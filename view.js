const VIEW = {
  "bodyBackground": "black",
  
  "buffer": 125,

  "clearStatus": function () {
    $("status").innerHTML = "";
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
      draw(ITEMS.potion.renderable.symbol);
      draw(player.renderable.symbol);
      draw(SHARD.renderable.symbol);
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
              if (map[row][col] !== null) {
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
              if (entityMatrix[row][col].renderable !== undefined) {
                  html += "<span style='background-color: " + this.bodyBackground 
                  + "; color: " + entityMatrix[row][col].renderable.color + "'>";
                  html += entityMatrix[row][col].renderable.symbol;
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
  }
};

window.addEventListener("load", () => {

});

//window.addEventListener("resize", () => {
//	sizeElementsToWindow();	
//});








