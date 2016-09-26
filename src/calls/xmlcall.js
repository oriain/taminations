/*

    Copyright 2016 Brad Christie

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
    var xfactor = false;
    var yfactor = false;

    //  If moving just some of the dancers,
    //  see if we can keep them in the same shape
    if (ctx.actives.length < ctx.dancers.length) {
      //  No animations have been done on ctx2, so dancers are still at the start points
      var ctx3 = this.ctx2.clone();
      //  So ctx3 is a copy of the start point
      var bounds1 = ctx3.bounds();
      //  Now add the paths
      ctx3.dancers.forEach(function(d,i) {
        d.path.add(new Path(allp[i>>1]));
      });
      //  And move it to the end point
      ctx3.analyze();
      var bounds2 = ctx3.bounds();
      //  And see if the shape has changed
      var shapemap = this.ctx2.matchShapes(ctx3);
      if (shapemap) {
        //  TODO see if mapping is 90 degrees off
        var bounds0 = ctx.clone(ctx.actives).bounds();
       // xfactor = (2*bounds0.x)/(bounds1.x + bounds2.x);
       // yfactor = (2*bounds0.y)/(bounds1.y + bounds2.y);
      }
    }

    var vdif = this.computeFormationOffsets(ctx,this.ctx2);
    this.xmlmap.forEach(function(m,i3) {
      var p = new Path(allp[m>>1]);
      //  Scale active dancers to fit the space they are in
      if (xfactor && yfactor) {
        var vs = new Vector(xfactor,yfactor).rotate(this.ctx2.dancers[m].tx.angle);
        p.scale(Math.abs(vs.x),Math.abs(vs.y));
      } else {
      //  Compute difference between current formation and XML formation
        var vd = vdif[i3].rotate(-ctx.actives[i3].tx.angle);
        //  Apply formation difference to first movement of XML path
        if (vd.distance > 0.1)
          p.movelist.unshift(p.movelist.shift().skew(-vd.x,-vd.y));
      }
      //  Add XML path to dancer
      ctx.actives[i3].path.add(p);
      //  Move dancer to end so any subsequent modifications (e.g. roll)
      //  use the new position
      ctx.actives[i3].animateToEnd();
    },this);

    ctx.levelBeats();
    ctx.analyze();

  };

  //  Once a mapping of the current formation to an XML call is found,
  //  we need to compute the difference between the two,
  //  and that difference will be added as an offset to the first movement
  XMLCall.prototype.computeFormationOffsets = function(ctx1,ctx2)
  {
    var dvbest;
    var dtotbest = -1;
    var mapping = this.xmlmap;
    //  We don't know how the XML formation needs to be turned to overlap
    //  the current formation.  So try all 4 angles and use the best.
    [0,Math.PI/2,Math.PI,Math.PI*3/2].forEach(function(angle) {
      var dv = [];
      var dtot = 0;
      ctx1.actives.forEach(function(d1,i) {
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
