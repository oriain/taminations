/*

    Copyright 2012 Brad Christie

    This file is part of TAMinations.

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
FourDancerCall = defineClass({
  extend: Call,
  methods: {
    perform: function(ctx) {
      //  If there are just 4 dancers, run the call with no modifications
      if (ctx.dancers.length <= 4)
        //  This sure seems an awkward way to call a superclass method
        Call.prototype.perform.call(this,ctx);
      else {
        //  8 dancers
        //  Divide into 2 groups of 4, try both vertical and horizontal
        splitctx = [this.split(ctx,function(loc) { return loc.x; }),
                    this.split(ctx,function(loc) { return loc.y; })];
        for (var ix2 in splitctx) {
          var ctx2 = splitctx[ix2];
          if (ctx2 == null)
            continue;
          try {
            for (var ix3 in ctx2) {
              var ctx3 = ctx2[ix3];
              //  Transform splits, then pass on using performOne calls
              this.center(ctx3);
              //  TODO add transform here
              Call.prototype.performCall.call(this,ctx3);
              //  If that works, transform paths back
              for (var d in ctx3.dancers)
                ctx.paths[ctx3.map[d]].add(ctx3.paths[d]);
            }
          } catch(err) {
            //  Unable to perform call for one split, try the other direction
            continue;  // with outer loop
          }
        }
      }
    },

    split: function(ctx,f) {
      var v1 = { dancers: [], map: [] };
      var v2 = { dancers: [], map: [] };
      for (var d in ctx.dancers) {
        var loc = ctx.dancers[d].location();
        var da = ctx.dancers[d].angle - ctx.dancers[d].startangle;
        if (f(loc) < 0) {
          //  Push copies of dancers - The start positions are different
          //  Might need to negate y values or fix Dancer constructor
          var d2 = new Dancer({dancer:ctx.dancers[d],x:loc.x,y:loc.y,angle:da});
          v1.dancers.push(d2);
          v1.map.push(d);
        }
        else if (f(loc) > 0) {
          var d2 = new Dancer({dancer:ctx.dancers[d],x:loc.x,y:loc.y,angle:da});
          v2.dancers.push(d2);
          v2.map.push(d);
        }
        else
          //  Dancer on axis, unable to split
          return null;
      }
      return [new CallContext(v1), new CallContext(v2)];
    },

    center: function(ctx) {
      var xtot = 0;
      var ytot = 0;
      for (var d in ctx.dancers) {
        xtot += ctx.dancers[d].startx;
        ytot += ctx.dancers[d].starty;
      }
      var dtot = ctx.dancers.length;
      for (var d in ctx.dancers) {
        ctx.dancers[d].startx -= xtot/dtot;
        ctx.dancers[d].starty -= ytot/dtot;
      }
    }

  }

});
