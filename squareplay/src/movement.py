
import os
import sys
import json
import copy
import re
from xml.dom.minidom import Node
from src.bezier import Bezier
from mathutils import Vector, Matrix

def expandPath(p):
  retval = []
  if isinstance(p,list):
    for m in p:
      retval += m.expand()
  else:
    retval += p.expand()
  return retval

"""
Movement is a low-level representation, one part of a Path
"""
class Movement:
  def __init__(self,move):
    self.btranslate = Bezier(0,0,move.cx1,move.cy1,move.cx2,move.cy2,move.x2,move.y2)
    if move.cx3 > 0:
      self.brotate = Bezier(0,0,move.cx3,move.cy3,move.cx4,move.cy4,move.x4,move.y4)
    else:
      self.brotate = Bezier(0,0,move.cx1,move.cy1,move.cx2,move.cy2,move.x2,move.y2)
    #  Compute transform for completed movement
    self.beats = move.beats
    self.hands = move.hands
    if (self.beats > 0):
      self.tx = self.translationMatrix(self.beats) * self.rotationMatrix(self.beats)

  #  Return a translation for a specific time
  def translate(self,t):
    t = min(max(0,t),self.beats)
    return self.btranslate.translate(t/self.beats)
  def translationMatrix(self,t):
    t = min(max(0,t),self.beats)
    return self.btranslate.translationMatrix(t/self.beats)

  def reflect(self):
    return self.scale(1,-1)

  #  Return a rotation for a specific time
  def rotate(self,t):
    t = min(max(0,t),self.beats)
    return self.brotate.rotate(t/self.beats)
  def rotationMatrix(self,t):
    t = min(max(0,t),self.beats)
    return self.brotate.rotationMatrix(t/self.beats)

  def scale(self,x,y):
    self.btranslate = Bezier(0,0,self.btranslate.ctrlx1*x,
                                 self.btranslate.ctrly1*y,
                                 self.btranslate.ctrlx2*x,
                                 self.btranslate.ctrly2*y,
                                 self.btranslate.x2*x,
                                 self.btranslate.y2*y);
    self.brotate = Bezier(0,0,self.brotate.ctrlx1*x,
                              self.brotate.ctrly1*y,
                              self.brotate.ctrlx2*x,
                              self.brotate.ctrly2*y,
                              self.brotate.x2*x,
                              self.brotate.y2*y)
    if y < 0:
      if self.usehands == LEFTHAND:
        self.usehands = RIGHTHAND
      elif self.usehands == RIGHTHAND:
        self.usehands = LEFTHAND
    return self;


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

  def __repr__(self):
    return ('{hands:'+str(self.hands)+
           ' beats:'+str(self.beats)+
           ' cx1:'+str(self.btranslate.ctrlx1)+
           ' cy1:'+str(self.btranslate.ctrly1)+
           ' cx2:'+str(self.btranslate.ctrlx2)+
           ' cy2:'+str(self.btranslate.ctrly2)+
           ' x2:'+str(self.btranslate.x2)+
           ' y2:'+str(self.btranslate.y2)+
           ' cx3:'+str(self.brotate.ctrlx1)+
           ' cx4:'+str(self.brotate.ctrlx2)+
           ' cy4:'+str(self.brotate.ctrly2)+
           ' x4:'+str(self.brotate.x2)+
           ' y4:'+str(self.brotate.y2)+
           '}')

"""
Move is a high-level representation, a user's part of a dancer's path
There can be more than one Movements in one Move
Move is converted to an array of lower-level Moves with the expand method
Those moves can then be converted to Movements
"""
class Move:

  NOHANDS = 0
  LEFTHAND = 1
  RIGHTHAND = 2
  BOTHHANDS = 3
  GRIPLEFT = 5
  GRIPRIGHT = 6
  GRIPBOTH =  7
  ANYGRIP =  4
  setHands = { "none": NOHANDS,
               "no": NOHANDS,
               "left": LEFTHAND,
               "right": RIGHTHAND,
               "both": BOTHHANDS,
               "gripleft": GRIPLEFT,
               "gripright": GRIPRIGHT,
               "gripboth": GRIPBOTH,
               "anygrip": ANYGRIP }
  moves = {}

  def init(tamsrc):
    #  Load JSON code of movements from javascript source
    movesrc = re.search('var paths =\s*(\{.*?);',tamsrc,re.DOTALL).group(1)
    movesrc = re.sub('//.*','',movesrc)
    movejson = json.loads(movesrc)
    for m in movejson:
      Move.moves[m] = Move(movejson[m])

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

    if isinstance(self.hands,str):
      self.hands = Move.setHands[self.hands]

  def __repr__(self):
    return ('{select:'+str(self.select)+
           ' hands:'+str(self.hands)+
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

  #  Returns an array of Moves generated from this Move
  def expand(self):
    retval = []
    if self.select:
      #  Recursively expand a "select" move
      retval = expandPath(Move.moves[self.select])
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
      #  Single low-level Move
      #  Copy self so when it's scaled the original doesn't get stepped on
      retval = [copy.copy(self)]
    return retval

  def useHands(self,h):
    if isinstance(h,str):
      h = setHands[h]
    self.usehands = h
