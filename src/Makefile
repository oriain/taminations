
#    Copyright 2014 Brad Christie
#
#    This file is part of Taminations.
#
#    Taminations is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    Taminations is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with Taminations.  If not, see <http://www.gnu.org/licenses/>.

#  This generates files needed for Taminations
#  You need GNU make to run this file
#  and Python to generate files
#  On Windows use Cygwin

RM = rm
COPY = cp
PYTHON = python
ZIP = zip
ZIPFILE = ../tamintion.zip
DIRS = b1 b2 ms plus adv a1 a2 c1 c2 c3a c3b info .
XMLSRC = calls.xml callindex.xml formations.xml moves.xml tamination.dtd
XMLCOPIES = $(foreach dir,$(DIRS),$(addprefix ../$(dir)/,$(XMLSRC)))
XREFXML = $(foreach dir,$(DIRS),$(wildcard ../$(dir)/*.x.xml))
PYXML = $(addsuffix .xml,$(basename $(basename $(XREFXML))))
CALLINDEX = callindex.xml

.phony : all
all : $(CALLINDEX) $(XMLCOPIES) $(PYXML) $(ZIPFILE)
	@echo Build complete

unzip :
	cd ../ext/jquery && $(UNZIP) jquery.mobile-1.2.0.zip
	cd ../ext/jquery/jquery.mousewheel && $(UNZIP) jquery-mousewheel-3.1.6.zip
	cd ../ext/jquery/jquery.svg && $(UNZIP) jquery.svg.package-1.4.4.zip
	cd ../ext/jquery/jquery.ui && $(UNZIP) jquery-ui-1.10.4.custom.zip

#  Clean target to delete jar and zip
.phony : clean
clean :
	-$(RM) *.class *.jar
	-$(RM) $(ZIPFILE)
	-$(RM) $(PYXML)
	-$(RM) $(XMLCOPIES)
	-$(RM) $(CALLINDEX)

#  Make the zip file.  Exclude my Eclipse project files which are not of interest to others.
#  The wildcard * pattern apparently conveniently excludes .* files
../tamination.zip : $(filter-out $(ZIPFILE),$(wildcard ../* ../*/*))
	-$(RM) $(ZIPFILE)
	cd .. && $(ZIP) -rq tamination.zip info b1 b2 ms plus a1 a2 adv c1 c2 c3a src ext *.html *.txt *.ico *.xml

#  Generate xml files from x.xml files with cross-references
%.xml : %.x.xml
	$(PYTHON) expandxrefs.py $< >$@

#  Generate index used by sequencer
$(CALLINDEX) : $(filter-out $(XMLCOPIES),$(wildcard ../*/*.xml) $(wildcard calls/*.js))
	$(PYTHON) indexcalls.py >$@

#  Copy XML files that define menus, moves, and formations to each directory
#  Browsers can be picky about loading AJAX from different directories
$(XMLCOPIES) : $(XMLSRC)
	$(COPY) $(notdir $@) $@
