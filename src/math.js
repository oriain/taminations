/*

    Copyright 2015 Brad Christie

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
"use strict";

//  Math class extensions
define(function() {

  var funcprop = {writable: true, enumerable: false};

  Math.toRadians = function(deg) {
    return deg * Math.PI / 180;
  };

  Math.toDegrees = function(rad) {
    return rad * 180 / Math.PI;
  };

  Math.IEEEremainder = function(d1,d2) {
    var n = Math.round(d1/d2);
    return d1 - n*d2;
  };

  Math.isApprox = function(a,b,delta) {
    delta = delta || 0.1;
    return Math.abs(a-b) < delta;
  };

  Math.angleDiff = function(a1,a2) {
    return ((((a1-a2) % (Math.PI*2)) + (Math.PI*3)) % (Math.PI*2)) - Math.PI;
  };

  Math.anglesEqual = function(a1,a2) {
    return Math.isApprox(Math.angleDiff(a1,a2),0);
  };

  Object.defineProperties(Math,{
    toRadians: funcprop,
    IEEEremainder: funcprop,
    isApprox: funcprop,
    angleDiff: funcprop
  });

  return Math;

});
