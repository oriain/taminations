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
define(['calls/box_call'],function(BoxCall) {
  var BoxCounterRotate = Env.extend(BoxCall);
  BoxCounterRotate.prototype.name = "BoxCounterRotate";
  Call.classes.boxcounterrotate = BoxCounterRotate;
  BoxCounterRotate.prototype.performOne = function(d,ctx)
  {
    Vector v = d.location.scale(.5);
    if (ctx.isLeft(d))
      v = v.rotate(Math.PI/2)
    else
      v = v.rotate(-Math.PI/2)
  };
  return BoxCounterRotate;
});

//# sourceURL=box_counter_rotate.js
