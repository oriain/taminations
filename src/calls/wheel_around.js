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

  //  This class handles Wheel Around and Reverse Wheel Around
  class WheelAround extends Action {

    constructor(calltext) {
      super()
      this.name = calltext.toCapCase()
      this.isReverse = this.name.match("Reverse") != null
    }

    performOne(d,ctx) {
      if (!ctx.isInCouple(d))
        throw new CallError(`Dancer ${d} is not part of a Facing Couple.`)
      if (!d.partner.active)
        throw new CallError(`Dancer ${d} must Wheel Around with partner.`)
      var wheel = (d.beau ^ this.isReverse) ? "Beau Wheel" : "Belle Wheel"
      var m = TamUtils.getMove(wheel)
      if (this.isReverse)
        m = m.reflect()
      return m
    }

  })
