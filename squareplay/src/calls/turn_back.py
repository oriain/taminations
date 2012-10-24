
class TurnBack(Call):

  def performOne(self,ctx,d):
    if d in ctx.beau:
      m = 'U-Turn Right'
    else:
      m = 'U-Turn Left'
    moves = Move({ 'select': m })
    return Path(moves)

caller['classes']['turnback'] = TurnBack
