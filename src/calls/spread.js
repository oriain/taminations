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
    along with TAMinations.  If not, see <http://www.gnu.org/licenses/>.

 */
AndSpread = Call.extend('andspread');
AndSpread.prototype.canModifyCall = function() { return true; };
AndSpread.prototype.performOne = function(ctx,d)
{
  var p = ctx.dancers[d].path;
  //  This is for waves only TODO tandem couples, single dancers (C-1)
  var v = new Vector();
  if (ctx.belle[d])
    v = new Vector(0,1);
  else if (ctx.beau[d])
    v = new Vector(0,-1);
  var m = p.movelist[p.movelist.length-1];
  var tx = m.rotate();
  v = v.preConcatenate(tx);
  m.skew(v.x,v.y);
  m.usehands = Movement.NOHANDS;
  return new Path();
};

//# sourceURL=spread.js