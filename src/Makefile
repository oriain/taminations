
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


# This makefile builds the JAR file needed to load taminations by the Java applet
# and the zip file that's available for download
# This requires JAVA_HOME set to an installed jdk

#  If the current directory contains a colon, we're most likely on a windows machine
ifeq '$(findstring :,$(CURDIR))' ':'
RM = del
PS = $(strip \ )
COPY = copy
else
RM = rm
PS = /
COPY = cp
endif


JAVA = $(JAVA_HOME)/bin/java
JAVAC = $(JAVA_HOME)/bin/javac
JAR = $(JAVA_HOME)/bin/jar
DIRS = b1 b2 ms plus adv a1 a2 c1 c2 c3a info
XMLFILES = $(foreach dir,$(DIRS),$(addprefix ../$(dir)/,$(wildcard *.xml)))
XREFXML = $(foreach dir,$(DIRS),$(wildcard ../$(dir)/*.x.xml))
PYXML = $(addsuffix .xml,$(basename $(basename $(XREFXML))))

.phony : all
all : TAMination.jar $(XMLFILES) $(PYXML) ../tamination.zip
	@echo Build complete

test :
	@echo $(PYXML)

unzip :
	cd ../ext/jquery && $(JAR) xvf jquery.mobile-1.2.0.zip
	cd ../ext/jquery/jquery.mousewheel && $(JAR) xvf jquery.mousewheel.3.0.2.zip
	cd ../ext/jquery/jquery.svg && $(JAR) xvf jquery.svg.package-1.4.4.zip
	cd ../ext/jquery/jquery.ui && $(JAR) xvf jquery-ui-1.8.18.custom.zip

#  Clean target to delete jar and zip
.phony : clean
clean :
	-$(RM) *.class *.jar
	-$(RM) ..$(PS)tamination.zip

#  Make the JAR file.  Tell the compiler to compile for Java 1.3 for maximum compatibility
TAMination.jar : TAMination.java
	$(JAVAC) -classpath $(JAVA_HOME)/jre/lib/plugin.jar TAMination.java && $(JAR) -cf TAMination.jar *.class

#  Make the zip file.  Exclude my Eclipse project files which are not of interest to others.
#  The wildcard * pattern apparently conveniently excludes .* files
../tamination.zip : $(filter-out ../tamination.zip,$(wildcard ../* ../*/*))
	-cd .. && $(RM) tamination.zip
	cd .. && $(JAR) cMf tamination.zip info b1 b2 ms plus a1 a2 adv c1 c2 c3a src ext *.html *.txt *.ico *.xml

#  Generate xml files from x.xml files with cross-references
%.xml : %.x.xml
	python expandxrefs.py $< >$(subst /,$(PS),$@)

#  Copy XML files that define menus, moves, and formations to each directory
#  Browsers can be picky about loading AJAX from different directories
$(XMLFILES) : $(XML)
%.xml :
	$(COPY) $(notdir $@) $(subst /,$(PS),$@)
