class Boys(Call):

  def perform(self,ctx):
    newactive = {}
    count = 0
    for d in ctx.active.keys():
      if ctx.active[d].gender == 'boy':
        newactive[d] = ctx.dancers[d]
        count += 1
    if count == 0:
      raise NoDancerError()
    ctx.active = newactive;

caller['classes']['boys'] = Boys
