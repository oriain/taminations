/*

    Copyright 2014 Brad Christie

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
define(function(){
  var TurnThru = Env.extend(Call);
  Call.classes.turnthru = TurnThru;
  TurnThru.prototype.performOne = function(d,ctx)
  {
    //  Can only turn thru with another dancer
    //  in front of this dancer
    //  who is also facing this dancer
    var d2 = ctx.dancerInFront(d);
    if (d2 != undefined && ctx.dancerInFront(d2) == d) {
      var dist = ctx.distance(d,d2);
      return new Path([{ select: 'Extend Left', scaleX: dist/2, scaleY: 0.5 },
                       { select: 'Swing Right', scaleX: 0.5, scaleY: 0.5 },
                       { select: 'Extend Right', scaleX: dist/2, scaleY: 0.5 }]);
    }
    throw new Error('Cannot find dancer to Turn Thru with '+d);
  };
  return TurnThru;
});

//# sourceURL=turn_thru.js
