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
class CrossRun(Call):
  def perform(self,ctx):
    for d in ctx.dancers.keys():
      p = Path()
      if d in ctx.active:
        #  Must be in a 4-dancer wave or line
        if not d in ctx.center and not d in ctx.end:
          raise CallError('General line required for Cross Run')
        #  Partner must be inactive
        d2 = ctx.partner.get(d,None)
        if d2 == None or d2 in ctx.active:
          raise CallError('Dancer and partner cannot both Cross Run')
        #  Center beaus and end belles run left
        isright = ctx.beau[d] ^ ctx.center[d];
        m = {True:'Run Right', False:'Run Left'}[isright]
        #  TODO check for runners crossing paths
        moves = Movement({ 'select': m, 'scaleY': 2 });
        p = Path(moves);

      elif ctx.partner[d] in ctx.active:
        m =  {True:'Dodge Right', False:'Dodge Left'}[d in ctx.beau]
        moves = Movement({ 'select': m });
        p = Path(moves);

      ctx.paths[d].add(p);

caller['classes']['crossrun'] = CrossRun
