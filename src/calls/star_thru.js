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

define(['calls/action','callerror'], (Action,CallError) =>

  class StarThru extends Action {

    get requires() { return ['Slide Thru'] }

    constructor() {
      super()
      this.name = "Star Thru"
    }

    perform(ctx) {
      //  Check that facing dancers are opposite genders
      ctx.actives.forEach( d => {
        var d2 = ctx.dancerInFront(d)
        if (d2 == undefined || !d2.active || ctx.dancerInFront(d2) != d)
          throw new CallError(`Dancer ${d} has nobody to Star Thru with`)
        if (d2.gender == d.gender)
          throw new CallError(`Dancer ${d} cannot Star Thru with another dancer of the same gender`)
      })
      //  All ok
      ctx.applyCalls("slide thru")
    }


  })
