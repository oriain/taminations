/*

    Copyright 2017 Brad Christie

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
"use strict";

define(['env','calls/action','callcontext','vector','affinetransform'],
    function(Env,Action,CallContext,Vector,AffineTransform) {
  var FourDancerCall = Env.extend(Action);

  FourDancerCall.prototype.preferFilter = function(ctx)
  {
    return true;
  };

  FourDancerCall.prototype.perform = function(ctx)
  {
    //  If there are just 4 dancers, run the call with no modifications
    if (ctx.dancers.length <= 4)
      //  This sure seems an awkward way to call a superclass method
      Action.prototype.perform.call(this,ctx);
    else {
      //  8 dancers
      //  Divide into 2 alternatives of 2 4-dancer contexts,
      //  trying both vertical and horizontal
      var splitctx = this.split(ctx,false).concat(this.split(ctx,true));
      splitctx.forEach(function(ctx2) {
        this.preProcess(ctx2);
      },this);
      if (splitctx.length > 2)
        splitctx = splitctx.filter(this.preferFilter);
      //  error if still 4 contexts???
      splitctx.forEach(function(ctx2) {
        //  Perform the requested call on this 4-dancer unit
        Action.prototype.performCall.call(this,ctx2);
        //  Adjust to fit 8-dancer positions
        this.postProcess(ctx2);
        //  Now apply the result to the 8-dancer context
        ctx2.dancers.forEach(function(d) {
          d.clonedFrom.path.add(d.path);
        });
      },this);
    }
  };

  FourDancerCall.prototype.preProcess = function(ctx) {
    ctx.center();
    // TODO Need to do additional transforms here e.g. expand
    ctx.analyze();
  };

  FourDancerCall.prototype.postProcess = function(ctx) {
    if (ctx.dancers.length > 4) {
    // And transform the resulting paths back
      ctx.dancers.forEach(function(d) {
        //  First figure out the direction this dancer needs to move
        var v = new Vector(
            ctx.isVerticalSplit ? 0 : -Math.round(d.location.x/3),
                ctx.isVerticalSplit ? -Math.round(d.location.y/3) : 0
        );
        //  Get the dancer's facing angle for the last movement
        var m = d.path.movelist.last();
        d.animate(d.beats()-m.beats);
        var tx = AffineTransform.getRotateInstance(d.tx.angle);
        //  Apply that angle to the direction we need to shift
        v = v.concatenate(tx);
        //  Finally apply it to the last movement
        d.path.skew(v.x,v.y);
      });
    };
  }

  //  This returns an array of 2 contexts, 4 dancers each
  //  divided by an axis
  FourDancerCall.prototype.split = function(ctx,isVertical)
  {
    var f = function(d) { return isVertical ? d.location.y : d.location.x; };
    //  Fail if there are any dancers on the axis
    if (ctx.dancers.some(function(d) {
      Math.isApprox(f(d),0);
    }))
      return [];
    //  Create the two contexts
    var retval = [ new CallContext(ctx.dancers.filter(function(d) {
      return f(d) > 0;
    })),
    new CallContext(ctx.dancers.filter(function(d) {
      return f(d) < 0;
    })) ];
    retval.forEach(function(ctx2) { ctx2.isVerticalSplit = isVertical; });
    return retval;
  };
  return FourDancerCall;
});
