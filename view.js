const VIEW = {
  "bodyBackground": "black",
  
  "buffer": 125,

  "aboutDisplayed": false,


  "displayAbout": function () {
    if (this.aboutDisplayed) {
      $("about").style = "display: none;";
      this.aboutDisplayed = false;
    } else {
      let html = 
            "<p>&nbsp<p>&nbsp<p>&nbsp" + 
        "<p>" + this.TITLE +
        "<p>" + this.COPYRIGHT + 
        "<p>" + this.INSTRUCTIONS +
        "<p>" + this.LICENSE;

      $("about").innerHTML = html;

      $("about").style = "display: inline;";
      this.aboutDisplayed = true;
    }
  },
  "TITLE": "Shards of Maxion",
  "COPYRIGHT": "Copyright (c) 2022 Blake Cooper",
  "INSTRUCTIONS": "Collect <span style='color: " + RAWS.entities.shard.render.color + ";'>" + RAWS.entities.shard.render.symbol + "</span> to open doors and improve your score<br>Collect <span style='color: " + RAWS.dimensions.hp.bgColor + ";'>" + RAWS.entities.potion.render.symbol + "</span><span style='color: " + RAWS.dimensions.atk.bgColor + ";'>&nbsp" + RAWS.entities.potion.render.symbol + "</span><span style='color: " + RAWS.dimensions.def.bgColor + ";'>&nbsp" + RAWS.entities.potion.render.symbol + "</span> to increase your stats<br>Collect <span style='color: " + RAWS.entities.restore.render.color + ";'>" + RAWS.entities.restore.render.symbol + "</span> to restore health<br>Avoid (or fight) <span style='color: " + RAWS.dimensions.atk.bgColor + ";'>" + RAWS.entities.minion.render.symbol + "</span> and <span style='color: " + RAWS.dimensions.atk.bgColor + ";'>" + RAWS.entities.maxion.render.symbol + "</span>",
  "LICENSE": "<p class='block'>Licensed under The MIT License:<br> http://en.wikipedia.org/wiki/MIT_License</p><p class='block'>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p><p class='block'>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p><p class='block'>THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
  "clearStatus": function () {
      $("status1").style = "color: grey;";
  },

  "checkForMobileDevice": function () {
    window.addEventListener("load", () => {
	  let mobile = navigator.userAgent.toLowerCase().match(/mobile/i);
	  if (mobile !== null) {
	    isMobile = true;
	  }
	});
  },

  "closeSpan": function () {
    if (GAME.player.get("hp") < GAME.player.get("base_hp")) {
      return "</span>";
    } else {
      return "";
    }
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
  
  "refreshScreen": function (map, dimension, entities, x, y) {
      if (this.rowVisible === -1 || this.colsVisible === -1) {
        this.setDisplaySize();
      };
      this.drawMap(map, dimension, x, y);
      this.drawStats();
      this.draw(entities, x, y);
  },
  
  "drawMap": function (map, dimension, x, y) {
      $("level").innerHTML = "";
	let html = "<span style='color: " + RAWS.colors[dimension.bgColor] + ";'>";
  
      let rowz = (x - Math.floor(this.rowsVisible/2)) > 0 
      ? x-Math.floor(this.rowsVisible/2) : 0;
      
      let colz = (y - Math.floor(this.colsVisible/2)) > 0
      ? y-Math.floor(this.colsVisible/2) : 0;
  
      let endRow;
      let endCol;
  
      if (rowz === 0) { 
          endRow = this.rowsVisible; 
      } else {
          endRow = (x + Math.ceil(this.rowsVisible/2)) < RAWS.settings.rows 
          ? x+Math.ceil(this.rowsVisible/2) :  (RAWS.settings.rows - 1);
      }
      
      if (colz === 0) { 
          endCol = this.colsVisible; 
      } else {
          endCol = (y + Math.ceil(this.colsVisible/2)) < RAWS.settings.cols 
          ? y+Math.ceil(this.colsVisible/2) : (RAWS.settings.cols - 1);
      }
  
    //  if (endRow === (RAWS.settings.rows-1)) { rowz = RAWS.settings.rows-this.rowsVisible; }
    //  if (endCol === (RAWS.settings.cols)) { colz = RAWS.settings.cols-this.colsVisible; }
     
      for (let row = rowz; row < endRow; row++) {
          for (let col = colz; col < endCol; col++) {
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
  
  "draw": function (entityMatrix, x, y) {
      $("entities").innerHTML = "";
  
      let html = "";
  
      let rowz = (x - Math.floor(this.rowsVisible/2)) > 0 
      ? x-Math.floor(this.rowsVisible/2) : 0;
      
      let colz = (y - Math.floor(this.colsVisible/2)) > 0 
      ? y-Math.floor(this.colsVisible/2) : 0;
  
      let endRow;
      let endCol;
  
      if (rowz === 0) { 
          endRow = this.rowsVisible; 
      } else {
          endRow = (x + Math.ceil(this.rowsVisible/2)) < RAWS.settings.rows 
          ? x+Math.ceil(this.rowsVisible/2) :  RAWS.settings.rows;
      }
      
      if (colz === 0) { 
          endCol = this.colsVisible; 
      } else {
          endCol = (y + Math.ceil(this.colsVisible/2)) < RAWS.settings.cols 
          ? y+Math.ceil(this.colsVisible/2) : RAWS.settings.cols;
      }
  
    //  if (endRow === RAWS.settings.rows) { rowz = RAWS.settings.rows-this.rowsVisible; }
    //  if (endCol === RAWS.settings.cols) { colz = RAWS.settings.cols-this.colsVisible; }
 
      for (let row = rowz; row < endRow; row++) {
        for (let col = colz; col < endCol; col++) {
          if (!entityMatrix.rowDefined(row)
          && !entityMatrix.isNullAt(row,col)
          && GAME.wasSeen[row][col]) {
            html += "<span style='background-color: ";
            
            if (entityMatrix.getIdAt(row, col) === "door") {
                     html += RAWS.colors[RAWS.dimensions[entityMatrix.getDimensionOfDoorAt(row, col)]["bgColor"]];
            } else {
              html += this.bodyBackground;
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
  
      let timeout = setTimeout(this.clearStatus, 1000 * RAWS.settings.seconds_display_status);
  },
 
  "rowsVisible": -1,

  "screenWidth": -1,

  "screenHeight": -1,

  "setDisplaySize": function () {
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

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

  "sizeElementsToWindow": function () {
  
  //If screen is in portrait mode, leave room for stats and status at the bottom
  if (screenWidth > screenHeight) {
  	$("body").style = "font-size: 2.2vw;";
  } else {
  	$("body").style = "font-size: 4vw;";
  }
  
  let style = window.getComputedStyle(body, null).getPropertyValue('font-size');
  let systemFontSize = parseFloat(style);
  		let statsStyleUpdate = "top: " + (systemFontSize * RAWS.settings.rows + buffer) + "px;";
  		$("stats").style = statsStyleUpdate;
  		let statusStyleUpdate = "top: " + (systemFontSize * RAWS.settings.rows + buffer + 35) + "px;"; 
  		$("status").style = statusStyleUpdate;
  },

  "updateUIColor": function (element, palette) {
      if (element === BACKGROUND) {
          if (GAME.player.DETERIORATION < palette.length) {
              bodyBackground = palette[GAME.player.DETERIORATION]; 
              document.querySelector("body").style.background = bodyBackground;
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

//window.addEventListener("resize", () => {
//	sizeElementsToWindow();	
//});
