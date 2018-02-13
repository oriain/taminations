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

define(['calls/action','path','callerror'], (Action,Path,CallError) =>

  class Run extends Action {

    constructor() {
      super()
      this.name = "Run"
    }

    perform(ctx) {
      //  We need to look at all the dancers, not just actives
      //  because partners of the runners need to dodge
      ctx.dancers.forEach(d => {
        if (d.active) {
          //  Find dancer to run around
          //  Usually it's the partner
          let d2 = d.partner
          if (!d2)
            throw new CallError(`Dancer ${d} has nobody to Run around.`)
          //  But special case of t-bones, could be the dancer on the other side,
          //  check if another dancer is running around this dancer's "partner"
          let d3 = d2.partner
          if (d != d3 && d3 && d3.active) {
            d2 = ctx.dancerToRight(d)
            if (d2 == d.partner)
              d2 = ctx.dancerToLeft(d)
          }
          //  Partner must be inactive
          if (!d2 || d2.active)
            throw new CallError(`Dancer ${d} has nobody to Run around.`)
          let m = ctx.isRight(d,d2) ? 'Run Right' : 'Run Left'
          let dist = ctx.distance(d,d2)
          d.path = TamUtils.getMove(m).scale(1,dist/2)
          //  Also set path for partner
          let m2 = ctx.isRight(d2,d) ? "Dodge Right" :
                   ctx.isLeft(d2,d) ? "Dodge Left" :
                   ctx.isInFront(d2,d) ? "Forward 2" :
                   ctx.isInBack(d2,d) ? "Back 2" :    //  really ???
                   "Stand"   // should never happen
          d2.path = TamUtils.getMove(m2).scale(1,dist/2)
        }
      })

    }

  })
