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

Call.classes['run'] = defineClass({
  name: "Run",
  extend: Call,
  methods: {
    perform: function(ctx) {
      for (var d in ctx.dancers) {
        var p = new Path();
        if (d in ctx.active) {
          //  Partner must be inactive
          var d2 = ctx.partner[d];
          if (d2 == null || ctx.active[d2])
            throw new CallError('Dancer '+dancerNum(d)+' has nobody to Run around.');
          var m = ctx.beau[d] ? 'Run Right' : 'Run Left';
          var moves = tam.translateMovement({ select: m });
          p = new Path(moves);
        }
        else if (ctx.partner[d] in ctx.active) {
          var m = ctx.beau[d] ? 'Dodge Right' : 'Dodge Left';
          var moves = tam.translateMovement({ select: m });
          p = new Path(moves);
        }
        ctx.paths[d].add(p);
      }
    }
  },
});
