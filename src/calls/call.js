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

//  Default method to perform one call
//  Pass the call on to each active dancer
//  Then collect each path into an array corresponding to the array of dancers
//  And level off the number of beats as needed by adding Stand moves
Call.prototype.perform = function(ctx) {
  var maxbeats = 0;
  ctx.analyze();
  //  Get all the paths with performOne calls
  for (var d in ctx.dancers) {
    p = new Path();
    if (d in ctx.active) {
      console.log('Perform: '+d+' '+ctx.partner[d]);
      p = this.performOne(ctx,d);
    }
    b = p.beats();
    console.log('Dancer '+d+'  beats: '+b);
    if (b > maxbeats)
      maxbeats = b;
    ctx.paths[d].add(p);
  }
  //  Level off the number of beats for each dancer
  for (var d in ctx.dancers) {
    b = maxbeats - ctx.paths[d].beats();
    if (b > 0) {
      var m = tam.translateMovement({select:'Stand',beats:b});
      ctx.paths[d].add(new Path(m));
    }
  }
}

//  Default method for one dancer to perform one call
//  Returns an empty path (the dancer just stands there)
Call.prototype.performOne = function(ctx,d)
{
  return new Path();
}


//  CallContext class is passed around calls to hold the working data
CallContext = defineClass({
  construct: function(source)
  {
    this.dancers = source.dancers;
    this.active = {}
    for (var d in (source.active || source.dancers))
      this.active[d] = source.dancers[d];
    this.paths = [];
    for (var d in this.dancers)
      this.paths.push(new Path());
  }
});

////    Routines to analyze dancers
//  Distance between two dancers
CallContext.prototype.distance = function(d1,d2)
{
  return    this.dancers[d1].location()
  .subtract(this.dancers[d2].location())
  .distance();
}
//  Angle of d2 as viewed from d1
//  If angle is 0 then d2 is in front of d1
CallContext.prototype.angle = function(d1,d2)
{
  var v = this.dancers[d2].location();
  var v2 = v.preConcatenate(this.dancers[d1].tx.getInverse());
  return v2.angle();
}
//  Test if dancer d2 is directly in front, back. left, right of dancer d1
CallContext.prototype.isInFront = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),0);
}
CallContext.prototype.isInBack = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),Math.PI);
}
CallContext.prototype.isLeft = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),Math.PI/2);
}
CallContext.prototype.isRight = function(d1,d2)
{
  return Math.anglesEqual(this.angle(d1,d2),Math.PI*3/2);
}


CallContext.prototype.analyze = function()
{
  this.beau = {};
  this.belle = {};
  this.leader = {};
  this.trailer = {};
  this.partner = {};
  //  .. etc for ends, centers, very centers ...
  for (var d1 in this.dancers) {
    var bestleft = -1;
    var bestright = -1;
    var countleft = 0;
    var countright = 0;
    var frontcount = 0;
    var backcount = 0;
    for (var d2 in this.dancers) {
      if (d2 == d1)
        continue;
      if (this.isRight(d1,d2)) {
        countright++;
        if (bestright < 0 || this.distance(d1,d2) < this.distance(d1,bestright))
          bestright = Number(d2);
      }
      else if (this.isLeft(d1,d2)) {
        countleft++;
        if (bestleft < 0 || this.distance(d1,d2) < this.distance(d1,bestleft))
          bestleft = Number(d2);
      }
      else if (this.isInFront(d1,d2))
        frontcount++;
      else if (this.isInBack(d1,d2))
        backcount++;
    }
    if (countleft % 2 == 1 && countright % 2 == 0) {
      this.partner[d1] = bestleft;
      this.belle[d1] = true;
    }
    else if (countright % 2 == 1 && countleft % 2 == 0) {
      this.partner[d1] = bestright;
      this.beau[d1] = true;
    }
    if (frontcount % 2 == 0 && backcount % 2 == 1)
      this.leader[d1] = true;
    else if (frontcount % 1 == 0 && backcount % 2 == 0)
      this.trailer[d1] = true;
  }
}
