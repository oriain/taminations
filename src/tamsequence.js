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

define(['calls/call','calls/codedcall','callcontext','callerror'],
        function(Call,CodedCall,CallContext,CallError) {

  var TamSequence = function() {
    this.startingFormation="Static Square";
    this.seq = 0;
    this.calllink = '';
    this.prevhtml = '';
    this.editor = null;
    this.callnames = [];
    this.prevtext = '';
    this.filecount = 0;
    this.calls = [];
    var me = this;
    this.tam = new TAMination('', function(t) {
      t.setFormation(me.startingFormation);
      me.startAnimations();
      me.editorSetup();
    });
  };

  TamSequence.compattern = /[*#].*/;

  TamSequence.prototype.textChange = function()
  {
    var text = $('#calls').text();
    if (text != this.prevtext)
      this.prevtext = text;
    else
      this.updateSequence();
  };

  //  This should not be called until jQuery is ready and all dependent modules
  //  have been loaded.  Thus these nested functions.
  TamSequence.sequenceSetup = function() {
    $(document).ready(function() {
    //  Make sure this is run *after* the document.ready function
    //  in tampage.js.  Then initialize the animation display
      //  before initializing the editor
      var tam = new TAMination('', function() {
        startAnimations();
        editorSetup();
      });
    });
  }

  TamSequence.prototype.editorSetup = function()
  {
    var me = this;
    tamsvg.setPart = function() {
      me.setCurrentCall();
    };
    this.calllink = document.URL.split(/\?/)[0];
    this.calls = document.URL.split(/\?/)[1];
    if (this.calls) {
      this.calls = unescape(calls).split(/\&/);
      me.startingFormation = this.calls.shift().trim();
      this.tam.setFormation(me.startingFormation);
      $('#calls').html(this.calls.join('<br/>'));
    }
    this.updateSequence();
    window.setInterval(function() { me.textChange() },1000);

    this.startingFormation = $('input[name="formation"]:checked').val();
    this.tam.setFormation(me.startingFormation);
    $('#instructions-link').click(function() {
      $('#instructions').toggle();
    });
    $('#instructions').click(function() {
      $('#instructions').hide();
    });
    $('input[name="formation"]').change(function(ev) {
      me.startingFormation = $(ev.target).val();
      this.tam = new TAMination('',function(t) {
        t.setFormation(me.startingFormation);
        me.startAnimations();
      });
    });
    var me = this;
    $('#clearbutton').click(function() {
      $('#calls').html('');
      me.updateSequence();
    });
    $('#linkbutton').click(function() { document.location = me.calllink; });
    $('#savebutton').click(function()
      {
        var w = window.open('','calllistwindow','width=800,height=800,menubar=yes');
        var t = me.startingFormation + '<br/>\n' +
                $('#calls').html()
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
        me.startingFormation = ta.shift().trim();
        $('input[name="formation"]').val([me.startingFormation]);
        text = ta.join('<br/>');
        $('#calls').html(text);
        this.tam = new TAMination('',function(t) {
          t.setFormation(me.startingFormation);
          me.startAnimations();
        });
      };
      reader.readAsText(i.files[0]);
    });
  };

  TamSequence.prototype.startAnimations = function() {
    if ($('#definition #sequencepage').size() == 0)
      $('#definition').empty().append($('#sequencepage'));
    //  Build the animation
    var dims = svgSize();
    var svgdim = dims.width;
    var svgstr='<div id="svgdiv" '+
               'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
    $("#svgcontainer").empty().width(dims.width).append(svgstr);
    var me = this;
    $('#svgdiv').svg({onLoad:function(x) {
        var t = new TamSVG(x);
        t.setPart = function(n) { me.setCurrentCall(n); }
        //  Add all the calls to the animation
        me.updateSequence();
        t.generateButtonPanel();
      }
    });
  };

  TamSequence.prototype.setCurrentCall = function(n) {
    $('#calls span').removeClass('callhighlight')
       .filter('.Part'+n).addClass('callhighlight');
    tamsvg.setTitle(n > 0 ? this.callnames[n-1] : '');
  }

  //  Highlight a line that has an error
  TamSequence.prototype.showError = function(n) {
    $('#calls').find('span.Part'+n).addClass('callerror');
  }

  //  This function is called every time the text is changed by the user
  TamSequence.prototype.processCallText = function() {
    //  retval is the text of all the calls, each line is one item of the array
    var retval = [];
    //  html is the marked-up calls to stuff back into the text box
    //  so calls are highlighted, errors marked, comments colored, etc.
    var html = [];
    var callnum = 1;
    //  Clear any previous error message
    $('#errortext').html('');
    //  Before we do anything else, remember the current location
    //  A little tricky as we need to carefully remove the old marker
    //  First mark the current location with a new name
    getSelection().getRangeAt(0).insertNode($('<span id="cursor2"/>')[0]);
    //  Then remove the old location marker
    $('#cursor').contents().unwrap();
    //  Now we can rename the current marker
    $('#cursor2').attr('id','cursor');
    //  Strip out existing elements that will be re-added
    //  and any other extraneous html
    //  As a courtesy, if html with <pre> was pasted, replace newlines with <br>
    //if ($('#calls').html().search('<pre') >= 0)
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
    //  Replace the text with our marked-up version
    $('#calls').html(html.join('<br/>'));
    //  And restore the user's current editing location
    getSelection().selectAllChildren($('#cursor')[0]);
    return retval;
  }

  TamSequence.prototype.fetchCall = function(callname) {
    //  Load any animations for this call
    var me = this;
    TAMination.searchCalls(callname,{exact:true}).forEach(function(d) {
      var f = d.link;
      if (!Call.xmldata[f]) {
        //  Call is interpreted by animations
        me.filecount++;
        //  Read and store the animation
        $.get(f.extension('xml'),function(data,status,jqxhr) {
          Call.xmldata[f] = data;
          if (--me.filecount == 0) {
            //  All xml has been read, now we can interpret the calls
            me.buildSequence();
          }
        },"xml").filename = f;
      }
    });

    //  Also load any scripts that perform this call
    TAMination.searchCalls(callname, {
        domain:CodedCall.scripts,
        keyfun: function(d) { return d.name; },
        exact:true }
    ).forEach(function(d) {
      //  Call is interpreted by a script
      if (!(d.name in Call.classes)) {
        me.filecount++;
        //  Read and interpret the script
        require(['calls/'+d.link],function(c) {
          Call.classes[d.name] = c;
          //  Load any other calls that this script uses
          if (c.requires)
            c.requires.forEach(function(d2) {
              me.fetchCall(d2);
            });
          if (--me.filecount == 0)
            me.buildSequence();
        });
      }
    });
  }



  TamSequence.prototype.updateSequence = function() {
    //  Don't do anything if there's no change
    var newhtml = $('#calls').text();
    if (newhtml.replace(/<.*?>/g) == this.prevhtml.replace(/<.*?>/g))
      return;
    this.prevhtml = newhtml;
    this.calls = this.processCallText();
    //  Make sure all calls are sent to be fetched
    this.filecount = 100;
    //  Look up the calls fetch the necessary files
    var me = this;
    for (var i in this.calls) {
      //  Need to load xml files, 1 or more for each call
      var callline = this.calls[i].toLowerCase()
                             .replace(/\s/g,' ')  // coalesce spaces
                             .replace(TamSequence.compattern,'');     // remove comments
      //  Fetch calls that are any part of the callname,
      //  to get concepts and modifications
      callline.minced().forEach(function(s) { me.fetchCall(s) });
    }
    //  All calls sent to be fetched, we can remove the safety
    this.filecount -= 100;
    if (!this.filecount)
      //  We already have all the files
      this.buildSequence();
  }

  TamSequence.prototype.buildSequence = function() {
    //  First clear out the previous animation
    tamsvg.dancers.forEach(function(d) {
      d.path.clear();
      d.animate(0);
    });
    tamsvg.parts = [];
    this.callnames = [];
    $('#errormsg').remove();
    var n2 = 0;
    var callname = '';
    try {
      for (n2 in this.calls) {
        callname = this.calls[n2];
        //  Break up the call as above to find and perform modifications
        var callline = this.calls[n2].toLowerCase()
                                .replace(/\s+/g,' ')  // coalesce spaces
                                .replace(TamSequence.compattern,'');     // remove comments
        //  Various user errors in applying calls are detected and thrown here
        //  and also by lower-level code
        var ctx = new CallContext(tamsvg);
        ctx.interpretCall(callline);
        ctx.performCall();
        //  If no error thrown, then we found the call
        //  and created the animation successfully
        //  Copy the call from the working context to each dancer
        tamsvg.dancers.forEach(function(d,i) {
          d.path.add(ctx.dancers[i].path);
          d.animateToEnd();
        });
        //  Each call shown as one "part" on the slider
        tamsvg.parts.push(ctx.dancers[0].path.beats());
        this.callnames.push(ctx.callname);
      } //  repeat for every call

    }  // end of try block

    catch (err) {
      if (err instanceof CallError) {
        this.showError(Number(n2)+1);
        var msg = err.message.replace(/%s/,'<span class="calltext">'+callname+'</span>')+'<br/>';
        $('#errortext').html(msg);
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
    this.calllink = document.URL.split(/\?/)[0] +
                    '?' + escape(this.startingFormation) + '&' +
                    $('#calls').html()
          .replace(/&nbsp;/g,' ')
          .replace(/<br\/?>/g,'&')
          .replace(/<.*?>/g,'');

  }

  return TamSequence;
});
