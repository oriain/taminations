
var callindex = 0;
var seq = 0
var xmldata = {};
var calls = [];
$.holdReady(true);
$.getJSON("src/callindex.json",function(data) {
  callindex = data;
  $.holdReady(false);
}).error(function() {alert('JSON error');});

var timeoutID = null;

function generateAnimations()  // override function in tampage.js
{
  $('#definition').append($('#sequenceform'));

  //  Build the animation
  TAMination(0,animations,'','');
  var dims = appletSize();
  var svgdim = dims.width;
  appletstr='<div id="svgdiv" '+
            'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
  $("#appletcontainer").append(appletstr);
  $('#svgdiv').svg({onLoad:TamSVG});

  //  Add all the calls to the animation
  $('#animationlist').append('<ol id="calllist"></ol>');
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

  //  Look up the calls and build the animation
  var filecount = 0;
  var tamxml = [];
  tamsvg.parts = [];
  for (var i in calls) {
    //  Need to load xml files, 1 or more for each call
    var callname = calls[i];
    var a = callindex[callname.toLowerCase()];
    for (var x in a) {
      if (!xmldata[a[x]]) {
        filecount++;
        //console.log('Reading '+a[x]);
        $.get(a[x],function(data,status,jqxhr) {
          //console.log('Filename: '+jqxhr.filename);
          xmldata[jqxhr.filename] = data;
          tamxml.push(data);
          if (--filecount == 0) {
            //  All xml has been read, now we can interpret the calls
            buildSequence();
          }
        }).filename = a[x];
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
  for (var i in tamsvg.dancers)
    tamsvg.dancers[i].path.clear();
  $('#errormsg').remove();
  for (var n2 in calls) {
    var callfound = false;
    var m = false;
    var mxml = false;
    var callname = calls[n2];
    //console.log("buildSequence: "+callname);
    for (var i in tamsvg.dancers)
      tamsvg.dancers[i].animate(999);
    var a = callindex[callname.toLowerCase()];
    for (var i in a) {
      var tamxml = xmldata[a[i]];
      $('tam',tamxml).each(function(n3) {
        if (callname.toLowerCase() == $(this).attr('title').toLowerCase()) {
          callfound = true;
          var fs = $(this).attr('formation');
          var f = getFormation(fs);
          var d = getDancers(f);
          $('#Part'+(Number(n2)+1)).text($(this).attr('title'));
          var sexy = $(this).attr('gender-specific');
          mm = matchFormations(tamsvg.dancers,d,sexy);
          if (!mm) {
            rotateFormation(d);
            mm = matchFormations(tamsvg.dancers,d,sexy);
          }
          if (mm) {
            //console.log("Match: "+callname+' '+$(this).attr('formation'));
            m = mm;
            mxml = tamxml;
            tam.callnum = n3; // ugly hack
          }
        }
      });
    }
    if (m) {  //  Call and formation found
      var allp = tam.getPath(mxml);
      for (var i in allp) {
        var p = new Path(allp[i]);
        tamsvg.dancers[m[i*2]].path.add(p);
        tamsvg.dancers[m[i*2+1]].path.add(p);
        tamsvg.dancers[m[i*2]].animate(999);
        tamsvg.dancers[m[i*2+1]].animate(999);
      }
      tamsvg.parts.push(p.beats());
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


function getFormation(from)  // override function in tamination.js
{
  var retval = from;
  if (typeof from != "string")
    retval = $('sequence',animations).attr('formation');
  if (retval && retval.indexOf('Formation') != 0)
    retval = formations[retval];
  return retval;
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

function angleDiff(a1,a2)
{
  return ((((a1-a2) % (Math.PI*2)) + (Math.PI*3)) % (Math.PI*2)) - Math.PI;
}

function matchFormations(d1,d2,sexy)
{
  if (d1.length != d2.length)
    return false;
  retval = {};
  count = 0;
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
      retval[i] = j;
      count++;
    }
  }
  if (count != d1.length)
    retval = false;
  return retval;
}