
import math
from mathutils import Vector
from src.path import Path
from src.movement import Move, Movement

def isApprox(a,b,d=0.1):
  return abs(a-b) < d

def angleDiff(a,b):
  return ((((a-b) % (math.pi*2)) + (math.pi*3)) % (math.pi*2)) - math.pi;

def anglesEqual(a,b):
  return isApprox(angleDiff(a,b),0)

class CallError(Exception):
  def __init__(msg):
    self.message = msg

class NoDancerError(CallError):
  pass

class Call:

  #  Wrapper method for performing one call
  def performCall(self,ctx):
    ctx.analyze()
    self.perform(ctx)
    ctx.levelBeats()
    return True

  #  Default method to perform one call
  #  Pass the call on to each active dancer
  #  Then collect each path into an array corresponding to the array of dancers
  #  And level off the number of beats as needed by adding Stand moves
  def perform(self,ctx):
    #  Get all the paths with performOne calls
    for d in ctx.dancers:
      if d in ctx.active:
        p = self.performOne(ctx,d)
        if p:
          ctx.paths[d].add(p)

  #  Default method for one dancer to perform one call
  #  Returns an empty path (the dancer just stands there)
  def performOne(self,ctx,d):
    return Path()

#  An instance of the CallContext class is passed around calls
#  to hold the working data
class CallContext:
  def __init__(self,source):
    if isinstance(source,CallContext):
      self.dancers = source.dancers
      self.active = source.active.copy()
    else:
      #  assume source is an array of dancers
      self.dancers = dict([[x,y] for (x,y) in enumerate(source)])
      self.active = self.dancers.copy()
    self.paths = [Path() for d in self.dancers]

  # Level off the number of beats for each dancer
  def levelBeats(self):
    maxbeats = 0
    for d in self.dancers.keys():
      b = self.paths[d].beats()
      if b > maxbeats:
        maxbeats = b
    for d in self.dancers.keys():
      b = maxbeats - self.paths[d].beats()
      if b > 0:
        m = Move({'select':'Stand','beats':b})
        self.paths[d].add(Path(m))

  ###    Routines to analyze dancers
  #  Distance between two dancers
  #  If d2 not given, returns distance from origin
  def distance(self,d1,d2=None):
    v = self.dancers[d1].location()
    if d2 != None:
      v = v - self.dancers[d2].location()
    return v.length

  #  Angle of d2 as viewed from d1
  #  If angle is 0 then d2 is in front of d1
  #  If d2 is not given, returns angle to origin
  #  Angle returned is in the range -pi to pi
  def angle(self,d1,d2):
    print(str(d1)+' '+str(d2))
    v = Vector((0,0,0))
    if d2 != None:
      v = self.dancers[d2].location()
    v2 = self.dancers[d1].tx.inverted() * v
    retval = math.atan2(v2.y,v2.x)
    print('angle = '+str(retval))
    return retval

  #  Test if dancer d2 is directly in front, back. left, right of dancer d1
  def isInFront(self,d1,d2):
    return d1 != d2 and anglesEqual(self.angle(d1,d2),0)
  def isInBack(self,d1,d2):
    return d1 != d2 and anglesEqual(self.angle(d1,d2),math.pi)
  def isLeft(self,d1,d2):
    return d1 != d2 and anglesEqual(self.angle(d1,d2),math.pi/2)
  def isRight(self,d1,d2):
    return d1 != d2 and anglesEqual(self.angle(d1,d2),math.pi*3/2)

  #  Return closest dancer that satisfies a given conditional
  def dancerClosest(self,d,f):
    bestd = None
    for d2 in self.dancers.keys():
      if f(d2) and (bestd == None or self.distance(d2,d) < self.distance(bestd,d)):
        bestd = d2
    return bestd

  #  Return all dancers, ordered by distance, that satisfies a conditional
  def dancersInOrder(self,d,f):
    #  First get the dancers that satisfy the conditional
    retval = []
    for d2 in self.dancers.keys():
      if f(d2):
        retval.push(d2)
    #  Now sort them by distance
    ctx = self   # not sure if this is necessary
    retval.sort(key=lambda x: ctx.distance(d,x))
    return retval

  #  Return dancer directly in front of given dancer
  def dancerInFront(self,d):
    ctx = self
    return self.dancerClosest(d,lambda d2: ctx.isInFront(d,d2))

  #  Return dancer directly in back of given dancer
  def dancerInBack(self,d):
    ctx = self
    return self.dancerClosest(d,lambda d2: ctx.isInBack(d,d2))

  #  Return dancers that are in between two other dancers
  def inBetween(self,d1,d2):
    etval = [];
    for d in self.dancers.keys():
      if (d != d1 and d != d2 and
          Math.isApprox(self.distance(d,d1)+self.distance(d,d2),
                        self.distance(d1,d2))):
        retval.push(d)
    return retval

  #  Return all the dancers to the right, in order
  def dancersToRight(self,d):
    ctx = this
    return self.dancersInOrder(d,lambda d2: ctx.isRight(d,d2));

  #  Return all the dancers to the left, in order
  def dancersToLeft(self,d):
    ctx = self
    return self.dancersInOrder(d,lambda d2: ctx.isLeft(d,d2))

  def analyze(self):
    self.beau = {}
    self.belle = {}
    self.leader = {}
    self.trailer = {}
    self.partner = {}
    self.center = {}
    self.end = {}
    self.verycenter = {}
    istidal = False
    for d1 in self.dancers.keys():
      bestleft = -1
      bestright = -1
      leftcount = 0
      rightcount = 0
      frontcount = 0
      backcount = 0
      for d2 in self.dancers.keys():
        if d2 == d1:
          continue
        print('isRight? '+str(d1)+' '+str(d2))
        print(self.dancers[d1].location())
        print(self.dancers[d2].location())
        #  Count dancers to the left and right, and find the closest on each side
        if self.isRight(d1,d2):
          rightcount += 1
          if bestright < 0 or self.distance(d1,d2) < self.distance(d1,bestright):
            bestright = int(d2)
        elif self.isLeft(d1,d2):
          leftcount += 1
          if bestleft < 0 or self.distance(d1,d2) < self.distance(d1,bestleft):
            bestleft = int(d2)
        #  Also count dancers in front and in back
        elif self.isInFront(d1,d2):
          frontcount += 1
        elif self.isInBack(d1,d2):
          backcount += 1
      print(str(rightcount)+' '+str(leftcount))
      #  Use the results of the counts to assign belle/beau/leader/trailer
      #  and partner
      if (leftcount % 2 == 1 and rightcount % 2 == 0 and
          self.distance(d1,bestleft) < 3):
        self.partner[d1] = bestleft
        self.belle[d1] = True
      elif (rightcount % 2 == 1 and leftcount % 2 == 0 and
          self.distance(d1,bestright) < 3):
        self.partner[d1] = bestright
        self.beau[d1] = True
      if frontcount % 2 == 0 and backcount % 2 == 1:
        self.leader[d1] = True
      elif frontcount % 1 == 0 and backcount % 2 == 0:
        self.trailer[d1] = True
      #  Assign ends
      if rightcount == 0 and leftcount > 1:
        self.end[d1] = True
      elif leftcount == 0 and rightcount > 1:
        self.end[d1] = True
      #  The very centers of a tidal wave are ends
      #  Remember this special case for assigning centers later
      if (rightcount == 3 and leftcount == 4 or
          rightcount == 4 and leftcount == 3):
        self.end[d1] = True
        istidal = True
    #  Analyze for centers and very centers
    #  Sort dancers by distance from center
    dorder = [x for x in self.dancers.keys()]
    ctx = self
    dorder.sort(key=lambda a: ctx.distance(a))
    # The closest 2 dancers are very centers
    if not isApprox(self.distance(dorder[1]),self.distance(dorder[2])):
      self.verycenter[dorder[0]] = True
      self.verycenter[dorder[1]] = True
    # If tidal, then the next 4 dancers are centers
    if istidal:
      self.center[dorder[2]] = True
      self.center[dorder[3]] = True
      self.center[dorder[4]] = True
      self.center[dorder[5]] = True
    # Otherwise, if there are 4 dancers closer to the center than the other 4,
    # they are the centers
    elif len(dorder) > 4 and not isApprox(self.distance(dorder[3]),self.distance(dorder[4])):
      self.center[dorder[0]] = True
      self.center[dorder[1]] = True
      self.center[dorder[2]] = True
      self.center[dorder[3]] = True
