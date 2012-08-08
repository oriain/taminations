
import glob
import re

def main():
  #  Build table of calls in each file
  r = re.compile('title="(.*?)"')
  r2 = re.compile('/(ms|plus|adv|c1|c2|c3a)/')
  r3 = re.compile('name:\\s*"(.*?)"')
  t = {}
  #  Read animations from xml files
  for filename in glob.glob('../*/*.xml'):
    filename = filename.replace('\\','/')
    if not r2.search(filename):
      continue
    t[filename] = []
    for line in open(filename):
      m = r.search(line)
      if m:
        t[filename].append(m.group(1))
  #  Read scripts from javascript files
  for filename in glob.glob('calls/*.js'):
    filename = filename.replace('\\','/')
    for line in open(filename):
      m = r3.search(line)
      if m:
        t['../src/'+filename] = [m.group(1)]

  #  Invert the table
  it = {}
  for c in t.values():
    for cc in c:
      it[cc] = set()
  for f in t:
    for c in t[f]:
      it[c].add(f.replace('../',''))
  #  Now print the file(s) for each call in JSON format
  print('{')
  for c in it:
    print('    "'+c.lower()+'":["'+'","'.join(it[c])+'"],')
  #  Mark end
  print('    "--":[]')
  print('}')

main()
