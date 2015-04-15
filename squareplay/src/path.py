
from mathutils import Matrix
from src.movement import Move, Movement
from xml.dom.minidom import Node

class Path:

  def __init__(self,p=None):
    self.movelist = []
    self.transformlist = []
    self.pathlist = []
    if isinstance(p,Path):
      for m in p.movelist:
        self.add(p.movelist[m])
    elif isinstance(p,Move):
      for mm in p.expand():
        self.add(Movement(mm))
    elif isinstance(p,list):
      for m in p:
        if isinstance(m,Move):
          for mm in m.expand():
            self.add(Movement(mm))
        elif isinstance(m,Movement):
          self.add(m)

  def clear(self):
    self.movelist = []
    self.transformlist = []
    self.pathlist = []

  def recalculate(self):
    self.transformlist = []
    tx = Matrix.Identity(3)
    for m in self.movelist:
      tt = m.translate(999)
      tx = tx * tt
      tr = m.rotate(999)
      tx = tx * tr
      self.transformlist.append(tx)

  def beats(self):
    b = 0.0
    for m in self.movelist:
      b += m.beats
    return b

  def changebeats(self,newbeats):
    factor = newbeats/self.beats()
    for m in self.movelist:
      m.beats *= factor

  def changehands(self,hands):
    for m in self.movelist:
      m.useHands(hands)

  def scale(self,x,y):
    for m in self.movelist:
      m.scale(x,y)

  def skew(self,x,y):
    for m in self.movelist:
      m.skew(x,y)

  def add(self,m):
    if isinstance(m,Movement):
      self.movelist.append(m)
    if isinstance(m,Path):
      self.movelist += m.movelist
    if isinstance(m,Node):
      for mm in m.childNodes:
        if mm.nodeType == Node.ELEMENT_NODE:
          self.movelist += [Movement(x) for x in Move(mm).expand()]
    self.recalculate()
    return self

  def reflect(self):
    for m in self.movelist:
      m.reflect()
    self.recalculate
    return self
