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
CrossRun = Call.childCall('crossrun');
CrossRun.prototype.perform = function(ctx)
{
  for (var d in ctx.dancers) {
    var p = new Path();
    if (d in ctx.active) {
      //  Must be in a 4-dancer wave or line
      if (!ctx.center[d] && !ctx.end[d])
        throw new CallError('General line required for Cross Run');
      //  Partner must be inactive
      var d2 = ctx.partner[d];
      if (d2 == null || ctx.active[d2])
        throw new CallError('Dancer and partner cannot both Cross Run');
      //  Center beaus and end belles run left
      var isright = ctx.beau[d] ^ ctx.center[d];
      var m = isright ? 'Run Right' : 'Run Left';
      //  TODO check for runners crossing paths
      var moves = tam.translateMovement({ select: m, scaleY: 2 });
      p = new Path(moves);
    }
    else if (ctx.partner[d] in ctx.active) {
      var m = ctx.beau[d] ? 'Dodge Right' : 'Dodge Left';
      var moves = tam.translateMovement({ select: m });
      p = new Path(moves);
    }
    ctx.dancers[d].path.add(p);
  }
};

//# sourceURL=crossrun.js
