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
QuarterTurns = FourDancerCall.extend();
QuarterTurns.prototype.performOne = function(d,ctx)
{
  var offsetX = 0;
  var offsetY = 0;
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
  return new Path({select: this.select(ctx,d), offsetX: offsetX, offsetY: offsetY });
};

FaceLeft = QuarterTurns.extend('faceleft');
FaceLeft.prototype.select = function() {
  return "Quarter Left";
};

FaceRight = QuarterTurns.extend('faceright');
FaceRight.prototype.select = function() {
  return "Quarter Right";
};

FaceIn = QuarterTurns.extend('facein');
FaceIn.prototype.select = function(ctx,d) {
  return ctx.angle(d) < 0 ? 'Quarter Right' : 'Quarter Left';
};

FaceOut = QuarterTurns.extend('faceout');
FaceOut.prototype.select = function(ctx,d) {
  return ctx.angle(d) < 0 ? 'Quarter Right' : 'Quarter Left';
};

QuarterIn = QuarterTurns.extend('quarterin');
QuarterIn.prototype.select = function(ctx,d) {
  return d.beau ? 'Quarter Right' : 'Quarter Left';
};

QuarterOut = QuarterTurns.extend('quarterout');
QuarterIn.prototype.select = function(ctx,d) {
  return d.beau ? 'Quarter Left' : 'Quarter Right';
};

//# sourceURL=quarter_left.js
