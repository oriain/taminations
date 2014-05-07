/*

    Copyright 2014 Brad Christie

    This file is part of Taminations.

    Taminations is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Taminations is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Taminations.  If not, see <http://www.gnu.org/licenses/>.

*/
Trade = Call.childCall('trade');
Trade.prototype.performOne = function(ctx,d)
{
  //  Figure out what dancer we're trading with
  var leftcount = 0;
  var bestleft = -1;
  var rightcount = 0;
  var bestright = -1;
  for (var d2 in ctx.active) {
    if (d2 == d)
      continue;
    if (ctx.isLeft(d,d2)) {
      if (!leftcount || ctx.distance(d,d2) < ctx.distance(d,bestleft))
        bestleft = d2;
      leftcount++;
    } else if (ctx.isRight(d,d2)) {
      if (!rightcount || ctx.distance(d,d2) < ctx.distance(d,bestright))
        bestright = d2;
      rightcount++;
    }
  }

  var dtrade = -1;
  var samedir = false;
  var call = '';
  //  We trade with the nearest dancer in the direction with
  //  an odd number of dancers
  if (rightcount % 2 == 1 && leftcount % 2 == 0) {
    dtrade = bestright;
    call = 'Run Right';
    samedir = ctx.isLeft(dtrade,d);
  } else if (rightcount % 2 == 0 && leftcount % 2 == 1) {
    dtrade = bestleft;
    call = 'Run Left';
    samedir = ctx.isRight(dtrade,d);
  }
  //  else throw error

  //  Found the dancer to trade with.
  //  Now make room for any dancers in between
  var hands = 'none';
  var dist = ctx.distance(d,dtrade);
  var scaleX = 1;
  if (ctx.inBetween(d,dtrade).length > 0) {
    //  Intervening dancers
    //  Allow enough room to get around them and pass right shoulders
    if (call == 'Run Right' && samedir)
      scaleX = 2;
  } else {
    //  No intervening dancers
    if (call == 'Run Left' && samedir)
      //  Partner trade, flip the belle
      call = 'Flip Left';
    else
      scaleX = dist/2;
    //  Hold hands for trades that are swing/slip
    if (!samedir && dist < 2.1) {
      if (call == 'Run Left')
        hands = 'left';
      else
        hands = 'right';
    }
  }
  var moves = tam.translateMovement({ select: call, hands: hands,
                                      scaleY: dist/2, scaleX: scaleX });
  return new Path(moves);
};

//# sourceURL=trade.js
