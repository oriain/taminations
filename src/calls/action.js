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

//  Base class for programmed calls that move the dancers

define(['env','path','calls/call','calls/codedcall' ],function(Env,Path,Call,CodedCall) {

  class Action extends CodedCall {

    //  Wrapper method for performing one call
    performCall(ctx,i) {
      this.perform(ctx,i)
      ctx.dancers.forEach(d => {
        d.recalculate()
        d.animateToEnd()
      })
      ctx.levelBeats()
    };

    //  Default method to perform one call
    //  Pass the call on to each active dancer
    //  Then append the returned paths to each dancer
    perform(ctx,i) {
      //  Get all the paths with performOne calls
      ctx.actives.forEach(d => {
        d.path.add(this.performOne(d,ctx))
      })
    }

    //  Default method for one dancer to perform one call
    //  Returns an empty path (the dancer just stands there)
    performOne() {
      return new Path()
    }

    postProcess(ctx,i) {
      Call.prototype.postProcess.call(this,ctx,i)
      ctx.matchStandardFormation()
    }

  }

  return Action

})
