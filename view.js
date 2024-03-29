const VIEW = {
  "aboutDisplayed": false,

  "bodyBackgroundColor": "black",

  "copyright": "Copyright (c) 2023 Blake Cooper",

  "checkForMobileDevice": function () {
    window.addEventListener("load", () => {
      let mobile = navigator.userAgent
        .toLowerCase().match(/mobile/i);
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
        "<p>" + this.license +
        "<p><a href='#' onclick='GAME.resetHighScore()'>Reset high score</a>";

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
      this.mapDisplay.rowMax = 
        (x + Math.ceil(this.rowsVisible/2)) < RAWS.settings.rows
        ? x+ Math.ceil(this.rowsVisible/2) : (RAWS.settings.rows - 1);
    }

    if (this.mapDisplay.col === 0) { 
      this.mapDisplay.colMax = this.colsVisible; 
    } else {
      this.mapDisplay.colMax = 
        (y + Math.ceil(this.colsVisible/2)) < RAWS.settings.cols 
        ? y+Math.ceil(this.colsVisible/2) : (RAWS.settings.cols - 1);
    }
  },

  "draw": function (mode, dimension) {
    let htmlElement = mode === CONSTS.MAP ? $("map") : $("entities");
    let matrix = mode === CONSTS.MAP ? GAME.map : GAME.entities;

    htmlElement.innerHTML = "";
    let html = (mode === CONSTS.MAP) 
      ? "<span style='color: " + RAWS.colors[dimension.bgColor] + ";'>" 
      : "";

    for (let row = this.mapDisplay.row; row < this.mapDisplay.rowMax; row++) {
      for (let col = this.mapDisplay.col; col < this.mapDisplay.colMax; col++) {
        if (mode === CONSTS.ENTITIES		//mode 1: entity drawing 
        && !matrix.rowDefined(row)
        && !matrix.isNullAt(row,col)
        && GAME.wasSeen[row][col]) {

          html += "<span style='background-color: ";

          if (matrix.getIdAt(row, col) === "door") {
            html += 
            RAWS.colors[
              RAWS.dimensions[
                matrix.getDimensionOfDoorAt(row, col)
              ]["bgColor"]];
          } else {
            html += this.bodyBackgroundColor;
          }

          if (matrix.getPlayerAt(row,col) === undefined) {
            html += "; color: " + RAWS.colors[matrix.getRenderDataAt(row, col).color] + "'>";
            html += matrix.getRenderDataAt(row,col).symbol;
            html += "</span>";
          } else {
            const render = GAME.player.get("render");
            html += "; color: " + render.color + "'>";
            html += render.symbol;
            html += "</span>";
          }

        } else if (mode === CONSTS.MAP	//mode 2: map drawing
        && (matrix.rowsAreDefined 
        && matrix.at(row,col) !== null
        && GAME.wasSeen[row][col])
        ) {
          html += matrix.at(row,col);
        } else {
          html += CONSTS.SPACE;
        }
      }
        html += "<br>";
      }

      if (mode === CONSTS.MAP) {
        html += "</span>";
      }

      htmlElement.innerHTML = html;
  },

  "drawPointsForStat": function (stat) {
    let ret = "";

    for (let i = 0; i < stat; i++) {
      ret += ".";
    }

    return ret;
  },

  "drawStats": function () {
    let html =
      "<span style='color: " + RAWS.colors[RAWS.dimensions.hp.bgColor]			//hp
      + ";'>&nbsp;hp: "
      + this.damageSpan() 
      + this.drawPointsForStat(GAME.player.get("hp"))
      + this.closeSpan()
      + "<span style='color: grey;'>"
      + this.drawPointsForStat(GAME.player.get("base_hp") - GAME.player.get("hp"))
      + "</span></span>"

      + "<span style='color: " + RAWS.colors[RAWS.dimensions.atk.bgColor] + ";'>" 	//atk
      + "<br>atk: "
      + this.drawPointsForStat(GAME.player.get("atk"))
      + "</span>"

      + "<span style='color: " + RAWS.colors[RAWS.dimensions.def.bgColor] + ";'>" 	//def
      + "<br>def: "
      + this.drawPointsForStat(GAME.player.get("def"))
      + "</span>"

      + "<span style='color: " + RAWS.entities.shard.render.color + ";'>"		//shards
      + "<br>shards: " 
      + GAME.player.get("shards")
      + "</span>"

      + " top: "									//highscore
      + GAME.highscore;

    $("stats").innerHTML = html;
  },

  "drawStatus": function (message) {

    this.statusList.push(message);

    $("status1").style = "color: white;";
    for (let i = 1; i < this.numberStatusMsgsVisible; i++) {
      let element = "status" + i;
      $(element).innerHTML = this.statusList[this.statusList.length-i];
    }

    setTimeout(this.greyLastStatus, 1000 * RAWS.settings.seconds_display_status);
  },

  "greyLastStatus": function () {
      $("status1").style = "color: grey;";
  },

  "instructions": "Collect <span style='color: " + RAWS.entities.shard.render.color + ";'>" + RAWS.entities.shard.render.symbol + "</span> to open doors and improve your score<br>Collect <span style='color: " + RAWS.dimensions.hp.bgColor + ";'>" + RAWS.entities.potion.render.symbol + "</span><span style='color: " + RAWS.dimensions.atk.bgColor + ";'>&nbsp" + RAWS.entities.potion.render.symbol + "</span><span style='color: " + RAWS.dimensions.def.bgColor + ";'>&nbsp" + RAWS.entities.potion.render.symbol + "</span> to increase your stats<br>Collect <span style='color: " + RAWS.entities.restore.render.color + ";'>" + RAWS.entities.restore.render.symbol + "</span> to restore health<br>Avoid (or fight) <span style='color: " + RAWS.dimensions.atk.bgColor + ";'>" + RAWS.entities.minion.render.symbol + "</span> and <span style='color: " + RAWS.dimensions.atk.bgColor + ";'>" + RAWS.entities.maxion.render.symbol + "</span>",

  "license": "<p class>Licensed under The MIT License:<br> http://en.wikipedia.org/wiki/MIT_License</p>",

  "maskOpacity": .6, 

  "numberStatusMsgsVisible": 5,		//TODO: make a part of RAWS/settings

  "refreshScreen": function (map, dimension, entities, x, y) {
      if (this.rowVisible === -1 || this.colsVisible === -1) {
        this.setDisplaySize();
      };

      //TODO: improve performance with boolean to update when required.
      this.setMapDisplay(x, y);

      this.draw(CONSTS.MAP, dimension);
      this.draw(CONSTS.ENTITIES, dimension);
      this.drawStats();
  },

  "rowsVisible": -1,

  "screenWidth": -1,

  "screenHeight": -1,

  "setDisplaySize": function () {
    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;
    
    const origFont = parseInt(window.getComputedStyle(document.documentElement).fontSize);
    
    let rows = Math.floor(
      screenHeight/(origFont) * RAWS.settings.default_font_size);
    rows /= 3;		//necessary because font is not square

    let cols = Math.floor(
      screenWidth/(origFont) * RAWS.settings.default_font_size);

    $('body').style.fontSize = RAWS.settings.default_font_size + "em";

    this.rowsVisible = rows;
    this.colsVisible = cols;
    
    console.log(this.rowsVisible);
    console.log(this.colsVisible);
  },

  "setMaskOpacity": function (a) {
    $("mask").style="opacity: " + a + ";";
  },

  "statusList": ["","","",""],

  "title": "Shards of Maxion"
};
