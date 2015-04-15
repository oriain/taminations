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
class Zoom(Call):
  def performOne(self,ctx,d):
    m = []
    if d in ctx.leader:
      d2 = ctx.dancerInBack(d)
      a = ctx.angle(d)
      c = {True:'Run Left', False:'Run Right'}[a < 0]
      if not d2 in ctx.active[d2]:
        raise CallError('Trailer of dancer '+dancerNum(d)+' is not active.')
      dist = ctx.distance(d,d2)
      m.append({'select':c,'beats':2,'offsetX':-dist/2})
      m.append({'select':c,'beats':2,'offsetX':dist/2})
    elif d in ctx.trailer:
      d2 = ctx.dancerInFront(d)
      if not d2 in ctx.active[d2]:
        raise CallError('Leader of dancer '+dancerNum(d)+' is not active.')
      dist = ctx.distance(d,d2)
      m.append({ 'select':'Forward', 'beats':4, 'scaleX':dist });
    else:
      raise CallError('Dancer '+dancerNum(d)+' cannot Zoom.')
    return Path(m)
