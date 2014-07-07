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

//  This is the code to handle searching calls

var tam = new TAMination();
tam.loadXML('calls.xml',function(a) { calls = a; });

//  Monitor the text input every 1/10 second
//  Will do work only if there's a new search
var prevsearch = '';
$(document).ready(function() {
  window.setInterval(function() {
    var text = $('#search').val();
    if (text != prevsearch && text.match(/\w/)) {
      dosearch(text);
      prevsearch = text;
    }
  },100);
});

//  Update the table of search results
function dosearch(text) {
  //  Clear out previous results
  $('#results').empty();
  $('call[level!="Info"]',calls).filter(function() {
    //  Look for any substring match ignoring case
    return $(this).attr('text').toLowerCase().indexOf(text.toLowerCase()) >= 0;
  }).each(function() {
    //  Append one row to the search results table for each match
    //  Include the level of each call as second item on each row
    $('#results').append('<tr><td><a href="../' + $(this).attr('link') +
               '">' + $(this).attr('text') +
               '</a></td><td style="padding-left:20px">' + $(this).attr('sublevel') +
               '</td></tr>');
  });
}
