
import math
from mathutils import Matrix, Vector

class Bezier:

  def __init__(self,x1,y1,ctrlx1,ctrly1,ctrlx2,ctrly2,x2,y2):
    self.x1 = x1
    self.y1 = y1
    self.ctrlx1 = ctrlx1
    self.ctrly1 = ctrly1
    self.ctrlx2 = ctrlx2
    self.ctrly2 = ctrly2
    self.x2 = x2
    self.y2 = y2
    self.calculatecoefficients()

  def calculatecoefficients(self):
    self.cx = 3.0*(self.ctrlx1-self.x1)
    self.bx = 3.0*(self.ctrlx2-self.ctrlx1) - self.cx
    self.ax = self.x2 - self.x1 - self.cx - self.bx

    self.cy = 3.0*(self.ctrly1-self.y1)
    self.by = 3.0*(self.ctrly2-self.ctrly1) - self.cy
    self.ay = self.y2 - self.y1 - self.cy - self.by

  #  Return the location along the curve given "t" between 0 and 1
  def translation(self,t):
    x = self.x1 + t*(self.cx + t*(self.bx + t*self.ax))
    y = self.y1 + t*(self.cy + t*(self.by + t*self.ay))
    return Vector([x,y,0])
  def translationMatrix(self,t):
    return Matrix.Translation(self.translation(t))

  #  Return the direction. which is the derivative, given "t" between 0 and 1
  def direction(self,t):
    x = self.cx + t*(2.0*self.bx + t*3.0*self.ax)
    y = self.cy + t*(2.0*self.by + t*3.0*self.ay)
    return Vector([x,y,0])
  def directionMatrix(self,t):
    return Matrix.Translation(self.direction(t))

  #  Return the angle of the derivative given "t" between 0 and 1
  #  This is the angle that the curve is moving to
  def rotation(self,t):
    x = self.cx + t*(2.0*self.bx + t*3.0*self.ax)
    y = self.cy + t*(2.0*self.by + t*3.0*self.ay)
    return math.atan2(y,x)
  def rotationMatrix(self,t):
    return Matrix.Rotation(self.rotation(t),4,'Z')

  #  Return the angle of the second derivative given "t"
  #  For determining the turning direction
  def turn(self,t):
    x = 2.0*self.bx + t*6.0*self.ax
    y = 2.0*self.by + t*6.0*self.ay
    return math.atan2(y,x)
  def turnMatrix(self,t):
    return Matrix.Rotation(self.turn(t),4,'Z')
