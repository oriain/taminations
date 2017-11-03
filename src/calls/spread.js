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

define(['calls/action','movement','path','vector'],
    (Action,Movement,Path,Vector) =>

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
      if (ctx.actives.length == ctx.dancers.length/2) {
        if (new CallContext(ctx.actives).isLine())
          ;  //  Case 2: Active dancers in line or wave spread among themselves
        else
          ;  //  Case 1: Active dancers spread and let in the others
      } else if (ctx.isLines())
        ;  //  Case 2
      else
        ;  // case 3

    }

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

  })