/*

    Copyright 2014 Brad Christie

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
var crossrefs = {};

var funcprop = {writable: false, enumerable: false};
Object.prototype.childClass = function(c)
{
  c = c || function() { };
  c.prototype = Object.create(this.prototype);
  c.prototype.constructor = c;
  c.prototype.superclass = this;
  return c;
};

/**
 *   This defines a forEach function for objects similar to the Array function
 *   Parameters:
 *   f(p,v)
 *      A function called for every enumerable property of the object
 *      p is the property, and v is its value
 *   o
 *      An optional object to bind 'this' in the function given as the first parameter
 *
 */
Object.prototype.forEach = function(f,o) {
    for (var p in this) {
      f.call(o,p,this[p]);
    }
};
Object.defineProperties(Object.prototype, {
  childClass: funcprop,
  forEach: funcprop
});

String.prototype.toCapCase = function()
{
  return this.replace(/\b\w+\b/g, function(word)
      {
        return word.substring(0,1).toUpperCase() +
               word.substring(1).toLowerCase();
      }
 );
};
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.collapse = function() {
  return this.replace(/\s+/g,'');
};
String.prototype.toCamelCase = function() {
  return this.toCapCase().collapse();
};

Object.defineProperties(String.prototype, {
  toCapCase: funcprop,
  trim: funcprop,
  collapse: funcprop,
  toCamelCase: funcprop
});

//  Extra XML data that needs to be loaded to build menus and animations
function preload(url,f,e)
{
  //  No longer working on IE 8 (on XP)
  if (navigator.userAgent.indexOf('MSIE 8') > 0)
    return;
  $.holdReady(true);
  $.ajax(url,{
    dataType:"xml",
    error: typeof e == 'function' ? e : function(jq,stat,err) {
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
//  Load the XML doc that defines the animations
var docname = document.URL.match(/(\w+)\.html/)[1];
if (docname != 'index')
preload(docname+'.xml',function(a)
  {
    //  Stuff the animations in a global variable
    //  TODO it would be better for the animations to be a property of
    //  the Taminations object
    animations = a;
    //  Scan the doc for cross-references and load any found
    $('tamxref',a).each(function() {
      var link = $(this).attr('xref-link');
      preload('../'+link+'.xml',function(b) {
        crossrefs[link] = b;
      });
    });
  //  Some pages in the info section do not have xml, so ignore
  //  any errors
  }, function() { });

var TAMination = window.TAMination = function(xmldoc,call)
{
  return this instanceof TAMination ?
      this.init(xmldoc,call) :
      new TAMination(xmldoc,call);
};
var tam;

TAMination.prototype = {
  init: function(xmldoc,call)
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
  },

  selectAnimation: function(n)
  {
    this.callnum = n;
  },

  animations: function()
  {
    return $('tam[display!="none"],tamxref',this.xmldoc);
  },

  animation: function(n)
  {
    if (arguments.length == 0 || typeof n == 'undefined')
      n = this.callnum;
    if (typeof n == 'number')
      return this.animations().eq(n);
    return $(n);  // should be a tam element
  },

  animationXref: function(n)
  {
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
  },

  //  Return the formation for the current animation.
  //  If the animation uses a named formation, it is looked up and
  //  the definition returned.
  //  The return value is an XML document element with dancers
  getFormation: function()
  {
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
  },

  attrs: [ "select", "hands" ],
  numattrs: [ "reflect", "beats", "scaleX", "scaleY", "offsetX", "offsetY",
              "cx1", "cy1", "cx2", "cy2", "x2", "y2",
              "cx3", "cx4", "cy4", "x4", "y4" ],

  getParts: function()
  {
    var a = this.animationXref();
    return a.attr("parts") ? a.attr("parts") : '';
  },

  getTitle: function(n)
  {
    var a = this.animation(n);
    return a.attr("title");
  },

  getComment: function(n)
  {
    return this.animation(n).find('taminator').text();
  },

  getPath: function(a)
  {
    var tam = this;
    var retval = [];
    $("path",this.animationXref(a)).each(function(n) {
      var onepath = tam.translatePath(this);
      retval.push(onepath);
    });
    return retval;
  },

  getNumbers : function()
  {
    var a = this.animationXref();
    // np is the number of paths not including phantoms (which raise it > 4)
    var np =  Math.min($('path',a).length,4);
    retval = ['1','2','3','4','5','6','7','8'];
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
  },

  getCouples : function()
  {
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
  },

  translate: function(item)
  {
    var tag = $(item).prop('tagName');
    tag = tag.toCapCase();
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
    for (var i in this.numattrs) {
      if ($(move).attr(this.numattrs[i]) != undefined)
        movement[this.numattrs[i]] = Number($(move).attr(this.numattrs[i]));
    }
    return [movement];
  }

};  // end of TAMination class

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
  var a = tam.animationXref(n);
  return a.attr("parts") ? a.attr("parts") : '';
}

function SelectAnimation(n)
{
  tam.selectAnimation(n);
}

function formationToString(f)
{
  var outstr = "Formation";
  $('dancer',f).each(function() {
    outstr += ' ' + $(this).attr('gender') + ' ' +
              $(this).attr('x') + ' ' +
              $(this).attr('y') + ' ' +
              $(this).attr('angle');
  });
  return outstr;
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
  return $('formation[name="'+name+'"]',formationdata);
}
