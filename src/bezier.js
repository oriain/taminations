/*

    Copyright 2017 Brad Christie

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

define(['affinetransform'],function(AffineTransform) {

  //  Bezier class
  Bezier = function (x1,y1,ctrlx1,ctrly1,ctrlx2,ctrly2,x2,y2)
  {
    this.x1 = x1;
    this.y1 = y1;
    this.ctrlx1 = ctrlx1;
    this.ctrly1 = ctrly1;
    this.ctrlx2 = ctrlx2;
    this.ctrly2 = ctrly2;
    this.x2 = x2;
    this.y2 = y2;
    this.calculatecoefficients();
  };

  Bezier.prototype.calculatecoefficients = function()
  {
    this.cx = 3.0*(this.ctrlx1-this.x1);
    this.bx = 3.0*(this.ctrlx2-this.ctrlx1) - this.cx;
    this.ax = this.x2 - this.x1 - this.cx - this.bx;

    this.cy = 3.0*(this.ctrly1-this.y1);
    this.by = 3.0*(this.ctrly2-this.ctrly1) - this.cy;
    this.ay = this.y2 - this.y1 - this.cy - this.by;
  };

  //  Compute X, Y values for a specific t value
  Bezier.prototype.xt = function(t) {
    return this.x1 + t*(this.cx + t*(this.bx + t*this.ax))
  }
  Bezier.prototype.yt = function(t) {
    return this.y1 + t*(this.cy + t*(this.by + t*this.ay))
  }
  //  Compute dx, dy values for a specific t value
  Bezier.prototype.dxt = function(t) {
    return this.cx + t*(2.0*this.bx + t*3.0*this.ax)
  }
  Bezier.prototype.dyt = function(t) {
    return this.cy + t*(2.0*this.by + t*3.0*this.ay)
  }
  Bezier.prototype.angle = function(t) {
    return Math.atan2(this.dyt(t),this.dxt(t))
  }

  //  Return the movement along the curve given "t" between 0 and 1
  Bezier.prototype.translate = function(t)
  {
    var x = this.xt(t)
    var y = this.yt(t)
    return AffineTransform.getTranslateInstance(x,y);
  };

  //  Return the angle of the derivative given "t" between 0 and 1
  Bezier.prototype.rotate = function(t)
  {
    var theta = this.angle(t)
    return AffineTransform.getRotateInstance(theta);
  };

  //  Return turn direction at end of curve
  Bezier.prototype.rolling = function()
  {
    //  Check angle at end
    var theta = this.angle(1.0)
    //  If it's 180 then use angle at halfway point
    if (Math.anglesEqual(theta,Math.PI))
      theta = this.angle(0.5)
    //  If angle is 0 then no turn
    if (Math.anglesEqual(theta,0))
      return 0
    else
      return theta
  }

  //  Return the angle of the 2nd derivative given "t" between 0 and 1
  Bezier.prototype.turn = function(t)
  {
    var x = 2.0*this.bx + t*6.0*this.ax;
    var y = 2.0*this.by + t*6.0*this.ay;
    var theta = Math.atan2(y,x);
    return theta;
  };


  Bezier.prototype.toString = function()
  {
    return '[ '+this.x1.toFixed(1)+' '+this.y1.toFixed(1)+' '+
    this.ctrlx1.toFixed(1)+' '+this.ctrly1.toFixed(1)+' '+
    this.ctrlx2.toFixed(1)+' '+this.ctrly2.toFixed(1)+' '+
    this.x2.toFixed(1)+' '+this.y2.toFixed(1)+' ]';
  };

  return Bezier;

});
