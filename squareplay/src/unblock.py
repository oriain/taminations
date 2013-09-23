

class Block:

  def __init__(self,s,v):
    self.x = int(s[0])
    self.y = int(s[1])
    self.len = int(s[2])
    self.vertical = v

  def __repr__(self):
    sep = '-'
    if self.vertical:
      sep = '|'
    return str(self.x)+sep+str(self.y)+sep+str(self.len)

  def move(self,i):
    if self.vertical:
      self.y += i
    else:
      self.x += i

  def isOutOfBounds(self):
    if self.vertical:
      return self.y < 0 or self.y+self.len > 6
    else:
      return self.x < 0 or self.x+self.len > 6

layoutlist = []
layouts = {}
def layout2string(layout):
  s = ''
  for b in layout:
    if b.vertical:
      s += str(b.y)
    else:
      s += str(b.x)
  return s

def string2layout(s,layout):
  for (i,c) in enumerate(s):
    b = layout[i]
    if b.vertical:
      b.y = int(c)
    else:
      b.x = int(c)

def saveLayout(fromstr,tostr,move):
  if not tostr in layouts:
    layouts[tostr] = {'from':fromstr,'move':move}
    layoutlist.append(tostr)

def goal(layout):
  if layout[0].x == 4:
    print('Success!!!')
    #  and print result
    s = layout2string(layout)
    while s:
      print(layouts[s]['move'])
      s = layouts[s]['from']
    print('Moves analyzed: '+str(len(layoutlist)))
    return True
  return False

def overlapCheck(m,x,y):
  if m[x][y]:
    return False
  m[x][y] = True
  return True

def overlap(layout):
  m = []
  for i in range(0,6):
    m.append([False]*6)
  for b in layout:
    for i in range(0,b.len):
      if b.vertical:
        check = overlapCheck(m,b.x,b.y+i)
      else:
        check = overlapCheck(m,b.x+i,b.y)
      if not check:
        return True
  #print(m)
  return False

def generateMoves(layout,layoutstr):
  string2layout(layoutstr,layout)
  #  Try moving each block
  for b in layout:
    (x,y) = (b.x,b.y)
    #  Try moving forward
    while True:
      if b.vertical:
        b.y += 1
      else:
        b.x += 1
      if b.isOutOfBounds() or overlap(layout):
        break
      else:
        #print('Move '+str(b)+' ok')
        #  and save it
        saveLayout(layoutstr,layout2string(layout),str(b))
        if goal(layout):
          exit()
    (b.x,b.y) = (x,y)
    #  Try moving backward
    while True:
      if b.vertical:
        b.y -= 1
      else:
        b.x -= 1
      if b.isOutOfBounds() or overlap(layout):
        break
      else:
        #print('Move '+str(b)+' ok')
        #  and save it
        saveLayout(layoutstr,layout2string(layout),str(b))
        if goal(layout):
          exit()
    (b.x,b.y) = (x,y)


def  main():
  layout = []
  print('Enter horizontal blocks (XYL), starting with red block.')
  s = input()
  for t in s.split():
    layout.append(Block(t,False))
  print('Enter vertical blocks (XYL)')
  s = input()
  for t in s.split():
    layout.append(Block(t,True))
  if overlap(layout):
    print('Error - layout overlaps')
  else:
    print('Layout ok')
    s = layout2string(layout)
    print(s)
    saveLayout('',s,'')
    i = 0;
    while i < len(layoutlist):
      generateMoves(layout,layoutlist[i])
      i += 1

main()