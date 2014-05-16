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
FilterActives = Call.extend('filteractives');
FilterActives.prototype.perform = function(ctx)
{
  ctx.actives.filter(function(d) {
    return !this.test(d,ctx);
  },this).forEach(function(d) {
    d.active = false;
  });
};

Beaus = FilterActives.extend('beaus');
Beaus.prototype.test = function(d) {
  return d.beau;
};

Belles = FilterActives.extend('belles');
Belles.prototype.test = function(d) {
  return d.belle;
};

Boys = FilterActives.extend('boys');
Boys.prototype.test = function(d) {
  return d.gender == Dancer.BOY;
};

Girls = FilterActives.extend('girls');
Girls.prototype.test = function(d) {
  return d.gender == Dancer.GIRL;
};

Centers = FilterActives.extend('centers');
Centers.prototype.test = function(d) {
  return d.center;
};

Ends = FilterActives.extend('ends');
Ends.prototype.test = function(d) {
  return d.end;
};

VeryCenters = FilterActives.extend('verycenters');
VeryCenters.prototype.test = function(d) {
  return d.verycenter;
};

Leaders = FilterActives.extend('leaders');
Leaders.prototype.test = function(d) {
  return d.leader;
};

Trailers = FilterActives.extend('trailers');
Trailers.prototype.test = function(d) {
  return d.trailer;
};

FacingDancers = FilterActives.extend('facingdancers');
FacingDancers.prototype.test = function(d,ctx) {
  var d2 = ctx.dancerInFront(d);
  return d2 != undefined && ctx.dancerInFront(d2) == d;
};

//# sourceURL=filter_actives.js
