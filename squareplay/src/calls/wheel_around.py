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
class WheelAround(Call):
  def performOne(self,ctx,d):
    d2 = ctx.partner.get(d,None)
    if d2 == None or not d2 in ctx.active:
      raise CallError('Dancer '+dancerNum(d)+' must Wheel Around with partner.')
    m = ''
    if d in ctx.belle[d]:
      if not d2 in ctx.beau[d2]:
        raise CallError('Dancer '+dancerNum(d)+' is not part of a Facing Couple.')
      m = Path({ 'select': 'Belle Wheel' })
    else:
      if not d2 in ctx.belle[d2]:
        raise CallError('Dancer '+dancerNum(d)+' is not part of a Facing Couple.')
      m = Path({ 'select': 'Beau Wheel' });
    return m

caller['classes']['wheelaround'] = WheelAround
