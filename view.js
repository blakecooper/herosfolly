const VIEW = {
  "bodyBackground": "black",
  
  "buffer": 125,

  "clearStatus": function () {
    $("status").innerHTML = "";
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
    if (player.hp < player.base_hp) {
      return "</span>";
    } else {
      return "";
    }
  },

  "colsVisible": -1,
  
  "damageSpan": function () {
  
      let html = "";
  
      if (player.hp < player.base_hp) {
          html = "<span class=";
  
          if (player.hp < (player.base_hp / 3)) {
              html += "red";
          } else {
              html += "yellow";
          }
  
          html += ">";
  
      }
      
      return html;
  },
  
  "refreshScreen": function (map, entities, x, y) {
      if (this.rowVisible === -1 || this.colsVisible === -1) {
        this.setDisplaySize();
      };
      this.drawMap(map, x, y);
      this.drawStats();
      this.draw(entities, x, y);
  },
  
  "drawEntities": function () {
      draw(ITEMS.potion.render.symbol);
      draw(player.render.symbol);
      draw(SHARD.render.symbol);
  },
  
  "drawMap": function (map, x, y) {
      $("level").innerHTML = "";
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
          endRow = (x + Math.ceil(this.rowsVisible/2)) < ROWS 
          ? x+Math.ceil(this.rowsVisible/2) :  ROWS;
      }
      
      if (colz === 0) { 
          endCol = this.colsVisible; 
      } else {
          endCol = (y + Math.ceil(this.colsVisible/2)) < COLS 
          ? y+Math.ceil(this.colsVisible/2) : COLS;
      }
  
      if (endRow === ROWS) { rowz = ROWS-this.rowsVisible; }
      if (endCol === COLS) { colz = COLS-this.colsVisible; }
      
      for (let row = rowz; row < endRow; row++) {
          for (let col = colz; col < endCol; col++) {
              if (map[row] !== undefined 
              && map[row][col] !== null) {
                  html += map[row][col];
              } else {
                  html += SPACE;
              }
  		}    
          
          html += "<br>";
  	}
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
          endRow = (x + Math.ceil(this.rowsVisible/2)) < ROWS 
          ? x+Math.ceil(this.rowsVisible/2) :  ROWS;
      }
      
      if (colz === 0) { 
          endCol = this.colsVisible; 
      } else {
          endCol = (y + Math.ceil(this.colsVisible/2)) < COLS 
          ? y+Math.ceil(this.colsVisible/2) : COLS;
      }
  
      if (endRow === ROWS) { rowz = ROWS-this.rowsVisible; }
      if (endCol === COLS) { colz = COLS-this.colsVisible; }
      
      for (let row = rowz; row < endRow; row++) {
          for (let col = colz; col < endCol; col++) {
              if (entityMatrix[row][col] !== null && entityMatrix[row][col].render !== undefined) {
                  html += "<span style='background-color: " + this.bodyBackground 
                  + "; color: " + entityMatrix[row][col].render.color + "'>";
                  html += entityMatrix[row][col].render.symbol;
                  html += "</span>";
              } else {
                  html += SPACE;
              }
          }
          html += "<br>";
      }
  
      $("entities").innerHTML = html;
  },
  
  "drawStats": function () {
  
      $("stats").innerHTML = "hp: " 
          + this.damageSpan()
  		+ player.hp
          + this.closeSpan()
          + "/" + player.base_hp
          + " atk: "
  		+ player.atk
          + " def: "
  		+ player.def
          + " shards: "
  		+ player.shards
          + " top: "
          + highscores;
  },
  "drawStatus": function (message) {
    $("status").innerHTML = message;
    let timeout = setTimeout(function() {
      this.clearStatus();
    }, 1000 * SECONDS_DISPLAY_STATUS);
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

    let rows = Math.floor(screenHeight/(origFont)*DEFAULT_FONT_SIZE);
    //this is necessary because the font is not square (yet):
    rows /= 3;
    
    let cols = Math.floor(screenWidth/(origFont) * DEFAULT_FONT_SIZE);
    $('body').style.fontSize = DEFAULT_FONT_SIZE + "em";

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
  		let statsStyleUpdate = "top: " + (systemFontSize * ROWS + buffer) + "px;";
  		$("stats").style = statsStyleUpdate;
  		let statusStyleUpdate = "top: " + (systemFontSize * ROWS + buffer + 35) + "px;"; 
  		$("status").style = statusStyleUpdate;
  },

  "updateUIColor": function (element, palette) {
      if (element === BACKGROUND) {
          if (player.DETERIORATION < palette.length) {
              bodyBackground = palette[player.DETERIORATION]; 
              document.querySelector("body").style.background = bodyBackground;
          }
      } else if (element === TEXT) {
          if (player.LEECH < palette.length) {
              textColor = palette[player.LEECH];
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
