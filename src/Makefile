
#    Copyright 2013 Brad Christie
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
#  Optional: install Java and set JAVA_HOME
#  to build the applet used with IE on XP

RM = rm
COPY = cp
PYTHON = python
DIRS = b1 b2 ms plus adv a1 a2 c1 c2 c3a info .
XMLSRC = calls.xml formations.xml moves.xml tamination.dtd
XMLCOPIES = $(foreach dir,$(DIRS),$(addprefix ../$(dir)/,$(XMLSRC)))
XREFXML = $(foreach dir,$(DIRS),$(wildcard ../$(dir)/*.x.xml))
PYXML = $(addsuffix .xml,$(basename $(basename $(XREFXML))))
ifneq '$(JAVA_HOME)' '' 
JAVA_FILES = TAMination.jar ../tamination.zip 
JAVA = "$(JAVA_HOME)/bin/java"
JAVAC = "$(JAVA_HOME)/bin/javac"
JAR = "$(JAVA_HOME)/bin/jar"
UNZIP = "$(JAVA_HOME)/bin/jar" xvf
else
UNZIP = unzip
endif

.phony : all
all : $(XMLCOPIES) $(PYXML) $(JAVA_FILES)
	@echo Build complete

unzip :
	cd ../ext/jquery && $(UNZIP) jquery.mobile-1.2.0.zip
	cd ../ext/jquery/jquery.mousewheel && $(UNZIP) jquery.mousewheel.3.0.2.zip
	cd ../ext/jquery/jquery.svg && $(UNZIP) jquery.svg.package-1.4.4.zip
	cd ../ext/jquery/jquery.ui && $(UNZIP) jquery-ui-1.8.18.custom.zip

#  Clean target to delete jar and zip
.phony : clean
clean :
	-$(RM) *.class *.jar
	-$(RM) ../tamination.zip
	-$(RM) $(PYXML)
	-$(RM) $(XMLCOPIES)
	-$(RM) callindex.xml

#  Make the JAR file.  Tell the compiler to compile for Java 1.3 for maximum compatibility
TAMination.jar : TAMination.java
	$(JAVAC) -classpath "$(JAVA_HOME)/jre/lib/plugin.jar" TAMination.java && $(JAR) -cf TAMination.jar *.class

#  Make the zip file.  Exclude my Eclipse project files which are not of interest to others.
#  The wildcard * pattern apparently conveniently excludes .* files
../tamination.zip : $(filter-out ../tamination.zip,$(wildcard ../* ../*/*))
	-cd .. && $(RM) tamination.zip
	cd .. && $(JAR) cMf tamination.zip info b1 b2 ms plus a1 a2 adv c1 c2 c3a src ext *.html *.txt *.ico *.xml

#  Generate xml files from x.xml files with cross-references
%.xml : %.x.xml
	$(PYTHON) expandxrefs.py $< >$@

#  Generate index used by sequencer
callindex.xml : $(wildcard ../*/*.xml) $(wildcard calls/*.js)
	$(PYTHON) indexcalls.py >$@

#  Copy XML files that define menus, moves, and formations to each directory
#  Browsers can be picky about loading AJAX from different directories
$(XMLCOPIES) : $(XMLSRC)
	$(COPY) $(notdir $@) $@
