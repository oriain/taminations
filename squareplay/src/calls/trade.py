'''
    Copyright 2012 Brad Christie

    This file is part of TAMinations.

    TAMinations is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    TAMinations is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with TAMinations.  If not, see <http://www.gnu.org/licenses/>.
'''
class Trade(Call):
  def performOne(self,ctx,d):
    #  Figure out what dancer we're trading with
    leftcount = 0
    bestleft = -1
    rightcount = 0
    bestright = -1
    for d2 in ctx.active.keys():
      if d2 == d:
        continue
      if ctx.isLeft(d,d2):
        if leftcount==0 or ctx.distance(d,d2) < ctx.distance(d,bestleft):
          bestleft = d2
        leftcount += 1
      elif ctx.isRight(d,d2):
        if rightcount==0 or ctx.distance(d,d2) < ctx.distance(d,bestright):
          bestright = d2
        rightcount += 1

    dtrade = -1
    samedir = False
    call = ''
    #  We trade with the nearest dancer in the direction with
    #  an odd number of dancers
    if rightcount % 2 == 1 and leftcount % 2 == 0:
      dtrade = bestright
      call = 'Run Right'
      samedir = ctx.isLeft(dtrade,d)
    elif rightcount % 2 == 0 and leftcount % 2 == 1:
      dtrade = bestleft
      call = 'Run Left'
      samedir = ctx.isRight(dtrade,d)
    #  else throw error

    #  Found the dancer to trade with.
    #  Now make room for any dancers in between
    hands = 'none'
    dist = ctx.distance(d,dtrade)
    scaleX = 1
    if ctx.inBetween(d,dtrade).length > 0:
      #  Intervening dancers
      #  Allow enough room to get around them and pass right shoulders
      if call == 'Run Right' and samedir:
        scaleX = 2
    else:
      #  No intervening dancers
      if call == 'Run Left' and samedir:
        #  Partner trade, flip the belle
        call = 'Flip Left'
      else:
        scaleX = dist/2
      #  Hold hands for trades that are swing/slip
      if not samedir and dist < 2.1:
        if call == 'Run Left':
          hands = 'left'
        else:
          hands = 'right'
    moves = Movement({ 'select': call, 'hands': hands,
                       'scaleY': dist/2, 'scaleX': scaleX });
    return Path(moves)

caller['classes']['trade'] = Trade
# TODO add a check that the trade is really a Partner Trade
caller['classes']['partnertrade'] = Trade
