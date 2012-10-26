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
class FacingDancers(Call):
  def perform(self,ctx):
    newactive = {}
    count = 0
    for d in ctx.active.keys():
      d2 = ctx.dancerInFront(d)
      if d2 != None and ctx.dancerInFront(d2) == d:
        newactive[d] = ctx.dancers[d]
        count += 1
    if count == 0:
      raise NoDancerError();
    ctx.active = newactive;

caller['classes']['facingdancers'] = FacingDancers
#  This is for 'Facing Boys' e.g.
caller['classes']['facing'] = FacingDancers
