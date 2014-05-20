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
var FourDancerCall = Call.extend('fourdancers');
FourDancerCall.prototype.perform = function(ctx)
{
  //  If there are just 4 dancers, run the call with no modifications
  if (ctx.dancers.length <= 4)
    //  This sure seems an awkward way to call a superclass method
    Call.prototype.perform.call(this,ctx);
  else {
    //  8 dancers
    //  Divide into 2 alternatives of 2 4-dancer contexts,
    //  trying both vertical and horizontal
    var splitctx = [ this.split(ctx,function(loc) { return loc.x; }),
                     this.split(ctx,function(loc) { return loc.y; })];
    splitctx.filter(function(a) { return a!=null; })
            .forEach(function(ctxpair,isVerticalSplit) {
      ctxpair.forEach(function(ctx2) {
        try {
          ctx2.center();
          // TODO Need to do additional transforms here e.g. expand
          ctx2.analyze();
          //  Perform the requested call on this 4-dancer unit
          Call.prototype.performCall.call(this,ctx2);
          // And transform the resulting paths back
          ctx2.dancers.forEach(function(d) {
            //  First figure out the direction this dancer needs to move
            var v = new Vector(
                isVerticalSplit ? 0 : -Math.round(d.location.x/3),
                isVerticalSplit ? -Math.round(d.location.y/3) : 0
            );
            //  Get the dancer's facing angle for the last movement
            var m = d.path.movelist.last();
            d.animate(d.beats()-m.beats);
            var tx = AffineTransform.getRotateInstance(d.tx.angle);
            //  Apply that angle to the direction we need to shift
            v = v.preConcatenate(tx);
            //  Finally apply it to the last movement
            m.skew(v.x,v.y);
          });

          //  Now apply the result to the 8-dancer context
          ctx2.dancers.forEach(function(d) {
            d.clonedFrom.path.add(d.path);
          });
        } catch (err) {
          ;  // ignore error, try the other split
        }
      },this);
    },this);
  }
};

//  This returns an array of 2 contexts, 4 dancers each
//  divided by an axis
FourDancerCall.prototype.split = function(ctx,f)
{
  //  Fail if there are any dancers on the axis
  if (ctx.dancers.some(function(d) {
    Math.isApprox(f(d.location),0);
  }))
    return null;
  //  Create the two contexts
  return [ new CallContext(ctx.dancers.filter(function(d) {
    return f(d.location) > 0;
  })),
          new CallContext(ctx.dancers.filter(function(d) {
    return f(d.location) < 0;
  })) ];
};
