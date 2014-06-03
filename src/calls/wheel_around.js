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
  var WheelAround = Env.extend(Call);
  WheelAround.prototype.name = "Wheel Around";
  Call.classes.wheelaround = WheelAround;
  WheelAround.prototype.performOne = function(d,ctx)
  {
    var d2 = d.partner;
    if (!d2 || !d2.active)
      throw new CallError('Dancer '+d+' must Wheel Around with partner.');
    var m = {};
    if (d.belle) {
      if (!d2.beau)
        throw new CallError('Dancer '+d+' is not part of a Facing Couple.');
      m = { select: 'Belle Wheel' };
    }
    else {
      if (!d2.belle)
        throw new CallError('Dancer '+d+' is not part of a Facing Couple.');
      m = { select: 'Beau Wheel' };
    }
    return new Path(m);
  };
  return WheelAround;
});

//# sourceURL=wheel_around.js
