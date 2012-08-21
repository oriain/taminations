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

var callindex = 0;
var startingFormation="Facing Couples";
var seq = 0
var xmldata = {};
var calls = [];
$.holdReady(true);
$.getJSON("src/callindex.json",function(data) {
  callindex = data;
  $.holdReady(false);
}).error(function() {alert('JSON error');});

var timeoutID = null;

$(document).ready(function() {
  $('#formation').change(function() {
    startingFormation = $('#formation').val();
    generateAnimations();
  });

});

function generateAnimations()  // override function in tampage.js
{
  if ($('#definition #sequenceform').size() == 0)
    $('#definition').empty().append($('#sequenceform'));

  //  Build the animation
  TAMination(0,animations,'','');
  var dims = appletSize();
  var svgdim = dims.width;
  appletstr='<div id="svgdiv" '+
            'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
  $("#appletcontainer").empty().append(appletstr);
  $('#svgdiv').svg({onLoad:TamSVG});

  //  Add all the calls to the animation
  $('#animationlist').empty().append('<ol id="calllist"></ol>');
  generateButtonPanel();
  updateSequence();

  $('#calls').keyup(function() {
    if (typeof timeoutID == 'number')
      window.clearTimeout(timeoutID);
    timeoutID = window.setTimeout(updateSequence,1000);
  });

}

function updateSequence()
{
  // Copy the calls from the textarea to the animation list
  $('#calllist').empty();
  calls = $('#calls').val().split(/\n/);
  var realcalls = [];
  var j = 1
  for (var i in calls) {
    var callname = calls[i];
    if (callname.search(/\w/) >= 0) {
      $('#calllist').append('<li><span id="Part'+(j++)+'">'+callname+'</span></li>');
      realcalls.push(callname);
    }
  }
  calls = realcalls;

  //  Look up the calls fetch the necessary files
  var filecount = 0;
  tamsvg.parts = [];
  for (var i in calls) {
    //  Need to load xml files, 1 or more for each call
    var callwords = calls[i].toLowerCase().replace(/\W/g,'').split(/\s+/);
    //  Fetch calls that are any part of the callname,
    //  to get concepts and modifications
    for (s=0; s<callwords.length; s++) {
      for (e=s+1; e<=callwords.length; e++) {
        var call = callwords.slice(s,e).join('');
        var a = callindex[call];
        for (var x in a) {
          if (!xmldata[a[x]]) {
            filecount++;
            if (a[x].indexOf('.js') > 0)
              //  Call is interpreted by a script
              //  Read and interpret the script
              $.getScript(a[x],function(data,status,jqxhr) {
                // xmldata set by script
                if (--filecount == 0)
                  buildSequence();
              }).fail(function() { console.log('script failed');});
            else
              //  Call is interpreted by animations
              //  Read and store the animation
              $.get(a[x],function(data,status,jqxhr) {
                xmldata[jqxhr.filename] = data;
                if (--filecount == 0) {
                  //  All xml has been read, now we can interpret the calls
                  buildSequence();
                }
              }).filename = a[x];
          }
        }
      }
    }
  }
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
    var callfound = false;
    var m = false;
    var mxml = false;
    var callname = calls[n2];
    var callcontext = new CallContext(tamsvg);

    //  Break up the call as above to find and perform modifications
    var doxml = true;
    var callwords = calls[n2].toLowerCase().replace(/\W/g,'').split(/\s+/);
    $('#Part'+(Number(n2)+1)).text('');
    while (callwords.length > 0) {
      var callfound = false;
      var callpaths = [];
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
                  $('#Part'+(Number(n2)+1)).text($(xelem).attr('title'));
                  m = mm;
                  mxml = tamxml;
                  tam.callnum = x; // ugly hack
                  allp = tam.getPath(mxml);
                  for (var i3 in allp) {
                    var p = new Path(allp[i3]);
                    callpaths[m[i3*2]] = p;
                    callpaths[m[i3*2+1]] = p;
                  }
                  callwords = callwords.slice(i,callwords.length);
                  break parseOneCall;
                }
              }
            }
          }
        }
        //  Failed to find XML-defined animation, check for a script
        for (var ii in a) {
          var tamxml = xmldata[a[ii]];
          if (typeof tamxml == 'function') {
            console.log('will use function');
            callfound = true;
            var nextcall = new tamxml();
            nextcall.perform(callcontext);
            callpaths = callcontext.paths;
            //  TODO check for function failure
            $('#Part'+(Number(n2)+1)).text($('#Part'+(Number(n2)+1)).text()+' '+nextcall.classname);
            callwords = callwords.slice(i,callwords.length);
            doxml = false;
            break parseOneCall;
          }
        }
      }

      //  If we fell through to here, and have not parsed anything,
      //  then parsing the call has failed
      if (callwords.length > 0 && i==0) {
        $('#Part'+(Number(n2)+1)).text(calls[n2]);
        break;
      }

    }

    if (callpaths.length > 0 && callpaths[0].beats() > 0) {  //  Call and formation found
      tamsvg.paths = [];
      for (var d in tamsvg.dancers) {
        tamsvg.paths[d] = tamsvg.dancers[d].path;  // for levelBeats
        tamsvg.dancers[d].path.add(callpaths[d]);
        tamsvg.dancers[d].animate(999);
      }
      levelBeats(tamsvg);
      tamsvg.parts.push(callpaths[0].beats());
    }
    else if (callfound) {  //  Call found but no matching formation
      $('#call'+n2).css('background-color','red').css('color','white');
      $('#animationlist').append('<span id="errormsg"><br/><span style="color:black">'+
                                 'No animation for '+callname+
                                 ' from that formation.</span></span>');
      break;
    }
    else {  //  Call not found
      $('#Part'+(Number(n2)+1)).css('background-color','red').css('color','white');
      $('#animationlist').append('<span id="errormsg"><br/><span style="color:black">'+
                                 'Call '+callname+
                                 ' not found.</span></span>');
      break;
    }

    //for (var i=0; i<4; i++) {
    //  callcontext2 = new CallContext(tamsvg);
    //  console.log('Dancer '+(i+1)+' partner is '+(callcontext2.partner[i]+1));
      //console.log('Dancer '+(i+1)+' is at '+callcontext.dancers[i].location());
      //for (var j=0; j<4; j++)
      //  if (i != j)
      //    console.log("Dancer "+(j+1)+(callcontext.isRight(i,j) ? " is " : " is NOT ")
      //           + "right of "+(i+1));
    //}

  }
  tamsvg.parts.pop();  // last part is implied
  var lastcallstart = tamsvg.beats - 2;
  tamsvg.beats = tamsvg.dancers[0].beats() + 2;
  if (!tamsvg.running) {
    tamsvg.beat = lastcallstart;
    tamsvg.start();
  }
  updateSliderMarks(true);

}

//  Level off the number of beats for each dancer
function levelBeats(ctx)
{
  var maxbeats = 0;
  for (var d in ctx.dancers) {
    var b = ctx.paths[d].beats();
    if (b > maxbeats)
      maxbeats = b;
  }
  for (var d in ctx.dancers) {
    var b = maxbeats - ctx.paths[d].beats();
    if (b > 0) {
      var m = tam.translateMovement({select:'Stand',beats:b});
      ctx.paths[d].add(new Path(m));
    }
  }
}

function getFormation()  // override function in tamination.js
{
  return getNamedFormation(startingFormation);
}

function getDancers(formation)
{
  var tokens = formation.split(/\s+/);
  var dancers = [];
  var i = 1;
  for (var i=1; i<tokens.length; i+=4) {
    var d = new Dancer(tamsvg,Dancer.genders[tokens[i]],
            -Number(tokens[i+2]),-Number(tokens[i+1]),
            Number(tokens[i+3])+180,
            0,0,i);
    dancers.push(d);
    d = new Dancer(tamsvg,Dancer.genders[tokens[i]],
            Number(tokens[i+2]),Number(tokens[i+1]),
            Number(tokens[i+3]),
            0,0,i+1);
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
