import sys
import os
import glob
import re
import xml.dom.minidom
import json
import bge
from src.formation import getFormation, matchFormations, rotateFormation
from src.dancer import CallText
import src.move

def init():
  caller = bge.logic.getCurrentController().owner
  if caller['init'] == 'init':

    #  Get the location of the source directory
    here = [p for p in sys.path if p.endswith('squareplay')][0]

    #  Load all xml files defining calls
    calls = []
    for f in glob.glob(here+'/../*/*.xml'):
      #  TODO maybe just remember call names to conserver memory
      calls.append(xml.dom.minidom.parse(f))

    #  Load xml files defining sequences
    seqpath = os.path.join(here,'../seq')
    print(seqpath)
    if os.path.exists(seqpath):
      sequences = []
      for s in glob.glob(seqpath+'/*.xml'):
        sequences.append(xml.dom.minidom.parse(s))

    #  Load JSON file of formations
    tamsrcpath = os.path.join(here,'../src/tamination.js')
    if os.path.exists(tamsrcpath):
      tamsrc = ''.join(open(tamsrcpath).readlines())
      formationsrc = re.search('var formations =\s*(\{.*?);',tamsrc,re.DOTALL).group(1)
      formationsrc = re.sub('//.*','',formationsrc)
      caller['formations'] = json.loads(formationsrc)
      src.move.init(tamsrc)

    # Put the calls where we can get them
    caller['calls'] = calls
    caller['sequences'] = sequences

    #  Flag that initialization is complete
    caller['call'] = 'no sequence'
    caller['init'] = 'done'

def call():
  caller = bge.logic.getCurrentController().owner
  if caller['call'] == 'no sequence':
    #  Choose a random sequence
    seq = 0
    caller['sequence'] = seq
    #  Get the starting formation
    seqobj = caller['sequences'][seq].getElementsByTagName('sequence')[0]
    fs = seqobj.getAttribute('formation')
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
    caller['seqcalls'] = caller['sequences'][seq].getElementsByTagName('call')
    for call in caller['seqcalls']:
      caller['call'] = call.getAttribute('select')
      print(caller['call'])
      m = False
      tam = False
      #  Find the call
      for xml in caller['calls']:
        for tam in xml.getElementsByTagName('tam'):
          if tam.getAttribute('title') == caller['call']:
            f2s = tam.getAttribute('formation')
            f2 = getFormation(f2s)
            m = matchFormations(f,f2,tam.hasAttribute('gender-specific'))
            #  also try rotating f2 by 90 degrees
            if not m:
              rotateFormation(f2)
              m = matchFormations(f,f2)
            if m:
              break
        if m: break
      #  Send the paths to the dancers
      if m:
        for (i,p) in enumerate(tam.getElementsByTagName('path')):
          if i==0:
            calltext.addPath(p,tam.getAttribute('title'))
          f[m[i*2]].addPath(p)
          f[m[i*2+1]].addPath(p)
          f[m[i*2]].animate(999)
          f[m[i*2+1]].animate(999)

    #  Start the animation
    f[0].start()
    f[1].start()
    f[2].start()
    f[3].start()
    calltext.start()
