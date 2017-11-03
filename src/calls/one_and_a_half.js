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

define(['calls/codedcall','calls/half','callerror'], (CodedCall,Half,CallError) =>

  class OneAndaHalf extends CodedCall {

    static get requires() { return ['Half'] }

    constructor() {
      super()
      this.name = "Once and a Half"
    }

    preProcess(ctx) {
      if (ctx.callstack.length < 2)
        throw new CallError("One and a half of what?")
    }

    performCall(ctx,i) {
      //  At this point the call has already been done once
      //  So just do half of it again
      ctx.applyCalls("half "+ctx.callstack[0].name)
    }

  })
