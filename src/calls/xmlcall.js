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

define(['env','calls/call','path'],
       function(Env,Call,Path) {
  var XMLCall = Env.extend(Call);
  XMLCall.prototype.name = '';

  XMLCall.prototype.performCall = function(ctx) {
    //  Get the formation
    var f = $(this.xelem).find('formation');
    if (f.size() <= 0) {
      var fs = $(this.xelem).attr('formation');
      f = getNamedFormation(fs);
    }
    var allp = tam.getPath(this.xelem);
    //  Compute difference between current formation and XML formation
    var vdif = this.computeFormationOffsets(ctx,this.ctx2);
    this.xmlmap.forEach(function(m,i3) {
      //  Apply formation difference to first movement of XML path
      var vd = vdif[i3].rotate(-ctx.dancers[i3].tx.angle);
      var p = new Path(allp[m>>1]);
      if (vd.distance > 0.1)
        p.movelist[0].skew(-vd.x,-vd.y);
      //  Add XML path to dancer
      ctx.dancers[i3].path.add(p);
    });
    ctx.levelBeats();

  };

  //  Once a mapping of the current formation to an XML call is found,
  //  we need to compute the difference between the two,
  //  and that difference will be added as an offset to the first movement
  XMLCall.prototype.computeFormationOffsets = function(ctx1,ctx2)
  {
    var dvbest;
    var dtotbest = -1;
    var mapping = this.xmlmap;
    [0,Math.PI/2,Math.PI,Math.PI*3/2].forEach(function(angle) {
      var dv = [];
      var dtot = 0;
      ctx1.dancers.forEach(function(d1,i) {
        var v1 = d1.location;
        var v2 = ctx2.dancers[mapping[i]].location.rotate(angle);
        dv[i] = v1.subtract(v2);
        dtot += dv[i].distance;
      });
      if (dtotbest < 0 || dtotbest > dtot) {
        dvbest = dv;
        dtotbest = dtot;
      }
    });
    return dvbest;
  }

  return XMLCall;

});

//# sourceURL=xmlcall.js
