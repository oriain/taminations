/*

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

 */

var startingFormation="Static Square";
var callindex = 0;
var seq = 0;
var xmldata = {};
var calls = [];
var callclasses = {};
var calllink = '';
var animwidth='50';
var compattern = /[*#].*/;
var prevhtml = '';
var editor = null;

var synonyms = {
  '&' : 'and',
  '&amp;' : 'and',
  'through' : 'thru',
  '1/4' : ['a','quarter'],
  '1/2' : 'half',
  '3/4' : ['three','quarters'],
  keys : function() {
    var retval = [];
    for (var k in this)
      if (typeof k == 'string')
        retval.push(k);
    return retval.sort(function(a,b) { return b.length - a.length; });
  }
};
var synindex = synonyms.keys();

$.holdReady(true);
$.getJSON("src/callindex.json",function(data) {
  callindex = data;
  $.holdReady(false);
}).error(function() {alert('JSON error');});

var timeoutID = null;
$(document).ready(function() {
  //  Make sure this is run *after* the document.ready function
  //  in tampage.js.  This is a bit of a hack.
  window.setTimeout(function() {
  tinymce.init({
    mode : "textareas",
    convert_newlines_to_brs : true,
    forced_root_block: false,
    setup: function(ed) {
      ed.onKeyUp.add(function(ed,k) {
        if (typeof timeoutID == 'number')
          window.clearTimeout(timeoutID);
        timeoutID = window.setTimeout(updateSequence,1000);
      });
    },

    theme: function(editor, target) {
      var dom = tinymce.DOM, editorContainer;

      // Generate UI
      editorContainer = dom.insertAfter(dom.create('div', {style: 'border: 1px solid gray'},
          '<div style="border-top: 1px solid gray"></div>'
      ), target);

      // Set editor container size to target element size
      dom.setStyle(editorContainer, 'width', target.offsetWidth);

      // Return editor and iframe containers
      return {
        editorContainer: editorContainer,
        iframeContainer: editorContainer.lastChild,
        // iframe height = target height
        iframeHeight: target.offsetHeight
      };
    },

    oninit: function() {
      editor = tinymce.editors['calls'];
      editor.dom.loadCSS('sequence.css');
      editor.focus();
      tamsvg.setPart = setCurrentCall;
      calllink = document.URL.split(/\?/)[0];
      var calls = document.URL.split(/\?/)[1];
      if (calls) {
        calls = unescape(calls).split(/\&/);
        startingFormation = calls.shift().trim();
        editor.setContent(calls.join('<br/>'));
      }
      updateSequence();
    }
  });  // end of tinymce.init

  startingFormation = $('input[name="formation"]:checked').val();
  $('#instructions-link').click(function() {
    $('#instructions').toggle();
  });
  $('#instructions').click(function() {
    $('#instructions').hide();
  });
  $('input[name="formation"]').change(function(ev) {
    startingFormation = $(ev.target).val();
    generateAnimations();
  });
  $('#clearbutton').click(function() {
    editor.setContent('');
    updateSequence();
  });
  $('#linkbutton').click(function() { document.location = calllink; });
  $('#savebutton').click(function()
    {
      var w = window.open('','calllistwindow','width=800,height=800,menubar=yes');
      var t = startingFormation + '<br/>\n' +
              editor.getContent({format:'raw'})
                    .replace(/&nbsp;/g,' ')
                    .replace(/<br\/?>/g,'\n')
                    .replace(/<.*?>/g,'')
                    .replace(/\n/g,'<br/>');
      w.document.write(t);
      w.alert('Select "Save As.." or "Save Page As.." and save this as a text file.');
      w.document.close();
    });
  //  HTML5 stuff to read a file
  if (!window.File || !window.FileReader) {
    $('#loadbutton').hide();
    $('#inputfile').hide();
  }
  $('#loadbutton').click(function(evt) {
    var i = $('#inputfile').get()[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var text = e.target.result;
      var ta = text.split('\n');
      startingFormation = ta.shift().trim();
      $('input[name="formation"]').val([startingFormation]);
      text = ta.join('<br/>');
      editor.setContent(text);
      generateAnimations();
    };
    reader.readAsText(i.files[0]);
  });

});
},1000);

function generateAnimations()  // override function in tampage.js
{
  if ($('#definition #sequencepage').size() == 0)
    $('#definition').empty().append($('#sequencepage'));

  //  Build the animation
  TAMination(0,animations,'','');
  var dims = appletSize();
  var svgdim = dims.width;
  appletstr='<div id="svgdiv" '+
            'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
  $("#appletcontainer").empty().width(dims.width).append(appletstr);
  $('#svgdiv').svg({onLoad:function(x) {
      var t = new TamSVG(x);
      t.setPart = setCurrentCall;
    }
  });

  //  Add all the calls to the animation
  updateSequence();
  generateButtonPanel();

}

function setCurrentCall(n)
{
  $(editor.getDoc()).find('span').removeClass('callhighlight')
     .filter('.Part'+n).addClass('callhighlight');
}
function showError(n)
{
  $(editor.getDoc()).find('span.Part'+n).addClass('callerror');
}

//  This function is called every time the text is changed by the user
function processCallText()
{
  var retval = [];
  var html = [];
  var callnum = 1;
  //  Clear any previous error message
  $('#errortext').html('');
  //  Before we do anything else, remember the current location
  //  The editor inserts a special <span> to mark it
  var bm = editor.selection.getBookmark();
  //  Strip out existing elements that will be re-added
  //  and any other extraneous html
  //  As a courtesy, if html with <pre> was pasted, replace newlines with <br>
  if ($('#calls').html().search('<pre') >= 0)
    $('#calls').html($('#calls').html().replace(/\n/g,'<br/>'));
  //  Remove existing spans, they will be re-generated
  //  Except of course the bookmark that we just added
  $(editor.getDoc()).find('span').not('span[data-mce-type]').contents().unwrap();
  var lines = editor.getContent({format:'raw'}).split(/<br\s*\/?>/);
  for (var i=0; i<lines.length; i++) {
    var line = lines[i];
    var calltext = line;
    var comchar = line.search(/[*#]/);
    if (comchar >= 0) {
      //  Highlight comments
      line = line.substr(0,comchar) + '<span class="commenttext">' +
             line.substr(comchar) + '</span>';
      //  and remove them from the text of calls returned
      calltext = line.substr(0,comchar);
    }
    //  Remove bookmark from string to return for parsing calls
    calltext = $.trim(calltext.replace(/<.*?>/g,'').replace(/\&nbsp;/g,' '));
    //  Also remove special character used for bookmarks
    calltext = calltext.replace(/\uFEFF/,'');
    //  If we have something left to parse as a call
    if (calltext.search(/\w/) >= 0) {
      //  .. add class to highlight it when animated
      line = '<span class="Part'+callnum+'">' + line + '</span>';
      callnum += 1;
      retval.push(calltext);
    }
    html.push(line);

  }
  //  Replace the text with our marked-up version
  tinymce.activeEditor.setContent(html.join('<br/>'));
  //  And restore the user's current editing location
  tinymce.activeEditor.selection.moveToBookmark(bm);
  return retval;
}

function updateSequence()
{
  //  Don't do anything if there's no change
  if (!editor)
    return;
  var newhtml = editor.getContent();
     // $('#calls').html();
  if (newhtml == prevhtml)
    return;
  prevhtml = newhtml;
  calls = processCallText();
  //  Look up the calls fetch the necessary files
  var filecount = 100;
  tamsvg.parts = [];
  for (var i in calls) {
    //  Need to load xml files, 1 or more for each call
    var callwords = calls[i].toLowerCase()
                            .replace(/\s/g,' ')  // coalesce spaces
                            .replace(compattern,'')     // remove comments
                            .split(/\s+/);
    callwords = $.map(callwords,function(a) {
      for (var k in synindex) {
        var syn = synindex[k];
        if (a == syn)
          a = synonyms[syn];
      }
      return a;
    });
    //  Fetch calls that are any part of the callname,
    //  to get concepts and modifications
    for (var s=0; s<callwords.length; s++) {
      for (var e=s+1; e<=callwords.length; e++) {
        var call = callwords.slice(s,e).join('');
        var a = callindex[call];
        for (var x in a) {
          if (!xmldata[a[x]]) {
            if (a[x].indexOf('.js') > 0) {
              //  Call is interpreted by a script
              filecount++;
              //  Read and interpret the script
              $.getScript(a[x],function(data,status,jqxhr) {
                // xmldata set by script
                if (--filecount == 0)
                  buildSequence();
              }).fail(function(jqxhr,settings,exception) {
                alert('script failed '+settings);
              });
            }
            else if (a[x].indexOf('.xml') > 0) {
              //  Call is interpreted by animations
              filecount++;
              //  Read and store the animation
              $.get(a[x],function(data,status,jqxhr) {
                //  Location of the filename depends (I think)
                //  on whether the callback is run now or later
                var f = 'filename' in jqxhr ? jqxhr.filename : a[x];
                xmldata[f] = data;
                if (--filecount == 0) {
                  //  All xml has been read, now we can interpret the calls
                  buildSequence();
                }
              },"xml").filename = a[x];
            }
          }
        }
      }
    }
  }
  filecount -= 100;
  if (!filecount)
    //  We already have all the files
    buildSequence();
}

function buildSequence()
{
  //  First clear out the previous animation
  for (var i in tamsvg.dancers) {
    tamsvg.dancers[i].path.clear();
    tamsvg.dancers[i].animate(0);
  }
  $('#errormsg').remove();
  for (var n2 in calls) {
    var m = false;
    var mxml = false;
    var callname = calls[n2];
    var ctx = new CallContext(tamsvg);
    var callfound = false;

    //  Break up the call as above to find and perform modifications
    var doxml = true;
    var callwords = calls[n2].toLowerCase()
                             .replace(/\s/g,' ')  // coalesce spaces
                             .replace(compattern,'')     // remove comments
                             .split(/\s+/);
    callwords = $.map(callwords,function(a) {
      for (var k in synindex) {
        var syn = synindex[k];
        if (a == syn)
          a = synonyms[syn];
      }
      return a;
    });
    try {
    while (callwords.length > 0) {
      callfound = false;
parseOneCall:
      for (var i=callwords.length; i>0; i--) {
        var call = callwords.slice(0,i).join('');
        //  First try to find an explicit xml animation
        //  But only for the complete call
        var a = callindex[call];
        for (var ii in a) {
          var tamxml = xmldata[a[ii]];
          if (typeof tamxml == 'object' && doxml && i==callwords.length) {
            for (var x=0; x<$('tam',tamxml).length; x++) {
              var xelem = $('tam',tamxml)[x];
              if (call == $(xelem).attr('title').toLowerCase().replace(/\W/g,'')) {
                callfound = true;
                var fs = $(xelem).attr('formation');
                var f = getNamedFormation(fs);
                var d = getDancers(f);
                var sexy = $(xelem).attr('gender-specific');
                mm = matchFormations(tamsvg.dancers,d,sexy);
                if (!mm) {
                  rotateFormation(d);
                  mm = matchFormations(tamsvg.dancers,d,sexy);
                }
                if (mm) {
                  m = mm;
                  mxml = tamxml;
                  tam.callnum = x; // ugly hack
                  allp = tam.getPath(mxml);
                  for (var i3 in allp) {
                    var p = new Path(allp[i3]);
                    ctx.paths[m[i3*2]] = p;
                    ctx.paths[m[i3*2+1]] = p;
                  }
                  ctx.levelBeats();
                  callwords = callwords.slice(i,callwords.length);
                  break parseOneCall;
                }
              }
            }
          }
        }
        //  Failed to find XML-defined animation, check for a script
        var tamxml = Call.classes[call];
        if (typeof tamxml == 'function') {
          callfound = true;
          var nextcall = new tamxml();
          nextcall.performCall(ctx);
          callwords = callwords.slice(i,callwords.length);
          doxml = false;
          break parseOneCall;
        }
      }

      //  If we fell through to here, and have not parsed anything,
      //  then parsing the call has failed
      if (callwords.length > 0 && i==0) {
        break;
      }

    }

    }
    catch (err) {
      showError(Number(n2)+1);
      if (err instanceof CallError) {
        $('#errortext').html('I am unable to do<br/><span class="calltext">'+
            calls[n2] +
            '</span><br/>from this formation.<br/>'+err.message);
        break;
      } else if (err instanceof NoDancerError) {
        $('#errortext').html('There are no dancers that can do <br/><span class="calltext">'+
            calls[n2] +
            '</span>.<br/>'+err.message);
        break;
      } else
        throw err;
    }

    if (ctx.paths[0].beats() > 0) {  //  Call and formation found
      tamsvg.paths = [];
      for (var d in tamsvg.dancers) {
        tamsvg.paths[d] = tamsvg.dancers[d].path;  // for levelBeats
        tamsvg.dancers[d].path.add(ctx.paths[d]);
        tamsvg.dancers[d].animate(999);
      }
      tamsvg.parts.push(ctx.paths[0].beats());
    }
    else if (callfound) {  //  Call found but no matching formation
      showError(Number(n2)+1);
      $('#errortext').html('No animation for <span class="calltext">'+callname+
                                 '</span> from that formation.');
      break;
    }
    else {  //  Call not found
      showError(Number(n2)+1);
      $('#errortext').html('Call <span class="calltext">'+callname+
                                 '</span> not found.');
      break;
    }

  }
  tamsvg.parts.pop();  // last part is implied
  var lastcallstart = tamsvg.beats - 2;
  tamsvg.beats = tamsvg.dancers[0].beats() + 2;
  if (!tamsvg.running) {
    tamsvg.beat = lastcallstart;
    tamsvg.start();
  }
  updateSliderMarks(true);
  //  Generate link from calls
  calllink = document.URL.split(/\?/)[0]
    + '?' + escape(startingFormation) + '&' +
         editor.getContent({format:'raw'})
               .replace(/&nbsp;/g,' ')
               .replace(/<br\/?>/g,'&')
               .replace(/<.*?>/g,'');
}

function gotoCall(n)
{
  var b = 0.01;  // so yellow highlight is on call selected
  for (var i=0; i<n; i++)
    b += tamsvg.parts[i];
  tamsvg.setBeat(b);
}

function getFormation()  // override function in tamination.js
{
  return getNamedFormation(startingFormation);
}

function getDancers(formation)
{
  var tokens = formation.split(/\s+/);
  var dancers = [];
  for (var i=1; i<tokens.length; i+=4) {
    var d = new Dancer({tamsvg:tamsvg,gender:Dancer.genders[tokens[i]],
            x:-Number(tokens[i+2]),y:-Number(tokens[i+1]),
            angle:Number(tokens[i+3])+180,number:i});
    dancers.push(d);
    d = new Dancer({tamsvg:tamsvg,gender:Dancer.genders[tokens[i]],
            x:Number(tokens[i+2]),y:Number(tokens[i+1]),
            angle:Number(tokens[i+3]),number:i+1});
    dancers.push(d);
  }
  return dancers;
}

function rotateFormation(d)
{
  for (var i in d) {
    var x = d[i].starty;
    var y = -d[i].startx;
    d[i].startx = x;
    d[i].starty = y;
    d[i].startangle = (d[i].startangle + 270) % 360;
    d[i].computeStart();
  }
}

//  Returns a normalized difference between two angles
function angleDiff(a1,a2)
{
  return ((((a1-a2) % (Math.PI*2)) + (Math.PI*3)) % (Math.PI*2)) - Math.PI;
}

function matchFormations(d1,d2,sexy)
{
  if (d1.length != d2.length)
    return false;
  var retval = {};
  var count = 0;
  for (i in d1) {
    for (j in d2) {
      if (sexy && (d1[i].gender != d2[j].gender))
        continue;
      if (Math.abs(d1[i].tx.getTranslateX()-d2[j].start.getTranslateX()) > 0.1)
        continue;
      if (Math.abs(d1[i].tx.getTranslateY()-d2[j].start.getTranslateY()) > 0.1)
        continue;
      var anglediff = angleDiff(d1[i].tx.getAngle(),d2[j].start.getAngle());
      if (Math.abs(anglediff) > 10*Math.PI/180)
        continue;
      retval[j] = i;
      count++;
    }
  }
  if (count != d1.length)
    retval = false;
  return retval;
}
