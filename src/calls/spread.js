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
    along with TAMinations.  If not, see <http://www.gnu.org/licenses/>.

 */
"use strict";

define(['calls/action','callcontext','movement','path','vector','callerror'],
       (Action,CallContext,Movement,Path,Vector,CallError) => {

  class AndSpread extends Action {

    constructor() {
      super()
      this.name = " and Spread"
    }

    /*
     * 1. If only some of the dancers are directed to Spread (e.g., from a
     * static square, Heads Star Thru & Spread), they slide apart sideways to
     * become ends, as the inactive dancers step forward between them.
     *
     * 2. If the (Anything) call finishes in lines or waves (e.g., Follow Your Neighbor),
     * the centers anticipate the Spread action by sliding apart sideways to
     * become the new ends, while the original ends anticipate the Spread action
     * by moving into the nearest center position.
     *
     * 3. If the (Anything) call finishes in tandem couples
     *  (e.g., Wheel & Deal from a line of four), the lead dancers slide apart sideways,
     *  while the trailing dancers step forward between them.
     */

    perform(ctx) {
      //  Is this spread from waves, tandem, actives?
      var spreader = null
      if (ctx.actives.length == ctx.dancers.length/2) {
        if (new CallContext(ctx.actives).isLine())
          spreader = new Case2()  //  Case 2: Active dancers in line or wave spread among themselves
        else
          spreader = new Case1()  //  Case 1: Active dancers spread and let in the others
      } else if (ctx.isLines())
        spreader = new Case2()  //  Case 2
      else if (ctx.dancers.every(d => ctx.isInTandem(d)))
        spreader = new Case3()  // case 3
      if (spreader != null)
        spreader.perform(ctx)
      else
        throw new CallError("Can not figure out how to Spread")
    }

  }

  class Case1 extends Action {

    perform(ctx) {
      ctx.levelBeats()
      ctx.dancers.forEach(d => {
        if (d.active) {
          //  Active dancers spread apart
          let m = ""
          if (ctx.dancersToRight(d).length == 0)
            m = "Dodge Right"
          else if (ctx.dancersToLeft(d).length == 0)
            m = "Dodge Left"
          else
            throw new CallError("Can not figure out how to Spread")
          d.path.add(TamUtils.getMove(m).changebeats(2))
        } else {
          //  Inactive dancers move forward
          let d2 = ctx.dancerInFront(d)
          if (d2 != null) {
            let dist = ctx.distance(d,d2)
            d.path.add(TamUtils.getMove("Forward").scale(dist,1).changebeats(2))
          }
        }
      })
    }
  }

  class Case2 extends Action {

    performOne(d,ctx) {
      var p = d.path
      //  This is for waves only TODO tandem couples, single dancers (C-1)
      var v = new Vector()
      if (d.belle)
        v = new Vector(0,2)
      else if (d.beau)
        v = new Vector(0,-2)
      var m = p.movelist.pop()
      var tx = m.rotate()
      v = v.concatenate(tx)
      p.movelist.push(m.skew(v.x,v.y).useHands(Movement.NOHANDS))
      return new Path()
    }

  }

  class Case3 extends Case1 {

    perform(ctx) {
      //  Mark the leaders as active
      ctx.dancers.forEach( d => { d.active = d.leader } )
      //  And forward to Case1, actives spread
      super.perform(ctx)
    }

  }

  return AndSpread

})