/*

    Copyright 2015 Brad Christie

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

define(['env','calls/call','path'],function(Env,Call,Path) {
  var SlideThru = Env.extend(Call);
  SlideThru.prototype.name = "Slide Thru";
  SlideThru.prototype.performOne = function(d,ctx)
  {
    //  Can only pass thru with another dancer
    //  in front of this dancer
    //  who is also facing this dancer
    var d2 = ctx.dancerInFront(d);
    if (d2 != undefined && ctx.dancerInFront(d2) == d) {
      var dist = ctx.distance(d,d2);
      var move1 = { select: 'Extend Left', scaleX: dist/2, scaleY:0.5 };
      var move2 = d.gender == Dancer.BOY
           ? { select: 'Lead Right', scaleX: dist/2, scaleY:0.5 }
           : { select: 'Quarter Left', offsetX: dist/2, offsetY:-0.5 };
      return new Path([move1,move2]);
    }
    throw new Error();
  };
  return SlideThru;
});

//# sourceURL=passthru.js
