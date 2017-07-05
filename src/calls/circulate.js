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

define(['env','calls/action','callcontext'],function(Env,Action,CallContext) {
  var Circulate = Env.extend(Action);
  Circulate.prototype.name = "Circulate";
  Circulate.prototype.perform = function(ctx) {
    //  If just 4 dancers, try Box Circulate
    if (ctx.actives.length == 4)
      ctx.applyCalls('box circulate');
    //  If in waves or lines, then do All 8 Circulate
    else if (ctx.isLines())
      ctx.applyCalls('all 8 circulate');
    //  If in columns, do Column Circulate
    else if (ctx.isColumns())
      ctx.applyCalls('column circulate');
    //  Otherwise ... ???
    else
      throw new CallError('Cannot figure out how to Circulate.');
  };
  Circulate.requiresxml = ['All 8 Circulate'];
  return Circulate;
});
