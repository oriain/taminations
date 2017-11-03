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

define(["calls/codedcall","callerror"], (CodedCall,CallError) =>

  class Centers extends CodedCall {

    constructor(calltext) {
      super()
      this.name = calltext.toCapCase()
    }

    preProcess(ctx) {
      var numc = 4
      if (this.name.match("2|two"))
        numc = 2
      if (this.name.match("6|six"))
        numc = 6
      var dsort = ctx.dancers.copy().sort((d1,d2) => ctx.distance(d1) - ctx.distance(d2))
      if (ctx.distance(dsort[numc]) - ctx.distance(dsort[numc-1]) > 0.1) {
        dsort.slice(numc).forEach(d => { d.active = false } )
      } else
        throw new CallError("Cannot find "+this.name+" dancers")
    }

  })
