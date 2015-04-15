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
class Run(Call):
  def perform(self,ctx):
    for d in ctx.dancers.keys():
      p = Path()
      if d in ctx.active:
        #  Partner must be inactive
        d2 = ctx.partner.get(d,None)
        if d2 == None or ctx.active[d2]:
          raise CallError('Dancer '+dancerNum(d)+' has nobody to Run around.')
        m = {True:'Run Right',False:'Run Left'}[d in ctx.beau]
        moves = Movement({ 'select': m })
        p = Path(moves);
      elif ctx.partner[d] in ctx.active:
        m = {True:'Dodge Right',False:'Dodge Left'}[d in ctx.beau]
        moves = Movement({ 'select': m });
        p = Path(moves);
      ctx.paths[d].add(p);

caller['classes']['run'] = Run
