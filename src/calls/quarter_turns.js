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

define(['env','calls/box_call','path'],function(Env,BoxCall,Path) {
  var QuarterTurns = Env.extend(BoxCall);
  QuarterTurns.prototype.performOne = function(d,ctx)
  {
    var offsetX = 0;
    var offsetY = 0;
    var move = this.select(ctx,d);
    if (move != 'Stand' && !Math.isApprox(d.location.x,0) && !Math.isApprox(d.location.y,0)) {
      if (ctx.isFacingIn(d))
        offsetX = 1;
      else if (ctx.isFacingOut(d))
        offsetX = -1;
      else
        return undefined;  // TODO for now just handle dancers in boxes
      if (d.beau)
        offsetY = 1;
      else if (d.belle)
        offsetY = -1;
      else
        return undefined;    // TODO for now just handle dancers in boxes
    }
    return new Path({select: move, offsetX: offsetX, offsetY: offsetY });
  };
  return QuarterTurns;
});

//# sourceURL=quarter_turns.js
