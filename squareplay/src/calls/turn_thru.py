
class TurnThru(Call):

  def performOne(self,ctx,d):
    #  Can only turn thru with another dancer
    #  in front of this dancer
    #  who is also facing this dancer
    d2 = ctx.dancerInFront(d)
    if d2 and ctx.dancerInFront(d2) == d:
      dist = ctx.distance(d,d2)
      moves = [Movement({ 'select': 'Extend Left', 'scaleX': dist/2, 'scaleY': 0.5 }),
               Movement({ 'select': 'Swing Right', 'scaleX': 0.5, 'scaleY': 0.5 }),
               Movement({ 'select': 'Extend Right', 'scaleX': dist/2, 'scaleY': 0.5 })];
      return Path(moves)
    raise CallError('Cannot find dancer to Turn Thru with ')

caller['classes']['turnthru'] = TurnThru
