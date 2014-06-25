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

define(['affinetransform','bezier'],function(AffineTransform,Bezier) {

  //  Movement class
  //  Constructor for independent heading and movement
  Movement = function(h,b,ctrlx1,ctrly1,ctrlx2,ctrly2,x2,y2,
      ctrlx3,ctrly3,ctrlx4,ctrly4,x4,y4) {
    if (arguments.length == 1) {
      b = h.beats;
      ctrlx1 = h.cx1;
      ctrly1 = h.cy1;
      ctrlx2 = h.cx2;
      ctrly2 = h.cy2;
      x2 = h.x2;
      y2 = h.y2;
      ctrlx3 = h.cx3;
      ctrly3 = 0;
      ctrlx4 = h.cx4;
      ctrly4 = h.cy4;
      x4 = h.x4;
      y4 = h.y4;
      h = h.hands;
    }
    this.btranslate = new Bezier(0,0,ctrlx1,ctrly1,ctrlx2,ctrly2,x2,y2);
    this.numargs = arguments.length;
    this.myargs = [];
    for (var i in arguments)
      this.myargs[i] = arguments[i];
    if (ctrlx3 != undefined)
      this.brotate = new Bezier(0,0,ctrlx3,ctrly3,ctrlx4,ctrly4,x4,y4);
    else
      this.brotate = new Bezier(0,0,ctrlx1,ctrly1,ctrlx2,ctrly2,x2,y2);
    this.beats = b;
    if (typeof h == "string")
      this.usehands = Movement.setHands[h];
    else
      this.usehands = h;
  };

  Movement.NOHANDS = 0;
  Movement.LEFTHAND = 1;
  Movement.RIGHTHAND = 2;
  Movement.BOTHHANDS = 3;
  Movement.GRIPLEFT = 5;
  Movement.GRIPRIGHT = 6;
  Movement.GRIPBOTH =  7;
  Movement.ANYGRIP =  4;
  Movement.setHands = { "none": Movement.NOHANDS,
      "left": Movement.LEFTHAND,
      "right": Movement.RIGHTHAND,
      "both": Movement.BOTHHANDS,
      "gripleft": Movement.GRIPLEFT,
      "gripright": Movement.GRIPRIGHT,
      "gripboth": Movement.GRIPBOTH,
      "anygrip": Movement.ANYGRIP };

  Movement.prototype.useHands = function(h)
  {
    this.usehands = h;
    return this;
  };

  Movement.prototype.clone = function()
  {
    var m = new Movement(this.usehands,
        this.beats,
        this.btranslate.ctrlx1,this.btranslate.ctrly1,
        this.btranslate.ctrlx2,this.btranslate.ctrly2,
        this.btranslate.x2,this.btranslate.y2,
        this.brotate.ctrlx1,this.brotate.ctrly1,
        this.brotate.ctrlx2,this.brotate.ctrly2,
        this.brotate.x2,this.brotate.y2);
    return m;
  };

  Movement.prototype.translate = function(t)
  {
    if (typeof t != 'number')
      t = this.beats;
    var tt = Math.min(Math.max(0,t),this.beats);
    return this.btranslate.translate(tt/this.beats);
  };

  Movement.prototype.rotate = function(t)
  {
    if (typeof t != 'number')
      t = this.beats;
    var tt = Math.min(Math.max(0,t),this.beats);
    return this.brotate.rotate(tt/this.beats);
  };

  Movement.prototype.transform = function(t)
  {
    var tx = new AffineTransform();
    tx.concatenate(this.translate(t));
    tx.concatenate(this.rotate(t));
    return tx;
  };

  Movement.prototype.reflect = function()
  {
    return this.scale(1,-1);
  };

  Movement.prototype.scale = function(x,y)
  {
    this.btranslate = new Bezier(0,0,this.btranslate.ctrlx1*x,
        this.btranslate.ctrly1*y,
        this.btranslate.ctrlx2*x,
        this.btranslate.ctrly2*y,
        this.btranslate.x2*x,
        this.btranslate.y2*y);
    this.brotate = new Bezier(0,0,this.brotate.ctrlx1*x,
        this.brotate.ctrly1*y,
        this.brotate.ctrlx2*x,
        this.brotate.ctrly2*y,
        this.brotate.x2*x,
        this.brotate.y2*y);
    if (y < 0) {
      if (this.usehands == Movement.LEFTHAND)
        this.usehands = Movement.RIGHTHAND;
      else if (this.usehands == Movement.RIGHTHAND)
        this.usehands = Movement.LEFTHAND;
    }
    return this;
  };

  Movement.prototype.skew = function(x,y)
  {
    this.btranslate = new Bezier(0,0,this.btranslate.ctrlx1,
        this.btranslate.ctrly1,
        this.btranslate.ctrlx2+x,
        this.btranslate.ctrly2+y,
        this.btranslate.x2+x,
        this.btranslate.y2+y);
    return this;
  };

  Movement.prototype.toString = function()
  {
    return this.btranslate.toString() + ' '+this.brotate.toString();
  };

  return Movement;

});
