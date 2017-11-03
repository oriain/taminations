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

define(['calls/quarter_turns'], QuarterTurns =>

  //  This class is used for Quarter In and Quarter Out
  class QuarterIn extends QuarterTurns {

    constructor(calltext) {
      super()
      this.name = calltext.toCapCase()
    }

    select(ctx,d) {
      return d.beau ^ (this.name.match("Out")!=null) ? "Quarter Right" : "Quarter Left"
    }

  })
