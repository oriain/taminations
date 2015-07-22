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

define(['env','calls/codedcall','calls/xmlcall'],
       function(Env,CodedCall,XMLCall) {
  var Half = Env.extend(CodedCall);
  Half.prototype.name = "Half";

  Half.prototype.perform = function(ctx) {
    //  Steal the next call off the stack
    var call = ctx.callstack.shift();

    //  For XML calls there should be an explicit number of parts
    if (call instanceof XMLCall) {
      //  Figure out how many beats are in half the call
      var parts = $(call.xelem).attr('parts');
      var partnums = parts.split(';');
      var halfbeats = 0;
      partnums.slice(0,(partnums.length+1)/2).forEach(function(b) {
        halfbeats += Number(b);
      });
    }

    //  Perform the call
    var ctxbeats = ctx.maxBeats();
    call.performCall(ctx);

    //  Coded calls so far do not have explicit parts
    //  so just divide them in two
    if (call instanceof CodedCall)
      halfbeats = (ctx.maxBeats() - ctxbeats) / 2;

    //  Chop off the excess half
    ctx.dancers.forEach(function(d) {
      var m = 0;
      while (d.path.beats() > ctxbeats + halfbeats) {
        //  Maybe should add a pop method to Path
        m = d.path.movelist.pop();
      }
      if (m && d.path.beats() < ctxbeats + halfbeats) {
        m.clip(ctxbeats + halfbeats - d.path.beats());
        d.path.add(m);
      }
      d.path.recalculate();
    });

  };

  return Half;
});
