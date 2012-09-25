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

Call.classes['facingdancers'] = defineClass({
  name: "Facing Dancers",
  extend: Call,
  methods: {
    perform: function(ctx) {
      var newactive = {};
      var count = 0;
      for (var d in ctx.active) {
        var d2 = ctx.dancerInFront(d);
        if (d2 != undefined && ctx.dancerInFront(d2) == d) {
          newactive[d] = ctx.dancers[d];
          count++;
        }
      }
      if (count == 0)
        throw new NoDancerError();
      ctx.active = newactive;
    }
  },
});

//  This is for 'Facing Boys' e.g.
Call.classes['facing'] = defineClass({
  name: "Facing",
  extend: Call.classes['facingdancers']
});
