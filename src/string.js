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

//  Extend String with some useful stuff
/**
 *   Return string with first letter of each word capitalized
 */
define(function() {
  var funcprop = {writable: true, enumerable: false};
  String.prototype.toCapCase = function()
  {
    return this.replace(/\b\w+\b/g, function(word) {
      return word.substring(0,1).toUpperCase() +
      word.substring(1).toLowerCase();
    });
  };
  /** Remove leading and trailing whitespace  */
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
  };
  /**  Remove all spaces  */
  String.prototype.collapse = function() {
    return this.replace(/\s+/g,'');
  };
  /**  Capitalize every word and remove all spaces  */
  String.prototype.toCamelCase = function() {
    return this.toCapCase().collapse();
  };

  /**  Parse parameters out of a search string  */
  String.prototype.toArgs = function() {
    return this.split(/\&/).reduce(function(args,a) {
      var v = true;
      var b = a.split(/=/);
      if (b.length > 1) {
        a = b[0];
        v = b[1];
        if (v.match(/n|no|false|0/i))
          v = false;
      }
      a = a.toLowerCase().replace(/\W/g,"");
      args[a] = v;
      return args;
    },{});
  };

  /**  Apply an extension to a filename, replacing any previous extension */
  String.prototype.extension = function(ext) {
    // remove any existing extension
    var f = this.replace(/\.[^\/.]*$/,'');
    // add the extension, make sure with just one dot
    return f + '.' + ext.replace(/^\./,'');
  };

  Object.defineProperties(String.prototype, {
    toCapCase: funcprop,
    trim: funcprop,
    collapse: funcprop,
    toCamelCase: funcprop,
    toArgs: funcprop
  });
  return String;
});
