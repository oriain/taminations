
import os
import sys
import json
import copy
import re
from xml.dom.minidom import Node
from src.bezier import Bezier
from mathutils import Vector, Matrix

def init(tamsrc):
  #  Load JSON code of movements from javascript source
  movesrc = re.search('var paths =\s*(\{.*?);',tamsrc,re.DOTALL).group(1)
  movesrc = re.sub('//.*','',movesrc)
  movejson = json.loads(movesrc)
  Move.movements = {}
  for m in movejson:
    Move.movements[m] = Move(movejson[m])


def expandPath(p):
  retval = []
  if isinstance(p,list):
    for m in p:
      retval += m.expand()
  else:
    retval += p.expand()
  return retval

class Move:

  def __init__(self,m):
    #  Movement fields
    self.hands = 'no'
    self.beats = 0
    self.cx1 = 0
    self.cy1 = 0
    self.cx2 = 0
    self.cy2 = 0
    self.x2 = 0
    self.y2 = 0
    self.cx3 = 0
    self.cy3 = 0  # always
    self.cx4 = 0
    self.cy4 = 0
    self.x4 = 0
    self.y4 = 0

    #  Additional fields for moves in a path
    self.select = False
    self.scaleX = 1
    self.scaleY = 1
    self.offsetX = 0
    self.offsetY = 0
    self.reflect = False

    if isinstance(m,Node):
      self.select = m.getAttribute('select')  # better have one
      if m.hasAttribute('beats'):
        self.beats = float(m.getAttribute('beats'))
      if m.hasAttribute('hands'):
        self.hands = m.getAttribute('hands')
      if m.hasAttribute('offsetX'):
        self.offsetX = float(m.getAttribute('offsetX'))
      if m.hasAttribute('offsetY'):
        self.offsetY = float(m.getAttribute('offsetY'))
      if m.hasAttribute('scaleX'):
        self.scaleX = float(m.getAttribute('scaleX'))
      if m.hasAttribute('scaleY'):
        self.scaleY = float(m.getAttribute('scaleY'))

    if isinstance(m,dict):
      #  Convert dictionary to object
      for f in m:
        self.__dict__[f] = m[f]

  def computeTransforms(self):
    #  Compute Beziers for animation
    self.btranslate = Bezier(0,0,self.cx1,self.cy1,self.cx2,self.cy2,self.x2,self.y2)
    if self.cx3 > 0:
      self.brotate = Bezier(0,0,self.cx3,self.cy3,self.cx4,self.cy4,self.x4,self.y4)
    else:
      self.brotate = Bezier(0,0,self.cx1,self.cy1,self.cx2,self.cy2,self.x2,self.y2)
    #  Compute transform for completed movement
    if (self.beats > 0):
      self.tx = self.translationMatrix(self.beats) * self.rotationMatrix(self.beats)

  def __repr__(self):
    return ('{hands:'+self.hands+
           ' beats:'+str(self.beats)+
           ' cx1:'+str(self.cx1)+
           ' cy1:'+str(self.cy1)+
           ' cx2:'+str(self.cx2)+
           ' cy2:'+str(self.cy2)+
           ' x2:'+str(self.x2)+
           ' y2:'+str(self.y2)+
           ' cx3:'+str(self.cx3)+
           ' cx4:'+str(self.cx4)+
           ' cy4:'+str(self.cy4)+
           ' x4:'+str(self.x4)+
           ' y4:'+str(self.y4)+
           '}')

  def expand(self):
    retval = []
    if self.select:
      retval = expandPath(Move.movements[self.select])
      beats = sum([a.beats for a in retval])
      for a in retval:
        if self.beats > 0:
          a.beats *= self.beats / beats
        a.cx1 *= self.scaleX
        a.cx2 *= self.scaleX
        a.x2 *= self.scaleX
        a.cx3 *= self.scaleX
        a.cx4 *= self.scaleX
        a.x4 *= self.scaleX
        a.cy1 *= self.scaleY
        a.cy2 *= self.scaleY
        a.y2 *= self.scaleY
        a.cy4 *= self.scaleY
        a.y4 *= self.scaleY
        if self.reflect:
          a.cy1 *= -1
          a.cy2 *= -1
          a.y2 *= -1
          a.cy4 *= -1
          a.y4 *= -1
        a.cx2 += self.offsetX
        a.x2 += self.offsetX
        a.cy2 += self.offsetY
        a.y2 += self.offsetY
        if self.hands:
          a.hands = self.hands
        elif self.reflect:
          if a.hands == "right":
            a.hands = "left"
          elif a.hands == "left":
            a.hands = "right"
          elif a.hands == "gripright":
            a.hands = "gripleft"
          elif a.hands == "gripleft":
            a.hands = "gripright"
    else:
      #  A movement - return a copy so the original doesn't get modified
      retval = [copy.copy(self)]
    for a in retval:
      a.computeTransforms()
    return retval

  #  Return a translation for a specific time
  def translation(self,t):
    t = min(max(0,t),self.beats)
    return self.btranslate.translate(t/self.beats)
  def translationMatrix(self,t):
    t = min(max(0,t),self.beats)
    return self.btranslate.translationMatrix(t/self.beats)

  #  Return a rotation for a specific time
  def rotation(self,t):
    t = min(max(0,t),self.beats)
    return self.brotate.rotation(t/self.beats)
  def rotationMatrix(self,t):
    t = min(max(0,t),self.beats)
    return self.brotate.rotationMatrix(t/self.beats)

  #  Return the moving direction for a specific time
  def direction(self,t):
    if t < self.beats:
      return self.btranslate.direction(t/self.beats)
    return Vector([0,0,0])
  def directionMatrix(self,t):
    return Matrix.Translation(self.direction(t))

  def turn(self,t):
    if t < self.beats:
      return self.btranslate.turn(t/self.beats)
    return 0
  def turnMatrix(self,t):
    return Matrix.Rotation(self.turn(t),4,'Z')
