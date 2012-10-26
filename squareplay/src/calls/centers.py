
class Centers(Call):

  def perform(self,ctx):
    newactive = {}
    count = 0
    for d in ctx.active.keys():
      if d in ctx.center:
        newactive[d] = ctx.dancers[d]
        count += 1
    if count == 0:
      raise NoDancerError()
    ctx.active = newactive;

caller['classes']['cemters'] = Centers
caller['classes']['cemter'] = Centers
