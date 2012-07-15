/*

    Copyright 2011 Brad Christie

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

var animations = 0;
var formations = 0;
var paths = 0;

var TAMination = window.TAMination = function(elemid,xmldoc,call,params)
{
  var elem = document.getElementById(elemid);
  return this instanceof TAMination ?
      this.init(elem,xmldoc,call,params) :
      new TAMination(elemid,xmldoc,call,params);
}
var tam;
TAMination.prototype = {
  init: function(elem,xmldoc,call,params)
  {
    tam = this;
    tam.xmldoc = xmldoc;
    tam.callnum = 0;
    tam.call = call;
    $("tam",tam.xmldoc).each(function(n) {
      var str = $(this).attr("title") + "from" + $(this).attr("from");
      if ($(this).attr("group") != undefined)
        str = $(this).attr("title");
      //  First replace strips "(DBD)" et al
      //  Second strips all non-alphanums, not valid in html ids
      str = str.replace(/ \(DBD.*/,"").replace(/\W/g,"");
      if (str.toLowerCase() == tam.call.toLowerCase())
        tam.callnum = n;
    });
    var f = tam.getFormation();
    var parts = tam.getParts();
    if (elem) {
      //  IE has a hard time finding the applet, it needs to be told exacty where it is
      var archive = document.URL.replace(/(embed|info|ms|plus|adv|c1|c2|c3a).*/,"src/TAMination.jar");
      var appletstr = '<applet id="applet" code="TAMination" archive="'+archive+'" '+
      'width="'+elem.offsetWidth+'" '+
      'height="'+elem.offsetHeight+'" '+
      'mayscript="true">'+
      '<param name="archive" value="'+archive+'" />'+
      '<param name="java_code" value="TAMination" />'+
      '<param name="java_type" value="application/x-java-applet;jpi-version=1.3" />'+
      '<param name="parts" value="'+parts+'" />'+
      '<param name="appwidth" value="'+elem.offsetWidth+'" />'+
      '<param name="appheight" value="'+elem.offsetHeight+'" />'+
      '<param name="scriptable" value="true" />'+
      '<param name="formation" value="'+f+'" />';
      if (params.play != undefined)
        appletstr += '<param name="play" value="true" />';
      if (params.loop != undefined)
        appletstr += '<param name="loop" value="true" />';
      if (params.phantoms != undefined)
        appletstr += '<param name="phantoms" value="true" />';
      if (params.grid != undefined)
        appletstr += '<param name="grid" value="true" />';
      if (params.paths != undefined)
        appletstr += '<param name="paths" value="true" />';
      if (params.hexagon != undefined)
        appletstr += '<param name="hexagon" value="true" />';
      var p = tam.getPath(tam.xmldoc);
      for (var i=0; i<p.length; i++) {
        var str = '';
        for (var j=0; j<p[i].length; j++)
          str += movementToString(p[i][j]);
        appletstr += '<param name="dance'+(i+1)+'" value="'+str+'" />';
      }
      appletstr +=
        'Sorry, you need to <a href="http://java.com/">download Java</a> to view TAMinations.'+
        '</applet>';
      elem.innerHTML = appletstr;
    }
  },

  //  Return the formation for the current animation.
  //  If the animation uses a named formation, it is looked up and
  //  the definition returned.
  //  The return value is a string that still needs to be parsed
  //  to get the dancers and their positions.
  getFormation: function()
  {
    var a= $("tam",this.xmldoc).eq(this.callnum);
    var retval = a.attr('formation');
    if (retval && retval.indexOf('Formation') != 0)
      retval = formations[retval];
    if (!retval) {  //  must be sequence
      retval = $('sequence',animations).attr('formation');
      if (retval && retval.indexOf('Formation') != 0)
        retval = formations[retval];
    }
    return retval;
  },

  attrs: [ "select", "hands", "reflect" ],
  numattrs: [ "beats", "scaleX", "scaleY", "offsetX", "offsetY",
              "cx1", "cy1", "cx2", "cy2", "x2", "y2",
              "cx3", "cx4", "cy4", "x4", "y4" ],

  getParts: function()
  {
    var a = $("tam",this.xmldoc).eq(this.callnum);
    return a.attr("parts") ? a.attr("parts") : '';
  },

  getTitle: function()
  {
    var a = $("tam",this.xmldoc).eq(this.callnum);
    return a.attr("title");
  },

  getPath: function(xmldoc)
  {
    var tam = this;
    var retval = [];
    $("path",$("tam",xmldoc).eq(this.callnum)).each(function(n) {
      var onepath = [];
      $("*",this).each(function() {
        var move = {};
        for (var a in tam.attrs) {
          if ($(this).attr(tam.attrs[a]) != undefined)
            move[tam.attrs[a]] = $(this).attr(tam.attrs[a]);
        }
        for (var a in tam.numattrs) {
          if ($(this).attr(tam.numattrs[a]) != undefined)
            move[tam.numattrs[a]] = Number($(this).attr(tam.numattrs[a]));
        }
        var p = tam.translatePath(move);
        while (p.length)
          onepath.push(p.shift());
      });
      retval.push(onepath);
    });
    return retval;
  },

  getNumbers : function()
  {
    var a = $("tam",this.xmldoc).eq(this.callnum);
    // np is the number of paths not including phantoms (which raise it > 4)
    var np =  Math.min($('path',a).size(),4);
    var retval = [];
    var i = 0;
    $("path",a).each(function(n) {
      var n = $(this).attr('numbers');
      if (n) {
        var nn = n.split(/ /);
        retval[i*2] = nn[0];
        retval[i*2+1] = nn[1];
      }
      else if (i > 3) {  // phantoms
        retval[i*2] = ['a','b','c','d'][i*2-8];
        retval[i*2+1] = ['a','b','c','d'][i*2-7];
      }
      else {
        retval[i*2] = i+1;
        retval[i*2+1] = i+1+np;
      }
      i += 1;
    });
    return retval;
  },

  translatePath: function(path)
  {
    var retval = [];
    if (path instanceof Array) {
      for (var m in path) {
        var p = this.translateMovement(path[m]);
        while (p.length)
          retval.push(p.shift());
      }
    }
    else {
      var p = this.translateMovement(path);
      while (p.length)
        retval.push(p.shift());
    }
    return retval;
  },

  translateMovement: function(move)
  {
    var retval = [];
    if ("select" in move) {
      retval = this.translatePath(paths[move.select]);
      var beats = 0;
      for  (var i=0; i<retval.length; i++)
        beats += retval[i].beats;
      for  (var i=0; i<retval.length; i++) {
        if ("beats" in move)
          retval[i].beats *= move.beats / beats;
        if ("scaleX" in move) {
          retval[i].cx1 *= move.scaleX;
          retval[i].cx2 *= move.scaleX;
          retval[i].x2 *= move.scaleX;
          if (retval[i].cx3 != undefined)
            retval[i].cx3 *= move.scaleX;
          if (retval[i].cx4 != undefined)
            retval[i].cx4 *= move.scaleX;
          if (retval[i].x4 != undefined)
            retval[i].x4 *= move.scaleX;
        }
        if ("scaleY" in move) {
          retval[i].cy1 *= move.scaleY;
          retval[i].cy2 *= move.scaleY;
          retval[i].y2 *= move.scaleY;
          if (retval[i].cy4)
            retval[i].cy4 *= move.scaleY;
          if (retval[i].y4)
            retval[i].y4 *= move.scaleY;
        }
        if ("reflect" in move) {
          retval[i].cy1 *= -1;
          retval[i].cy2 *= -1;
          retval[i].y2 *= -1;
          if (retval[i].cy4 != undefined)
            retval[i].cy4 *= -1;
          if (retval[i].y4 != undefined)
            retval[i].y4 *= -1;
        }
        if ("offsetX" in move) {
          retval[i].cx2 += move.offsetX;
          retval[i].x2 += move.offsetX;
        }
        if ("offsetY" in move) {
          retval[i].cy2 += move.offsetY;
          retval[i].y2 += move.offsetY;
        }
        if ("hands" in move)
          retval[i].hands = move.hands;
        else if ("reflect" in move) {
          if (retval[i].hands == "right")
            retval[i].hands = "left";
          else if (retval[i].hands == "left")
            retval[i].hands = "right";
          else if (retval[i].hands == "gripright")
            retval[i].hands = "gripleft";
          else if (retval[i].hands == "gripleft")
            retval[i].hands = "gripright";
        }
      }
    }
    else {  // Not a reference to another movement
      retval = [ cloneObject(move) ];
    }
    return retval;
  }

};

function cloneObject(obj)
{
  retval = { };
  for (p in obj)
    retval[p] = obj[p];
  return retval;
}

function objectToString(obj)
{
  retval = '';
  for (p in obj)
    retval += p + ': ' + obj[p] + "\n";
  return retval;
}

function getParts(n)
{
  var a = $("tam",animations).eq(n);
  return a.attr("parts") ? a.attr("parts") : '';
}

function SelectAnimation(n)
{
  tam.callnum = n;
  var applet = document.getElementById('applet');
  if (applet)
    applet.setFormation(tam.getFormation());
  var p = tam.getPath(tam.xmldoc);
  for (var i=0; i<p.length; i++) {
    var str = '';
    for (var j=0; j<p[i].length; j++)
      str += movementToString(p[i][j]);
    var ii = i+1;
    if (applet)
      applet.addDancer(i+1,str);
  }
  if (applet) {
    applet.setParts(tam.getParts());
    applet.rebuildUI();
  }
}
function translatePath(path)
{
  var retval = [];
  $("*",path).each(function() {
    var p = translateMovement($(this));
    while (p.length)
      retval.push(p.shift());
  });
  return retval;
}

function translateMovement(move)
{
  var retval = [];
  if (move.is("move")) {
    retval = translatePath($("move[name='"+move.attr("select")+"']",paths));
    var beats = 0;
    for  (var i=0; i<retval.length; i++)
      beats += Number(retval[i].beats);
    for  (var i=0; i<retval.length; i++) {
      if (move.attr("beats"))
        retval[i].beats *= Number(move.attr("beats")) / beats;
      if (move.attr("scaleX")) {
        retval[i].cx1 *= Number(move.attr("scaleX"));
        retval[i].cx2 *= Number(move.attr("scaleX"));
        retval[i].x2 *= Number(move.attr("scaleX"));
        if (retval[i].cx3 != undefined)
          retval[i].cx3 *= Number(move.attr("scaleX"));
        if (retval[i].cx4 != undefined)
          retval[i].cx4 *= Number(move.attr("scaleX"));
        if (retval[i].x4 != undefined)
          retval[i].x4 *= Number(move.attr("scaleX"));
      }
      if (move.attr("scaleY")) {
        retval[i].cy1 *= Number(move.attr("scaleY"));
        retval[i].cy2 *= Number(move.attr("scaleY"));
        retval[i].y2 *= Number(move.attr("scaleY"));
        if (retval[i].cy4)
          retval[i].cy4 *= Number(move.attr("scaleY"));
        if (retval[i].y4)
          retval[i].y4 *= Number(move.attr("scaleY"));
      }
      if (move.attr("reflect")) {
        retval[i].cy1 *= -1;
        retval[i].cy2 *= -1;
        retval[i].y2 *= -1;
        if (retval[i].cy4 != undefined)
          retval[i].cy4 *= -1;
        if (retval[i].y4 != undefined)
          retval[i].y4 *= -1;
      }
      if (move.attr("offsetX")) {
        retval[i].cx2 += Number(move.attr("offsetX"));
        retval[i].x2 += Number(move.attr("offsetX"));
      }
      if (move.attr("offsetY")) {
        retval[i].cy2 += Number(move.attr("offsetY"));
        retval[i].y2 += Number(move.attr("offsetY"));
      }
      if (move.attr("hands"))
        retval[i].hands = move.attr("hands");
      else if (move.attr("reflect")) {
        if (retval[i].hands == "right")
          retval[i].hands = "left";
        else if (retval[i].hands == "left")
          retval[i].hands = "right";
        else if (retval[i].hands == "gripright")
          retval[i].hands = "gripleft";
        else if (retval[i].hands == "gripleft")
          retval[i].hands = "gripright";
      }
    }
  }
  else if (move.is("Movement"))
    if (move.attr("cx3") == undefined)
      retval = [{ hands: move.attr("hands"),
                 beats: Number(move.attr("beats")),
                 cx1: Number(move.attr("cx1")),
                 cy1: Number(move.attr("cy1")),
                 cx2 : Number(move.attr("cx2")),
                 cy2 : Number(move.attr("cy2")),
                 x2 : Number(move.attr("x2")),
                 y2 : Number(move.attr("y2"))}];
    else
      retval = [{ hands: move.attr("hands"),
                 beats: Number(move.attr("beats")),
                 cx1: Number(move.attr("cx1")),
                 cy1: Number(move.attr("cy1")),
                 cx2 : Number(move.attr("cx2")),
                 cy2 : Number(move.attr("cy2")),
                 x2 : Number(move.attr("x2")),
                 y2 : Number(move.attr("y2")),
                 cx3 : Number(move.attr("cx3")),
                 cx4 : Number(move.attr("cx4")),
                 cy4 : Number(move.attr("cy4")),
                 x4 :  Number(move.attr("x4")),
                 y4 : Number(move.attr("y4"))}];
  return retval;
}

function movementToString(m)
{
  var retval =  "Movement "+m.hands+" " + m.beats + " " +
                m.cx1 + " " + m.cy1 + " " + m.cx2 + " " + m.cy2 + " " + m.x2 + " " + m.y2;
  if (m.cx3 != undefined)
    retval += " " + m.cx3 + " " + m.cx4 + " " + m.cy4 + " " + m.x4 + " " + m.y4;
  return retval + ";";
}

//  The applet calls this as the animation reaches each part of the call
//  If there's an element with id or class "<call><part>" or "Part<part>" it
//  be highlighted
function setPart(part)
{
  if ($('span').length > 0) {
    //  Remove current highlights
    $('span').removeClass('definition-highlight');
    $('span').filter('.'+currentcall+part+
                    ',#'+currentcall+part+
                    ',.Part'+part+',#Part'+part).addClass('definition-highlight')
    //  hide and show is needed to force Webkit browsers to show the change
                    .hide().show();
  }
}

//Generate the correct copyright for a call at a specific level
function getCopyright(levelurl)
{
  var levelstring = " ";
  if (levelurl.match(/\bms\b/))
    levelstring = "1994, 2000-2011 by ";
  if (levelurl.match(/\bplus\b/))
    levelstring = "1997, 2001-2007 by ";
  if (levelurl.match(/\badv\b/))
    levelstring = "1982, 1986-1988, 1995, 2001-2011. Bill Davis, John Sybalsky, and ";
  if (levelurl.match(/\bc1\b/))
    levelstring = "1983, 1986-1988, 1995-2011 Bill Davis, John Sybalsky and ";
  if (levelurl.match(/\bc2\b/))
    levelstring = "1983, 1986-1988, 1995-2011 Bill Davis, John Sybalsky and ";
  if (levelurl.match(/\bc3a\b/))
    levelstring = "2004-2008 Vic Ceder and ";
  if (levelstring != ' ')
    levelstring = "<p class=\"copyright\">&copy; Copyright " +
         levelstring +
         "<a href=\"http://www.callerlab.org/\">CALLERLAB Inc.</a>, "+
         "The International Association of Square Dance Callers. Permission to reprint, republish, " +
         "and create derivative works without royalty is hereby granted, "+
         "provided this notice appears. Publication on the Internet of "+
         "derivative works without royalty is hereby granted provided this "+
         "notice appears. Permission to quote parts or all of this document "+
         "without royalty is hereby granted, provided this notice is "+
         "included. Information contained herein shall not be changed nor "+
         "revised in any derivation or publication.</p>";
  return levelstring;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Take a object describing a movement and return a string for passing to the applet
function movement(m)
{
  var str = "Movement "+m.hands+" "+m.beats+" "+m.cx1+" "+m.cy1+" "+m.cx2+" "+m.cy2+" "+m.x2+" "+m.y2;
  if (m.cx3 != undefined)
    str += " "+m.cx3+" "+m.cx4+" "+m.cy4+" "+m.x4+" "+m.y4;
  return str + ";";
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//**  formations
var formations =
{
  // Two Couple Formations
  "Facing Couples":
    "Formation boy -2 1 0  girl -2 -1 0",

  "Couples Facing Out":
    "Formation girl -2 1 180 boy -2 -1 180",

  "Two-Faced Line RH":
    "Formation boy 0 3 0 girl 0 1 0",

  "Two-Faced Line LH":
    "Formation boy 0 -1 0 girl 0 -3 0",

  "Box RH":
    "Formation boy -2 1 0 girl -2 -1 180",

  "Box LH":
    "Formation boy -2 1 180 girl -2 -1 0",

  "Wave RH":
    "Formation boy 0 3 0 girl 0 1 180",

  "Wave LH":
    "Formation boy 0 -3 0 girl 0 -1 180",

  "Wave RH GBBG":
    "Formation girl 0 3 0 boy 0 1 180",

  "Wave LH GBBG":
    "Formation girl 0 -3 0 boy 0 -1 180",

  "Diamond RH":
    "Formation boy 0 3 0 girl 1 0 270",

  "Diamond LH":
    "Formation boy 0 3 180 girl 1 0 90",

  "Diamond Facing":
    "Formation boy 0 3 0 girl 1 0 90",

  "Diamond Facing RH":
    "Formation boy 0 3 180 girl 1 0 270",

  "Single Double Pass Thru":
    "Formation boy -3 0 0 girl -1 0 0",

  "Single Eight Chain Thru":
    "Formation boy -3 0 0 girl -1 0 180",

  "Single Quarter Tag":
    "Formation boy -3 0 0 girl 0 1 0",

  "Single Left Quarter Tag":
    "Formation boy -3 0 0 girl 0 1 180",

  "Tandem Girls Lead":
    "Formation boy -3 0 0 girl -1 0 0",

  // Four Couple Formations
  "Static Square":
    "Formation boy -3 1 0  girl -3 -1 0  boy 1 3 270  girl -1 3 270",

  "Static Heads Facing Out":
    "Formation boy -3 -1 180  girl -3 1 180  boy 1 3 270  girl -1 3 270",

  "Static Facing Out":
    "Formation boy -3 -1 180  girl -3 1 180  boy -1 3 90  girl 1 3 90",

  "Static MiniWaves RH":
    "Formation boy -3 1 0  girl -3 -1 180  boy 1 3 270  girl -1 3 90",

  "Static BackToBack":
    "Formation boy -2 0 0 girl -4 0 180 boy 0 2 270 girl 0 4 90",

  "Static Facing":
    "Formation boy -4 0 0 girl -2 0 180 boy 0 4 270 girl 0 2 90",

  "Single File Promenade":
    "Formation boy -3 1 270  girl -3 -1 270  boy 1 3 180  girl -1 3 180",

  "Single File Reverse Promenade":
    "Formation boy -3 1 90  girl -3 -1 90  boy 1 3 0  girl -1 3 0",

  "Promenade":
    "Formation boy 1.414 1.414 135  girl 2.121 2.121 135  boy 1.414 -1.414 45  girl 2.121 -2.121 45",

  "Promenade 2":
    "Formation boy 2 0 90 girl 3 0 90 boy 0 2 180 girl 0 3 180",

  "Star Promenade":
    "Formation boy 1 0 90 girl 3 0 90 boy 0 1 180 girl 0 3 180",

  "Normal Lines":
    "Formation boy -2 3 0  girl -2 1 0  boy -2 -1 0  girl -2 -3 0",

  "Lines Facing Out":
    "Formation girl -2 3 180 boy -2 1 180 girl -2 -1 180 boy -2 -3 180",

  "Column RH GBGB":
    "Formation girl -3 -1 180  boy -1 -1 180  girl 1 -1 180  boy 3 -1 180",

  "Column LH GBGB":
    "Formation boy -3 -1 0  girl -1 -1 0  boy 1 -1 0  girl 3 -1 0",

  "Z RH GBBG":
    "Formation girl -4 1 0 boy -2.5 1 0 boy -2.5 -1 180 girl -1 -1 180",

  "Magic Column RH":
    "Formation girl -3 -1 0  boy -1 -1 180  girl 1 -1 180  boy 3 -1 0",

  "Magic Column LH":
    "Formation girl -3 -1 180  boy -1 -1 0  girl 1 -1 0  boy 3 -1 180",

  "Ocean Waves RH BGGB":
    "Formation boy -2 3 0  girl -2 1 180  girl -2 -1 0  boy -2 -3 180",

  "Ocean Waves LH BGGB":
    "Formation boy -2 3 180  girl -2 1 0  girl -2 -1 180  boy -2 -3 0",

  "Ocean Waves RH GBBG":
    "Formation girl -2 3 0  boy -2 1 180  boy -2 -1 0  girl -2 -3 180",

  "Ocean Waves LH GBBG":
    "Formation girl -2 3 180  boy -2 1 0  boy -2 -1 180  girl -2 -3 0",

  "Ocean Waves RH BGBG":
    "Formation boy -2 3 0 girl -2 1 180 boy -2 -1 0 girl -2 -3 180",

  "Ocean Waves LH BGBG":
    "Formation boy -2 3 180 girl -2 1 0 boy -2 -1 180 girl -2 -3 0",

  "Circle":
    "Formation boy -2.414 1 -22.5  girl -2.414 -1 22.5  boy 1 2.414 247.5 girl -1 2.414 292.5",

  "Alamo Wave":
    "Formation boy -2.414 1 -22.5  girl -2.414 -1 202.5  boy 1 2.414 247.5 girl -1 2.414 112.5",

  "Two-Faced Lines RH":
    "Formation boy -2 3 0 girl -2 1 0 girl -2 -1 180 boy -2 -3 180",

  "Two-Faced Lines LH":
    "Formation girl -2 3 180 boy -2 1 180 boy -2 -1 0 girl -2 -3 0",

  "Thar LH Boys":
    "Formation boy -1 0 270 girl -3 0 90 boy 0 -1 0 girl 0 -3 180",

  "Thar LH Girls":
    "Formation girl -1 0 270 boy -3 0 90 girl 0 -1 0 boy 0 -3 180",

  "Thar RH Boys":
    "Formation boy -1 0 90 girl -3 0 270 boy 0 -1 180 girl 0 -3 0",

  "Diamonds RH Girl Points":
    "Formation boy 0 -3 180 girl -3 -2 90 boy 0 -1 0 girl 3 -2 270",

  "Diamonds LH Girl Points":
    "Formation boy 0 -3 0 girl -3 -2 270 boy 0 -1 180 girl 3 -2 90",

  "Diamonds Facing Girl Points":
    "Formation boy 0 -3 180 girl -3 -2 270 boy 0 -1 0 girl 3 -2 90",

  "Diamonds Facing LH Girl Points":
    "Formation boy 0 -3 0 girl -3 -2 90 boy 0 -1 180 girl 3 -2 270",

  "Diamonds RH PTP Girl Points":
    "Formation boy -1 -3 90 girl 0 -1 0 boy 1 -3 270 girl 0 -5 180",

  "Diamonds 3 and 1 Girl Points":
    "Formation boy 0 -3 180 girl -3 -2 270 boy 0 -1 0 girl 3 -2 270",

  "Diamonds 3 and 1":
    "Formation boy 0 -3 180 girl -3 -2 270 boy 0 -1 180 girl 3 -2 90",

  "Interlocked Diamonds RH Girl Points":
    "Formation boy 0 -3 180 girl -3 -2 90 boy 0 -1 180 girl 3 -2 270",

  "Interlocked Diamonds LH Girl Points":
    "Formation boy 0 -3 0 girl -3 -2 270 boy 0 -1 0 girl 3 -2 90",

  "Interlocked Diamonds RH PTP Girl Points":
    "Formation boy -1 -3 90 girl 0 -1 180 boy 1 -3 270 girl 0 -5 180",

  "Interlocked Diamonds LH PTP Girl Points":
    "Formation boy -1 -3 270 girl 0 -1 0 boy 1 -3 90 girl 0 -5 0",

  "Inverted Lines Centers In":
    "Formation boy -2 3 180  girl -2 1 0  boy -2 -1 0  girl -2 -3 180",

  "Inverted Lines Centers Out":
    "Formation boy -2 3 0  girl -2 1 180  boy -2 -1 180  girl -2 -3 0",

  "Concentric Diamonds RH":
    "Formation boy 0 3 0  girl 0 1 0  boy 2 0 270  girl 4 0 270",

  "Concentric Diamonds Mixed":
    "Formation boy 0 3 0  girl 0 1 180  boy 2 0 90  girl 4 0 270",

  "Quarter Tag":
    "Formation boy -3 1 0 girl -3 -1 0 boy 0 -3 180 girl 0 -1 0",

  "Quarter Tag LH":
    "Formation boy -3 1 0 girl -3 -1 0 boy 0 -3 0 girl 0 -1 180",

  "3/4 Tag":
    "Formation girl -3 1 180 boy -3 -1 180 boy 0 -3 180 girl 0 -1 0",

  "3/4 Tag LH":
    "Formation girl -3 1 180 boy -3 -1 180 boy 0 -3 0 girl 0 -1 180",

  "Quarter Lines RH":
    "Formation boy -3 1 0 girl -3 -1 0 boy 0 1 0 girl 0 3 0",

  "Quarter Lines LH":
    "Formation boy -3 1 0 girl -3 -1 0 boy 0 -1 0 girl 0 -3 0",

  "Quarter Wave RH":
    "Formation boy -3 1 0 girl -3 -1 180 boy 0 -3 180 girl 0 -1 0",

  "Quarter Wave LH":
    "Formation boy -3 1 180 girl -3 -1 0 boy 0 -3 0 girl 0 -1 180",

  "Double Pass Thru":
    "Formation boy -3 1 0 girl -3 -1 0 boy -1 1 0 girl -1 -1 0",

  "Completed Double Pass Thru":
    "Formation girl -3 1 180 boy -3 -1 180 girl -1 1 180 boy -1 -1 180",

  "Eight Chain Thru":
    "Formation boy -3 1 0 girl -3 -1 0 boy -1 -1 180 girl -1 1 180",

  "Pass Thru":
    "Formation boy -3 1 0 girl -3 -1 0 boy -1 -1 180 girl -1 1 180",

  "Trade By":
    "Formation girl -3 1 180 boy -3 -1 180 girl -1 -1 0 boy -1 1 0",

  "Two-Faced Tidal Line RH":
    "Formation boy 0 3.5 0 girl 0 2.5 0 girl 0 1.5 180 boy 0 .5 180",

  "Two-Faced Tidal Line LH":
    "Formation girl 0 3.5 180 boy 0 2.5 180 boy 0 1.5 0 girl 0 .5 0",

  "Tidal Inverted Line RH":
    "Formation boy 0 -3.5 180 girl 0 -2.5 0 boy 0 -1.5 0 girl 0 -.5 180",

  "Tidal Line RH":
    "Formation boy 0 -3.5 180 girl 0 -2.5 180 boy 0 -1.5 180 girl 0 -.5 180",

  "Tidal Line LH":
    "Formation boy 0 -2.5 0 girl 0 -3.5 0 boy 0 -.5 0 girl 0 -1.5 0",

  "Tidal Wave RH BGGB":
    "Formation boy 0 -3.5 180 girl 0 -2.5 0 girl 0 -1.5 180 boy 0 -.5 0",

  "Tidal Wave LH BGGB":
    "Formation boy 0 -3.5 0 girl 0 -2.5 180 girl 0 -1.5 0 boy 0 -.5 180",

  "Hourglass RH BP":
    "Formation boy -2 -3 180 girl -3 0 90 boy -2 3 0 girl 0 1 0",

  "Hourglass LH BP":
    "Formation boy -2 -3 0 girl -3 0 270 boy -2 3 180 girl 0 1 180",

  "Hourglass Facing LH Box":
    "Formation boy -2 -3 0 girl -3 0 90 boy -2 3 180 girl 0 1 0",

  "Hourglass Facing RH Box":
    "Formation boy -2 -3 180 girl -3 0 270 boy -2 3 0 girl 0 1 180",

  // Galaxy points are tweaked to fix handholds
  "Galaxy RH GP":
    "Formation boy -1 -1 180 girl -3 0 90 boy -1 1 0 girl 0 3.1 0",

  "Galaxy LH GP":
    "Formation boy -1 -1 0 girl -3 0 270 boy -1 1 180 girl 0 3.1 180",

  "Facing Blocks":
    "Formation boy -3 1 0 girl -3 -3 0 boy -1 3 0 girl -1 -1 0",

  "Blocks Facing Out":
    "Formation girl -3 1 180 boy -3 -3 180 girl -1 3 180 boy -1 -1 180",

  "Blocks RH":
    "Formation boy -3 1 0 girl -3 -3 180 boy -1 3 0 girl -1 -1 180",

  "Butterfly RH":
    "Formation boy -3 3 0 girl -3 -3 180 boy -1 1 0 girl -1 -1 180",

  "Butterfly LH":
    "Formation boy -3 3 180 girl -3 -3 0 boy -1 1 180 girl -1 -1 0",

  "Butterfly In":
    "Formation boy -3 3 0 girl -3 -3 0 boy -1 1 0 girl -1 -1 0",

  "Butterfly Out":
    "Formation boy -3 -3 180 girl -3 3 180 boy -1 -1 180 girl -1 1 180",

  "Butterfly Chain Thru":
    "Formation boy -3 3 0 girl -3 -3 0 boy -1 -1 180 girl -1 1 180",

  "Butterfly Trade By":
    "Formation boy -3 -3 180 girl -3 3 180 boy -1 1 0 girl -1 -1 0",

  "O RH":
    "Formation boy -3 1 0 girl -3 -1 180 boy -1 3 0 girl -1 -3 180",

  "O LH":
    "Formation boy -3 1 180 girl -3 -1 0 boy -1 3 180 girl -1 -3 0",

  "O In":
    "Formation boy -3 1 0 girl -3 -1 0 boy -1 3 0 girl -1 -3 0",

  "O Out":
    "Formation girl -3 1 180 boy -3 -1 180 girl -1 3 180 boy -1 -3 180",

  "O Eight Chain Thru":
    "Formation boy -3 1 0 girl -3 -1 0 boy -1 -3 180 girl -1 3 180",

  "O Trade By":
    "Formation boy -3 -1 180 girl -3 1 180 boy -1 3 0 girl -1 -3 0",

   //  These are T-Bones, boys as trailers in a column and the girls facing out
   //  DLDL is 'down,left,down,left' reading the bottom line from left to right
  "T-Bone DLDL":
    "Formation girl -3 -1 270  boy -1 -1 180  girl 1 -1 270  boy 3 -1 180",

  "T-Bone DRDR":
    "Formation girl -3 -1 270  boy -1 -1 0  girl 1 -1 270  boy 3 -1 0",

  "T-Bone URUR":
    "Formation girl -3 -1 90  boy -1 -1 0  girl 1 -1 90  boy 3 -1 0",

  "T-Bone RDRD":
    "Formation girl -3 1 90  boy -1 1 180  girl 1 1 90  boy 3 1 180",

  "T-Bone URRD":
    "Formation boy -1 3 0 girl -1 1 270 girl -1 -1 270 boy -1 -3 180",

  "T-Bone ULLD":
    "Formation boy -1 3 0 girl -1 1 90 girl -1 -1 90 boy -1 -3 180",

  "T-Bone ULRU":
    "Formation boy -1 3 0 girl -1 -1 270 boy -1 1 90 girl -1 -3 0",

  "T-Bone URLU":
    "Formation boy -1 3 0 girl -1 -1 90 boy -1 1 270 girl -1 -3 0",

  "T-Bone DLLU":
    "Formation boy -1 3 180 girl -1 1 90 girl -1 -1 90 boy -1 -3 0",

  "T-Bone DRLD":
    "Formation boy -1 3 180 girl -1 -1 90 boy -1 1 270 girl -1 -3 180",

  "T-Bone DLRD":
    "Formation boy -1 3 180 girl -1 -1 270 boy -1 1 90 girl -1 -3 180",

  "T-Bone LUUR":
    "Formation boy -1 3 90 girl 1 3 90 boy -1 1 0 girl -1 -1 0",

  "T-Bone LDDR":
    "Formation boy -1 3 90 girl 1 3 90 boy -1 1 180 girl -1 -1 180",

  "T-Bone LULU":
    "Formation boy -1 3 90 girl -1 1 0 boy -1 -1 90 girl -1 -3 0",

  "T-Bone LDLD":
    "Formation boy -1 3 90 girl -1 1 180 boy -1 -1 90 girl -1 -3 180",

  "T-Bone Couples":
    "Formation boy -2 3 0 girl -2 1 0 girl -3 -2 270 boy -1 -2 270",

  // Formations with phantoms
  "Phantom Formation In":
    "Formation boy -2 3 0 girl -2 1 0 boy 3 2 270 girl 1 2 270 phantom -2 -1 0 phantom -2 -3 0",

  "Phantom Formation RH":
    "Formation boy -2 3 0 girl -2 1 180 boy 3 2 270 girl 1 2 90 phantom -2 -1 0 phantom -2 -3 180",

  "Phantom Formation Two-Faced":
    "Formation boy -2 3 0 girl -2 1 0 boy 1 2 90 girl 3 2 90 phantom -2 -1 180 phantom -2 -3 180",

  "Phantom Lines In":
    "Formation boy 2 3 180 girl 2 1 180 boy 2 -1 180 girl 2 -3 180 phantom 2 5 180 phantom 2 -5 180",

  "Phantom Lines Out":
    "Formation girl -2 3 180 boy -2 1 180 girl -2 -1 180 boy -2 -3 180 phantom -2 -5 180 phantom -2 5 180",

  "Phantom Waves RH":
    "Formation boy 2 3 180  girl 2 1 0 boy 2 -1 180 girl 2 -3 0 phantom 2 5 0 phantom 2 -5 180",

  "Phantom Waves LH":
    "Formation boy -2 1 0  girl -2 3 180 boy -1 -2 90 girl -3 -2 270",

  "Phantom Two-Faced RH":
    "Formation boy -2 3 0 girl -2 1 0 girl -3 -2 270 boy -1 -2 270",

  "Tidal Line Girls Disconnected":
    "Formation girl 0 -2.5 0 boy 0 -3.5 0 girl 0 -.5 0 boy 0 -1.5 0"

};


////////////////////////////////////////////////////////////////////////////////
//** movements
var paths =
{

  "Stand": { "hands":"both", "beats":1, "cx1":0, "cy1":0, "cx2":0, "cy2":0, "x2":0, "y2":0 },

  "Stand Left": { "select":"Stand", "hands":"left" },

  "Stand Right": { "select":"Stand", "hands":"right" },

  "FinalStand": { "select":"Stand", "hands":"gripboth" },

  "Final Left": { "select":"Stand", "hands":"gripleft" },

  "Final Right": { "select":"Stand", "hands":"gripright" },

  "Forward": { "hands":"no", "beats":1, "cx1":0.333, "cy1":0, "cx2":0.667, "cy2":0, "x2":1, "y2":0 },

  "Back": { "hands":"no", "beats":1, "cx1":-0.333, "cy1":0, "cx2":-0.667, "cy2":0, "x2":-1, "y2":0,
                               "cx3":0.5, "cx4":0.5, "cy4":0, "x4":1, "y4":0 },

  "Run Left": { "hands":"no", "beats":3, "cx1":1.333, "cy1":0, "cx2":1.333, "cy2":2, "x2":0, "y2":2 },

  "Run Right": { "select":"Run Left", "reflect":-1 },

  "U-Turn Left": { "hands":"no", "beats":3, "cx1":0, "cy1":0, "cx2":0, "cy2":0, "x2":0, "y2":0,
                                 "cx3":1.333, "cx4":1.333, "cy4":2, "x4":0, "y4":2 },

  "U-Turn Right": { "select":"U-Turn Left", "reflect":-1 },

  "Flip Left": { "hands":"no", "beats":3, "cx1":0.1, "cy1":0, "cx2":0.1, "cy2":2, "x2":0, "y2":2,
                                 "cx3":1, "cx4":1, "cy4":2, "x4":0, "y4":2 },

  "Flip Right": { "select":"Flip Left", "reflect":-1 },

  "Dodge Left": { "hands":"no", "beats":3, "cx1":0, "cy1":0, "cx2":0, "cy2":2, "x2":0, "y2":2,
                                 "cx3":4, "cx4":4, "cy4":1, "x4":8, "y4":1 },

  "Dodge Right": { "select":"Dodge Left", "reflect":-1 },

  "Extend Left": {  "hands":"no", "beats":1, "cx1":0.5, "cy1":0, "cx2":0.5, "cy2":1, "x2":1, "y2":1,
                                 "cx3":1, "cx4":1, "cy4":0.4, "x4":2, "y4":0.4 },


  "Extend Right": { "select":"Extend Left", "reflect":-1 },

  "Retreat Left": { "hands":"no", "beats":1, "cx1":-0.5, "cy1":0, "cx2":-0.5, "cy2":1, "x2":-1, "y2":1,
                                 "cx3":1, "cx4":1, "cy4":-0.4, "x4":2, "y4":-0.4 },

  "Retreat Right": { "select":"Retreat Left", "reflect":-1 },

  "Quarter Left": { "hands":"no", "beats":1.5, "cx1":0, "cy1":0, "cx2":0, "cy2":0, "x2":0, "y2":0,
                                   "cx3":0.55, "cx4":1, "cy4":0.45, "x4":1, "y4":1 },

  "Quarter Right": { "select":"Quarter Left", "reflect":-1 },

  "Hinge Left": { "hands":"left", "beats":1.5, "cx1":0.55, "cy1":0, "cx2":1, "cy2":0.45, "x2":1, "y2":1 },

  "Hinge Right": { "select":"Hinge Left", "reflect":-1 },

  "BackHinge Left": { "hands":"left", "beats":1.5, "cx1":-0.55, "cy1":0, "cx2":-1, "cy2":0.45, "x2":-1, "y2":1,
                                     "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },

  "BackHinge Right": { "select":"BackHinge Left", "reflect":-1 },

  "HalfHinge Left": { "hands":"left", "beats":0.75, "cx1":0.265, "cy1":0, "cx2":0.52, "cy2":0.105, "x2":0.707, "y2":0.293 },

  "HalfHinge Right": { "select":"HalfHinge Left", "reflect":-1 },

  "HalfBackHinge Left": { "hands":"left", "beats":0.75, "cx1":-0.265, "cy1":0, "cx2":-0.52, "cy2":0.105, "x2":-0.707, "y2":0.293,
                                     "cx3":0.265, "cx4":0.52, "cy4":-0.105, "x4":0.707, "y4":-0.293 },

  "HalfBackHinge Right": { "select":"HalfBackHinge Left", "reflect":-1 },

  "BackRun Left": { "hands":"left", "beats":3, "cx1":-1.333, "cy1":0, "cx2":-1.333, "cy2":2, "x2":0, "y2":2,
                                   "cx3":1.333, "cx4":1.333, "cy4":-2, "x4":0, "y4":-2 },

  "BackRun Right": { "select":"BackRun Left", "reflect":-1 },

  "Fold Left": { "hands":"no", "beats":2, "cx1":1.5, "cy1":0, "cx2":3.5, "cy2":2, "x2":2, "y2":2 },

  "Fold Right": { "select":"Fold Left", "reflect":-1 },

  "Cross Fold Left": { "hands":"no", "beats":3, "cx1":1.5, "cy1":0, "cx2":2.5, "cy2":4, "x2":2, "y2":4 },

  "Cross Fold Right": { "select":"Cross Fold Left", "reflect":-1 },

  "Lead Left": { "hands":"no", "beats":1.5, "cx1":0.55, "cy1":0, "cx2":1, "cy2":0.45, "x2":1, "y2":1 },

  "Lead Right": { "select":"Lead Left", "reflect":-1 },

  "Eighth Left": { "hands":"no", "beats":0.75, "cx1":0, "cy1":0, "cx2":0, "cy2":0, "x2":0, "y2":0,
                                   "cx3":0.265, "cx4":0.52, "cy4":0.105, "x4":0.707,  "y4":0.293 },

  "Eighth Right": { "select":"Eighth Left", "reflect":-1 },

  "Lead Left 1/2": { "hands":"no", "beats":0.75, "cx1":0.265, "cy1":0, "cx2":0.520, "cy2":0.105, "x2":0.707, "y2":0.293 },

  "Lead Right 1/2": { "select":"Lead Left 1/2", "reflect":-1 },

  "Sashay Left": { "hands":"no", "beats":3, "cx1":0.75, "cy1":0, "cx2":0.75, "cy2":2, "x2":0, "y2":2,
                                 "cx3":0, "cx4":0, "cy4":0, "x4":0, "y4":0 },

  "Sashay Right": { "select":"Sashay Left", "reflect":-1 },

  "BackSashay Left": { "hands":"no", "beats":3, "cx1":-0.75, "cy1":0, "cx2":-0.75, "cy2":2, "x2":0, "y2":2,
                                 "cx3":0, "cx4":0, "cy4":0, "x4":0, "y4":0 },

  "BackSashay Right": { "select":"BackSashay Left", "reflect":-1 },

  "Sxtnth Left": { "hands":"both", "beats":0.1, "cx1":0, "cy1":0, "cx2":0, "cy2":0, "x2":0, "y2":0,
                                    "cx3":0.1313, "cx4":0.2614, "cy4":0.0259, "x4":0.3827, "y4":0.0761 },

  "Sxtnth Right": { "select":"Sxtnth Left", "reflect":-1 },

  "Cross Left": { "hands":"left", "beats":2, "cx1":1, "cy1":0, "cx2":0, "cy2":2, "x2":2, "y2":2,
                                   "cx3":1, "cx4":1, "cy4":0.4, "x4":2, "y4":0.4 },

  "Cross Right": { "select":"Cross Left", "reflect":-1 },


  //    Counter Rotate
  //    From the dancer's starting position, if the rotation center is
  //    to the left of the dancer, then it's a Counter Rotate Left, else Right
  //    The X and Y numbers are the net change in position
  // Counter rotate turning towards the right with a net forward movement
  "Counter Rotate Right 2 0": { "hands":"no", "beats":2, "cx1":0.5, "cy1":0.5, "cx2":1.5, "cy2":0.5, "x2":2, "y2":0,
                                "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "    Counter rotate turning left with a net forward movement":"",
  "Counter Rotate Left 2 0" : { "select":"Counter Rotate Right 2 0", "reflect":-1},
  "Counter Rotate Left 0 2": { "hands":"no", "beats":2, "cx1":0.5, "cy1":0.5, "cx2":0.5,"cy2":1.5, "x2":0,"y2":2,
                               "cx3":0.55, "cx4":1, "cy4":0.45, "x4":1, "y4":1 },
  "Counter Rotate Right 0 -2": { "select":"Counter Rotate Left 0 2", "reflect":-1 },
  "Counter Rotate Left 1 2": { "hands":"no", "beats":2, "cx1":0, "cy1":0.5, "cx2":1,"cy2":2, "x2":1,"y2":2,
                               "cx3":0.55, "cx4":1, "cy4":0.45, "x4":1, "y4":1 },
  "Counter Rotate Right 1 -2" : { "select":"Counter Rotate Left 1 2", "reflect":-1},
  "Counter Rotate Right 0 2": { "hands":"no", "beats":2, "cx1":-0.5, "cy1":0.5, "cx2":-0.5,"cy2":1.5, "x2":0,"y2":2,
                                "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 0 -2": { "select":"Counter Rotate Right 0 2", "reflect":-1},
  "Counter Rotate Right 1 2": { "hands":"no", "beats":2, "cx1":0, "cy1":0.5, "cx2":0,"cy2":2, "x2":1,"y2":2,
                                "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left -2 0": { "hands":"no", "beats":2, "cx1":-0.5, "cy1":0.5, "cx2":-1.5, "cy2":0.5, "x2":-2, "y2":0,
                               "cx3":0.55, "cx4":1, "cy4":0.45, "x4":1, "y4":1 },
  "Counter Rotate Right -2 0": { "select":"Counter Rotate Left -2 0", "reflect":-1 },
  "Counter Rotate Right 3 1" : { "hands":"no", "beats":2, "cx1":0.5, "cy1":1, "cx2":2, "cy2":1.5, "x2":3, "y2":1,
                                 "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 3 -1" : { "select":"Counter Rotate Right 3 1", "reflect":-1},
  "Counter Rotate Right 3 -1" : { "hands":"no", "beats":2, "cx1":1, "cy1":1, "cx2":2.5, "cy2":0, "x2":3, "y2":-1,
                                  "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Right 0 3" : { "hands":"no", "beats":2, "cx1":-0.5, "cy1":0.5, "cx2":-1, "cy2":2.5, "x2":0, "y2":3,
                                 "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Right 5 1" : { "hands":"no", "beats":2, "cx1":0.5, "cy1":1, "cx2":4, "cy2":1.5, "x2":5, "y2":1,
                                 "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 5 -1" : { "select":"Counter Rotate Right 5 1", "reflect":-1},
  "Counter Rotate Right 5 -1" : { "hands":"no", "beats":2, "cx1":1.5, "cy1":1, "cx2":4, "cy2":0.5, "x2":5, "y2":-1,
                                  "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 5 1" : { "select":"Counter Rotate Right 5 -1", "reflect":-1 },
  "Counter Rotate Right 1 -5" : { "hands":"no", "beats":2, "cx1":1.5, "cy1":-1, "cx2":2, "cy2":-3.5, "x2":1, "y2":-5,
                                  "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 1 5" : { "select":"Counter Rotate Right 1 -5", "reflect":-1},
  "Counter Rotate Left -1 3" : { "hands":"no", "beats":2, "cx1":0.5, "cy1":1, "cx2":0, "cy2":2.5, "x2":-1, "y2":3,
                                 "cx3":0.55, "cx4":1, "cy4":0.45, "x4":1, "y4":1 },
  "Counter Rotate Right -1 -3" : { "select":"Counter Rotate Left -1 3", "reflect": -1 },
  "Counter Rotate Right 4 2" : { "hands":"no", "beats":2, "cx1":0.5, "cy1":1.5, "cx2":2.5, "cy2":2.5, "x2":4, "y2":2,
                                 "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 4 -2" : { "select":"Counter Rotate Right 4 2", "reflect":-1 },
  "Counter Rotate Right -2 -4" : { "hands":"no", "beats":2, "cx1":0.5, "cy1":-1.5, "cx2":-0.5, "cy2":-3.5, "x2":-2, "y2":-4,
                                   "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left -2 4" : { "select":"Counter Rotate Right -2 -4", "reflect":-1 },
  "Counter Rotate Right 4 -2" : { "hands":"no", "beats":2, "cx1":1.5, "cy1":0.5, "cx2":3.5, "cy2":-0.5, "x2":4, "y2":-2,
                                 "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Right 2 -4" : { "hands":"no", "beats":2, "cx1":1.5, "cy1":-0.5, "cx2":2.5, "cy2":-2.5, "x2":2, "y2":-4,
                                  "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },

  //    Useful for turning a circle of four
  "Counter Rotate Left 1 1" : { "hands":"no", "beats":2, "cx1":0, "cy1":0.5, "cx2":0.5,"cy2":1,"x2":1,"y2":1,
                                  "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },
  "Counter Rotate Left 1.414 1.414" : { "select":"Counter Rotate Left 1 1", "scaleX":1.414, "scaleY":1.414 },


  //    For circle left and circle right
  "cl": { "hands":"both", "beats":1, "cx1":0.27, "cy1":0.64, "cx2":0.77, "cy2":1.14, "x2":1.41, "y2":1.41,
                                   "cx3":0.265, "cx4":0.52, "cy4":-0.105, "x4":0.707, "y4":-0.293 },

  "cr": { "select":"cl", "reflect":-1 },

  "incircle2": { "hands":"both", "beats":1, "cx1":0.3, "cy1":0, "cx2":0.3, "cy2":0, "x2":0.59, "y2":0,
                                   "cx3":1, "cx4":2, "cy4":1, "x4":3, "y4":2 },

  "incircle3": { "select":"incircle2", "reflect":-1 },

  //    For single circle to a wave
  "ssqtr": { "hands":"no", "beats":1, "cx1":0, "cy1":0.385, "cx2":0.315, "cy2":0.7, "x2":0.7, "y2":0.7,
                                 "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },

  "Pivot forward left": { "hands":"no", "beats":3, "cx1":0, "cy1":1.333, "cx2":2, "cy2":1.333, "x2":2, "y2":0,
                                               "cx3":1.333, "cx4":1.333, "cy4":-2, "x4":0, "y4":-2 },
  "Pivot forward right": { "select":"Pivot forward left", "reflect":-1 },
  "Pivot backward left": { "hands":"no", "beats":3, "cx1":0, "cy1":1.333, "cx2":-2, "cy2":1.333, "x2":-2, "y2":0,
                                                "cx3":1.333, "cx4":1.333, "cy4":2, "x4":0, "y4":2 },
  "Pivot backward right": { "select":"Pivot backward left", "reflect":-1 },

  //    For fractional tops
  "Sxtnth": { "hands":"no", "beats":1.125, "cx1":0.3939, "cy1":0, "cx2":0.7842, "cy2":-0.0777, "x2":1.1481, "y2":-0.2283 },

  "H16th": { "hands":"left", "beats":0.375, "cx1":0.1313, "cy1":0, "cx2":0.2614, "cy2":0.0259, "x2":0.3827, "y2":0.0761 },

  //    For couples circle left
  "Circle Left Half": { "hands":"gripboth", "beats":3, "cx1":0, "cy1":1.88, "cx2":2.83, "cy2":1.88, "x2":2.83, "y2":0,
                                       "cx3":1.33, "cx4":1.33, "cy4":-2, "x4":0, "y4":-2 },

  "Circle Left Quarter": { "hands":"gripboth", "beats":1.5, "cx1":0, "cy1":0.39, "cx2":0.318, "cy2":0.707, "x2":0.707, "y2":0.707,
                                         "cx3":0.55, "cx4":1, "cy4":-0.45, "x4":1, "y4":-1 },

  "Circle Right Quarter": { "select":"Circle Left Quarter", "reflect":-1 },

  "Forward .5": { "select":"Foward", "beats":0.5, "scaleX":0.5 },

  "Forward 2": { "select":"Forward", "beats":2, "scaleX":2 },

  "Forward 3": { "select":"Forward", "beats":3, "scaleX":3 },

  "Forward 4": { "select":"Forward", "beats":4, "scaleX":4 },

  "Forward 5": { "select":"Forward", "beats":5, "scaleX":5 },

  "Forward 6": { "select":"Forward", "beats":6, "scaleX":6 },

  "Back 2": { "select":"Back", "beats":2, "scaleX":2 },

  "Slow Forward": { "select":"Forward", "beats":2 },

  "Slow Forward 2": { "select":"Forward 2", "beats":3 },

  "Extend Left 2": { "select":"Extend Left", "beats":2, "scaleX":2, "scaleY":2 },

  "Extend Right 2": { "select":"Extend Left 2", "reflect":-1 },

  "Extend Left 4": { "select":"Extend Left", "beats":3, "scaleX":4, "scaleY":4 },

  "Extend Right 4": { "select":"Extend Left 4", "reflect":-1 },

  "Pull Left": { "select":"Extend Left", "hands":"right" },

  "Pull Right": { "select":"Pull Left", "reflect":-1 },

  "Pass Thru": [ { "select":"Extend Left", "scaleY":0.5 },
                 { "select":"Extend Right", "scaleY":0.5 } ],

  "Swing Left": { "select":"Run Left", "hands":"left" },

  "Swing Right": { "select":"Swing Left", "reflect":-1 },

  "Cast Left": [ { "select":"Swing Left" },
                 { "select":"Hinge Left" } ],

  "Cast Right": { "select":"Cast Left", "reflect":-1 },

  "Lead Left 2": { "select":"Lead Left", "beats":3, "scaleX":2, "scaleY":2 },

  "Lead Right 2": { "select":"Lead Left 2", "reflect":-1 },

  "Lead Left 3": { "select":"Lead Left", "beats":4.5, "scaleX":3, "scaleY":3 },

  "Lead Right 3": { "select":"Lead Left 3", "reflect":-1 },

  "Pull By": { "select":"Extend Left", "hands":"right" },

  "Beau Wheel": { "select":"BackRun Right", "hands":"right" },

  "Belle Wheel": { "hands":"left", "beats":3, "cx1":1.333, "cy1":0, "cx2":1.333, "cy2":2, "x2":0, "y2":2,
                   "cx3":1.333, "cx4":1.333, "cy4":2, "x4":0, "y4":2 },

  "Beau Reverse Wheel": { "hands":"right", "beats":3, "cx1":1.333, "cy1":0, "cx2":1.333, "cy2":-2, "x2":0, "y2":-2,
                          "cx3":1.333, "cx4":1.333, "cy4":-2, "x4":0, "y4":-2 },

  "Belle Reverse Wheel": { "select":"BackRun Left", "hands":"left" }

  };
