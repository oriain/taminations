
class Ends(Call):

  def perform(self,ctx):
    newactive = {}
    count = 0
    for d in ctx.active.keys():
      if d in ctx.end:
        newactive[d] = ctx.dancers[d]
        count += 1
    if count == 0:
      raise NoDancerError()
    ctx.active = newactive;

caller['classes']['ends'] = Ends
caller['classes']['end'] = Ends
