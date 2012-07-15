
var callindex = 0;
var seq = 0
$.holdReady(true);
$.getJSON("src/callindex.json",function(data) {
  callindex = data;
  $.holdReady(false);
}).error(function() {alert('JSON error');});

function generateAnimations()  // override function in tampage.js
{
  //  List the calls
  var h = ''
  $('call',animations).each(function(n) {
    h += '<div style="margin:10px 40px; font-family:Arial">'+
          '<span id="Part'+(n+2)+'">'+
          $(this).attr('select')+'</span></div>';
  });
  $('#definition').html(h);

  //  Build the animation
  TAMination(0,animations,'','');
  var dims = appletSize();
  var svgdim = dims.width;
  appletstr='<div id="svgdiv" '+
            'style="width:'+svgdim+'px; height:'+svgdim+'px;"></div>';
  $("#appletcontainer").append(appletstr);
  $('#svgdiv').svg({onLoad:TamSVG});

  //  Add all the calls to the animation
  var filecount = 0;
  var tamxml = [];
  $('call',animations).each(function(n) {
    //  Need to load xml files, 1 or more for each call
    var a = callindex[$(this).attr('select')];
    for (var x in a) {
      filecount++;
      $.get(a[x],function(data) {
        tamxml.push(data);
        if (--filecount == 0) {
          //  All xml has been read, now we can interpret the calls
          $('call',animations).each(function(n2) {
            var m = false;
            var mxml = false;
            var call = $(this);
            for (var i in tamsvg.dancers)
              tamsvg.dancers[i].animate(999);
            for (var x in tamxml) {
              $('tam',tamxml[x]).each(function(n3) {
                if (call.attr('select') == $(this).attr('title')) {
                  var fs = $(this).attr('formation');
                  var f = getFormation(fs);
                  var d = getDancers(f);
                  //alert("Match: "+call.attr('select')+' '+$(this).attr('formation'));
                  mm = matchFormations(tamsvg.dancers,d);
                  if (!mm) {
                    rotateFormation(d);
                    mm = matchFormations(tamsvg.dancers,d);
                  }
                  if (mm) {
                    m = mm;
                    mxml = tamxml[x];
                    tam.callnum = n3; // ugly hack
                  }
                }
              });
            }
            if (m) {
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
          });
          tamsvg.beats = tamsvg.dancers[0].beats();
          generateButtonPanel();
        }
      });
    }
  });

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

function matchFormations(d1,d2)
{
  if (d1.length != d2.length)
    return false;
  retval = {};
  count = 0;
  for (i in d1) {
    for (j in d2) {
      if (Math.abs(d1[i].tx.getTranslateX()-d2[j].start.getTranslateX()) > 0.1)
        continue;
      if (Math.abs(d1[i].tx.getTranslateY()-d2[j].start.getTranslateY()) > 0.1)
        continue;
      if (Math.abs(d1[i].tx.getAngle()-d2[j].start.getAngle()) > 10*Math.PI/180)
        continue;
      retval[i] = j;
      count++;
    }
  }
  if (count != d1.length)
    retval = false;
  return retval;
}