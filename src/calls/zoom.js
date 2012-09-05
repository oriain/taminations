/*

    Copyright 2012 Brad Christie

    This file is part of TAMinations.

    TAMinations is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    TAMinations is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with TAMinations.  If not, see <http://www.gnu.org/licenses/>.

 */

Call.classes['zoom'] = defineClass({
  name: "Zoom",
  extend: Call,
  methods: {
    performOne: function(ctx,d) {
      var m = [];
      if (ctx.leader[d]) {
        var d2 = ctx.dancerInBack(d);
        var a = ctx.angle(d);
        var c = a < 0 ? 'Run Left' : 'Run Right';
        if (!ctx.active[d2])
          throw new Error();
        var dist = ctx.distance(d,d2);
        m.push({select:c,beats:2,offsetX:-dist/2});
        m.push({select:c,beats:2,offsetX:dist/2});
      } else if (ctx.trailer[d]) {
        var d2 = ctx.dancerInFront(d);
        if (!ctx.active[d2])
          throw new Error();
        var dist = ctx.distance(d,d2);
        m.push({ select:'Forward', beats:4, scaleX:dist });
      } else {
        throw new Error();
      }
      var moves = tam.translatePath(m);
      return new Path(moves);
    }

  },
});
