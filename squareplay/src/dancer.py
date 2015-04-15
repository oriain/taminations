
import math
import datetime
import bge
from mathutils import Matrix,  Vector
from xml.dom.minidom import Node
from src.movement import Movement
from src.path import Path

class Moving:
  def __init__(self):
    self.reset()
  def reset(self):
    self.forward = False
    self.backward = False
    self.left = False
    self.right = False
    self.turnLeft = False
    self.turnRight = False

class Dancer:

  beats_per_second = 2

  def __init__(self,gender,x=0,y=0,angle=0):
    self.x = x
    self.y = y
    self.gender = gender  #  'boy' or 'girl'
    self.angle = angle  # in degrees
    self.object = None
    self.path = Path()
    self.starttime = 0
    self.computeStart()
    self.moving = Moving()

  def setObject(self,obj):
    self.object = obj
    obj['PythonObject'] = self

  def addPath(self,p):
    self.path.add(p)

  def computeStart(self):
    self.startx = Matrix.Translation(Vector([self.x,self.y,0]))
    self.startx *= Matrix.Rotation(self.angle*math.pi/180,4,'Z')

  def start(self):
    self.starttime = datetime.datetime.now()

  def stop(self):
    self.starttime = 0

  def moveForward(self):
    self.object.applyMovement(Vector([0.05,0,0]),True)
    self.moving.forward = True
  def moveBackward(self):
    self.object.applyMovement(Vector([-0.05,0,0]),True)
    self.moving.backward = True
  def moveLeft(self):
    self.object.applyMovement(Vector([0,0.05,0]),True)
    self.moving.left = True
  def moveRight(self):
    self.object.applyMovement(Vector([0,-0.05,0]),True)
    self.moving.right = True
  def didRotate(self,lr):
    if lr > 0:
      self.moving.turnLeft = True
    if lr < 0:
      self.moving.turnRight = True

  def locationMatrix(self,t):
    '''  Return transform matrix for dancer at time t
    '''
    #  Start with start position
    p = self.startx.copy()
    #  Apply all completed movements
    for m in self.path.movelist:
      if t < m.beats:
        #  Add partial movement and finish
        p *= m.translationMatrix(t)
        p *= m.rotationMatrix(t)
        break
      #  Add complete movement
      p *= m.tx
      t -= m.beats
    return p

  def location(self):
    return self.tx.to_translation()

  def direction(self,t):
    for m in self.path.movelist:
      if t < m.beats:
        return m.direction(t)
      t -= m.beats
    return Vector([0,0,0])

  def rotation(self,t):
    for m in self.path.movelist:
      if t < m.beats:
        return m.rotate(t)
      t -= m.beats
    return 0

  def turn(self,t):
    for m in self.path.movelist:
      if t < m.beats:
        return m.turn(t)
      t -= m.beats
    return 0

  def animate(self,t=0):
    ''' Move dancer to its location at time t '''
    if self.starttime or t:
      if t == 0:
        t = (datetime.datetime.now() - self.starttime).total_seconds() * Dancer.beats_per_second
      self.tx = self.locationMatrix(t)
      #  Get x, y, angle for matching formations
      v = self.tx.to_translation()
      self.x = v.x
      self.y = v.y
      q = self.tx.to_quaternion()
      self.angle = q.angle * 180 / math.pi
      if q.z < -0.1:  #  0 angle sometimes has z of "-0"
        self.angle = (self.angle + 180) % 360
      #  Apply to blender object
      if self.object:
        self.object.worldTransform = self.tx

  def snapUser(self,t=0):
    ''' If the user is moving close to the correct path, snap
        to the correct location and/or angle
    '''
    if self.starttime or t:
      if t == 0:
        t = (datetime.datetime.now() - self.starttime).total_seconds() * Dancer.beats_per_second
      #  Get the ideal location at this time
      p0 = self.locationMatrix(t)
      v0 = p0.to_translation()
      #  Get the direction the dancer should be moving
      dir0 = self.direction(t)
      #  See if the user is moving in the correct direction
      correct = False
      if self.moving.forward and dir0.x > 0:
        correct = True
      if self.moving.backward and dir0.x < 0:
        correct = True
      if self.moving.left and dir0.y > 0:
        correct = True
      if self.moving.right and dir0.y < 0:
        correct = True
      #  Now see if the user is close to the correct location
      d = (self.object.worldPosition - v0).length
      if correct:
        if d < 0.1:
          pass
          #print("Snapping position")
          #self.object.worldPosition = v0

      #  Now do the same for rotation
      #  Get the ideal direction the dancer should be headed
      r0 = self.rotation(t)
      #  Compare to the current direction
      q = self.object.worldTransform.to_quaternion()
      r = q.angle;
      if q.z < -0.1:
        r = (r + math.pi) % (math.pi*2)
      #print('Direction: '+str(r*180/math.pi)+'  Should be: '+str(r0*180/math.pi))
      dr = abs(r-r0)
      #print('Error: '+str(d)+' '+str(dr*180/math.pi))

      self.moving.reset()

  def correctUser(self,t=0):
    #####  NOT USED  #####
    '''  At this point the user has moved the dancer object
         Now check if the movement is too much and correct as needed '''
    if self.starttime or t:
      if t == 0:
        t = (datetime.datetime.now() - self.starttime).total_seconds() * Dancer.beats_per_second
      #  Get the ideal location at this time
      p0 = self.location(t)
      v0 = p0.to_translation()
      #  Get the location at the end of the current movement
      t2 = 0;
      for m in self.path.movelist:
        t2 += m.beats
        if t2 > t:
          break;
      p1 = self.location(t2)
      v1 = p1.to_translation()
      #  Distance from current ideal point to end of movement
      d0 = (v0 - v1).length
      #  Compare with distance from current dancer location to end of movement
      v2 = self.object.worldPosition
      d2 = (v2 - v1).length
      if d2 < d0:
        #  Dancer has moved too far - undo any movement since last frame
        self.object.worldPosition = Vector([self.x,self.y,0])
      else:
        #  Location ok - remember it
        self.x = self.object.worldPosition.x
        self.y = self.object.worldPosition.y
        q = self.object.worldTransform.to_quaternion()
        self.angle = q.angle * 180 / math.pi
        if q.z < -0.1:  #  0 angle sometimes has z of "-0"
          self.angle = (self.angle + 180) % 360


class CallText(Dancer):

  def __init__(self):
    Dancer.__init__(self,'')

  def addPath(self,p,call):
    Dancer.addPath(self,p)
    for m in self.path.movelist:
      if not hasattr(m,'text'):
        m.text = call

  def animate(self,t=0):
    if self.starttime or t:
      if t == 0:
        t = (datetime.datetime.now() - self.starttime).total_seconds() * Dancer.beats_per_second
      m = False
      for m in self.path.movelist:
        if t < m.beats:
          if self.object and hasattr(m,'text'):
            self.object.text = m.text
          break
        t -= m.beats
      else:  #  Fell through the loop, animations are complete
        if self.object and m and hasattr(m,'text'):
          self.object.text = ''
          if self.starttime:
            bge.logic.endGame()

#  Routines connected to Blender controllers
def moveForward():
  bge.logic.getCurrentController().owner['PythonObject'].moveForward()
def moveBackward():
  bge.logic.getCurrentController().owner['PythonObject'].moveBackward()
def moveLeft():
  bge.logic.getCurrentController().owner['PythonObject'].moveLeft()
def moveRight():
  bge.logic.getCurrentController().owner['PythonObject'].moveRight()

def correctUser():
  dancer = bge.logic.getCurrentController().owner
  if 'PythonObject' in dancer:
    dancer['PythonObject'].snapUser()

def animate():
  dancer = bge.logic.getCurrentController().owner
  if 'PythonObject' in dancer:
    dancer['PythonObject'].animate()
