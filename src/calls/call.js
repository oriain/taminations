/*

    Copyright 2015 Brad Christie

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

"use strict";

define(['env','path'],function(Env,Path) {
  var Call = Env.extend();
  Call.prototype.name = '';
  Call.classes = {};
  Call.xmldata = {};
  Call.scripts = [
       { name:'Allemande Left', link:'allemande_left' },
       { name:'Box the Gnat', link:'box_the_gnat' },
       { name:'Left Turn Thru', link:'allemande_left' },
       { name:'Beaus', link:'beaus' },
       { name:'Belles', link:'belles' },
       { name:'Box Counter Rotate', link:'box_counter_rotate' },
       { name:'Boys', link:'boys' },
       { name:'Centers', link:'centers' },
       { name:'Cross Run', link:'cross_run' },
       { name:'Ends', link:'ends' },
       { name:'Explode and', link:'explode_and' },
       { name:'Face In', link:'face_in' },
       { name:'Face Left', link:'face_left' },
       { name:'Face Out', link:'face_out'},
       { name:'Face Right', link:'face_right' },
       { name:'Girls', link:'girls' },
       { name:'Hinge', link:'hinge' },
       { name:'Leaders', link:'leaders' },
       { name:'Make Tight Wave', link:'make_tight_wave' }, // TEMP for testing
       { name:'Pass Thru', link:'pass_thru' },
       { name:'Quarter In', link:'quarter_in' },
       { name:'Quarter Out', link:'quarter_out' },
       { name:'and Roll', link:'roll' },
       { name:'Run', link:'run' },
       { name:'Slide Thru', link:'slide_thru' },
       { name:'Slip', link:'slip' },
       { name:'and Spread', link:'spread' },
       { name:'Star Thru', link:'star_thru' },
       { name:'Touch a Quarter', link:'touch_a_quarter' },
       { name:'Trade', link:'trade' },
       { name:'Trailers', link:'trailers' },
       { name:'Turn Back', link:'turn_back' },
       { name:'Turn Thru', link:'turn_thru' },
       { name:'Very Centers', link:'verycenters' },
       { name:'Wheel Around', link:'wheel_around' },
       { name:'Zag', link:'zag' },
       { name:'Zag Zag', link:'zagzag' },
       { name:'Zag Zig', link:'zagzig' },
       { name:'Zig', link:'zig' },
       { name:'Zig Zag', link:'zigzag' },
       { name:'Zig Zig', link:'zigzig' },
       { name:'Zoom', link:'zoom' }
   ];

  //  Wrapper method for performing one call
  Call.prototype.performCall = function(ctx)
  {
    ctx.analyze();
    this.perform(ctx);
    ctx.dancers.forEach(function(d) {
      d.recalculate();
      d.animateToEnd();
    },this);
    ctx.levelBeats();
  };

  //  Default method to perform one call
  //  Pass the call on to each active dancer
  //  Then append the returned paths to each dancer
  Call.prototype.perform = function(ctx) {
    //  Get all the paths with performOne calls
    ctx.actives.forEach(function(d) {
      d.path.add(this.performOne(d,ctx));
    },this);
  };

  //  Default method for one dancer to perform one call
  //  Returns an empty path (the dancer just stands there)
  Call.prototype.performOne = function()
  {
    return new Path();
  };

  //  Any call that uses other calls needs to override this
  Call.requires = [];

  return Call;
});
