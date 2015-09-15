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

define(['affinetransform','bezier'],function(AffineTransform,Bezier) {

  //  Movement class
  //  Constructor for independent heading and movement
  Movement = function(fullb,h,ctrlx1,ctrly1,ctrlx2,ctrly2,x2,y2,
      ctrlx3,ctrly3,ctrlx4,ctrly4,x4,y4,b) {
    if (arguments.length == 1) {
      //  Copying another Movement
      h = fullb.hands;
      ctrlx1 = fullb.cx1;
      ctrly1 = fullb.cy1;
      ctrlx2 = fullb.cx2;
      ctrly2 = fullb.cy2;
      x2 = fullb.x2;
      y2 = fullb.y2;
      ctrlx3 = fullb.cx3;
      ctrly3 = 0;
      ctrlx4 = fullb.cx4;
      ctrly4 = fullb.cy4;
      x4 = fullb.x4;
      y4 = fullb.y4;
      b = fullb.beats;
      fullb = fullb.fullbeats;
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
    this.beats = this.fullbeats = b;
    if (typeof fullb == "number")
      this.fullbeats = b;
    if (typeof h == "string")
      this.hands = Movement.setHands[h];
    else  //  should be one of the ints below
      this.hands = h;
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

  /**
   * Return a new movement by changing the hands
   */
  Movement.prototype.useHands = function(h)
  {
    return new Movement(this.fullbeats,h,
        this.cx1,this.cy1,this.cx2,this.cy2,this.x2,this.y2,
        this.cx3,this.cx4,this.cy4,this.x4,this.y4,this.beats)

  };

  Movement.prototype.clone = function()
  {
    return new Movement(
        this.fullbeats,
        this.hands,
        this.btranslate.ctrlx1,this.btranslate.ctrly1,
        this.btranslate.ctrlx2,this.btranslate.ctrly2,
        this.btranslate.x2,this.btranslate.y2,
        this.brotate.ctrlx1,this.brotate.ctrly1,
        this.brotate.ctrlx2,this.brotate.ctrly2,
        this.brotate.x2,this.brotate.y2);
  };

  /**
   * Return a matrix for the translation part of this movement at time t
   * @param t  Time in beats
   * @return   Matrix for using with canvas
   */
  Movement.prototype.translate = function(t)
  {
    if (typeof t != 'number')
      t = this.beats;
    var tt = Math.min(Math.max(0,t),this.fullbeats);
    return this.btranslate.translate(tt/this.fullbeats);
  };

  /**
   * Return a matrix for the rotation part of this movement at time t
   * @param t  Time in beats
   * @return   Matrix for using with canvas
   */
  Movement.prototype.rotate = function(t)
  {
    if (typeof t != 'number')
      t = this.beats;
    var tt = Math.min(Math.max(0,t),this.fullbeats);
    return this.brotate.rotate(tt/this.fullbeats);
  };

  Movement.prototype.transform = function(t)
  {
    var tx = new AffineTransform();
    tx = tx.preConcatenate(this.translate(t));
    tx = tx.preConcatenate(this.rotate(t));
    return tx;
  };

  Movement.prototype.reflect = function()
  {
    return this.scale(1,-1);
  };

  /**
   * Return a new Movement scaled by x and y factors.
   * If y is negative hands are also switched.
   */
  Movement.prototype.scale = function(x,y)
  {
    return new Movement(beats,
        (y < 0 && this.hands == Movement.RIGHTHAND) ? Movement.LEFTHAND
          : (y < 0 && this.hands == Movement.LEFTHAND) ? Movement.RIGHTHAND
          : this.hands,  // what about GRIPLEFT, GRIPRIGHT?
        this.cx1*x,this.cy1*y,this.cx2*x,this.cy2*y,this.x2*x,this.y2*y,
        this.cx3*x,this.cx4*x,this.cy4*y,this.x4*x,this.y4*y,this.fullbeats)
  };

  /**
   * Return a new Movement with the end point shifted by x and y
   */
  Movement.prototype.skew = function(x,y)
  {
    return new Movement(this.beats,this.hands,this.cx1,this.cy1,
        this.cx2+x,this.cy2+y,this.x2+x,this.y2+y,
        this.cx3,this.cx4,this.cy4,this.x4,this.y4,this.fullbeats)
  };

  Movement.prototype.clip = function(b) {
    if (b > 0 && b < this.fullbeats)
      return new Movement(b,this.hands,this.cx1,this.cy1,
          this.cx2,this.cy2,this.x2,this.y2,
          this.cx3,this.cx4,this.cy4,this.x4,this.y4,this.fullbeats)
    else
      return this;
  }

  Movement.prototype.toString = function()
  {
    return this.btranslate.toString() + ' '+this.brotate.toString();
  };

  return Movement;

});
