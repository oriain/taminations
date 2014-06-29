function dims() {
  var w = window.innerWidth;
  if (!w)
    w = document.body.scrollWidth;
  var h = window.innerHeight;
  if (!h)
    h = document.body.clientHeight;
  if (!h)
    h = w + 100;
  return {
    w : w,
    h : h
  };
}

function buildAnimation(tam) {
  tam.selectByCall(call);
  var d = dims();
  var svgstr = '<div id="svgcontainer"><div id="svgdiv" ' + 'style="width:'
  + d.w + 'px; height:' + (d.h - 120)
  + 'px; background-color:#ffffc0"></div></div>';
  $("body").prepend(svgstr);
  $('#svgdiv').svg({
    onLoad : function(svg_in) {
      TamSVG(svg_in);
      generateButtonPanel();
      if (args.play)
        tamsvg.start();
    }
  });
}

var search = document.URL.split(/\?/)[1];
args = search.split(/&/);
var page = args[0].split(/\./)[0];
var call = args[0].split(/\./)[1];
if (call == null) {
  page = args[0];
  call = '';
}
page += '.xml';
var params = {};
for (var i = 1; i < args.length; i++) {
  params[args[i]] = 1;
}
args = params;

var callnumber = 0;
var currentcall = 'No Call';

$(document).ready(function() {
  var d = dims();
  $('#tamdiv').width(d.w);
  $('#tamdiv').height(d.h);
  new TAMination(page, buildAnimation, function() {
    //  Try alternatives for ms and adv pages
    //  One of these is sure to fail, but that's ok
    if (page.match(/^ms/)) {
      loadXML(page.replace('ms', 'b1'));
      loadXML(page.replace('ms', 'b2'));
    }
    if (page.match(/^adv/)) {
      loadXML(page.replace('adv', 'a1'));
      loadXML(page.replace('adv', 'a2'));
    }
  });
});
