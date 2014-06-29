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

requirejs.config({
    paths : {
      cookie: '../ext/cookie',
      jquery: '../ext/jquery/jquery.2.1.1.min',
      jquerysvg: '../ext/jquery/jquery.svg/jquery.svg',
      jqueryui: '../ext/jquery/jquery-ui/jquery-ui',
      jquerymousewheel: '../ext/jquery/jquery.mousewheel/jquery.mousewheel.min',
      jquerymobile: '../ext/jquery/jquery.mobile-1.4.2/jquery.mobile-1.4.2',
      jquerymobilepagedata: '../ext/jquery/jqm.page.params',
      call: 'calls/call',
      tinymce: '../ext/tinymce_4.1.0_jquery/tinymce/js/tinymce/tinymce.min'
    },
    shim: {
      cookie : {
        exports: 'Cookie'
      },
      jquerysvg : {
        deps: ['jquery']
      },
      tamination : {
        deps: ['jquery'],
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
        deps: ['tampage','call','tinymce']
      },
      embed : {
        deps: ['tamination','tamsvg','jqueryui',]
      },
      tinymce : {
        deps: ['jquery']
      },
      call : {
        deps : ['tamination']
      }
    }
  }
);

if (document.URL.search('mobile.html') >= 0)
  require(['mobile'],function() { sizeFirstMobilePage(); });
else if (document.URL.search('sequence.html') >= 0)
  require(['tamsequence'],function() { });
else if (document.URL.search('taminations/embed.html') >= 0)
  require(['embed'],function() { });
else
  require(['tampage'],function() { });
