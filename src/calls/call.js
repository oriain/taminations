/*

    Copyright 2012 Brad Christie

    This file is part of TAMinations.

    TAMinations is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    TAMinations is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with TAMinations.  If not, see <http://www.gnu.org/licenses/>.

 */

Call = defineClass({});

//  Wrapper method for performing one call
Call.prototype.performCall = function(ctx) {
  ctx.analyze();
  this.perform(ctx);
  ctx.levelBeats();
};
//  Default method to perform one call
//  Pass the call on to each active dancer
//  Then collect each path into an array corresponding to the array of dancers
//  And level off the number of beats as needed by adding Stand moves
Call.prototype.perform = function(ctx) {
  //  Get all the paths with performOne calls
  for (var d in ctx.dancers) {
    if (d in ctx.active)
      ctx.paths[d].add(this.performOne(ctx,d));
  }
};

Call.classes = {};

//  Default method for one dancer to perform one call
//  Returns an empty path (the dancer just stands there)
Call.prototype.performOne = function(ctx,d)
{
  return new Path();
};


//  CallContext class is passed around calls to hold the working data
CallContext = defineClass({
  construct: function(source)
  {
    this.dancers = source.dancers;
    this.active = {};
    for (var d in (source.active || source.dancers))
      this.active[d] = source.dancers[d];
    this.paths = [];
    for (d in this.dancers)
      this.paths.push(new Path());
  }
});

//  Level off the number of beats for each dancer
CallContext.prototype.levelBeats = function()
{
  var maxbeats = 0;
  for (var d in this.dancers) {
    var b = this.paths[d].beats();
    if (b > maxbeats)
      maxbeats = b;
  }
  for (var d in this.dancers) {
    var b = maxbeats - this.paths[d].beats();
    if (b > 0) {
      var m = tam.translateMovement({select:'Stand',beats:b});
      this.paths[d].add(new Path(m));
    }
  }
};

////    Routines to analyze dancers
//  Distance between two dancers
//  If d2 not given, returns distance from origin
CallContext.prototype.distance = function(d1,d2)
{
  var v = this.dancers[d1].location();
  if (d2)
    v = v.subtract(this.dancers[d2].location());
  return v.distance();
};
//  Angle of d2 as viewed from d1
//  If angle is 0 then d2 is in front of d1
CallContext.prototype.angle = function(d1,d2)
{
  var v = this.dancers[d2].location();
  var v2 = v.preConcatenate(this.dancers[d1].tx.getInverse());
  return v2.angle();
};
//  Test if dancer d2 is directly in front, back. left, right of dancer d1
CallContext.prototype.isInFront = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),0);
};
CallContext.prototype.isInBack = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),Math.PI);
};
CallContext.prototype.isLeft = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),Math.PI/2);
};
CallContext.prototype.isRight = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),Math.PI*3/2);
};

//  Return dancers that are in between two other dancers
CallContext.prototype.inBetween = function(d1,d2)
{
  var retval = [];
  for (var d in this.dancers) {
    if (d != d1 && d != d2 &&
        Math.isApprox(this.distance(d,d1)+this.distance(d,d2),
                      this.distance(d1,d2)))
      retval.push(d);
  }
  return retval;
};

CallContext.prototype.analyze = function()
{
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
    if (leftcount % 2 == 1 && rightcount % 2 == 0) {
      this.partner[d1] = bestleft;
      this.belle[d1] = true;
    }
    else if (rightcount % 2 == 1 && leftcount % 2 == 0) {
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
  else if (!Math.isApprox(this.distance(dorder[3]),this.distance(dorder[4]))) {
    this.center[dorder[0]] = true;
    this.center[dorder[1]] = true;
    this.center[dorder[2]] = true;
    this.center[dorder[3]] = true;
  }

};
