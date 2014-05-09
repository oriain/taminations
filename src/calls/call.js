/*

    Copyright 2014 Brad Christie

    This file is part of Taminations.

    Taminations is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Taminations is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Taminations.  If not, see <http://www.gnu.org/licenses/>.

 */

Call = Object.childClass();
Call.classes = {};
Call.childCall = function(name,c)
{
  c = Call.childClass(c);
  Call.classes[name] = c;
  c.prototype.name = name;
  return c;
};

CallError = Error.childClass(function(msg)
{
  this.superclass(msg);
  this.name="CallError";
  this.message = msg;
});

NoDancerError = Error.childClass();

function dancerNum(d)
{
  return Math.floor(d)+1;
}

//  Wrapper method for performing one call
Call.prototype.performCall = function(ctx) {
  ctx.analyze();
  this.perform(ctx);
  ctx.levelBeats();
};

//  Default method to perform one call
//  Pass the call on to each active dancer
//  Then append the returned paths to each dancer
Call.prototype.perform = function(ctx) {
  //  Get all the paths with performOne calls
  var didsomething = false;
  ctx.active.forEach(function(prop,d) {
    var p = this.performOne(ctx,d);
    if (p != undefined) {
      ctx.dancers[d].path.add(p);
      ctx.dancers[d].recalculate();
      ctx.dancers[d].animate(999);
      didsomething = true;
    }
  },this);
  if (!didsomething)
    throw new NoDancerError();
};

//  Default method for one dancer to perform one call
//  Returns an empty path (the dancer just stands there)
Call.prototype.performOne = function(ctx,d)
{
  return new Path();
};

//  If a call can modify another call by reading its output
//  and performing its modification it should override this method
Call.prototype.canModifyCall = function()
{
  return false;
};

///////   CallContext class    //////////////
//  An instance of the CallContext class is passed around calls
//  to hold the working data - dancers, paths, and
//  progress performing a call
//
//  A CallContext can be created by any of
//  * cloning another CallContext
//  * current state of TamSVG animation
//  * XML formation
CallContext = function(source)
{
  if (source instanceof CallContext || source instanceof TamSVG) {
    this.dancers = source.dancers.map(function(d) {
      return new Dancer({dancer:d,computeOnly:true});
    });
    this.active = (source.active || source.dancers).map(function(d) {
      return d;
    });
  } else {

  }
  if (source.map != undefined)
    this.map = source.map;
};

//  Static function to copy an array of dancers
CallContext.copyDancers = function(dancers)
{
  return dancers.map(function(d) {
    return new Dancer({dancer:dancers[d],computeOnly:true});
  });
};

//  Level off the number of beats for each dancer
CallContext.prototype.levelBeats = function()
{
  //  get the longest number of beats
  var maxbeats = this.dancers.reduce(function(v,d) {
    return Math.max(v,d.path.beats());
  },0);
  //  add that number as needed by using the "Stand" move
  this.dancers.forEach(function(d) {
    var b = maxbeats - d.path.beats();
    if (b > 0) {
      var m = tam.translate($('path[name="Stand"]',movedata));
      m[0].beats = b;
      d.path.add(new Path(m));
    }
  });
};

////    Routines to analyze dancers
//  Distance between two dancers
//  If d2 not given, returns distance from origin
CallContext.prototype.distance = function(d1,d2)
{
  var v = this.dancers[d1].location();
  if (d2 != undefined)
    v = v.subtract(this.dancers[d2].location());
  return v.distance();
};
//  Angle of d2 as viewed from d1
//  If angle is 0 then d2 is in front of d1
//  If d2 is not given, returns angle to origin
//  Angle returned is in the range -pi to pi
CallContext.prototype.angle = function(d1,d2)
{
  var v = new Vector(0,0);
  if (d2 != undefined)
    v = this.dancers[d2].location();
  var v2 = v.preConcatenate(this.dancers[d1].tx.getInverse());
  return v2.angle();
};
CallContext.prototype.isFacingIn = function(d)
{
  var a = this.angle(d);
  return Math.abs(a) < Math.PI/4;
};
CallContext.prototype.isFacingOut = function(d)
{
  var a = this.angle(d);
  return Math.abs(a) > Math.PI/4;
};
//  Test if dancer d2 is directly in front, back. left, right of dancer d1
CallContext.prototype.isInFront = function(d1,d2)
{
  return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),0);
};
CallContext.prototype.isInBack = function(d1,d2)
{
  return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),Math.PI);
};
CallContext.prototype.isLeft = function(d1,d2)
{
  return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),Math.PI/2);
};
CallContext.prototype.isRight = function(d1,d2)
{
  return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),Math.PI*3/2);
};

//  Return closest dancer that satisfies a given conditional
CallContext.prototype.dancerClosest = function(d,f)
{
  var ctx = this;
  return this.dancers.filter(f,ctx).reduce(function(best,d2) {
    return best == undefined || ctx.distance(d2,d) < ctx.distance(best,d)
      ? d2 : best;
  });
};

//  Return all dancers, ordered by distance, that satisfies a conditional
CallContext.prototype.dancersInOrder = function(d,f)
{
  var ctx = this;
  return this.dancers.filter(f,ctx).sort(function(a,b) {
    return ctx.distance(d,a) - ctx.distance(d,b);
  });
};

//  Return dancer directly in front of given dancer
CallContext.prototype.dancerInFront = function(d)
{
  return this.dancerClosest(d,function(d2) {
    return ctx.isInFront(d,d2);
  });
};

//  Return dancer directly in back of given dancer
CallContext.prototype.dancerInBack = function(d)
{
  return this.dancerClosest(d,function(d2) {
    return this.isInBack(d,d2);
  });
};

//  Return dancers that are in between two other dancers
CallContext.prototype.inBetween = function(d1,d2)
{
  return this.dancers.filter(function(d) {
    return d != d1 && d != d2 &&
        Math.isApprox(this.distance(d,d1)+this.distance(d,d2),
                      this.distance(d1,d2));
  });
};

//  Return all the dancers to the right, in order
CallContext.prototype.dancersToRight = function(d)
{
  return this.dancersInOrder(d,function(d2) {
    return this.isRight(d,d2);
  });
};

//  Return all the dancers to the left, in order
CallContext.prototype.dancersToLeft = function(d)
{
  return this.dancersInOrder(d,function(d2) {
    return this.isLeft(d,d2);
  });
};

CallContext.prototype.analyze = function()
{
  this.dancers.forEach(function(d) { d.animate(999); });
  this.beau = {};
  this.belle = {};
  this.leader = {};
  this.trailer = {};
  this.partner = {};
  this.center = {};
  this.end = {};
  this.verycenter = {};
  var istidal = false;
  for (var d1 in this.dancers) {
    var bestleft = -1;
    var bestright = -1;
    var leftcount = 0;
    var rightcount = 0;
    var frontcount = 0;
    var backcount = 0;
    for (var d2 in this.dancers) {
      if (d2 == d1)
        continue;
      //  Count dancers to the left and right, and find the closest on each side
      if (this.isRight(d1,d2)) {
        rightcount++;
        if (bestright < 0 || this.distance(d1,d2) < this.distance(d1,bestright))
          bestright = Number(d2);
      }
      else if (this.isLeft(d1,d2)) {
        leftcount++;
        if (bestleft < 0 || this.distance(d1,d2) < this.distance(d1,bestleft))
          bestleft = Number(d2);
      }
      //  Also count dancers in front and in back
      else if (this.isInFront(d1,d2))
        frontcount++;
      else if (this.isInBack(d1,d2))
        backcount++;
    }
    //  Use the results of the counts to assign belle/beau/leader/trailer
    //  and partner
    if (leftcount % 2 == 1 && rightcount % 2 == 0 &&
        this.distance(d1,bestleft) < 3) {
      this.partner[d1] = bestleft;
      this.belle[d1] = true;
    }
    else if (rightcount % 2 == 1 && leftcount % 2 == 0 &&
        this.distance(d1,bestright) < 3) {
      this.partner[d1] = bestright;
      this.beau[d1] = true;
    }
    if (frontcount % 2 == 0 && backcount % 2 == 1)
      this.leader[d1] = true;
    else if (frontcount % 1 == 0 && backcount % 2 == 0)
      this.trailer[d1] = true;
    //  Assign ends
    if (rightcount == 0 && leftcount > 1)
      this.end[d1] = true;
    else if (leftcount == 0 && rightcount > 1)
      this.end[d1] = true;
    //  The very centers of a tidal wave are ends
    //  Remember this special case for assigning centers later
    if (rightcount == 3 && leftcount == 4 ||
        rightcount == 4 && leftcount == 3) {
      this.end[d1] = true;
      istidal = true;
    }
  }
  //  Analyze for centers and very centers
  //  Sort dancers by distance from center
  var dorder = [];
  for (d1 in this.dancers)
    dorder[d1] = d1;
  var ctx = this;
  dorder.sort(function(a,b) {
    return ctx.distance(a) - ctx.distance(b);
  });
  // The closest 2 dancers are very centers
  if (!Math.isApprox(this.distance(dorder[1]),this.distance(dorder[2]))) {
    this.verycenter[dorder[0]] = true;
    this.verycenter[dorder[1]] = true;
  }
  // If tidal, then the next 4 dancers are centers
  if (istidal) {
    this.center[dorder[2]] = true;
    this.center[dorder[3]] = true;
    this.center[dorder[4]] = true;
    this.center[dorder[5]] = true;
  }
  // Otherwise, if there are 4 dancers closer to the center than the other 4,
  // they are the centers
  else if (this.dancers.length > 4 &&
           !Math.isApprox(this.distance(dorder[3]),this.distance(dorder[4]))) {
    this.center[dorder[0]] = true;
    this.center[dorder[1]] = true;
    this.center[dorder[2]] = true;
    this.center[dorder[3]] = true;
  }

};
