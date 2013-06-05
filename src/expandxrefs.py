
import glob
import re
import sys
import os.path
import xml.etree.ElementTree as ET

def main():
  #  Read the input xml file
  ifile = sys.argv[1]
  tree = ET.parse(ifile)
  root = tree.getroot()
  #  Start a new xml document for the output
  newtree = ET.ElementTree(ET.Element('tamination'))
  newroot = newtree.getroot()
  #  Look for xref elements in the source
  for tam in root:
    if tam.tag == 'tamxref':
      #  Get all the xref files
      files = glob.glob('../'+tam.get('file'))
      for file in files:
        if file.endswith('.x.xml'):
          continue
        if os.path.exists(file.replace('.xml','.x.xml')):
          continue
        #if tam.get('not-file') and re.search(tam.get('not-file'),file):
        #  continue
        tree2 = ET.parse(file)
        #  Find the xref animations that match
        for tam2 in tree2.getroot().findall('tam'):
          if re.search(tam.get('title-match'),tam2.get('title')):
            #  Perform any requested substitutions
            if tam.get('title-sub'):
              newtitle = re.sub(tam.get('title-match'),tam.get('title-sub'),tam2.get('title'))
              tam2.set('title',newtitle)
            if tam.get('group'):
              tam2.set('group',tam.get('group'))
            #  Append it to the output xml
            newroot.append(tam2);
    else:
      newroot.append(tam)
  #  Print the output xml
  ET.dump(newtree)

main()
