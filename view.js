const VIEW = {
  "aboutDisplayed": false,

  "bodyBackgroundColor": "black",

  "copyright": "Copyright (c) 2022 Blake Cooper",

  "checkForMobileDevice": function () {
    window.addEventListener("load", () => {
	  let mobile = navigator.userAgent.toLowerCase().match(/mobile/i);
	  if (mobile !== null) {
	    isMobile = true;
	  }
	});
  },

  "closeSpan": function () {
      return (GAME.player.get("hp") < GAME.player.get("base_hp")) 
      ? "</span>" 
      : "";
  },

  "colsVisible": -1,
  
  "damageSpan": function () {
  
      let html = "";
  
      if (GAME.player.get("hp") < GAME.player.get("base_hp")) {
          html = "<span class=";
  
          if (GAME.player.get("hp") < (GAME.player.get("base_hp") / 3)) {
              html += "red";
          } else {
              html += "yellow";
          }
  
          html += ">"; 
      }
      return html;
  },

  "displayAbout": function () {
    if (GAME.play) {
      this.setMaskOpacity(0);
    }

    if (this.aboutDisplayed) {
      $("about").style = "display: none;";
      this.aboutDisplayed = false;
    } else {
      if (GAME.play) {
        this.setMaskOpacity(this.maskOpacity);
      }

      let html = 
            "<p>&nbsp<p>&nbsp<p>&nbsp" + 
        "<p>" + this.title +
        "<p>" + this.copyright + 
        "<p>" + this.instructions +
        "<p>" + this.license;

      $("about").innerHTML = html;
      $("about").style = "display: inline;";
      this.aboutDisplayed = true;
    }
  },

  "mapDisplay": {
    "row": -1,
    "rowMax": -1,
    "col": -1,
    "colMax": -1,
  },

  "setMapDisplay": function (x, y) {
    this.mapDisplay.row = (x - Math.floor(this.rowsVisible/2)) > 0 
    ? x-Math.floor(this.rowsVisible/2) : 0;
      
    this.mapDisplay.col = (y - Math.floor(this.colsVisible/2)) > 0
    ? y-Math.floor(this.colsVisible/2) : 0;
  
    if (this.mapDisplay.row === 0) { 
        this.mapDisplay.rowMax = this.rowsVisible; 
    } else {
        this.mapDisplay.rowMax = (x + Math.ceil(this.rowsVisible/2)) < RAWS.settings.rows 
        ? x+Math.ceil(this.rowsVisible/2) :  (RAWS.settings.rows - 1);
    }
      
    if (this.mapDisplay.col === 0) { 
        this.mapDisplay.colMax = this.colsVisible; 
    } else {
        this.mapDisplay.colMax = (y + Math.ceil(this.colsVisible/2)) < RAWS.settings.cols 
        ? y+Math.ceil(this.colsVisible/2) : (RAWS.settings.cols - 1);
    }
  },

  "drawMap": function (map, dimension) {
      $("level").innerHTML = "";
	
      let html = "<span style='color: " 
      + RAWS.colors[dimension.bgColor] + ";'>";

      for (let row = this.mapDisplay.row; row < this.mapDisplay.rowMax; row++) {
          for (let col = this.mapDisplay.col; col < this.mapDisplay.colMax; col++) {
              if (map.rowsAreDefined 
              && map.at(row,col) !== null
              && GAME.wasSeen[row][col]) {
//                  if (GAME.isSeen[row][col]) {
//                    html += "<span style='opacity: " + RAWS.settings.is_seen_opacity + ";'>";
//                  }
                  html += map.at(row,col);
//                  if (GAME.isSeen[row][col]) {
//                    html += "</span>";
//                  }
              } else {
                  html += CONSTS.SPACE;
              }
  		}    
          
          html += "<br>";
  	}

      html += "</span>";
      $("level").innerHTML = html;
  },
  "greyLastStatus": function () {
      $("status1").style = "color: grey;";
  },

  "instructions": "Collect <span style='color: " + RAWS.entities.shard.render.color + ";'>" + RAWS.entities.shard.render.symbol + "</span> to open doors and improve your score<br>Collect <span style='color: " + RAWS.dimensions.hp.bgColor + ";'>" + RAWS.entities.potion.render.symbol + "</span><span style='color: " + RAWS.dimensions.atk.bgColor + ";'>&nbsp" + RAWS.entities.potion.render.symbol + "</span><span style='color: " + RAWS.dimensions.def.bgColor + ";'>&nbsp" + RAWS.entities.potion.render.symbol + "</span> to increase your stats<br>Collect <span style='color: " + RAWS.entities.restore.render.color + ";'>" + RAWS.entities.restore.render.symbol + "</span> to restore health<br>Avoid (or fight) <span style='color: " + RAWS.dimensions.atk.bgColor + ";'>" + RAWS.entities.minion.render.symbol + "</span> and <span style='color: " + RAWS.dimensions.atk.bgColor + ";'>" + RAWS.entities.maxion.render.symbol + "</span>",

  "license": "<p class>Licensed under The MIT License:<br> http://en.wikipedia.org/wiki/MIT_License</p>",

  "maskOpacity": .6, 

  "refreshScreen": function (map, dimension, entities, x, y) {
      if (this.rowVisible === -1 || this.colsVisible === -1) {
        this.setDisplaySize();
      };

      //TODO: improve performance with boolean to update when required.
      this.setMapDisplay(x, y);
      
      this.drawMap(map, dimension);
      this.draw(entities, x, y);
      this.drawStats();
  },

  "setMaskOpacity": function (a) {
    $("mask").style="opacity: " + a + ";";
  },

  "title": "Shards of Maxion",

  
  
  
  "draw": function (entityMatrix, x, y) {
      $("entities").innerHTML = "";
  
      let html = "";
  
      let firstDisplayRow = (x - Math.floor(this.rowsVisible/2)) > 0 
      ? x-Math.floor(this.rowsVisible/2) : 0;
      
      let firstDisplayCol = (y - Math.floor(this.colsVisible/2)) > 0 
      ? y-Math.floor(this.colsVisible/2) : 0;
  
      let lastDisplayRow;
      let lastDisplayCol;
  
      if (firstDisplayRow === 0) { 
          lastDisplayRow = this.rowsVisible; 
      } else {
          lastDisplayRow = (x + Math.ceil(this.rowsVisible/2)) < RAWS.settings.rows 
          ? x+Math.ceil(this.rowsVisible/2) :  RAWS.settings.rows;
      }
      
      if (firstDisplayCol === 0) { 
          lastDisplayCol = this.colsVisible; 
      } else {
          lastDisplayCol = (y + Math.ceil(this.colsVisible/2)) < RAWS.settings.cols 
          ? y+Math.ceil(this.colsVisible/2) : RAWS.settings.cols;
      }
  
    //  if (lastDisplayRow === RAWS.settings.rows) { firstDisplayRow = RAWS.settings.rows-this.rowsVisible; }
    //  if (lastDisplayCol === RAWS.settings.cols) { firstDisplayCol = RAWS.settings.cols-this.colsVisible; }
 
      for (let row = firstDisplayRow; row < lastDisplayRow; row++) {
        for (let col = firstDisplayCol; col < lastDisplayCol; col++) {
          if (!entityMatrix.rowDefined(row)
          && !entityMatrix.isNullAt(row,col)
          && GAME.wasSeen[row][col]) {
            html += "<span style='background-color: ";
            
            if (entityMatrix.getIdAt(row, col) === "door") {
                     html += RAWS.colors[RAWS.dimensions[entityMatrix.getDimensionOfDoorAt(row, col)]["bgColor"]];
            } else {
              html += this.bodyBackgroundColor;
            }

		    if (entityMatrix.getPlayerAt(row,col) === undefined) {
                      html += "; color: " + RAWS.colors[entityMatrix.getRenderDataAt(row, col).color] + "'>";
                      html += entityMatrix.getRenderDataAt(row,col).symbol;
                      html += "</span>";
                    } else {
                      const render = GAME.player.get("render");
                      html += "; color: " + render.color + "'>";
                      html += render.symbol;
                      html += "</span>";
                    }
              } else {
                  html += CONSTS.SPACE;
              }
          }
          html += "<br>";
      }
  
      $("entities").innerHTML = html;
  },
  
  "drawStats": function () {
  
      let html =
        "<span style='color: " 
        + RAWS.colors[RAWS.dimensions.hp.bgColor] 
        + ";'>&nbsp;hp: ";

      html += this.damageSpan();

      for (let i = 0; i < GAME.player.get("hp"); i++) {
        html += ".";
      }

      html += this.closeSpan();

      html += "<span style='color: grey;'>";

      const max = GAME.player.get("base_hp") - GAME.player.get("hp");

      for (let i = 0; i < max; i++) {
        html += ".";
      }

      html += "</span>";
      html += "</span>";
          
      html += "<span style='color: " + RAWS.colors[RAWS.dimensions.atk.bgColor] + ";'>" 
        + "<br>atk: ";
  	  
      for (let i = 0; i < GAME.player.get("atk"); i++) {
          html += ".";
      }
      
      html += "</span>";

      html += "<span style='color: " + RAWS.colors[RAWS.dimensions.def.bgColor] + ";'>" 
        + "<br>def: ";
      
      for (let i = 0; i < GAME.player.get("def"); i++) {
          html += ".";
      }
      
      html += "</span>";
      html += "<span style='color: " + RAWS.entities.shard.render.color + ";'>";

      html += "<br>shards: "
  		+ GAME.player.get("shards")
        + "</span>"
          + " top: "
          + GAME.highscore;

      $("stats").innerHTML = html;
  },
    "statusList": ["","","",""],

  "drawStatus": function (message) {
 
    this.statusList.push(message);

    $("status1").style = "color: white;";
    $("status1").innerHTML = this.statusList[this.statusList.length-1];
    $("status2").innerHTML = this.statusList[this.statusList.length-2];
    $("status3").innerHTML = this.statusList[this.statusList.length-3];
    $("status4").innerHTML = this.statusList[this.statusList.length-4];
  
      let timeout = setTimeout(this.greyLastStatus, 1000 * RAWS.settings.seconds_display_status);
  },
 
  "rowsVisible": -1,

  "screenWidth": -1,

  "screenHeight": -1,

  "setDisplaySize": function () {
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    //add margins if browser window is wide
//    if (screenWidth > 1000) {
//        $("container").style="margin-left: 300px;margin-right: 300px;";
//        $("aboutButton").style="margin-left: 300px;margin-right: 300px;";
//    }
    
    //TODO: more efficient way to do the following?
    let origFont = window.getComputedStyle(document.body).getPropertyValue('font-size');
    let idx = 0;

    while(origFont[idx] !== 'p') {
        idx++;
    }

    origFont = origFont.substring(0,idx);

    let rows = Math.floor(screenHeight/(origFont)*RAWS.settings.default_font_size);
    //this is necessary because the font is not square (yet):
    rows /= 3;
    
    let cols = Math.floor(screenWidth/(origFont) *RAWS.settings.default_font_size);
    $('body').style.fontSize =RAWS.settings.default_font_size + "em";

    this.rowsVisible = rows;
    this.colsVisible = cols;
  },

  "updateUIColor": function (element, palette) {
      if (element === BACKGROUND) {
          if (GAME.player.DETERIORATION < palette.length) {
              bodyBackgroundColor = palette[GAME.player.DETERIORATION]; 
              document.querySelector("body").style.background = bodyBackgroundColor;
          }
      } else if (element === TEXT) {
          if (GAME.player.LEECH < palette.length) {
              textColor = palette[GAME.player.LEECH];
              $("level").style.color = textColor;
              $("stats").style.color = textColor;
              $("status").style.color = textColor;
          }
      }
  },

  "waitingKeypress": function () {
    return new Promise((resolve) => {
      document.addEventListener('keydown', onKeyHandler);
  	  document.addEventListener('touchstart', handleTouchStart);        
      document.addEventListener('touchmove', handleTouchMove);
      function onKeyHandler(e) {
  	    for (key in RAW.settings.keymap) {
  		  if (e.keyCode === parseInt(key)) {
            document.removeEventListener('keydown', onKeyHandler);
  			keyPressed = e.keyCode;
  			resolve();
  		  }
        }
      }
      let xDown = null;
      let yDown = null;
  
  	  function getTouches(evt) {
        return evt.touches ||             // browser API
        evt.originalEvent.touches;        // jQuery
  	  }                                                     
                                                                           
  	  function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];                                      
      	xDown = firstTouch.clientX;                                     
      	yDown = firstTouch.clientY;                                      
  	  }                                                
                                                                           
  	  function handleTouchMove(evt) {
  		//detect quadrant
  		//determine slop of line
  		//designate x, y or x+y shift as necessary
  
  		if ( ! xDown || ! yDown ) {
          return;
      	}
      	
  		let xUp = evt.touches[0].clientX;                                   		
  		let yUp = evt.touches[0].clientY;
  
      	let xDiff = xDown - xUp;
      	let yDiff = yDown - yUp;
                  
  		let slope = yDiff/xDiff;
              
  		if (xDiff > 0 && yDiff > 0) {
  		  //Quadrant IV
  		  if (slope < .7) {
  		    keyPressed = 100;
  		  } else if (slope === .7) {
  		    keyPressed = 103;
  		  } else if (slope > .7 && slope < 1.8) {
  			keyPressed = 103;	
  		  } else if (slope === 1.8) {
  			keyPressed = 103;
  		  } else if (slope > 1.8) {
  			keyPressed = 104;
  		  }
  		} else if (xDiff > 0 && yDiff < 0) {
  		  //Quadrant III
  		  if (slope > -.7) {
  		    keyPressed = 100;
  		  } else if (slope === -.7) {
  			keyPressed = 97;
  		  } else if (slope < -.7 && slope > -1.8) {
  		    keyPressed = 97;	
  		  } else if (slope === -1.8) {
  			keyPressed = 97;
  		  } else if (slope < -1.8) {
  		    keyPressed = 98;
  		  }
  		} else if (xDiff < 0 && yDiff > 0) {
  		  //Quadrant I
  		  if (slope > -.7) {
  		    keyPressed = 102;
  		  } else if (slope === -.7) {
  			keyPressed = 105;
  		  } else if (slope < -.7 && slope > -1.8) {
  			keyPressed = 105;	
  		  } else if (slope === -1.8) {
  			keyPressed = 105;
  		  } else if (slope < -1.8) {
  			keyPressed = 104;
  		  }
  		} else if (xDiff < 0 && yDiff < 0) {
  		  //Quadrant II
  		  if (slope < .7) {
  			keyPressed = 102;
  		  } else if (slope === .7) {
  			keyPressed = 99;
  		  } else if (slope > .7 && slope < 1.8) {
  			keyPressed = 99;	
  		  } else if (slope === 1.8) {
  			keyPressed = 99;
  		  } else if (slope > 1.8) {
  			keyPressed = 98;
  		  }
  		} else {               
      	  //This should only fire if one of the x or y values is 0
  		  if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
          	if ( xDiff > 0 ) {
              keyPressed = 100; 
          	} else {
              keyPressed = 102;
          	}                       
      	  } else {
            if ( yDiff > 0 ) {
              keyPressed = 104;
            } else { 
              keyPressed = 98;
          	}                                                                 
      	  }
  		}
      
  		/* reset values */
      	xDown = null;
      	yDown = null;                   
  		document.removeEventListener('touchstart', handleTouchStart);        
     	document.removeEventListener('touchmove', handleTouchMove);
  		resolve();                          
      }
    });
  }
}

window.addEventListener("load", () => {

});
