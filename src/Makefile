
#    Copyright 2012 Brad Christie
#
#    This file is part of TAMinations.
#
#    TAMinations is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    TAMinations is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with TAMinations.  If not, see <http://www.gnu.org/licenses/>.


# This makefile builds the JAR file needed to load taminations by the Java applet
# and the zip file that's available for download
# This requires JAVA_HOME set to an installed jdk

#  If the current directory contains a colon, we're most likely on a windows machine
ifeq '$(findstring :,$(CURDIR))' ':'
RM = del
PS = $(strip \ )
else
RM = rm
PS = /
endif



JAVA = $(JAVA_HOME)/bin/java
JAVAC = $(JAVA_HOME)/bin/javac
JAR = $(JAVA_HOME)/bin/jar

.phony : all
all : TAMination.jar  callindex.json ../tamination.zip
	@echo Build complete

unzip :
	cd ../ext/jquery && $(JAR) xvf jquery.mobile-1.0.1.zip
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
	$(JAVAC) -source 1.3 -target 1.3 -classpath $(JAVA_HOME)/jre/lib/plugin.jar TAMination.java && $(JAR) -cf TAMination.jar *.class

#  Make the zip file.  Exclude my Eclipse project files which are not of interest to others.
#  The wildcard * pattern apparently conveniently excludes .* files
../tamination.zip : $(filter-out ../tamination.zip,$(wildcard ../* ../*/*))
	-cd .. && $(RM) tamination.zip
	cd .. && $(JAR) cvMf tamination.zip info ms plus adv c1 c2 c3a src ext *.html *.txt *.ico *.xml

#  Make the index of calls
#  This is for a future project, not used by the current animations
callindex.json : $(wildcard ../*/*.xml) $(wildcard calls/*.js)
	python indexcalls.py >$@
