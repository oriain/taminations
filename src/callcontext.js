/*

    Copyright 2015 Brad Christie

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

"use strict";


///////   CallContext class    //////////////
//An instance of the CallContext class is passed around calls
//to hold the working data - dancers, paths, and
//progress performing a call

//A CallContext can be created by any of
//* cloning another CallContext
//* copying an array of dancers
//* current state of TamSVG animation
//* XML formation (?)

define(['calls/call','callnotfounderror','formationnotfounderror'],
    function(Call,CallNotFoundError,FormationNotFoundError) {

  var CallContext = function(source)
  {
    this.callname = '';
    if (source instanceof CallContext) {
      this.dancers = source.dancers.map(function(d) {
        return new Dancer({dancer:d,computeOnly:true,active:d.active});
      });
    }

    else if (source instanceof TamSVG) {
      this.dancers = source.dancers.map(function(d) {
        return new Dancer({dancer:d,computeOnly:true,active:true});
      });
    }

    else if (source instanceof Array) {
      this.dancers = source.map(function(d) {
        return new Dancer({dancer:d,computeOnly:true,active:true});
      });
    }

  };
  Object.defineProperty(CallContext.prototype,'actives',{
    get: function() {
      return this.dancers.filter(function(d) { return d.active; });
    }
  });

  /**
   *   Append the result of processing this CallContext to it source.
   *   The CallContext must have been previously cloned from the source.
   */
  CallContext.prototype.appendToSource = function() {
    this.dancers.forEach(function(d) {
      d.clonedFrom.path.add(d.path);
      d.clonedFrom.animateToEnd();
    });
  };

  CallContext.prototype.applyCalls = function()
  {
    for (var i=0; i<arguments.length; i++) {
      var ctx = new CallContext(this);
      ctx.interpretCall(arguments[i]);
      ctx.appendToSource();
    }
  };

  /**
   * This is the main loop for interpreting a call
   * @param calltext  One complete call, lower case, words separated by single spaces
   */
  CallContext.prototype.interpretCall = function(calltext)
  {
    var err = new CallNotFoundError();
    //  Clear out any previous paths from incomplete parsing
    this.dancers.forEach(function(d) {
      d.path = new Path();
    });
    this.callname = '';
    //  If a partial interpretation is found (like 'boys' of 'boys run')
    //  it gets popped off the front and this loop interprets the rest
    while (calltext.length > 0) {
      //  Try chopping off each word from the end of the call until
      //  we find something we know
      if (!calltext.chopped().some(function(callname) {
        var success = false;
        //  First try to find an exact match in Taminations
        //  Then look for a code match
        try {
          success = this.matchXMLcall(callname);
        } catch (err2) {
          err = err2;
        }
        try {
          success = success || this.matchJScall(callname);
        } catch (err2) {
          err = err2;
        }
        if (success) {
          //  Remove the words we matched, break out of and
          //  the chopped loop, and continue if any words left
          calltext = calltext.replace(callname,'').trim();
          return true;
        }
      },this))
        //  Every combination from callwords.chopped failed
        throw err;
    }
  };

  //  Given a context and string, try to find an XML animation
  //  If found, the call is added to the context
  CallContext.prototype.matchXMLcall = function(calltext)
  {
    var found = false;
    var match = false;
    var ctx = this;
    // Check that actives == dancers
    if (ctx.dancers.length == ctx.actives.length) {
      //  Try to find a match in the xml animations
      TAMination.searchCalls(calltext,{exact:true}).some(function(d) {
        //  Found xml file with call, now look through each animation
        return TAMination.searchCalls(calltext, {
          domain: $('tam',Call.xmldata[d.link]).toArray(),
          exact:true,
          keyfun: function(d) { return $(d).attr('title'); }}
        ).some(function(xelem) {
          found = true;
          //  Get the formation
          var f = $(xelem).find('formation');
          if (f.size() <= 0) {
            var fs = $(xelem).attr('formation');
            f = getNamedFormation(fs);
          }
          var d = getDancers(f);
          var sexy = $(xelem).attr('gender-specific');
          //  Try to match the formation to the current dancer positions
          var ctx2 = new CallContext(d);
          var mm = matchFormations(ctx,ctx2,sexy);
          if (mm) {
            //  Match found
            var allp = tam.getPath(xelem);
            //  Compute difference between current formation and XML formation
            var vdif = computeFormationOffsets(ctx,ctx2,mm);
            mm.forEach(function(m,i3) {
              //  Apply formation difference to first movement of XML path
              var vd = vdif[i3].rotate(-ctx.dancers[i3].tx.angle);
              var p = new Path(allp[m>>1]);
              if (vd.distance > 0.1)
                p.movelist[0].skew(-vd.x,-vd.y);
              //  Add XML path to dancer
              ctx.dancers[i3].path.add(p);
            });
            ctx.levelBeats();
            ctx.callname += $(xelem).attr('title') + ' ';
            match = true;
            return true;  // break out of callindex loop
          }
          return false;  // match not found, continue
        });
      });
    }
    if (found && !match)
      //  Found the call but formations did not match
      throw new FormationNotFoundError();
    return match;
  };


  /**
   *   Reads an XML formation and returns array of the dancers
   * @param formation   XML formation element
   * @returns Array of dancers
   */
  function getDancers(formation)
  {
    var dancers = [];
    var i = 1;
    $('dancer',formation).each(function() {
      var d = new Dancer({
           tamsvg:tamsvg,
           computeOnly:true,
           gender:Dancer.genders[$(this).attr('gender')],
           x:-Number($(this).attr('y')),
           y:-Number($(this).attr('x')),
           angle:Number($(this).attr('angle'))+180,
           number:i++});
      dancers.push(d);
      d = new Dancer({
           tamsvg:tamsvg,
           computeOnly:true,
           gender:Dancer.genders[$(this).attr('gender')],
           x:Number($(this).attr('y')),
           y:Number($(this).attr('x')),
           angle:Number($(this).attr('angle')),
           number:i++});
      dancers.push(d);
    });
    return dancers;
  }

  /*
   * New algorithm to match formations
   * Match dancers relative to each other, rather than compare absolute positions
   * 2 cases
   *   1.  Dancers facing same or opposite directions
   *       - If dancers are lined up 0, 90, 180, 270 angles must match
   *       - Other angles match by quadrant
   *   2.  Dancers facing other relative directions (commonly 90 degrees)
   *       - Dancers must match quadrant or adj boundary
   *
   *
   *
   */
  function angleBin(a)
  {
    var retval = -1;
    if (Math.anglesEqual(a,0))
      retval = 0;
    else if (Math.anglesEqual(a,Math.PI/2))
      retval = 2;
    else if (Math.anglesEqual(a,Math.PI))
      retval = 4;
    else if (Math.anglesEqual(a,-Math.PI/2))
      retval = 6;
    else if (a > 0 && a < Math.PI/2)
      retval = 1;
    else if (a > Math.PI/2 && a < Math.PI)
      retval = 3;
    else if (a < 0 && a > -Math.PI/2)
      retval = 7;
    else if (a < -Math.PI/2 && a > -Math.PI)
      retval = 5;
    return retval;
  }

  function angleMask(b,fuzz)
  {
    var mask = 1<<b;
    if (fuzz) {
      mask |= 1<<((b+1)%8);
      mask |= 1<<((b+7)%8);
    }
    return mask;
  }

  function dancerRelation(ctx,d1,d2)
  {
    if (Math.anglesEqual(d1.start.angle,d2.start.angle) ||
        Math.anglesEqual(d1.start.angle,d2.start.angle+180)) {
      //  Case 1
      return angleBin(ctx.angle(d1,d2));
    } else {
      //  Case 2  TODO make fuzzy
      return angleBin(ctx.angle(d1,d2));
    }
  }

  function matchFormations(ctx1,ctx2,sexy)
  {
    if (ctx1.dancers.length != ctx2.dancers.length)
      return false;
    //  Find mapping using DFS
    var mapping = [];
    var gnippam = [];
    ctx1.dancers.forEach(function(d,i) { mapping[i] = gnippam[i] = -1; });
    var mapindex = 0;
    while (mapindex >= 0 && mapindex < ctx1.dancers.length) {
      var nextmapping = mapping[mapindex] + 1;
      while (nextmapping < ctx2.dancers.length) {
        mapping[mapindex] = nextmapping;
        mapping[mapindex+1] = nextmapping ^ 1;
        if (testMapping(ctx1,ctx2,mapping,mapindex,sexy))
          break;
        nextmapping++;
      }
      if (nextmapping >= ctx2.dancers.length) {
        //  No more mappings for this dancer
        mapping[mapindex] = mapping[mapindex+1] = -1;
        mapindex -= 2;
      } else {
        //  Mapping found
        mapindex += 2;
      }
    }
    return mapindex < 0 ? false : mapping;
  }

  function testMapping(ctx1,ctx2,mapping,i,sexy)
  {
    if (sexy && (ctx1.dancers[i].gender != ctx2.dancers[mapping[i]].gender))
      return false;
    return ctx1.dancers.every(function(d1,j) {
      if (mapping[j] < 0 || i == j)
        return true;
      var relq1 = dancerRelation(ctx1,ctx1.dancers[i],ctx1.dancers[j]);
      var relt1 = dancerRelation(ctx2,ctx2.dancers[mapping[i]],ctx2.dancers[mapping[j]]);
      var relq2 = dancerRelation(ctx1,ctx1.dancers[j],ctx1.dancers[i]);
      var relt2 = dancerRelation(ctx2,ctx2.dancers[mapping[j]],ctx2.dancers[mapping[i]]);
      //  If dancers are side-by-side, make sure handholding matches by checking distance
      if (relq1 == 2 || relq1 == 6) {
        var d1 = ctx1.distance(i,j);
        var d2 = ctx2.distance(mapping[i],mapping[j]);
        if ((d1 < 2.1) != (d2 < 2.1))
          return false;
      }
      //  TEMP does not allow for fuzzy matching
      return relq1 == relt1 && relq2 == relt2;
    });
  }

  //  Once a mapping of the current formation to an XML call is found,
  //  we need to compute the difference between the two,
  //  and that difference will be added as an offset to the first movement
  function computeFormationOffsets(ctx1,ctx2,mapping)
  {
    var dvbest;
    var dtotbest = -1;
    [0,Math.PI/2,Math.PI,Math.PI*3/2].forEach(function(angle) {
      var dv = [];
      var dtot = 0;
      ctx1.dancers.forEach(function(d1,i) {
        var v1 = d1.location;
        var v2 = ctx2.dancers[mapping[i]].location.rotate(angle);
        dv[i] = v1.subtract(v2);
        dtot += dv[i].distance;
      });
      if (dtotbest < 0 || dtotbest > dtot) {
        dvbest = dv;
        dtotbest = dtot;
      }
    });
    return dvbest;
  }

  //  Given a context and string, try to find an animation generated by code
  //  If found, the call is added to the context
  CallContext.prototype.matchJScall = function(calltext)
  {
    return TAMination.searchCalls(calltext, {
        domain: Call.scripts,
        keyfun: function(d) { return d.name; },
        exact:true }
    ).some(function(c) {
      var call = new Call.classes[c.name];
      call.performCall(this);
      this.callname += call.name + ' ';
      return true;
    },this);
  };

  //  Level off the number of beats for each dancer
  CallContext.prototype.levelBeats = function()
  {
    //  get the longest number of beats
    var maxbeats = this.dancers.reduce(function(v,d) {
      return Math.max(v,d.path.beats());
    },0);
    //  add that number as needed by using the "Stand" move
    this.dancers.forEach(function(d) {
      var b = maxbeats - d.path.beats();
      if (b > 0) {
        var m = tam.translate($('path[name="Stand"]',movedata));
        m[0].beats = b;
        d.path.add(new Path(m));
      }
    });
  };

  //  Moves the start position of a group of dancers
  //  so they are centered around the origin
  CallContext.prototype.center = function()
  {
    var xave = this.dancers.reduce(function(a,b) { return a+b.startx; },0) / this.dancers.length;
    var yave = this.dancers.reduce(function(a,b) { return a+b.starty; },0) / this.dancers.length;
    this.dancers.forEach(function(d) {
      d.startx -= xave;
      d.starty -= yave;
      d.computeStart();
    });
  };

////Routines to analyze dancers
  CallContext.prototype.dancer = function(d)
  {
    return d instanceof Dancer ? d : this.dancers[d];
  };
//Distance between two dancers
//If d2 not given, returns distance from origin
  CallContext.prototype.distance = function(d1,d2)
  {
    var v = this.dancer(d1).location;
    if (d2 != undefined)
      v = v.subtract(this.dancer(d2).location);
    return v.distance;
  };
//Angle of d2 as viewed from d1
//If angle is 0 then d2 is in front of d1
//If d2 is not given, returns angle to origin
//Angle returned is in the range -pi to pi
  CallContext.prototype.angle = function(d1,d2)
  {
    var v = new Vector(0,0);
    if (d2 != undefined)
      v = this.dancer(d2).location;
    var v2 = v.preConcatenate(this.dancer(d1).tx.getInverse());
    return v2.angle;
  };
  CallContext.prototype.isFacingIn = function(d)
  {
    var a = Math.abs(this.angle(d));
    return !Math.isApprox(a,Math.PI/2) && a < Math.PI/2;
  };
  CallContext.prototype.isFacingOut = function(d)
  {
    var a = Math.abs(this.angle(d));
    return !Math.isApprox(a,Math.PI/2) && a > Math.PI/2;
  };
//Test if dancer d2 is directly in front, back. left, right of dancer d1
  CallContext.prototype.isInFront = function(d1,d2)
  {
    return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),0);
  };
  CallContext.prototype.isInBack = function(d1,d2)
  {
    return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),Math.PI);
  };
  CallContext.prototype.isLeft = function(d1,d2)
  {
    return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),Math.PI/2);
  };
  CallContext.prototype.isRight = function(d1,d2)
  {
    return d1 != d2 && Math.anglesEqual(this.angle(d1,d2),Math.PI*3/2);
  };

//Return closest dancer that satisfies a given conditional
  CallContext.prototype.dancerClosest = function(d,f)
  {
    var ctx = this;
    return this.dancers.filter(f,ctx).reduce(function(best,d2) {
      return best == undefined || ctx.distance(d2,d) < ctx.distance(best,d)
      ? d2 : best;
    },undefined);
  };

//Return all dancers, ordered by distance, that satisfies a conditional
  CallContext.prototype.dancersInOrder = function(d,f)
  {
    var ctx = this;
    return this.dancers.filter(f,ctx).sort(function(a,b) {
      return ctx.distance(d,a) - ctx.distance(d,b);
    });
  };

//Return dancer directly in front of given dancer
  CallContext.prototype.dancerInFront = function(d)
  {
    return this.dancerClosest(d,function(d2) {
      return this.isInFront(d,d2);
    },this);
  };

//Return dancer directly in back of given dancer
  CallContext.prototype.dancerInBack = function(d)
  {
    return this.dancerClosest(d,function(d2) {
      return this.isInBack(d,d2);
    });
  };

//Return dancer directly to the right of given dancer
  CallContext.prototype.dancerToRight = function(d)
  {
    return this.dancerClosest(d,function(d2) {
      return this.isRight(d,d2);
    });
  };

//Return dancer directly to the left of given dancer
  CallContext.prototype.dancerToLeft = function(d)
  {
    return this.dancerClosest(d,function(d2) {
      return this.isLeft(d,d2);
    });
  };

//Return dancer that is facing this dancer
  CallContext.prototype.dancerFacing = function(d) {
    var d2 = this.dancerInFront(d);
    if (d2 != undefined && this.dancerInFront(d2) != d)
      d2 = undefined;
    return d2;
  };

//Return dancers that are in between two other dancers
  CallContext.prototype.inBetween = function(d1,d2)
  {
    return this.dancers.filter(function(d) {
      return d !== d1 && d !== d2 &&
      Math.isApprox(this.distance(d,d1)+this.distance(d,d2),
          this.distance(d1,d2));
    },this);
  };

//Return all the dancers to the right, in order
  CallContext.prototype.dancersToRight = function(d)
  {
    return this.dancersInOrder(d,function(d2) {
      return this.isRight(d,d2);
    });
  };

//Return all the dancers to the left, in order
  CallContext.prototype.dancersToLeft = function(d)
  {
    return this.dancersInOrder(d,function(d2) {
      return this.isLeft(d,d2);
    });
  };

//Return true if this dancer is in a wave or mini-wave
  CallContext.prototype.isInWave = function(d) {
    return d.partner &&
    Math.anglesEqual(this.angle(d,d.partner),this.angle(d.partner,d));
  };

//Return true if this is 4 dancers in a box
  CallContext.prototype.isBox = function()
  {
    //  Must have 4 dancers
    return this.dancers.length == 4 &&
    this.dancers.every(function(d) {
      //  Each dancer must have a partner
      //  and must be either a leader or a trailer
      return d.partner && (d.leader || d.trailer);
    });
  };

//Return true if this is 4 dancers in any kind of line, including waves
  CallContext.prototype.isLine = function()
  {
    //  Must have 4 dancers
    return this.dancers.length == 4 &&
    //  Each dancer must have right or left shoulder to origin
    this.dancers.every(function(d) {
      return Math.isApprox(Math.abs(this.angle(d)),Math.PI/2);
    },this) &&
    //  All dancers must either be on the y axis
    (this.dancers.every(function(d) {
      return Math.isApprox(d.location.x,0);
    }) ||
    //  or on the x axis
    this.dancers.every(function(d) {
      return Math.isApprox(d.location.y,0);
    }));
  };

  CallContext.prototype.analyze = function()
  {
    this.dancers.forEach(function(d) {
      d.animateToEnd();
      d.beau = false;
      d.belle = false;
      d.leader = false;
      d.trailer = false;
      d.partner = false;
      d.center = false;
      d.end = false;
      d.verycenter = false;
    });
    var istidal = false;
    this.dancers.forEach(function(d1) {
      var bestleft = false;
      var bestright = false;
      var leftcount = 0;
      var rightcount = 0;
      var frontcount = 0;
      var backcount = 0;
      this.dancers.filter(function(d2) {
        return d1 !== d2;
      },this).forEach(function(d2) {
        //  Count dancers to the left and right, and find the closest on each side
        if (this.isRight(d1,d2)) {
          rightcount++;
          if (!bestright || this.distance(d1,d2) < this.distance(d1,bestright))
            bestright = d2;
        }
        else if (this.isLeft(d1,d2)) {
          leftcount++;
          if (!bestleft || this.distance(d1,d2) < this.distance(d1,bestleft))
            bestleft = d2;
        }
        //  Also count dancers in front and in back
        else if (this.isInFront(d1,d2))
          frontcount++;
        else if (this.isInBack(d1,d2))
          backcount++;
      },this);
      //  Use the results of the counts to assign belle/beau/leader/trailer
      //  and partner
      if (leftcount % 2 == 1 && rightcount % 2 == 0 &&
          this.distance(d1,bestleft) < 3) {
        d1.partner = bestleft;
        d1.belle = true;
      }
      else if (rightcount % 2 == 1 && leftcount % 2 == 0 &&
          this.distance(d1,bestright) < 3) {
        d1.partner = bestright;
        d1.beau = true;
      }
      if (frontcount % 2 == 0 && backcount % 2 == 1)
        d1.leader = true;
      else if (frontcount % 2 == 1 && backcount % 2 == 0)
        d1.trailer = true;
      //  Assign ends
      if (rightcount == 0 && leftcount > 1)
        d1.end = true;
      else if (leftcount == 0 && rightcount > 1)
        d1.end = true;
      //  The very centers of a tidal wave are ends
      //  Remember this special case for assigning centers later
      if (rightcount == 3 && leftcount == 4 ||
          rightcount == 4 && leftcount == 3) {
        d1.end = true;
        istidal = true;
      }
    },this);
    //  Analyze for centers and very centers
    //  Sort dancers by distance from center
    var dorder = [];
    this.dancers.forEach(function(d1) {
      dorder.push(d1);
    });
    var ctx = this;
    dorder.sort(function(a,b) {
      return ctx.distance(a) - ctx.distance(b);
    });
    //  The 2 dancers closest to the center
    //  are centers (4 dancers) or very centers (8 dancers)
    if (!Math.isApprox(this.distance(dorder[1]),this.distance(dorder[2]))) {
      if (this.dancers.length == 4) {
        dorder[0].center = true;
        dorder[1].center = true;
      } else {
        dorder[0].verycenter = true;
        dorder[1].verycenter = true;
      }
    }
    // If tidal, then the next 4 dancers are centers
    if (istidal) {
      [2,3,4,5].forEach(function(i) {
        dorder[i].center = true;
      });
    }
    // Otherwise, if there are 4 dancers closer to the center than the other 4,
    // they are the centers
    else if (this.dancers.length > 4 &&
        !Math.isApprox(this.distance(dorder[3]),this.distance(dorder[4]))) {
      [0,1,2,3].forEach(function(i) {
        dorder[i].center = true;
      });
    }

  };
  return CallContext;

});

