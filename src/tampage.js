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
var prefix = '';
//  Make the links work from both taminations directory and its subdirectories
if (document.URL.search(/(info|b1|b2|ms|plus|adv|a1|a2|c1|c2|c3a)/) >= 0)
  prefix = '../';
var currentmenu = 0;
var callnumber = -1;
var currentcall = "";
var titleob = 0;
var tamsvg = 0;
var cookie = 0;
var animationNumber = {};
var here = document.URL.split(/\?/)[0];
var search = document.URL.split(/\?/)[1];
if (search != null)
  search = search.split(/\&/);
else
  search = [];
args = {};
for (var i=0; i<search.length; i++) {
  var arg1 = search[i].split(/=/);
  if (arg1.length > 1)
    args[arg1[0]] = arg1[1];
  else
    args[search[i].toLowerCase().replace(/\W/g,"")] = true;
}
var difficultText = [ ' <font color="blue">&diams;</font>',
                      ' <font color="red">&diams;&diams;</font>',
                      ' <font color="black">&diams;&diams;&diams;</font>' ];

var calldata;
preload('calls.xml',function(a) { calldata = a; });

var levelselectors = {
      info: 'call[sublevel="Info"]',
      how: 'call[sublevel="HowItWorks"]',
      basicandmainstream: 'call[level="Basic and Mainstream"]',
      basic1: 'call[sublevel="Basic 1"]',
      basic2: 'call[sublevel="Basic 2"]',
      mainstream: 'call[sublevel="Mainstream"]',
      plus: 'call[level="Plus"]',
      advanced: 'call[level="Advanced"]',
      a1: 'call[sublevel="A-1"]',
      a2: 'call[sublevel="A-2"]',
      c1: 'call[sublevel="C-1"]',
      c2: 'call[sublevel="C-2"]',
      c3a: 'call[sublevel="C-3A"]' };

// Body onload function
$(document).ready(
  function() {
    if (typeof defwidth == 'undefined')
      defwidth = 40;
    if (typeof animwidth == 'undefined')
      animwidth = 30;
    $(".noshow").hide();
    //  Load the menus
    $("body").prepend('<div style="width:100%; height:48px" id="menudiv"></div>');
    $("#menudiv").hide();  // so we don't flash all the menus
    $("#menuload").addClass("menutitle");
    //  Insert title
    $("body").prepend(getTitle());
    //  Build the document structure
    var htmlstr = '<table id="deftable" cellspacing="0" cellpadding="4" width="100%">'+
                    '<tr valign="top">'+
                      '<td width="'+defwidth+'%">'+
                        '<div id="definition">'+
                          '<span class="level"></span>'+
                        '</div>'+
                      '</td>'+
                      '<td width="'+animwidth+'%" class="animation"><div id="appletcontainer"></div></td>'+
                      '<td class="animation">'+
                        '<div id="animationlist"></div>'+
                      '</td>'+
                    '</tr>'+
                  '</table>';

    //  Build the menus
    $("#menudiv").append('<table cellpadding="0" cellspacing="0" width="100%" summary="">'+
                         '<tr>'+
                         '<td id="info" class="menutitle">Info</td>'+
                         '<td id="basicandmainstream" class="menutitle" colspan="3">Basic and Mainstream</td>'+
                         '<td id="plus" class="menutitle" rowspan="2">Plus</td>'+
                         '<td id="advanced" class="menutitle" colspan="2">Advanced</td>'+
                         '<td id="c1" class="menutitle" rowspan="2">C-1</td>'+
                         '<td id="c2" class="menutitle" rowspan="2">C-2</td>'+
                         '<td id="c3a" class="menutitle" rowspan="2">C-3A</td></tr>'+
                     '<tr><td id="how" class="menutitle">How It Works</td>'+
                         '<td id="basic1" class="menutitle">Basic 1</td>'+
                         '<td id="basic2" class="menutitle">Basic 2</td>'+
                         '<td id="mainstream" class="menutitle">Mainstream</td>'+
                         '<td id="a1" class="menutitle">A-1</td>'+
                         '<td id="a2" class="menutitle">A-2</td>'+
    '</tr></table>');
    $('#menudiv').append('<div class="menu"></div>');
    $('.menutitle').each(function() {
      $(this).click(function() {
        $('.menutitle').removeClass('selected');
        $(this).addClass('selected');
        //  Select the calls for this level
        var level = $(this).attr('id');
        var menu = $(levelselectors[level],calldata);
        var columns = Math.min(Math.ceil(menu.size()/25),4);
        var rows = Math.floor((menu.size() + columns - 1) / columns);
        var menuhtml = '<table cellpadding="0" cellspacing="0">';
        for (var r = 0; r < rows; r++) {
          menuhtml += '<tr>';
          for (var c = 0; c < columns; c++) {
            var mi = c*rows + r;
            if (mi < menu.size()) {
              var menuitem = $(menu.eq(mi));
              var onelink = menuitem.attr('link');
              if (menuitem.attr('anim') != undefined)
                onelink += '?' + menuitem.attr('anim');
              menuhtml += '<td onclick="document.location=\''+prefix+onelink+'\'">'+
                           menuitem.attr('text')+'</td>';
            }
          }
          menuhtml += '</tr>';
        }
        menuhtml += '</table>';
        $('.menu').empty();
        $('.menu').append(menuhtml);
        $(".menu td").addClass("menuitem");
        $(".menuitem").hover(
            function() { $(this).addClass("menuitem-highlight"); },
            function() { $(this).removeClass("menuitem-highlight"); })
            .bind("mousedown",
                function() { return false; });

        //  Position off the screen to get the width without flashing it in the wrong position
        $(".menu").css("left","-1000px").show();
        var mw = $(".menu").width();
        var mh = $(".menu").height();
        var sw = $('body').width();
        var sh = $('body').height();
        var ml = $(this).offset().left;
        var mt = $(this).offset().top + $(this).height() + 4;
        //        Generally the menu goes below the title
        //        But if it pushes the menu off the right side of the screen shift it left
        if (ml+mw > sw)
          ml = sw - mw;
        //    and push it up if it flows below the screen
        if (mt+mh > sh)
          mt = sh - mh;
        $("td:has(applet)").addClass("invisible");  // need to hide the applet to see the menus
        $(".menu").css("top",mt+"px");
        $(".menu").css("left",ml+"px");
      });
    });

    //  Hide all the menus
    $(".menutitle > div").addClass("menutitlediv").hide();
    //  Remove any visible menus when user clicks elsewhere
    $(document).bind("mousedown",clearMenus);
    //  Everything's ready, show the menus
    $("#menuload").hide();
    $("#menudiv").show();

    sizeBody();
    //  Load XML documents that define the animations
    var docname = document.URL.match(/(\w+)\.html/)[1];
    $.ajax({url:docname+".xml",dataType:"xml",
      success:function(a) {
        $("#menudiv").after(htmlstr);
        animations = a;
        generateAnimations();
      },
    });
    //  end of menu load function

  });  // end of document ready function

function clearMenus()
{
  $(".menu").hide();
  $("td:has(applet)").removeClass("invisible");
  $('.menutitle').removeClass('selected');
}

//  Generate the title above the menus
function getTitle()
{
  return '<div class="title">' +
         '<a href="http://www.tamtwirlers.org/">'+
         '<img height="72" border="0" align="right" src="'+prefix+'info/badge.gif"></a>'+
         '<a href="'+prefix+'info/index.html">Taminations</a></div>';
}

//Set height of page sections to fit the window
function sizeBody()
{
  var h = $(window).height() - 116;
  $('#definition').height(h);
  $('#calllist').height(h);
  $('#animationlist').height(h);
  $('#iframeleft').height(h);
  $('#iframeright').height(h);
}

function appletSize()
{
  var aw = 100;
  var ah = 100;
  var h = window.innerHeight ? window.innerHeight : document.body.offsetHeight;
  var w = window.innerWidth ? window.innerWidth : document.body.offsetWidth;
  if (typeof h == "number" && typeof w == "number") {
    ah = h - 150;
    aw = (w * animwidth) / 100;
    if (ah * 350 > aw * 420)
      ah = (aw * 420) / 350;
    else
      aw = (ah * 350) / 420;
  }
  aw = Math.floor(aw);
  ah = Math.floor(ah);
  return { width: aw, height: ah };
}

function generateAnimations()
{
  var showDiffLegend = false;
  //  Put the call definition in the document structure
  $("#deftable").nextAll().appendTo("#definition");
  $("#radio1").attr("checked",true);
  $("#applet").width(appletSize().width).height(appletSize().height);
  $("h2").first().prepend(getLevel());
  //  Show either full or abbreviated definition
  //  Load saved options from browser cookie
  cookie = new Cookie("TAMination");
  if ($('.abbrev').length + $('.full').length > 0) {
    if (cookie.full == "true") {
      $('.abbrev').hide();
      $('#full').addClass('selected');
      $('#abbrev').removeClass('selected');
    }
    else
      $('.full').hide();
    $('#full').click(function() {
      $('.abbrev').hide();
      $('.full').show();
      $('#full').addClass('selected');
      $('#abbrev').removeClass('selected');
      cookie.full = "true";
      cookie.store();
    });
    $('#abbrev').click(function() {
      $('.full').hide();
      $('.abbrev').show();
      $('#abbrev').addClass('selected');
      $('#full').removeClass('selected');
      cookie.full = "false";
      cookie.store();
    });
  }
  else
    $('.level > .appButton').hide();
  //  Build the selection list of animations
  var prevtitle = "";
  var prevgroup = "";
  $("#animationlist").empty();  //  disable to restore old animations
  $('tam[display!="none"]',animations).each(function(n) {
    var callname = $(this).attr('title') + 'from' + $(this).attr('from');
    var name = $(this).attr('from');
    if ($(this).attr("group") != undefined) {
      if ($(this).attr("group") != prevgroup)
        $("#animationlist").append('<span class="callname">'+$(this).attr("group")+'</span><br />');
      name = $(this).attr('title').replace($(this).attr('group'),' ');
      callname = $(this).attr('title');
    }
    else if ($(this).attr("title") != prevtitle)
      $("#animationlist").append('<span class="callname">'+$(this).attr("title")+" from</span><br />");
    if ($(this).attr("difficulty") != undefined) {
      name = name + difficultText[Number($(this).attr("difficulty"))-1];
      showDiffLegend = true;
    }
    //  First replace strips "(DBD)" et al
    //  Second strips all non-alphanums, not valid in html ids
    callname = callname.replace(/ \(DBD.*/,"").replace(/\W/g,"");
    animationNumber[callname.toLowerCase()] = n;
    prevtitle = $(this).attr("title");
    prevgroup = $(this).attr('group');
    $('<input name="tamradio" type="radio" class="selectRadio"/>').appendTo("#animationlist")
      .click(function() { PickAnimation(n); });
    $("#animationlist").append('<a class="selectAnimation" href="javascript:PickAnimation('+n+')">'+
          name + '</a>');
    if ($("path",this).length == 2)
      $("#animationlist").append(' <span class="comment">(4 dancers)</span>');
    $("#animationlist").append('<br />');
  });
  $(".selectAnimation").hover(function() { $(this).addClass("selectHighlight"); },
                              function() { $(this).removeClass("selectHighlight"); });
  //  Add any comment below the animation list
  $('#animationlist').append('<br /><div id="comment" class="comment">' +
                      $('comment *',animations).text() + '</div>');
  //  Passed-in arg overrides cookie
  if (args.svg == 'false' || args.svg == 'true') {
    cookie.svg = args.svg;
    cookie.store();
  }
  if (showDiffLegend)
    $('#animationlist').append(
        difficultText[0]+' Common - New dancers should look at these.<br/>'+
        difficultText[1]+' More difficult - For more experienced dancers.<br/>'+
        difficultText[2]+' Most difficult - For expert dancers.<br/><br/>'
        );
  var cansvg = !$.browser.msie || $.browser.version > 8;
  if (cansvg && cookie.svg == 'false')
    $('#animationlist').append('Problems with Java? Try the <a href="'+
                               here+'?svg=true">SVG animation</a>.');
  //  If a specific animation is requested in the URL, switch to it
  callnumber = 0;
  callname = '';
  for (var arg in args) {
    if (animationNumber[arg] != undefined) {
      callnumber = animationNumber[arg];
      callname = arg;
    }
  }
  //  Insert the applet
  if ($("tam",animations).size() > 0) {
    $('#appletcontainer').height($('#appletcontainer').width()+100).width(appletSize().width);
    //  For non-MSIE, SVG is now the default
    if (cansvg && cookie.svg != 'false') {
      TAMination(0,animations,callname,'');
      var dims = appletSize();
      var svgdim = dims.width;
      appletstr='<div id="svgdiv" '+
                'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
      $("#appletcontainer").append(appletstr);
      $('#svgdiv').svg({onLoad:function(x) {
          var t = new TamSVG(x);
          t.setPart = setPart;
        }
      });
    }
    else
      TAMination('appletcontainer',animations,callname,'');
    if ($('tam',animations).size() <= 0) {
      appletstr = '<p style="margin: 20px">No animation for this call.</p>';
    }
    $('#appletcontainer').after('<div id="taminatorsays"></div>');
    //  Make sure the 1st radio button is turned on
    if ($(".selectRadio").get(callnumber))
      $(".selectRadio").get(callnumber).checked = true;
    $("#animationlist > a").eq(callnumber).addClass("selectedHighlight");
    $("#animationlist > a").eq(callnumber).prevAll('.callname:first').addClass("selectedHighlight");
    currentcall = $('tam',animations).eq(callnumber)
        .attr("title").replace(/ \(DBD.*/,"").replace(/\W/g,"");
  } else {
    //  no animations
    $('#appletcontainer').append("<h3><center>No animation for this call.</center></h3>");
  }
  sizeBody();
  showTAMinator(callnumber);
  if (tamsvg)
    generateButtonPanel();
}


function PickAnimation(n)
{
  SelectAnimation(n);
  if (tamsvg) {
    tamsvg.stop();
    $('#appletcontainer').empty();
    $('#svgdiv').empty();
    var dims = appletSize();
    var svgdim = dims.width;
    appletstr='<div id="svgdiv" '+
              'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
    $("#appletcontainer").append(appletstr);
    $('#svgdiv').svg({onLoad:TamSVG});
  }
  $('.selectedHighlight').removeClass("selectedHighlight");
  $("#animationlist > a").eq(n).addClass("selectedHighlight");
  $(".selectRadio").get(n).checked = true;
  //  Note that :first gets the 'first previous' when used with prevAll
  $("#animationlist > a").eq(n).prevAll('.callname:first').addClass("selectedHighlight");
  if (tamsvg) {
    generateButtonPanel();
    tamsvg.setPart = setPart;
    setPart(0);
  }
  currentcall = $('tam',animations).eq(n)
      .attr("title").replace(/ \(DBD.*/,"").replace(/\W/g,"");
  //  Show any comments below the animation
  showTAMinator(n);
}

//Show one specific TAMinator comment
function showTAMinator(n)
{
  $('#taminatorsays').empty();
  var tamsays = false;
  if ($('tam',animations).eq(n).find('taminator').size() > 0) {
    tamsays = $('tam',animations).eq(n).find('taminator').text();
  } else if (Math.random() > 0.8) {
    var tipnum = Math.floor(Math.random()*tips.length);
    tamsays = 'Tip: '+tips[tipnum];
  }
  if (tamsays) {
    $('#taminatorsays').append('<img src="../src/taminator.gif" />')
                       .append('<img src="../src/thetaminatorsays.gif" />')
                       .append('<p class="styling" id="taminatorquote"></p>');
    if (typeof tamsays == 'string')
      $('#taminatorquote').append(tamsays);
    else
      tamsays.appendTo('#taminatorquote');
    var h = (window.innerHeight ? window.innerHeight : document.body.clientHeight)
            -appletSize().height - 116;
    $('#taminatorsays').height(h);
  }
}


function getLevel()
{
  var levelstring = " ";
  if (document.URL.match(/\/b1\//))
    levelstring = "Basic 1";
  if (document.URL.match(/\/b2\//))
    levelstring = "Basic 2";
  if (document.URL.match(/\/ms\//))
    levelstring = "Mainstream";
  if (document.URL.match(/\/plus\//))
    levelstring = "Plus";
  if (document.URL.match(/\/adv\//))
    levelstring = "Advanced";
  if (document.URL.match(/\/a1\//))
    levelstring = "A-1";
  if (document.URL.match(/\/a2\//))
    levelstring = "A-2";
  if (document.URL.match(/\/c1\//))
    levelstring = "C-1";
  if (document.URL.match(/\/c2\//))
    levelstring = "C-2";
  if (document.URL.match(/\/c3a\//))
    levelstring = "C-3A";
  return '<span class="level">'+levelstring+'<br/><br/>' +
         '<span class="appButton selected" id="abbrev">Abbrev</span> '+
         '<span class="appButton" id="full">Full</span></span>';
}

var tips = [
  "Right click on a dancer for special features.",
  "You can move the animation manually by dragging the slider.",
  "You can move the animation manually with the mouse wheel.",
  "Control the animation speed with the Slow and Fast buttons.",
  "Show all dancer paths with the Paths button.",
  "Use the Loop button to run the animation repeatedly."
];
