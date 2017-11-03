/*

    Copyright 2017 Brad Christie

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

//  Extend Object class with useful stuff
define(function() {

  class Env {

    /**
     *   This is a simple sub-classing method
     *   Use as
     *     SubClass = Env.extend(ParentClass,constructor);
     *     If ParentClass is not given, then Env is the parent
     *     If no constructor is given, a default empty one is created.
     */
    static extend(p,c)
    {
      p = p || Env;
      c = c || function() { };
      c.prototype = Object.create(p.prototype);
      c.prototype.constructor = c;
      //  Copy any statics as they are not inherited
      for (var prop in p)
        c[prop] = p[prop];
      return c;
    }

    /**
     *   This defines a forEach function for objects similar to the Array function
     *   Parameters:
     *   f(p,v)
     *      A function called for every enumerable property of the object
     *      p is the property, and v is its value
     *   o
     *      An optional object to bind 'this' in the function given as the first parameter
     *      If not given then the calling object is bound
     *
     */
    forEach(f,o) {
      o = o || this;
      for (var p in this) {
        f.call(o,p,this[p]);
      }
    }

    every(f,o) {
      o = o || this;
      for (var p in this) {
        if (!f.call(o,p,this[p]))
          return false;
      }
      return true;
    }

    some(f,o) {
      o = o || this;
      for (var p in this) {
        if (f.call(o,p,this[p]))
          return true;
      }
      return false;
    }

    ifdo(e,f) {
      return e ? f(this) : this;
    }

    //  Object comes with a keys method but not a values method
    values(o) {
      return Object.keys(o).map(function(k) { return this[k]; },o);
    }

  }

  var funcprop = {writable: true, enumerable: false};
  Object.defineProperties(Env.prototype, {
    extend: funcprop,
    forEach: funcprop,
    every: funcprop,
    some: funcprop,
    ifdo: funcprop
  });

  window.Env = Env;  // TODO remove once all code is AMD
  return Env;

});
