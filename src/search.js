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

//  This is the code to handle searching calls
var prevsearch = '';
$(document).ready(function() {
  window.setInterval(function() {
    //  Monitor the text input every 1/10 second
    //  Will do work only if there's a new search
    var text = $('#searchbox.active').text();
    if (text != prevsearch && text.match(/\w/)) {
      dosearch(text);
      prevsearch = text;
    }
  },100);
});

//  Update the table of search results
function dosearch(text) {
  //  Create result box if needed
  if ($('#searchresults').length == 0) {
    $('#definition').append('<div id="searchresultsdiv"><div><div>X</div></div>'+
        '<table><tbody id="searchresults"></tbody></table></div>')
    $('#searchresultsdiv').width($('#definition').width()*0.9);
    var h = $('#definition').height();
    if (h == 0)
      h = $(window).height() - $('#menudiv table').height() - $('.title').height();
    $('#searchresultsdiv').height(h*0.9);
    var p = $('#definition').position();
    $('#searchresultsdiv').offset({top:p.top+10, left:p.left+10});
  }
  //  Clear out previous results
  $('#searchresults').empty();
  $('#searchresultsdiv').show('slow');
  $('#searchresultsdiv div div').click(function() {
    $('#searchresultsdiv').hide('slow');
  });
  var query = text.toLowerCase();
  //  Use upper case and dup numbers while building regex so expressions don't get compounded
  //  Through => Thru
  query = query.replace(/\bthrou?g?h?\b/g,"THRU");
  //  Process fractions 1/2 3/4 1/4 2/3
  query = query.replace(/\b1\/2|(one.)?half\b/g,"(HALF|11/22)");
  query = query.replace(/\b(three\s+quarters?|3\/4)\b/g,"33/44");
  query = query.replace(/\b((one\s+)?quarter|1\/4)\b/g,"(QUARTER|11/44)");
  query = query.replace(/\btwo.thirds?\b/g,"22\/33");
  //  Process any other numbers
  query = query.replace(/\b(1|one)\b/g,"(11|ONE)");
  query = query.replace(/\b(2|two)\b/g,"(22|TWO)");
  query = query.replace(/\b(3|three)\b/g,"(33|THREE)");
  query = query.replace(/\b(4|four)\b/g,"(44|FOUR)");
  query = query.replace(/\b(5|five)\b/g,"(55|FIVE)");
  query = query.replace(/\b(6|six)\b/g,"(66|SIX)");
  query = query.replace(/\b(7|seven)\b/g,"(77|SEVEN)");
  query = query.replace(/\b(8|eight)\b/g,"(88|EIGHT)");
  query = query.replace(/\b(9|nine)\b/g,"(99|NINE)");

  //  Finally repair the upper case and dup numbers
  query = query.toLowerCase();
  query = query.replace(/([0-9])\1/g, "$1");

  calllistdata.forEach(function(d) {
    if (d.title.toLowerCase().match(query))
      //  Append one row to the search results table for each match
      //  Include the level of each call as second item on each row
      $('#searchresults').append('<tr><td><a href="../' + d.link +
                 '.html?' + d.title.replace(/\W|\s/g,'') + '">' + d.title +
                 '</a></td><td style="padding-left:20px">' + d.sublevel +
                 '</td></tr>');
  });
}
