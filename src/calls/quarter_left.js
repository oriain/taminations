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
QuarterLeft = FourDancerCall.extend('quarterleft');
QuarterLeft.prototype.performOne = function(ctx,d)
{
  var offsetX = 0;
  var offsetY = 0;
  if (ctx.isFacingIn(d))
    offsetX = 1;
  else if (ctx.isFacingOut(d))
    offsetX = -1;
  else
    return undefined;  // TODO for now just handle dancers in boxes
  if (ctx.beau[d])
    offsetY = 1;
  else if (ctx.belle[d])
    offsetY = -1;
  else
    return undefined;    // TODO for now just handle dancers in boxes
  return new Path({select: 'Quarter Left', offsetX: offsetX, offsetY: offsetY });
};

//# sourceURL=quarter_left.js
