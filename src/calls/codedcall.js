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

define(['path','calls/call'], (Path,Call) => {

  class CodedCall extends Call {

    //  Dynamically load classes for the coded calls
    //  Returns number of scripts queued to fetch with the require function
    //  Callback run as each class is loaded
    static getScript(calltext,callback) {
      var c = calltext.toLowerCase()
      var fetchnum = 0
      CodedCall.scripts.forEach(s => {
        if (c.match("^("+s.regex+")$") && !(s.regex in CodedCall.classes)) {
          fetchnum++
          require(['calls/'+s.link],itsclass => {
            CodedCall.classes[s.regex] = itsclass
            callback(itsclass)
          })
        }
      })
      return fetchnum
    }

    //  Return class that matches text
    //  Must have been loaded with getScript
    static getCodedCall(calltext) {
      var c = calltext.toLowerCase();
      var link = CodedCall.scripts.find(s => c.match(`^(${s.regex})$`) );
      return link ? new CodedCall.classes[link.regex](calltext) : false;
    }


  }

  CodedCall.classes = {}
  //  Script regex matches against call text
  //
  CodedCall.scripts = [
       { regex:'allemande left', link:'allemande_left' },
       { regex:'box the gnat', link:'box_the_gnat' },
       { regex:'left turn thru', link:'allemande_left' },
       { regex:'beaus', link:'beaus' },
       { regex:'belles', link:'belles' },
       { regex:'box counter rotate', link:'box_counter_rotate' },
       { regex:'boys?', link:'boys' },
       { regex:'centers?( (2|4|6|two|four|six))?', link:'centers' },
       { regex:'circulate', link:'circulate'},
       { regex:'cross run', link:'cross_run' },
       { regex:'ends', link:'ends' },
       { regex:'explode and', link:'explode_and' },
       { regex:"facing dancers", link:"facing_dancers"},
       { regex:'face (in|out|left|right)', link:'face_in' },
       { regex:'girls?', link:'girls' },
       { regex:'half', link:'half' },
       { regex:'half sashay', link:'half_sashay' },
       { regex:'heads?', link:'heads' },
       { regex:'hinge', link:'hinge' },
       { regex:'leaders?', link:'leaders' },
       { regex:'(onc?e and a half)|(1 1/2)', link:'one_and_a_half' },
       { regex:'pass thru', link:'pass_thru' },
       { regex:'quarter (in|out)', link:'quarter_in' },
       { regex:'and roll', link:'roll' },
       { regex:'run', link:'run' },
       { regex:'sides?', link:'sides' },
       { regex:'slide thru', link:'slide_thru' },
       { regex:'slip', link:'slip' },
       { regex:'and spread', link:'spread' },
       { regex:'star thru', link:'star_thru' },
       { regex:'(left )?touch a quarter', link:'touch_a_quarter' },
       { regex:'trade', link:'trade' },
       { regex:'trailers?', link:'trailers' },
       { regex:'turn back', link:'turn_back' },
       { regex:'turn thru', link:'turn_thru' },
       { regex:'very centers', link:'verycenters' },
       { regex:'(reverse )?wheel around', link:'wheel_around' },
       { regex:'z[ai]g', link:'zig' },
       { regex:'z[ai]g z[ai]g', link:'zigzag' },
       { regex:'zoom', link:'zoom' }
   ]


  return CodedCall

})
