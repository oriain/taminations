import bge
from src.dancer import Dancer

#  A formation is just a list of Dancer
#  This module is methods that operate on a formation

def getFormation(fs):
  '''  Given the string of a formation name or definition,
       returns the definition as a list of dancer
  '''
  caller = bge.logic.getCurrentController().owner
  #  Get formation definition
  if not fs.startswith('Formation'):
    fs = caller['formations'][fs]
  #  Parse definition
  tokens = fs.split()
  dancers = [];
  for i in range(1,len(tokens),4):
    d = Dancer(tokens[i],float(tokens[i+1]),float(tokens[i+2]),float(tokens[i+3]))
    dancers.append(d)
    #  Add implied symmetric dancer
    d = Dancer(tokens[i],-float(tokens[i+1]),-float(tokens[i+2]),(float(tokens[i+3])+180)%360)
    dancers.append(d)
  return dancers

def rotateFormation(f):
  '''  Rotate a formation by 90 degrees  '''
  for d in f:
    (d.x,d.y) = (d.y,-d.x)
    d.angle = (d.angle - 90) % 360

def matchFormations(f1,f2,genderSpecific=False):
  '''  Test if two formations match.  If so, return
       a mapping between the two, from f1 to f2, as a dictionary
  '''
  if len(f1) != len(f2):
    return False
  retval = {}
  for (i1,d1) in enumerate(f1):
    for (i2,d2) in enumerate(f2):
      if abs(d1.x-d2.x) > 0.1:
        continue
      if abs(d1.y-d2.y) > 0.1:
        continue
      if abs(d1.angle-d2.angle) > 10:
        continue
      if genderSpecific and d1.gender != d2.gender:
        continue
      retval[i1] = i2
  if len(retval) != len(f1):
    retval = False
  return retval