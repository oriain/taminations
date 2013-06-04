
import glob
import xml.etree.ElementTree as ET

def main():
  outfiles = []
  for dir in ['b1','b2','ms','plus','a1','a2','c1','c2','c3a']:
    for file in glob.glob('../'+dir+'/*.xml'):
      tree = ET.parse(file)
      if tree.findall('tamxref'):
        outfiles += [file]
  print(' '.join(outfiles))

main()
