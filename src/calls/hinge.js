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
  var Hinge = Env.extend(BoxCall);
  Hinge.prototype.name = "Hinge";
  Call.classes.hinge = Hinge;
  Hinge.prototype.performOne = function(d,ctx)
  {
    //  Find the dancer to hinge with
    var d2 = null;
    var d3 = ctx.dancerToRight(d);
    var d4 = ctx.dancerToLeft(d);
    if (d.partner && d.partner.active)
      d2 = d.partner;
    else if (d3 && d3.active)
      d2 = d3;
    else if (d4 && d4.active)
      d2 = d4;
    if (!d2)
      return undefined;
    //  TODO handle partner hinge
    if (ctx.isRight(d,d2))
      return new Path({select:'Hinge Right'});
    else
      return new Path({select:'Hinge Left'});
  }
  return Hinge;
});