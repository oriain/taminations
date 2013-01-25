/*

    Copyright 2013 Brad Christie

    This file is part of TAMinations.

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

var animations = 0;
var formations = 0;
var paths = 0;

//Extra XML data that needs to be loaded to build menus and animations
function preload(url,f)
{
  $.holdReady(true);
  $.ajax(url,{
    dataType:"xml",
    error: function(jq,stat,err) {
      alert("Unable to load "+url+" : "+stat+' '+err);
    },
    success: f,
    complete:function() { $.holdReady(false); }
  });
}
var formationdata;
preload('formations.xml',function(a) { formationdata = a; });
var movedata;
preload('moves.xml',function(a) { movedata = a; });

var TAMination = window.TAMination = function(elemid,xmldoc,call,params)
{
  var elem = document.getElementById(elemid);
  return this instanceof TAMination ?
      this.init(elem,xmldoc,call,params) :
      new TAMination(elemid,xmldoc,call,params);
};
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
  //  The return value is an XML document element with dancers
  getFormation: function()
  {
    var a = $("tam",this.xmldoc).eq(this.callnum);
    var f = $(a).find("formation");
    var retval = undefined;
    if (f.size() > 0) {
      //  Formation defined inline
      retval = f;
    } else {
      retval = getNamedFormation(a.attr('formation'));
      if (!retval) {  //  must be sequence
        a = startingFormation;
        retval = getNamedFormation(a);
      }
    }
    return retval;
  },

  attrs: [ "select", "hands" ],
  numattrs: [ "reflect", "beats", "scaleX", "scaleY", "offsetX", "offsetY",
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
      var onepath = tam.translatePath(this);
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
    if (retval.length == 0)
      retval = [1,2,3,4,5,6,7,8];
    return retval;
  },



  translate: function(item)
  {
    var tag = $(item).prop('tagName');
    tag = tag.substr(0,1).toUpperCase()+tag.substr(1);
    return this['translate'+tag](item);
  },

  //  Takes a path, which is an XML element with children that
  //  are moves or movements.
  //  Returns an array of JS movements
  translatePath: function(path)
  {
    var retval = [];
    var me = this;
    $(path).children().each(function() {
      retval = retval.concat(me.translate(this));
    });
    return retval;
  },

  //  Takes a move, which is an XML element that references another XML
  //  path with its "select" attribute
  //  Returns an array of JS movements
  translateMove: function(move)
  {
    //  First retrieve the requested path
    var movename = $(move).attr('select');
    var retval = this.translate($('path[name="'+movename+'"]',movedata).get(0));
    //  Now apply any modifications
    var beats = $(move).attr('beats');
    var scaleX = $(move).attr('scaleX');
    var scaleY = $(move).attr('scaleY');
    var offsetX = $(move).attr('offsetX');
    var offsetY = $(move).attr('offsetY');
    var reflect = $(move).attr('reflect');
    var hands = $(move).attr('hands');
    var oldbeats = 0;  //  If beats is given, we need to know how to scale
    for  (var i=0; i<retval.length; i++)  // each movement
      oldbeats += retval[i].beats;
    for  (var i=0; i<retval.length; i++) {
      if (beats != undefined)
        retval[i].beats *= Number(beats) / oldbeats;
      if (scaleX != undefined) {
        retval[i].cx1 *= Number(scaleX);
        retval[i].cx2 *= Number(scaleX);
        retval[i].x2 *= Number(scaleX);
        if (retval[i].cx3 != undefined)
          retval[i].cx3 *= Number(scaleX);
        if (retval[i].cx4 != undefined)
          retval[i].cx4 *= Number(scaleX);
        if (retval[i].x4 != undefined)
          retval[i].x4 *= Number(scaleX);
      }
      if (scaleY != undefined) {
        retval[i].cy1 *= Number(scaleY);
        retval[i].cy2 *= Number(scaleY);
        retval[i].y2 *= Number(scaleY);
        if (retval[i].cy4)
          retval[i].cy4 *= Number(scaleY);
        if (retval[i].y4)
          retval[i].y4 *= Number(scaleY);
      }
      if (reflect != undefined) {
        retval[i].cy1 *= -1;
        retval[i].cy2 *= -1;
        retval[i].y2 *= -1;
        if (retval[i].cy4 != undefined)
          retval[i].cy4 *= -1;
        if (retval[i].y4 != undefined)
          retval[i].y4 *= -1;
      }
      if (offsetX != undefined) {
        retval[i].cx2 += Number(offsetX);
        retval[i].x2 += Number(offsetX);
      }
      if (offsetY != undefined) {
        retval[i].cy2 += Number(offsetY);
        retval[i].y2 += Number(offsetY);
      }
      if (hands != undefined)
        retval[i].hands = hands;
      else if (reflect != undefined) {
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
    return retval;
  },

  //  Accepts a movement element from a XML file, either an animation definition
  //  or moves.xml
  //  Returns an array of a single JS movement
  translateMovement: function(move)
  {
    var movement = { };
    for (var a in this.attrs)
      movement[this.attrs[a]] = $(move).attr(this.attrs[a]);
    for (var i in this.numattrs)
      if ($(move).attr(this.numattrs[i]) != undefined)
        movement[this.numattrs[i]] = Number($(move).attr(this.numattrs[i]));
    return [movement];
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
    if (applet)
      applet.addDancer(i+1,str);
  }
  if (applet) {
    applet.setParts(tam.getParts());
    applet.rebuildUI();
  }
}

function movementToString(m)
{
  var retval =  "movement "+m.hands+" " + m.beats + " " +
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

function getNamedFormation(name)
{
  retval = name;
  //  TODO since we are getting rid of the formmation attribute, this
  //  will no longer apply
  if (retval && retval.indexOf('Formation') != 0)
    retval = $('formation[name="'+name+'"]',formationdata);
  return retval;
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
  var str = "movement "+m.hands+" "+m.beats+" "+m.cx1+" "+m.cy1+" "+m.cx2+" "+m.cy2+" "+m.x2+" "+m.y2;
  if (m.cx3 != undefined)
    str += " "+m.cx3+" "+m.cx4+" "+m.cy4+" "+m.x4+" "+m.y4;
  return str + ";";
}
