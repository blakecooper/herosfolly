const GAME = {
  acceptableLoopTimeout: 0,

  entityMatrixLocked: false,

  wasSeen: initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, false),

  isSeen: [],

  voronoiDiagram: {},

  doorsEntered: 0,

  shardsCollectedOnLevel: 0,

  potionsCollected: 0,

  dimension: RAWS.dimensions.hp,

  playerAttack: function (defender) {
    if (defender.canFight()) {

      const dimensionFactor = 1 + (this.doorsEntered * .2);
  
      let dimDefBuff = this.dimension.id === "def" ? 1 : 0;

      let atkRoll = random(20);
   
      let defenderHit = atkRoll > ((defender.def * dimensionFactor) + dimDefBuff);
      if (defenderHit) {
        let dmgToDefender = Math.floor(this.player.get("atk")/2) 
        + random(Math.ceil(this.player.get("atk")/2));
        
        defender.hp -= dmgToDefender;
  
        if (defender.hp < 1) {
    
          this.entityMatrix.makeNullAt(defender.x, defender.y);
          defender.x = -1;
          defender.y = -1;
    
          if (random(2)) {
            this.player.lucky();
          }
    
          for (let i = 0; i < defender.shards; i++) {
            this.player.picksUp("shard");     
          }
    
          return false;
        }
      } else {
        VIEW.drawStatus("You missed!");
      }
    
      return true;
    }
  },

  monsterAttack: function (attacker) {
 
    let dimensionFactor = 1 + (this.doorsEntered * .2); 
    let atkRoll = random(20) * dimensionFactor;

    if (this.dimension.id === "atk") { atkRoll += (this.doorsEntered * .2) };
 
    let defenderHit = atkRoll > this.player.get("def");
    if (defenderHit) {
      let dmgToDefender = Math.floor(attacker.atk/2 
      + random(attacker.atk/2)
      * dimensionFactor);
      
      this.player.hpAdj(-dmgToDefender);
 
      if (this.player.get("hp") < 1) {
        return false;
      }
    } else {
      VIEW.drawStatus("The " + attacker.id + " missed!");
    }
  
    return true;
  },
  
  avoidEdges: function (axis, value) {
    let mapDimension = RAWS.settings.rows - 1;
  
    if (axis === RAWS.settings.cols) {
      mapDimension = RAWS.settings.cols - 1;
    }
  	
    if (value == 0) { 
    	return ++value;
    } else if (value == mapDimension) { 
      return --value;
    } else {
  	return value;
    }
  },

  checkForBuffs: function (x,y) {
    if (!this.entityMatrix.isNullAt(x, y)
    && this.entityMatrix.getIdAt(x,y) === "restore") {
      return true;
    }
    return false;
  },

  checkForMonsters: function (x,y) {
    if (!this.entityMatrix.isNullAt(x, y)
    && this.entityMatrix.getMonstrosityAt(x,y)) {
	  return true;
    }
    return false;
  },

 checkForPotions: function (x,y) {
    if (!this.entityMatrix.isNullAt(x, y)
    && this.entityMatrix.getIdAt(x,y) === "potion") {
      return true;
    }
    return false;
  },

  checkForShards: function (x,y) {
    if (!this.entityMatrix.isNullAt(x, y)
    && this.entityMatrix.getIdAt(x,y) === "shard") {
      return true;
    }
    return false;
  },

  clearMonstersAroundPlayer: function() {
    //Get rid of any monsters right next to player
    for (let row = (this.player.get("x") - 1); row < (this.player.get("x") + 2); row++) {
      for (let col = (this.player.get("y") - 1); col < (this.player.get("y") + 2); col++) {
        if (!this.entityMatrix.isNullAt(row,col) && 
        (this.entityMatrix.getIdAt(row, col) === "minion" 
        || this.entityMatrix.getIdAt(row, col) === "maxion")) {    
          this.relocateMonsterAtIdx(getEnemyAt(row, col));
        }
      }
    }
  },

  cookies: document.cookie,
  
  enemies: [],

  populateEnemies: function () {
    const retArr = [];
    
    const enemyTypes = getListOfEntitiesWhere("isMonstrous", true);
    for (let i = 0; i < enemyTypes.length; i++) {
      let numberEnemies = Math.floor(RAWS.settings.base_spawn_rate 
      * enemyTypes[i].spawnRate) * (1 + (this.doorsEntered * .2));
 
        for (let j = 0; j < numberEnemies; j++) {
          retArr.push({ 
            ...new Entity(), 
            ...RAWS.entities[enemyTypes[i].id], 
            ...this.getAcceptableCoordinateAsObject() 
          });
        }
      }
    return retArr; 
  },

  voronoiSites: [], 
  potionZoneParams: [],

  enemyMoves: function(idx) {
    let randomMovementChoice = random(2);
  	
    if ((this.player.get("x") < this.enemies[idx].x) && (this.player.get("y") < this.enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        this.moveEnemyTo(idx, (this.enemies[idx].x - 1),(this.enemies[idx].y));
      } else {
        this.moveEnemyTo(idx, (this.enemies[idx].x),(this.enemies[idx].y - 1));
      }
    } else if ((this.player.get("x") < this.enemies[idx].x) && (this.player.get("y") === this.enemies[idx].y)) {
      this.moveEnemyTo(idx, (this.enemies[idx].x - 1), this.enemies[idx].y);
    } else if ((this.player.get("x") < this.enemies[idx].x) && (this.player.get("y") > this.enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        this.moveEnemyTo(idx, (this.enemies[idx].x - 1),(this.enemies[idx].y));
      } else {
        this.moveEnemyTo(idx, (this.enemies[idx].x),(this.enemies[idx].y + 1));
      }
    } else if ((this.player.get("x") === this.enemies[idx].x) && (this.player.get("y") < this.enemies[idx].y)) {
      this.moveEnemyTo(idx, this.enemies[idx].x, (this.enemies[idx].y - 1));
    } else if ((this.player.get("x") === this.enemies[idx].x) && (this.player.get("y") > this.enemies[idx].y)) {
      this.moveEnemyTo(idx, this.enemies[idx].x, (this.enemies[idx].y + 1));
   } else if ((this.player.get("x") > this.enemies[idx].x) && (this.player.get("y") < this.enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        this.moveEnemyTo(idx, (this.enemies[idx].x + 1),(this.enemies[idx].y));
      } else {
        this.moveEnemyTo(idx, (this.enemies[idx].x),(this.enemies[idx].y - 1));
      }
    } else if ((this.player.get("x") > this.enemies[idx].x) && (this.player.get("y") === this.enemies[idx].y)) {
      this.moveEnemyTo(idx, (this.enemies[idx].x + 1), this.enemies[idx].y);
    } else if ((this.player.get("x") > this.enemies[idx].x) && (this.player.get("y") > this.enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        this.moveEnemyTo(idx, (this.enemies[idx].x + 1),(this.enemies[idx].y));
      } else {
        this.moveEnemyTo(idx, (this.enemies[idx].x),(this.enemies[idx].y + 1));
      }
    }
  },

  entityMatrix: [],

  initializeEntityMatrix: (function () {
    let e = initializeMatrix(RAWS.settings.rows,RAWS.settings.cols,null);
    console.log("New entity matrix initialized!");
    console.log(e);

    return {
      isNullAt: function (x, y) {
        return e[x][y] === null;
      },
      makeNullAt: function (x, y) {
        e[x][y] = null;
      },
      getIdAt: function (x, y) {
        if (e[x][y]) {
          return e[x][y].id;
        }
      },
      getDimensionOfDoorAt: function (x, y) {
        return e[x][y].dimension;
      },
      placeAt: function (x, y, entity) {
        e[x][y] = entity;
      },
      getMonstrosityAt: function (x, y) {
        return e[x][y].isMonstrous;
      },
      rowDefined: function (row) {
        return typeof e[row] === 'undefined';
      },
      getPlayerAt: function (x, y) {
        return e[x][y].isPlayer;
      },
      getRenderDataAt: function (x, y) {
        return e[x][y].render;
      },
      clear: function () {
        e = initializeMatrix(RAWS.settings.rows,RAWS.settings.cols,null);
      }
    };
  })(),

  placeEntitiesOnMap: function () {
    //Spawn potions first
    //split map into sections based on how many potions
    let numberMapZones = RAWS.settings.potions_per_level;

    if (numberMapZones % 2 !== 0) { numberMapZones++; }
    
    let mapZoneCols = Math.floor(numberMapZones / 2);
    let zoneWidth = Math.floor(RAWS.settings.cols / mapZoneCols);
    let zoneHeight = Math.floor(RAWS.settings.rows / 2);
    let potionsToGenerate = RAWS.settings.potions_per_level;
 
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < mapZoneCols; col++) {
        if (potionsToGenerate > 0) {
          const potion = {
              ...new Entity(),
              ...RAWS.entities.potion,
              ...this.getAcceptableCoordinateAsObjectWithParams(
                (zoneHeight * row),
                ((zoneHeight * row) + (zoneHeight-1)),
                (zoneWidth * col),
                ((zoneWidth * col) + (zoneWidth-1))
              )
          }
          const dimColor = this.dimension.potionColor;
          potion.render.color = dimColor;
          this.entityMatrix.placeAt(potion.x,potion.y, potion);
          
          this.voronoiSites.push({x: potion.x, y: potion.y});
          this.potionZoneParams.push({
            x1: (zoneHeight * row),
            x2: ((zoneHeight * row) + (zoneHeight-1)),
            y1: (zoneWidth * col),
            y2: ((zoneWidth * col) + (zoneWidth-1))
  	  });
        }
      }

    }

    let voronoi = new Voronoi();
    let bbox = { x1: 0, xr: RAWS.settings.rows-1, yt: 0, rb: RAWS.settings.cols-1 };

    this.voronoiDiagram = voronoi.compute(this.voronoiSites, bbox);
    
    for (let edge = 0; edge < this.voronoiDiagram.edges.length; edge++) {
        if (!Number.isNaN(Math.floor(this.voronoiDiagram.edges[edge].va.x))
           &&!Number.isNaN(Math.floor(this.voronoiDiagram.edges[edge].va.y))
           &&!Number.isNaN(Math.floor(this.voronoiDiagram.edges[edge].vb.x))
           &&!Number.isNaN(Math.floor(this.voronoiDiagram.edges[edge].vb.y))) {

        
        if (Math.floor(this.voronoiDiagram.edges[edge].va.x < 0)) {
            this.voronoiDiagram.edges[edge].va.x = 0;
        }

        if (Math.floor(this.voronoiDiagram.edges[edge].va.y < 0)) {
            this.voronoiDiagram.edges[edge].va.y = 0;
        }
        if (Math.floor(this.voronoiDiagram.edges[edge].vb.x < 0)) {
            this.voronoiDiagram.edges[edge].vb.x = 0;
        }
        if (Math.floor(this.voronoiDiagram.edges[edge].vb.y < 0)) {
            this.voronoiDiagram.edges[edge].vb.y = 0;
        }
           }
    }
    
    for (let site = 0; site < this.voronoiSites.length; site++) {
      //spawn an item in that range
      const numberShards = (RAWS.settings.base_spawn_rate 
      * RAWS.entities.shard.spawnRate) / this.voronoiSites.length;
      for (let i = 0; i < numberShards; i++) {
        const shard = {
            ...new Entity(),
            ...RAWS.entities.shard,
            ...this.getAcceptableCoordinateAsObjectWithParams(
	      this.potionZoneParams[site].x1, 
	      this.potionZoneParams[site].x2, 
	      this.potionZoneParams[site].y1, 
	      this.potionZoneParams[site].y2, 
  	    )
        };
  
    
        if (isInVoronoiCell(
          shard.x, 
 	  shard.y, 
 	  this.voronoiSites[site].x, 
	  this.voronoiSites[site].y, 
	  this.voronoiDiagram
        )) {
          if (this.entityMatrix.isNullAt(shard.x,shard.y)
          || this.entityMatrix.getIdAt(shard.x,shard.y) !== "potion"){
            this.entityMatrix.placeAt(shard.x,shard.y,shard);
          }
        } 
      }
    }

    const numberRestore = RAWS.settings.base_spawn_rate
    * RAWS.entities.restore.spawnRate;
  
    for (let i = 0; i < numberRestore; i++) {
      const restore = {
          ...new Entity(),
          ...RAWS.entities.restore,
          ...this.getAcceptableCoordinateAsObject()
      }
  
      this.entityMatrix.placeAt(restore.x,restore.y,restore);
    }
    
    for (let i = 0; i < this.enemies.length; i++) {
      this.entityMatrix.placeAt(this.enemies[i].x,this.enemies[i].y, this.enemies[i]);
    }    
   
  
},
  
  getAcceptableCoordinateAsObjectWithParams: function (x1, x2, y1, y2) {
    let acceptable = false;
    this.acceptableTimeout = 0;
    const coordsArr = [-1, -1];

    while (!acceptable && this.acceptableTimeout < 100000) {
      coordsArr[0] = this.getRandomCoordinateWithParams(CONSTS.ROW, x2-x1)+x1;
      coordsArr[1] = this.getRandomCoordinateWithParams(CONSTS.COL, y2-y1)+y1;

      if (this.map.at(coordsArr[0],coordsArr[1]) === RAWS.map.text.floor) {
        acceptable = true;
      } else {
        this.acceptableTimeout++;
      }
    }
    
    return {
      x: coordsArr[0],
      y: coordsArr[1]
    };
    
  },

  getAcceptableCoordinateAsObject: function () {
    return this.getAcceptableCoordinateAsObjectWithParams(0, this.map.rowLength(), 0, this.map.colLength());
  },
  
  getEnemyAt: function (x,y) {
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].x === x && this.enemies[i].y === y) {
        return i;
      }
    }
	return -1;
  },

  getHighScores: function () {
    const key = "highscores=";
    let score = "";

    if (this.cookies.length > 0 && this.cookies.search(key) !== -1) {
      let highscoresString = this.cookies.substring(this.cookies.search(key) + key.length);
      let idx = 0;

      while (idx < this.cookies.length && highscoresString[idx] !== ";") {
        score += highscoresString[idx];
        idx++;
      }
      return parseInt(score);
    } else {
      return 0;
    }
  },

  getRandomCoordinateWithParams: function(axis, limit) {
    let mapLimit = RAWS.settings.rows;

    if (axis === CONSTS.COL) {
      mapLimit = RAWS.settings.cols;
    }

    return this.avoidEdges(axis, random(limit));
  }, 

  getRandomCoordinate: function (axis) {
    let mapLimit = RAWS.settings.rows;

    if  (axis === CONSTS.COL) {
     mapLimit = RAWS.settings.cols;
    }
    return this.avoidEdges(axis, random(mapLimit-1));
  },
  
  highscore: 0,
 
  isNewHighScore: false,
    
  keyPressed: -1,

  loop: function () {
    if (this.player.shards !== 0 &&
      this.player.shards % 7 == 0) {
      this.randomRegen();
    }
  
    //Get coordinates of proposed player move
    let proposedPlayerX = this.player.get("x");
    let proposedPlayerY = this.player.get("y");
    
    if (RAWS.settings.keymap[keyPressed] === CONSTS.LEFT) {
      proposedPlayerY--;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.RIGHT) {
      proposedPlayerY++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.UP) {
      proposedPlayerX--;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.DOWN) {
      proposedPlayerX++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.DOWNRIGHT) {
      proposedPlayerX++;
      proposedPlayerY++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.DOWNLEFT) {
      proposedPlayerX++;
      proposedPlayerY--;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.UPRIGHT) {
      proposedPlayerX--;
      proposedPlayerY++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.UPLEFT) {
      proposedPlayerX--;
      proposedPlayerY--;
    }
  
    //These conditions need to prevent the player from moving 
    //(and also updating the player x and y coordinates incorrectly)
    let monsterPresent = false;
    let moveThruDoor = false;
  
    //Complete player's move based on what's in the proposed move square
    if (this.checkForMonsters(proposedPlayerX,proposedPlayerY)) {
      monsterPresent = this.playerAttack(
        this.enemies[this.getEnemyAt(proposedPlayerX,proposedPlayerY)]
      );
    }
  
    if (!monsterPresent 
    && this.checkForShards(proposedPlayerX,proposedPlayerY)) {
      this.entityMatrix.makeNullAt(proposedPlayerX, proposedPlayerY);
      this.pickupShard(this.player);
    }
  
    if (!monsterPresent 
    && this.checkForPotions(proposedPlayerX,proposedPlayerY)){
      this.pickupPotion();
      this.entityMatrix.makeNullAt(proposedPlayerX, proposedPlayerY);
    }
  
    if (!monsterPresent && 
    this.checkForBuffs(proposedPlayerX, proposedPlayerY)) {
      this.pickupBuff();
      this.entityMatrix.makeNullAt(proposedPlayerX, proposedPlayerY);
    }
 
    if (!this.entityMatrix.isNullAt(proposedPlayerX,proposedPlayerY) 
    && this.entityMatrix.getIdAt(proposedPlayerX,proposedPlayerY) === "door") {
      //update dimension
      this.dimension = RAWS.dimensions[this.entityMatrix.getDimensionOfDoorAt(proposedPlayerX, proposedPlayerY)];
      this.doorsEntered++;
      this.potionsCollected = 0;
      this.doorsNotAppeared = true;
      this.shardsCollectedOnLevel = 0;
      //re-initialize entityMatrix
      this.map.generate();
      this.enemies = this.populateEnemies();

      this.entityMatrix.clear();
      this.placeEntitiesOnMap();
   
      this.wasSeen = initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, false);
      this.spawnPlayer();
      //skip rest of loop
      moveThruDoor = true;
    }
 
    if (!monsterPresent && !moveThruDoor 
    && this.map.at(proposedPlayerX,proposedPlayerY) === RAWS.map.text.floor) {
      this.movePlayerTo(proposedPlayerX,proposedPlayerY);
    }
  
    //Check for enemies next to player
    //Those enemies attack, others move toward player
    if (!moveThruDoor) {
      for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].x > 0 && this.enemies[i].y > 0 
        && Math.abs(this.player.get("x") - this.enemies[i].x) < 2 
        && Math.abs(this.player.get("y") - this.enemies[i].y) < 2) {
          this.monsterAttack(this.enemies[i]);
        } else {
          if ((this.enemies[i].id === "maxion" || random(20) > 1)
          && this.monsterOnScreen(i)) {
            this.enemyMoves(i);
          }	
        }	
      }
    }
  	
    //Check to see if player has died during the loop
    if (this.player.get("hp") < 1) {
      this.player.hpAdj(Math.abs(this.player.get("hp")));
      this.play = false;
    }
 
    if (this.shardsCollectedOnLevel === RAWS.settings.shards_required_to_advance
    && this.doorsNotAppeared) {
        this.appearDoors();
        VIEW.drawStatus("The shards have opened doors to other dimensions!");
    }

    this.updateTilesSeenByPlayer(this.player.get("viewDistance"));

  },
  viewPoints: [],
 
  updateTilesSeenByPlayer: function () {
    this.isSeen = initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, false);

    let oneWayViewDist = Math.floor(this.player.get("viewDistance")/2);
    
    let row = this.player.get("x") - oneWayViewDist;
    let rowMax = row + this.player.get("viewDistance");

    let col = this.player.get("y") - oneWayViewDist;
    let colMax = this.player.get("y") + oneWayViewDist;

 
    for (row; row < rowMax; row++) {
      for (col; col < colMax; col++) {
        if (this.map.rowsAreDefined
        && typeof this.map.at(row,col) !== 'undefined') {
          this.isSeen[row][col] = true;
          if (this.wasSeen[row][col] === false) {
            this.wasSeen[row][col] = true;
          }
        }
      }
      col = this.player.get("y") - oneWayViewDist;
    }
  },

  appearDoors: function () {
    for (dimension in RAWS.dimensions) {
      if (RAWS.dimensions[dimension] !== this.dimension) {
        const numberDoors = RAWS.settings.base_spawn_rate
        * RAWS.entities.door.spawnRate;
          
        for (let i = 0; i < numberDoors; i++) {
          let door = {
            ...new Entity(),
            ...RAWS.entities.door,
            ...this.getAcceptableCoordinateAsObject()
          };
  
          door.dimension = dimension;
          door.render = {
              color: RAWS.dimensions[dimension]["bgColor"],
              symbol: "O"
          };

          if (!this.entityMatrix.isNullAt(door.x,door.y)
          || (!(door.x === this.player.get("x") && door.y === this.player.get("y"))
          && (this.entityMatrix.getIdAt(door.x,door.y) !== "potion"))) {
            
            if (!this.entityMatrix.isNullAt(door.x,door.y)
            && this.entityMatrix.getMonstrosityAt(door.x,door.y)) {
              this.relocateMonsterAtIdx(this.getEnemyAt(door.x, door.y));
            }
              
            this.entityMatrix.placeAt(door.x,door.y,door);
          }  
        } 
      }
    }
    this.doorsNotAppeared = false;
  },

  doorsNotAppeared: true,

  map: [],

  monsterOnScreen: function (i) {
    if ((this.enemies[i].x > (this.player.get("x") - (VIEW.rowsVisible/2))
      && this.enemies[i].x < (this.player.get("x") + (VIEW.rowsVisible/2)))
    && (this.enemies[i].y > (this.player.get("y") - (VIEW.colsVisible/2))
      && this.enemies[i].y < (this.player.get("y") + (VIEW.colsVisible/2)))) { 
      return true;
    }

    return false;
  },

  maybeUpdateHighScores: function () {
    if (this.highscore < this.player.get("shards")) {
      this.highscore = this.player.get("shards");
      this.isNewHighScore = true;
    }
    document.cookie = 
      "highscores=" 
      + this.highscore 
      + "; SameSite=Strict;";

  },

  movePlayerTo: function (x,y) {
    this.entityMatrix.makeNullAt(this.player.get("x"),this.player.get("y"));
    this.entityMatrix.placeAt(x,y, this.player);
    this.player.updateCoords(x, y);
  },

  moveEnemyTo: function (idx,x,y) {
    if (this.enemies[idx].x > 0 && this.enemies[idx].y > 0 
    && this.map.at(x,y) === RAWS.map.text.floor 
    && (this.entityMatrix.isNullAt(x,y) 
        || this.entityMatrix.getIdAt(x,y) === "shard")) {
      this.entityMatrix.makeNullAt(this.enemies[idx].x,this.enemies[idx].y);
	  if (this.checkForShards(x,y)) {
	    this.enemies[idx].shards++;
	  }

      this.entityMatrix.placeAt(x,y, this.enemies[idx]);
		
      this.enemies[idx].x = x;
	  this.enemies[idx].y = y;
    }
  }, 

  noEntitiesOnSquare: function (checkX, checkY) {
    if (!this.entityMatrix.rowDefined(checkX) 
    && !this.entityMatrix.isNullAt(checkX,checkY)) {
      return false;
    }
    return true;
  },

  pickupBuff: function() {
    this.player.hpAdj(this.player.get("base_hp")-this.player.get("hp"));
  },
  
  pickupPotion: function () {
    this.potionsCollected++;
    this.dimension.potionEffect();
    if (this.potionsCollected === RAWS.settings.potions_per_level) {
        VIEW.drawStatus("There are no more potions... in this realm.");
    }
  },
  
  pickupShard: function (entity) {
    entity.picksUp("shards");
    if (entity.isPlayer) {
      this.shardsCollectedOnLevel++;
    }
  },
   
  play: true,
  
  player: {},

  initializePlayer: (function() {
    const p = {
      ...new Entity(), 
      ...RAWS.entities.player 
    };

    return {
      updateCoords: function (x, y) {
        p.x = x;
        p.y = y;
      },
      baseHpUp: function () {
        p.base_hp++;
      },
      hpAdj: function (val) {
        p.hp += val;
      },
      atkUp: function () {
        p.atk++;
      }, 
      defUp: function () {
        p.def++;
      },
      picksUp: function (item) {
        if (item === "shards") {
          p.shards++;
        }
      }, 
      get: function (prop) {
        if (p[prop] !== undefined) {
          return p[prop];
        }
      },
      lucky: function () {
        p.lucky();
      },
      isPlayer: true,
      holdsShards: function () {
        p.holdsShards();
      }
    };
  })(),

  initializeMap: (function() {
    let m = LEVEL.generate();

    return {
      at: function (x, y) {
        if (typeof m[x] !== 'undefined'
        && typeof m[x][y] !== 'undefined') {
          return m[x][y];
        }
      },
      rowLength: function () {
        return m.length;
      },
      colLength: function () {
        if (m[0] && typeof m[0] !== 'undefined') {
          return m[0].length;
        } else {
          return -1;
        }
      },
      rowsAreDefined: function () {
        return typeof m[0] !== 'undefined';
      },
      generate: function () {
        m = LEVEL.generate();
      }
    };
  })(),

  randomRegen: function () {
    if (this.player.get("hp") < this.player.get("base_hp")) {
      this.player.hpAdj(1);
      VIEW.drawStatus("You feel a benevolent presence! 1 HP gained.");
    }
  },

  relocateMonsterAtIdx: function (i) {
    let acceptablePlacement = false;
  
    while (!acceptablePlacement) {
      let x = this.getRandomCoordinate(RAWS.settings.rows);
      let y = this.getRandomCoordinate(RAWS.settings.cols);
  
      if (this.map.at(x,y) === RAWS.map.text.floor 
      && this.noEntitiesOnSquare(x, y)) {
        this.entityMatrix.makeNullAt(this.enemies[i].x,this.enemies[i].y);
  
        this.enemies[i].x = x;
        this.enemies[i].y = y;
  
        this.entityMatrix.placeAt(x,y,this.enemies[i]);
        acceptablePlacement = true;
      }
    }
  },
    startView: function () {
      let interval = setInterval(function() {
        VIEW.refreshScreen( 
        GAME.map,
        GAME.dimension,
        GAME.entityMatrix, 
        GAME.player.get("x"), 
        GAME.player.get("y"))}, 
      (1000 / RAWS.settings.fps));

    },

  spawnPlayer: function() {
    let playerPlacementSuccessful = false;

    let timeout = 0;

    while (!playerPlacementSuccessful && timeout < 100000) {

      const startingCoords = this.getAcceptableCoordinateAsObject();

      if (startingCoords.x - this.player.get("viewDistance") > 0
      && startingCoords.x + this.player.get("viewDistance") < this.map.rowLength()
      && startingCoords.y - this.player.get("viewDistance") > 0
      && startingCoords.y + this.player.get("viewDistance") < this.map.colLength()) {

       this.player.updateCoords(startingCoords.x, startingCoords.y); 
    
       playerPlacementSuccessful = true;
     } else {
       timeout++;
     }
   }

   if (!playerPlacementSuccessful) {
     console.log("Critical error: could not place player!");
   } else {
    this.entityMatrix.placeAt(this.player.get("x"), this.player.get("y"), this.player);
   }
  },


  start: async function () {

    //TODO: add this back in after new VIEW is complete
    //checkForMobileDevice();

    this.map = this.initializeMap; 
    this.player = this.initializePlayer;
    this.enemies = this.populateEnemies();

    this.entityMatrix = this.initializeEntityMatrix;
    this.entityMatrix.clear();
    this.placeEntitiesOnMap();

    this.spawnPlayer(); 

  

    this.updateTilesSeenByPlayer(this.player.get("viewDistance"));  
  
    this.highscore = this.getHighScores(); 
    this.startView();

    while (this.play) {
      await CONTROLLER.waitingKeypress();
   
      if (keyPressed > 0) {
       GAME.loop();
     }	
    }
    
    this.maybeUpdateHighScores();
    
    let endString = "You died. ";

    if (this.isNewHighScore) {
      endString = endString + "New high score though!";
    }
      
    VIEW.drawStatus(endString);
    
    clearInterval();
  },
};
