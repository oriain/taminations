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

xmldata['src/calls/leaders.js'] = defineClass({
  name: "Leaders",
  extend: Call,
  methods: {
    perform: function(ctx) {
      ctx.analyze();
      var newactive = {};
      for (var d in ctx.active) {
        if (ctx.leader[d])
          newactive[d] = ctx.dancers[d];
      }
      ctx.active = newactive;
    }

  },
});
