/*

    Copyright 2015 Brad Christie

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
"use strict";
var animations = 0;
var formations = 0;
var paths = 0;
var crossrefs = {};
var formationdata;
var movedata;

var prefix = '';
//  Make the links work from both taminations directory and its subdirectories
//  TODO Merge with tampage code
if (document.URL.search(/(info|b1|b2|ms|plus|adv|a1|a2|c1|c2|c3a|c3b)/) >= 0)
  prefix = '../';
if (document.URL.search(/embed/) >= 0)
  prefix = '';

var tam;  // for global access TODO remove
var TAMination = function(xmlpage,f,errfun,call)
{
  this.loadcount = 0;
  this.loadfinish = f;
  this.loadXML('formations.xml',function(a) { formationdata = a; });
  this.loadXML('moves.xml',function(a) { movedata = a; });
  if (xmlpage)
    this.loadXMLforAnimation(xmlpage,errfun);
  TAMination.tam = this;
};

//  Code for singleton pattern
TAMination.tam = 0;
TAMination.getTam = function() {
  if (!TAMination.tam)
    TAMination.tam = new TAMination();
  return TAMination.tam;
}

//  Scan the doc for cross-references and load any found
TAMination.prototype.scanforXrefs = function(xmldoc) {
  var me = this;
  $('tamxref',xmldoc).each(function() {
    var link = $(this).attr('xref-link');
    me.loadXML(prefix+link+'.xml',function(b) {
      crossrefs[link] = b;
    });
  });
};

TAMination.prototype.loadXMLforAnimation = function(xmlpage,errfun) {
  var me = this;
  this.loadXML(xmlpage,function(a) { me.xmldoc = a; me.scanforXrefs(a); },errfun);
};

TAMination.loadXML =
TAMination.prototype.loadXML = function(url,f,e) {
  var me = this;
  this.loadcount++;
  $.ajax(url,{
    dataType:"xml",
    error: typeof e == 'function'
      ? function() { e(me); }
      : function(jq,stat,err) {
          alert("Unable to load "+url+" : "+stat+' '+err);
    },
    success: f,
    complete:function() {
      if (me) {
        me.loadcount--;
        if (me.loadcount == 0)
          me.init('');
      }
    }
  });
};

TAMination.prototype.init = function(call) {
  tam = this;
  tam.callnum = 0;
  if (typeof this.loadfinish == 'function') {
    this.loadfinish(this);
    this.loadfinish = 0;
  }
};

TAMination.prototype.selectAnimation = function(n) {
  this.callnum = n;
};

TAMination.prototype.selectByCall = function(call) {
  tam.call = call;
  tam.animations().each(function(n) {
    var str = $(this).attr("title") + "from" + $(this).attr("from");
    if ($(this).attr("group") != undefined)
      str = $(this).attr("title");
    //  First replace strips "(DBD)" et al
    //  Second strips all non-alphanums, not valid in html ids
    str = str.replace(/ \(DBD.*/,"").replace(/\W/g,"");
    if (str.toLowerCase() == tam.call.toLowerCase())
      tam.callnum = n;
  });
};

TAMination.prototype.animations = function() {
  return $('tam[display!="none"],tamxref',this.xmldoc);
};

TAMination.prototype.animation = function(n) {
  if (arguments.length == 0 || typeof n == 'undefined')
    n = this.callnum;
  if (typeof n == 'number')
    return this.animations().eq(n);
  return $(n);  // should be a tam element
};

TAMination.prototype.animationXref = function(n) {
  var a = this.animation(n);
  if (a.attr('xref-link') != undefined) {
    var s = '';
    if (a.attr('xref-title') != undefined)
      s += "[title|='"+a.attr('xref-title')+"']";
    if (a.attr('xref-from') != undefined)
      s += '[from="'+a.attr('xref-from')+'"]';
    a = $('tam'+s,crossrefs[a.attr('xref-link')]);
  }
  return a;
};

  //  Return the formation for the current animation.
  //  If the animation uses a named formation, it is looked up and
  //  the definition returned.
  //  The return value is an XML document element with dancers
TAMination.prototype.getFormation = function() {
  if (typeof startingFormation != 'undefined')  // sequence
    return getNamedFormation(startingFormation);
  var a = this.animationXref();
  var f = $(a).find("formation");
  var retval = undefined;
  if (f.length > 0) {
    //  Formation defined as an element in the animation
    retval = f;
  } else {
    //  Named formation as an attribute
    retval = getNamedFormation(a.attr('formation'));
  }
  return retval;
};

TAMination.prototype.attrs =  [ "select", "hands" ];
TAMination.prototype.numattrs = [ "reflect", "beats", "scaleX", "scaleY", "offsetX", "offsetY",
                                  "cx1", "cy1", "cx2", "cy2", "x2", "y2",
                                  "cx3", "cx4", "cy4", "x4", "y4" ];

TAMination.prototype.getParts = function() {
  var a = this.animationXref();
  return a.attr("parts") ? a.attr("parts") : '';
};

TAMination.prototype.getTitle = function(n) {
  var a = this.animation(n);
  return a.attr("title");
};

TAMination.prototype.getComment = function(n) {
  return this.animation(n).find('taminator').text();
};

TAMination.prototype.getPath = function(a)
{
  var tam = this;
  var retval = [];
  $("path",this.animationXref(a)).each(function(n) {
    var onepath = tam.translatePath(this);
    retval.push(onepath);
  });
  return retval;
};

TAMination.prototype.getNumbers = function() {
  var a = this.animationXref();
  // np is the number of paths not including phantoms (which raise it > 4)
  var np =  Math.min($('path',a).length,4);
  var retval = ['1','2','3','4','5','6','7','8'];
  var i = 0;
  $("path",a).each(function(n) {
    var n = $(this).attr('numbers');
    if (n) {  //  numbers given in animation XML
      var nn = n.split(/ /);
      retval[i*2] = nn[0];
      retval[i*2+1] = nn[1];
    }
    else if (i > 3) {  // phantoms
      retval[i*2] = ' ';
      retval[i*2+1] = ' ';
    }
    else {  //  default numbering
      retval[i*2] = (i+1)+'';
      retval[i*2+1] = (i+1+np)+'';
    }
    i += 1;
  });
  return retval;
};

TAMination.prototype.getCouples = function() {
  var a = this.animationXref();
  var retval = ['1','3','1','3','2','4','2','4','5','6','5','6',' ',' ',' ',' '];
  $("path",a).each(function(n) {
    var c = $(this).attr('couples');
    if (c) {
      var cc = c.split(/ /);
      retval[n*2] = cc[0];
      retval[n*2+1] = cc[1];
    }
  });
  return retval;
};

TAMination.prototype.translate = function(item) {
  var tag = $(item).prop('tagName');
  tag = tag.toCapCase();
  return this['translate'+tag](item);
};

  //  Takes a path, which is an XML element with children that
  //  are moves or movements.
  //  Returns an array of JS movements
TAMination.prototype.translatePath = function(path) {
  var retval = [];
  var me = this;
  $(path).children().each(function() {
    retval = retval.concat(me.translate(this));
  });
  return retval;
};

  //  Takes a move, which is an XML element that references another XML
  //  path with its "select" attribute
  //  Returns an array of JS movements
TAMination.prototype.translateMove = function(move) {
  //  First retrieve the requested path
  var movename = $(move).attr('select');
  var moveitem = $('path[name="'+movename+'"]',movedata).get(0);
  if (moveitem == undefined)
    throw new Error('move "'+movename+'" not defined');
  var retval = this.translate(moveitem);
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
};

  //  Accepts a movement element from a XML file, either an animation definition
  //  or moves.xml
  //  Returns an array of a single JS movement
TAMination.prototype.translateMovement = function(move) {
  var movement = { };
  for (var a in this.attrs)
    movement[this.attrs[a]] = $(move).attr(this.attrs[a]);
  for (var i in this.numattrs) {
    if ($(move).attr(this.numattrs[i]) != undefined)
      movement[this.numattrs[i]] = Number($(move).attr(this.numattrs[i]));
  }
  return [movement];
};
// end of TAMination class

//  The program calls this as the animation reaches each part of the call
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
  return $('formation[name="'+name+'"]',formationdata);
}
