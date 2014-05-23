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
var QuarterTurns = FourDancerCall.extend();
Env.extend(BoxCall,QuarterTurns);
QuarterTurns.extend =  function(name,c) {
  c = Call.extend(name,c);
  Env.extend(QuarterTurns,c);
  return c;
};
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

var FaceLeft = QuarterTurns.extend('faceleft');
FaceLeft.prototype.select = function() {
  return "Quarter Left";
};

var FaceRight = QuarterTurns.extend('faceright');
FaceRight.prototype.select = function() {
  return "Quarter Right";
};

var FaceIn = QuarterTurns.extend('facein');
FaceIn.prototype.select = function(ctx,d) {
  return ctx.angle(d) < 0 ? 'Quarter Right' : 'Quarter Left';
};

var FaceOut = QuarterTurns.extend('faceout');
FaceOut.prototype.select = function(ctx,d) {
  return ctx.angle(d) < 0 ? 'Quarter Right' : 'Quarter Left';
};

var QuarterIn = QuarterTurns.extend('quarterin');
QuarterIn.prototype.select = function(ctx,d) {
  return d.beau ? 'Quarter Right' : 'Quarter Left';
};

var QuarterOut = QuarterTurns.extend('quarterout');
QuarterOut.prototype.select = function(ctx,d) {
  return d.beau ? 'Quarter Left' : 'Quarter Right';
};

var ZigZag = QuarterTurns.extend('zigzag');
ZigZag.prototype.select = function(ctx,d) {
  if (d.leader)
    return 'Quarter Right';
  if (d.trailer)
    return 'Quarter Left';
  return 'Stand';
};

var ZagZig = QuarterTurns.extend('zagzig');
ZagZig.prototype.select = function(ctx,d) {
  if (d.leader)
    return 'Quarter Left';
  if (d.trailer)
    return 'Quarter Right';
  return 'Stand';
};

var ZigZig = QuarterTurns.extend('zigzig');
ZigZig.prototype.select = function(ctx,d) {
  if (d.leader || d.trailer)
    return 'Quarter Right';
  return 'Stand';
};

var ZagZag = QuarterTurns.extend('zagzag');
ZagZag.prototype.select = function(ctx,d) {
  if (d.leader || d.trailer)
    return 'Quarter Left';
  return 'Stand';
};

var Zig = QuarterTurns.extend('zig');
Zig.prototype.select = function(ctx,d) {
  if (d.leader)
    return 'Quarter Right';
  return 'Stand';
};

var Zag = QuarterTurns.extend('zag');
Zag.prototype.select = function(ctx,d) {
  if (d.leader)
    return 'Quarter Left';
  return 'Stand';
};

//# sourceURL=quarter_turns.js
