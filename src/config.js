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

if (navigator.userAgent.indexOf('MSIE 8') > 0) {
  var noie8 =  '<h3>Taminations does not work on Internet Explorer 8.<br/>'+
  'Download and install one of these other excellent browsers.</h3>'+
  '<ul><li><a href="https://www.google.com/intl/en/chrome/browser/">Chrome</a></li>'+
  '<li><a href="http://www.mozilla.org/firefox/new/">Firefox</a></li>'+
  '<li><a href="http://www.opera.com/">Opera</a></li></ul></div>';
  document.getElementById('definition').innerHTML = noie8;
} else {

  requirejs.config({
    paths : {
      cookie: '../ext/cookie',
      jquery: '../ext/jquery/jquery-2.1.1.min',
      jquerysvg: '../ext/jquery/jquery-svg/jquery.svg.min',
      jqueryui: '../ext/jquery/jquery-ui-1.11.0.custom/jquery-ui.min',
      jquerymousewheel: '../ext/jquery/jquery-mousewheel-3.1.11/jquery.mousewheel.min',
      jquerymobile: '../ext/jquery/jquery-mobile/jquery.mobile-1.4.2.min',
      jquerymobilepagedata: '../ext/jquery/jqm.page.params',
      tinymce: '../ext/tinymce/js/tinymce/tinymce.min',
      call: 'calls/call',
    },
    shim: {
      cookie : {
        exports: 'Cookie'
      },
      jquerysvg : {
        deps: ['jquery']
      },
      tamination : {
        deps: ['jquery','env','string','math','array'],
        exports: 'TAMination'
      },
      tamsvg : {
        deps: ['tamination','jquerysvg','jquerymousewheel','cookie'],
        exports: 'TamSVG'
      },
      tampage : {
        deps: ['tamination','tamsvg','cookie','jqueryui'],
      },
      jquerymobilepagedata : {
        deps : ['jquerymobile']
      },
      mobile : {
        deps: ['cookie','jquerymobile','jquerymobilepagedata','tamsvg']
      },
      tamsequence : {
        deps: ['tampage','call','tinymce','env']
      },
      tinymce : {
        deps: ['jquery']
      },
      call : {
        deps : ['tamination','env']
      },
      search : {
        deps : ['tamination','tampage']
      }
    }
  });

  if (document.URL.search('mobile.html') >= 0)
    require(['mobile'],function() { sizeFirstMobilePage(); });
  else if (document.URL.search('sequence.html') >= 0)
    require(['tamsequence'],function() { sequenceSetup(); });
  else if (document.URL.search('taminations?/embed.html') >= 0)
    require(['embed'],function() { });
  else if (document.URL.search('movements.html') >= 0)
    require(['tampage'],movementsPageInit);
  else if (document.URL.search('search.html') >= 0)
    require(['search'],function() { });
  else
    require(['tampage'],function() { });
}
