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
var callnames = [];

var CallNotFoundError = Env.extend(CallError);
var FormationNotFoundError = Env.extend(CallError);

var scripts = {
    allemandeleft: 'allemande_left',
    boxthegnat: 'box_the_gnat',
    leftturnthru: 'allemande_left',
    beaus: 'beaus',
    belles: 'belles',
    boxcounterrotate: 'box_counter_rotate',
    boys: 'boys',
    centers: 'centers',
    crossrun: 'crossrun',
    ends: 'ends',
    facein: 'face_in',
    faceleft: 'face_left',
    factout: 'face_out',
    faceright: 'face_right',
    girls: 'girls',
    hinge: 'hinge',
    leaders: 'leaders',
    passthru: 'pass_thru',
    quarterin: 'quarter_in',
    quarterout: 'quater_out',
    androll: 'roll',
    run: 'run',
    slidethru: 'slide_thru',
    slip: 'slip',
    andspread: 'spread',
    starthru: 'star_thru',
    touchaquarter: 'touch_a_quarter',
    trade: 'trade',
    trailers: 'trailers',
    turnback: 'turn_back',
    turnthru: 'turn_thru',
    verycenters: 'verycenters',
    wheelaround: 'wheel_around',
    zag: 'zag',
    zagzag: 'zagzag',
    zagzig: 'zagzig',
    zig: 'zig',
    zigzag: 'zigzag',
    zigzig: 'zigzig',
    zoom: 'zoom'
};


//  String extension to help with parsing
//  Returns an array of strings, starting with the entire string,
//  and each subsequent string chopping one word off the end
String.prototype.chopped = function() {
  var ss = [];
  return this.split(/\s+/).map(function(s) {
    ss.push(s);
    return ss.join(' ');
  }).reverse();
};

//  Return an array of strings, each removing one word from the start
String.prototype.diced = function() {
  var ss = [];
  return this.split(/\s+/).reverse().map(function(s) {
    ss.unshift(s);
    return ss.join(' ');
  }).reverse();
};

/**
 *   Return all combinations of words from a string
 */
String.prototype.minced = function()
{
  return this.chopped().map(function(s) {
    return s.diced();
  }).flatten();
};

var SynonymReplacer = Env.extend(Env,function(str) {
  var synonyms;
  synonyms = [
    ['&' , '&amp;', 'and'],
    ['through' , 'thru'],
    ['1/4' , 'quarter', 'a quarter'],
    ['1/2' , 'half', 'a half'],
    ['3/4' , 'three quarters'],
    ['center', 'centers'],
    ['end', 'ends'],
    ['facing dancers', 'facing'],
    ['swap around', 'swap'],
    ['head', 'heads'],
    ['side', 'sides'],
  ];
  //  Combine all the synonyms into one regex
  var synregex = synonyms.map(function(a){return a.join('|');}).join('|');
  //  Find the first match in the string
  var m = str.match('(^|.*?\\s)('+synregex+')(?!\\w)(.*)$');
  if (m) {
    this.prefix = m[1];
    this.syn = m[2];
    //  Make more replacers out of the suffix???
    this.suffix = m[3];
    this.replacer = new SynonymReplacer(this.suffix);
    //  Get the list of synonyms to use for this match
    this.synlist = synonyms.filter(function(a) {
      return a.indexOf(this.syn) >= 0;
    },this)[0];
  }
  else {
    this.prefix = '';
    this.synlist = [str];
    this.suffix = '';
    this.replacer = null;
  }
  this.count = 0;
});

SynonymReplacer.prototype.next = function()
{
  var retval = null;
  if (this.replacer) {
    var rstr = this.replacer.next();
    if (rstr != null)
      retval = this.prefix + this.synlist[this.count] + rstr;
    else if (++this.count < this.synlist.length) {
      this.replacer = new SynonymReplacer(this.suffix);
      rstr = this.replacer.next();
      retval = this.prefix + this.synlist[this.count] + rstr;
    }
  }
  else if (this.count++ == 0)
    retval = this.synlist[0];
  return retval;
};

String.prototype.syns = function()
{
  var retval = [];
  var replacer = new SynonymReplacer(this);
  var s;
  while ((s=replacer.next()) != null)
    retval.push(s);
  return retval;
};


var prevtext = '';
var textChange = function()
{
  var text = $('#calls').text();
  if (text != prevtext)
    prevtext = text;
  else
    updateSequence();
};

var timeoutID = null;
//  This should not be called until jQuery is ready and all dependent modules
//  have been loaded.  Thus these nested functions.
var sequenceSetup = function() {
  $(document).ready(function() {
  //  Make sure this is run *after* the document.ready function
  //  in tampage.js.  Then initialize the animation display
    //  before initializing the editor
    var tam = new TAMination('', function() {
      startAnimations();
      editorSetup();
    });
    tam.loadXML('callindex.xml',function(a) { callindex = a; });
  });
}

var editorSetup = function()
{
  tamsvg.setPart = setCurrentCall;
  calllink = document.URL.split(/\?/)[0];
  var calls = document.URL.split(/\?/)[1];
  if (calls) {
    calls = unescape(calls).split(/\&/);
    startingFormation = calls.shift().trim();
    editor.setContent(calls.join('<br/>'));
  }
  updateSequence();
  window.setInterval(textChange,1000);

  startingFormation = $('input[name="formation"]:checked').val();
  $('#instructions-link').click(function() {
    $('#instructions').toggle();
  });
  $('#instructions').click(function() {
    $('#instructions').hide();
  });
  $('input[name="formation"]').change(function(ev) {
    startingFormation = $(ev.target).val();
    new TAMination('',startAnimations);
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
      new TAMination('',startAnimations);
    };
    reader.readAsText(i.files[0]);
  });
}

function startAnimations()
{
  if ($('#definition #sequencepage').size() == 0)
    $('#definition').empty().append($('#sequencepage'));

  //  Build the animation
  var dims = svgSize();
  var svgdim = dims.width;
  var svgstr='<div id="svgdiv" '+
             'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
  $("#svgcontainer").empty().width(dims.width).append(svgstr);
  $('#svgdiv').svg({onLoad:function(x) {
      var t = new TamSVG(x);
      t.setPart = setCurrentCall;
      //  Add all the calls to the animation
      updateSequence();
      t.generateButtonPanel();
    }
  });


}

function setCurrentCall(n)
{
  $('#calls span').removeClass('callhighlight')
     .filter('.Part'+n).addClass('callhighlight');
  tamsvg.setTitle(n > 0 ? callnames[n-1] : '');
}
//  Highlight a line that has an error
function showError(n)
{
  $('#calls').find('span.Part'+n).addClass('callerror');
}

//  This function is called every time the text is changed by the user
function processCallText()
{
  //  retval is the text of all the calls, each line is one item of the array
  var retval = [];
  //  html is the marked-up calls to stuff back into the text box
  //  so calls are highlighted, errors marked, comments colored, etc.
  var html = [];
  var callnum = 1;
  //  Clear any previous error message
  $('#errortext').html('');
  //  Before we do anything else, remember the current location
  $('#calls').find('#cursor').contents().unwrap();
  getSelection().getRangeAt(0).insertNode($('<span id="cursor"/>')[0]);
  //  Strip out existing elements that will be re-added
  //  and any other extraneous html
  //  As a courtesy, if html with <pre> was pasted, replace newlines with <br>
  if ($('#calls').html().search('<pre') >= 0)
    $('#calls').html($('#calls').html().replace(/\n/g,'<br/>'));
  //  Remove existing spans, they will be re-generated
  //  Except of course the span for the current location that we just added
  $('#calls').find('p').after('<br/>').contents().unwrap();
  $('#calls').find('span').not('#cursor').contents().unwrap();
  var lines = $('#calls').html().split(/<(?:br|div|p)\s*\/?>/);
  lines.forEach(function(line) {
    var calltext = line;
    var comchar = line.search(/[*#]/);
    if (comchar >= 0) {
      //  Highlight comments
      line = line.substr(0,comchar) + '<span class="commenttext">' +
             line.substr(comchar) + '</span>';
      //  and remove them from the text of calls returned
      calltext = line.substr(0,comchar);
    }
    //  Remove any remaining html tags in preparation for parsing calls
    calltext = $.trim(calltext.replace(/<.*?>/g,'').replace(/\&nbsp;/g,' '));
    //  If we have something left to parse as a call
    if (calltext.search(/\w/) >= 0) {
      //  .. add class to highlight it when animated
      line = '<span class="Part'+callnum+'">' + line + '</span>';
      callnum += 1;
      retval.push(calltext);
    }
    html.push(line);
  });
  //  TODO Replace the text with our marked-up version
  //  And restore the user's current editing location
  $('#calls').html(html.join('<br/>'));
  getSelection().selectAllChildren($('#cursor')[0]);
  return retval;
}

var filecount = 0;
function fetchCall(callname)
{
  callname = callname.collapse();

  //  Load any animations for this call
  $('call[text="'+callname.replace(/\W/g,'')+'"]',callindex).each( function () {
    var f = $(this).attr('link');
    if (!xmldata[f]) {
      //  Call is interpreted by animations
      filecount++;
      //  Read and store the animation
      $.get(f.extension('xml'),function(data,status,jqxhr) {
        xmldata[f] = data;
        if (--filecount == 0) {
          //  All xml has been read, now we can interpret the calls
          buildSequence();
        }
      },"xml").filename = f;
    }
  });

  //  Also load any scripts that perform this call
  if (callname in scripts) {
    //  Call is interpreted by a script
    if (!Call.classes[callname]) {
      filecount++;
      //  Read and interpret the script
      require(['calls/'+scripts[callname]],function(){
        if (--filecount == 0)
          buildSequence();
      });
    }
  }

}

function updateSequence()
{
  //  Don't do anything if there's no change
  var newhtml = $('#calls').text();
  if (newhtml.replace(/<.*?>/g) == prevhtml.replace(/<.*?>/g))
    return;
  prevhtml = newhtml;
  calls = processCallText();
  //  Make sure all calls are sent to be fetched
  filecount = 100;
  //  Look up the calls fetch the necessary files
  for (var i in calls) {
    //  Need to load xml files, 1 or more for each call
    var callline = calls[i].toLowerCase()
                           .replace(/\s/g,' ')  // coalesce spaces
                           .replace(compattern,'');     // remove comments
    //  Fetch calls that are any part of the callname,
    //  to get concepts and modifications
    callline.syns().forEach(function(s1) {
      s1.minced().forEach(function(s2) {
        fetchCall(s2);
      });
    });
  }
  //  All calls sent to be fetched, we can remove the safety
  filecount -= 100;
  if (!filecount)
    //  We already have all the files
    buildSequence();
}

function buildSequence()
{
  //  First clear out the previous animation
  tamsvg.dancers.forEach(function(d) {
    d.path.clear();
    d.animate(0);
  });
  tamsvg.parts = [];
  callnames = [];
  $('#errormsg').remove();
  var n2 = 0;
  var callname = '';
  try {
    for (n2 in calls) {
      callname = calls[n2];
      var ctx = null;
      //  Break up the call as above to find and perform modifications
      var callline = calls[n2].toLowerCase()
                              .replace(/\s+/g,' ')  // coalesce spaces
                              .replace(compattern,'');     // remove comments
      //  Various user errors in applying calls are detected and thrown here
      //  and also by lower-level code
      ctx = new CallContext(tamsvg);
      ctx.interpretCall(callline);
      //  If no error thrown, then we found the call
      //  and created the animation successfully
      //  Copy the call from the working context to each dancer
      tamsvg.dancers.forEach(function(d,i) {
        d.path.add(ctx.dancers[i].path);
        d.animateToEnd();
      });
      //  Each call shown as one "part" on the slider
      tamsvg.parts.push(ctx.dancers[0].path.beats());
      callnames.push(ctx.callname);
    } //  repeat for every call

  }  // end of try block

  catch (err) {
    showError(Number(n2)+1);
    if (err instanceof NoDancerError) {
      $('#errortext').html('There are no dancers that can do <br/><span class="calltext">'+
          calls[n2] + '</span>.<br/>');
    } else if (err instanceof CallNotFoundError) {
      $('#errortext').html('Call <span class="calltext">'+callname+
      '</span> not found.');
    } else if (err instanceof FormationNotFoundError) {
      $('#errortext').html('No animation for <span class="calltext">'+callname+
      '</span> from that formation.');
    }
    else if (err instanceof CallError) {
      $('#errortext').html('No animation for<br/><span class="calltext">'+
          calls[n2] + '</span><br/>'+err.message+'<br/>');
    }
    else
      throw err;
  }

  //  All calls parsed and created
  tamsvg.parts.pop();  // last part is implied
  var lastcallstart = tamsvg.beats - 2;
  tamsvg.beats = tamsvg.dancers[0].beats() + 2;
  if (!tamsvg.running) {
    tamsvg.beat = lastcallstart;
    tamsvg.start();
  }
  tamsvg.updateSliderMarks(true);
  //  Generate link from calls
  calllink = document.URL.split(/\?/)[0]
  + '?' + escape(startingFormation) + '&' +
  $('#calls').html()
        .replace(/&nbsp;/g,' ')
        .replace(/<br\/?>/g,'&')
        .replace(/<.*?>/g,'');

}

/**
 *   Reads an XML formation and returns array of the dancers
 * @param formation   XML formation element
 * @returns Array of dancers
 */
function getDancers(formation)
{
  var dancers = [];
  var i = 1;
  $('dancer',formation).each(function() {
    var d = new Dancer({
         tamsvg:tamsvg,
         computeOnly:true,
         gender:Dancer.genders[$(this).attr('gender')],
         x:-Number($(this).attr('y')),
         y:-Number($(this).attr('x')),
         angle:Number($(this).attr('angle'))+180,
         number:i++});
    dancers.push(d);
    d = new Dancer({
         tamsvg:tamsvg,
         computeOnly:true,
         gender:Dancer.genders[$(this).attr('gender')],
         x:Number($(this).attr('y')),
         y:Number($(this).attr('x')),
         angle:Number($(this).attr('angle')),
         number:i++});
    dancers.push(d);
  });
  return dancers;
}
/**
 *   Rotates a formation 90 degrees by changing the position and
 *   angle of each dancer
 * @param d   Array of dancers to move.  Changed in place.
 */
function rotateFormation(d)
{
  d.forEach(function(di) {
    var x = di.starty;
    var y = -di.startx;
    di.startx = x;
    di.starty = y;
    di.startangle = (di.startangle + 270) % 360;
    di.computeStart();
  });
}

/**
 *   Match two formations
 * @param d1  Array of dancers from the first formation
 * @param d2  Array of dancers from the second formaton
 * @param sexy  True if genders must match
 * @returns   False if no match, otherwise array mapping d2 to d1
 */
function matchFormations(d1,d2,sexy)
{
  if (d1.length != d2.length)
    return false;
  var retval = {};
  if (!d1.every(function(d1d,i) {
    return d2.some(function(d2d,j) {
      if (sexy && (d1d.gender != d2d.gender))
        return false;
      if (Math.abs(d1d.tx.translateX-d2d.start.translateX) > 0.1)
        return false;
      if (Math.abs(d1d.tx.translateY-d2d.start.translateY) > 0.1)
        return false;
      var ad = Math.angleDiff(d1d.tx.angle,d2d.start.angle);
      if (Math.abs(ad) > 10*Math.PI/180)
        return false;
      retval[j] = i;
      return true;
    });
  }))
    retval = false;
  return retval;
}
