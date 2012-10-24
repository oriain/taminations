import sys
import os
import glob
import re
import xml.dom.minidom
import json
import bge
from src.formation import getFormation, matchFormations, rotateFormation
from src.dancer import CallText
from src.movement import Move, Movement
from src.path import Path
from src.calls.call import Call, CallContext

def init():
  caller = bge.logic.getCurrentController().owner
  if caller['init'] == 'init':

    #  Get the location of the source directory
    here = [p for p in sys.path if p.endswith('squareplay')][0]
    caller['here'] = here

    #  Load json index of calls
    callindexfile = os.path.join(here,'../src/callindex.json')
    callindex = open(callindexfile).read()
    caller['callindex'] = json.loads(callindex)
    #  Init dictionary to hold xml data and code for calls
    caller['xmldata'] = {}    # indexed by xml file name
    caller['classes'] = {}    # indexed by canonical call name

    #  Load files defining sequences
    seqpath = os.path.join(here,'seq')
    if os.path.exists(seqpath):
      caller['sequences'] = []
      for s in glob.glob(seqpath+'/*'):
        caller['sequences'].append(open(s).readlines())

    #  Load JSON file of formations
    tamsrcpath = os.path.join(here,'../src/tamination.js')
    if os.path.exists(tamsrcpath):
      tamsrc = open(tamsrcpath).read()
      formationsrc = re.search('var formations =\s*(\{.*?);',tamsrc,re.DOTALL).group(1)
      formationsrc = re.sub('//.*','',formationsrc)
      caller['formations'] = json.loads(formationsrc)
      Move.init(tamsrc)

    #  Flag that initialization is complete
    caller['call'] = 'no sequence'
    caller['init'] = 'done'

def findXMLCall(caller,f,callwordstr):
  #  Get file defining the call
  call = re.sub(r'\s+','',callwordstr)
  if call in caller['callindex']:
    for a in [x for x in caller['callindex'][call] if x.endswith('xml')]:
      if not a in caller['xmldata']:
        filename = os.path.join(caller['here'],'../',a)
        caller['xmldata'][a] = xml.dom.minidom.parse(filename)
      xmlcode = caller['xmldata'][a]
      for tam in xmlcode.getElementsByTagName('tam'):
        if tam.getAttribute('title').lower().replace(' ','') == call:
          f2s = tam.getAttribute('formation')
          f2 = getFormation(f2s)
          m = matchFormations(f,f2,tam.hasAttribute('gender-specific'))
          #  also try rotating f2 by 90 degrees
          if not m:
            rotateFormation(f2)
            m = matchFormations(f,f2)
          if m:
            #  Animation found
            #  Send the paths to the dancers
            for (i,p) in enumerate(tam.getElementsByTagName('path')):
              if i==0:
                CallText().addPath(p,tam.getAttribute('title'))
              f[m[i*2]].addPath(p)
              f[m[i*2+1]].addPath(p)
              f[m[i*2]].animate(999)
              f[m[i*2+1]].animate(999)
            return True
  #  No animation found
  return False

def findProgrammedCall(caller,f,callwordstr):
  callwords = re.split(r'\s+',callwordstr.strip())
  ctx = CallContext(f)
  while len(callwords) > 0:
    for i in reversed(range(1,len(callwords)+1)):
      call = ''.join(callwords[0:i])
      print('Trying '+call)
      if not call in caller['callindex']:
        continue
      for a in [x for x in caller['callindex'][call] if x.endswith('py')]:
        if not call in caller['classes']:
          pyfile = os.path.join(caller['here'],a)
          exec(open(pyfile).read())
        print('Compute '+call)
        nextcall = caller['classes'][call]()
        if nextcall.performCall(ctx):
          print('Performed '+call)
          #  Add generated paths to each dancer
          for (ii,d) in enumerate(f):
            d.addPath(ctx.paths[ii])
          #  Successfully performed call
          callwords = callwords[i:]
          break  # out of inner for loop, continue while loop
      if not call == ''.join(callwords[0:i]):
        break  # out of outer for loop
    else:
      return False
  return len(callwords) == 0

def call():
  caller = bge.logic.getCurrentController().owner
  if caller['call'] == 'no sequence':
    #  Choose a random sequence
    seq = 0
    # not needed?? caller['sequence'] = seq
    #  Get the starting formation
    #  It's the first line of the sequence
    seqa = caller['sequences'][seq]
    fs = seqa[0]
    f = getFormation(fs)
    #  Associate dancer objects with each dancer
    scene = bge.logic.getCurrentScene()
    objs = scene.objects
    boynum = 1
    girlnum = 1
    for d in f:
      if d.gender == 'boy':
        d.setObject(objs['Boy.'+str(boynum)])
        boynum += 1
      else:
        d.setObject(objs['Girl.'+str(girlnum)])
        girlnum += 1
    calltext = CallText()
    calltext.setObject(objs['CallText'])
    #  Get the calls
    caller['seqcalls'] = caller['sequences'][seq][1:]
    for callwords in caller['seqcalls']:
      callwords = callwords.lower()
      callwords = re.sub(r'[^\s\w].*',' ',callwords)
      callwords = re.sub('through','thru',callwords)
      if (not findXMLCall(caller,f,callwords) and
          not findProgrammedCall(caller,f,callwords)):
        # error
        print('Unable to find animation for '+callwords)

    #  Start the animation
    f[0].start()
    f[1].start()
    f[2].start()
    f[3].start()
    calltext.start()
