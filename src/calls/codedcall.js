/*

    Copyright 2017 Brad Christie

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

define(['env','path','calls/call'],function(Env,Path,Call) {
  var CodedCall = Env.extend(Call);
  CodedCall.prototype.name = '';
  CodedCall.scripts = [
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
       { name:'Half', link:'half' },
       { name:'Half Sashay', link:'half_sashay' },
       { name:'Heads', link:'heads' },
       { name:'Hinge', link:'hinge' },
       { name:'Leaders', link:'leaders' },
       { name:'Make Tight Wave', link:'make_tight_wave' }, // TEMP for testing
       { name:'One and a Half', link:'one_and_a_half' },
       { name:'Pass Thru', link:'pass_thru' },
       { name:'Quarter In', link:'quarter_in' },
       { name:'Quarter Out', link:'quarter_out' },
       { name:'and Roll', link:'roll' },
       { name:'Reverse Wheel Around', link:'reverse_wheel_around' },
       { name:'Run', link:'run' },
       { name:'Sides', link:'sides' },
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
     //  { name:'Zag Zag', link:'zagzag' },
     //  { name:'Zag Zig', link:'zagzig' },
       { name:'Zig', link:'zig' },
     //  { name:'Zig Zag', link:'zigzag' },
     //  { name:'Zig Zig', link:'zigzig' },
       { name:'Zoom', link:'zoom' }
   ];

  //  Ironically, CodedCall has no code

  return CodedCall;
});
