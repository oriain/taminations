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
class AllemandeLeft(Call):
  def performOne(self,ctx,d):
    #  Can only turn thru with another dancer
    #  in front of this dancer
    #  who is also facing this dancer
    d2 = ctx.dancerInFront(d)
    if d2 != None and ctx.dancerInFront(d2) == d:
      dist = ctx.distance(d,d2)
      moves = Movement([{ 'select': 'Extend Right', 'scaleX': dist/2, 'scaleY': 0.5 },
                        { 'select': 'Swing Left', 'scaleX': 0.5, 'scaleY': 0.5 },
                        { 'select': 'Extend Left', 'scaleX': dist/2, 'scaleY': 0.5 }])
      return Path(moves);
    raise CallError('Cannot find dancer to turn with '+dancerNum(d))

caller['classes']['allemandeleft'] = AllemandeLeft
caller['classes']['leftturnthru'] = AllemandeLeft
