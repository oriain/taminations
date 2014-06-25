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

define(['movement','affinetransform'],function(Movement,AffineTransform) {

  //  Path class
  Path = function(p)
  {
    this.movelist = [];
    this.transformlist = [];
    if (p instanceof Path) {
      for (var m in p.movelist)
        this.add(p.movelist[m].clone());
    }
    else if (p && (p.select != undefined)) {
      var mm = tam.translateMove(p);
      for (var m in mm)
        this.add(new Movement(mm[m]));
    }
    else if (p instanceof Movement) {
      this.add(p.clone());
    }
    else if (p) {
      for (var i=0; i<p.length; i++) {
        if (p[i] instanceof Movement)
          this.add(p[i]);
        else if (p[i].cx1 != undefined)
          this.add(new Movement(p[i]));
        else
          this.add(new Path(p[i]));
      }
    }
  };

  Path.prototype.clear = function()
  {
    this.movelist = [];
    this.transformlist = [];
  };

  var recalc_count = 0;
  Path.prototype.recalculate = function()
  {
    recalc_count++;
    this.transformlist = [];
    var tx = new AffineTransform();
    for (var i in this.movelist) {
      var tt = this.movelist[i].translate(999);
      tx.concatenate(tt);
      var tr = this.movelist[i].rotate(999);
      tx.concatenate(tr);
      this.transformlist.push(new AffineTransform(tx));
    }
  };

  //  Return total number of beats in path
  Path.prototype.beats = function()
  {
    var b = 0.0;
    if (this.movelist != null) {
      for (var i in this.movelist)
        b += this.movelist[i].beats;
    }
    return b;
  };

  //  Make the path run slower or faster to complete in a given number of beats
  Path.prototype.changebeats = function(newbeats)
  {
    if (this.movelist != null) {
      var factor = newbeats/this.beats();
      for (var i in this.movelist)
        this.movelist[i].beats *= factor;
    }
  };

  //  Change hand usage
  Path.prototype.changehands = function(hands)
  {
    if (this.movelist != null) {
      for (var i in this.movelist)
        this.movelist[i].useHands(hands);
    }
  };

  //  Change the path by scale factors
  Path.prototype.scale = function(x,y)
  {
    if (this.movelist != null) {
      for (var i in this.movelist)
        this.movelist[i].scale(x,y);
    }
  };

  //  Skew the path by translating the destination point
  Path.prototype.skew = function(x,y)
  {
    if (this.movelist != null)
      this.movelist[this.movelist.length-1].skew(x,y);
  };

  //  Append one movement to the end of the Path
  Path.prototype.add = function(m)
  {
    if (m instanceof Movement)
      this.movelist.push(m);
    if (m instanceof Path)
      this.movelist = this.movelist.concat(m.movelist);
    this.recalculate();
    return this;
  };

  //  Reflect the path about the x-axis
  Path.prototype.reflect = function()
  {
    for (var i in this.movelist)
      this.movelist[i].reflect();
    this.recalculate();
    return this;
  };

  return Path;

});