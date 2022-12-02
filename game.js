const GAME = {
  appearDoors: function () {
    for (dimension in RAWS.dimensions) {
      if (RAWS.dimensions[dimension] !== this.currentDimension) {	//only spawn doors
        const numberDoors = RAWS.settings.base_spawn_rate	//to other dimensions
        * RAWS.entities.door.spawnRate;
          
        for (let i = 0; i < numberDoors; i++) {
          let door = {
            ...new Entity(),
            ...RAWS.entities.door,
            ...this.getAcceptableCoordinateAsObject()
          };
  
          door.dimension = dimension;				//render door in correct
          door.render = {					//color for its dimension
              color: RAWS.dimensions[dimension]["bgColor"],
              symbol: "O"
          };

          if (!this.entities.isNullAt(door.x,door.y)
          || (!(door.x === this.player.get("x") && door.y === this.player.get("y"))
          && (this.entities.getIdAt(door.x,door.y) !== "potion"))) {
            
            if (!this.entities.isNullAt(door.x,door.y)
            && this.entities.getMonstrosityAt(door.x,door.y)) {
              this.relocateMonsterAtIdx(this.getEnemyAt(door.x, door.y));
            }
              
            this.entities.placeAt(door.x,door.y,door);
          }  
        } 
      }
    }
    this.doorsNotAppeared = false;
  },

  avoidEdges: function (axis, value) {
    let mapDimension = axis === RAWS.settings.cols ? RAWS.settings.cols : RAWS.settings.rows;
    
    if (value == 0) { return ++value;
    } else if (value == mapDimension) { return --value;
    } else { return value; }
  },
  
  checkForEntityWithIdAt: function (id, x, y) {
    if (!this.entities.isNullAt(x, y)
    && this.entities.getIdAt(x,y) === id) {
      return true;
    } 
    return false;
  },

  clearMonstersAroundPlayer: function() {
    for (let row = (this.player.get("x") - 1); row < (this.player.get("x") + 2); row++) {
      for (let col = (this.player.get("y") - 1); col < (this.player.get("y") + 2); col++) {
        if (!this.entities.isNullAt(row,col) && 
        this.entities.getPropOfEntityAt("isMonstrous", row, col)) {    
          this.relocateMonsterAtIdx(this.getEnemyAt(row, col));
        }
      }
    }
  },

  cookies: document.cookie,

  currentDimension: RAWS.dimensions.hp, //game always starts in hp dimension

  despawnEnemyAt: function(x, y) {
    this.entities.despawnEntityAt(x,y);
    this.enemies[this.getEnemyAt(x,y)].x = 
    this.enemies[this.getEnemyAt(x,y)].y = -1;
  },
  
  determineDirectionAndMoveEnemy: function(idx) {
    let newX = this.enemies[idx].x;
    let newY = this.enemies[idx].y;
	
    let randomMovementChoice = random(2);			//if two directions possible
								//monster randomly chooses
    
    if ((this.player.get("x") < this.enemies[idx].x) 		//case 1: player is
    && (this.player.get("y") < this.enemies[idx].y)) {		//upper-left from monster
      if (randomMovementChoice === 0) {
        newX -= 1;
      } else {
        newY -= 1;
      }

    } else if ((this.player.get("x") < this.enemies[idx].x) 	//case 2: player is
    && (this.player.get("y") === this.enemies[idx].y)) {	//above monster
      newX -= 1;

    } else if ((this.player.get("x") < this.enemies[idx].x) 	//case 3: player is
    && (this.player.get("y") > this.enemies[idx].y)) {		//upper-right from monster
      if (randomMovementChoice === 0) {
        newX -= 1;
      } else {
        newY += 1;
      }

    } else if ((this.player.get("x") === this.enemies[idx].x)	//case 4: player is 
    && (this.player.get("y") < this.enemies[idx].y)) {		//left of monster
      newY -= 1;

    } else if ((this.player.get("x") === this.enemies[idx].x)	//case 5: player is
    && (this.player.get("y") > this.enemies[idx].y)) {		//right of monster
      newY += 1;

   } else if ((this.player.get("x") > this.enemies[idx].x)	//case 6: player is 
   && (this.player.get("y") < this.enemies[idx].y)) {		//lower-left from monster
      if (randomMovementChoice === 0) {
        newX += 1;
      } else {
        newY -= 1;
      }

    } else if ((this.player.get("x") > this.enemies[idx].x)	//case 7: player is 
    && (this.player.get("y") === this.enemies[idx].y)) {	//below monster
      newX += 1;
    } else if ((this.player.get("x") > this.enemies[idx].x)	//case 8: player is 
    && (this.player.get("y") > this.enemies[idx].y)) {		//lower-right from monster
      if (randomMovementChoice === 0) {
        newX += 1;
      } else {
        newY += 1;
      }
    }

    this.moveEnemyTo(idx, newX, newY);
  },

  determinePlayerDirection: function() {
    let proposedX = this.player.get("x");
    let proposedY = this.player.get("y");
    
    if (RAWS.settings.keymap[keyPressed] === CONSTS.LEFT) {
      proposedY--;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.RIGHT) {
      proposedY++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.UP) {
      proposedX--;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.DOWN) {
      proposedX++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.DOWNRIGHT) {
      proposedX++;
      proposedY++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.DOWNLEFT) {
      proposedX++;
      proposedY--;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.UPRIGHT) {
      proposedX--;
      proposedY++;
    } else if (RAWS.settings.keymap[keyPressed] === CONSTS.UPLEFT) {
      proposedX--;
      proposedY--;
    }

    return {
     x: proposedX,
     y: proposedY
    };
  },

  dimensions: RAWS.dimensions,

  doorsEntered: 0,

  doorsNotAppeared: true,

  enemies: [],

  enemyAttacks: function (attacker) {
    const totalAttack = (random(20)
    * (1 + (this.doorsEntered * .2))) 				    //buff enemies more in successive dimensions
    + (this.currentDimension.id === "atk" ? (this.doorsEntered * .2) : 0); //+1 to atk in atk dimensions
 
    if (totalAttack > this.player.get("def")) {
      const damage = Math.floor(attacker.atk/2	//half of damage is guaranteed
      + random(attacker.atk/2)			//other half is random
      * (1 + (this.doorsEntered * .2)));	//buff enemies more in successive dimensions
      
      this.player.hpAdj(-damage);
 
      if (this.player.get("hp") < 1) {
        return false;
      }
    } else {
      VIEW.drawStatus("The " + attacker.id + " missed!");
    }
  
    return true;
  },
  
  enemyTypes: getListOfEntitiesWhere("isMonstrous", true),
  
  entities: [],
  
  getAcceptableCoordinateAsObjectWithParams: function (x1, x2, y1, y2) {
    let acceptable = false;
    this.acceptableTimeout = 0;		//protect against running while loop forever
    
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
    return this.getAcceptableCoordinateAsObjectWithParams(
      0, 
      this.map.rowLength(), 
      0, 
      this.map.colLength());
  },
  
  getEnemyAt: function (x,y) {						//linear search could be
    for (let i = 0; i < this.enemies.length; i++) {			//made a BST if performance
      if (this.enemies[i].x === x && this.enemies[i].y === y) {		//affected
        return i;
      }
    }
	return -1;
  },

  getHighScores: function () {
    const key = "highscores=";
    let score = "";

    if (this.cookies.length > 0 
    && this.cookies.search(key) !== -1) {
      let highscoresString = this.cookies.substring(
        this.cookies.search(key) 
        + key.length
      );
      let idx = 0;

      while (idx < this.cookies.length 
      && highscoresString[idx] !== ";") {
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
    const mapLimit = axis === CONSTS.COL 
    ? RAWS.settings.cols : RAWS.settings.rows;
    
    return this.avoidEdges(axis, random(mapLimit-1));
  },
  
  highscore: 0,
 
  initEnemies: function () {
    const retArr = [];
    
    for (let i = 0; i < this.enemyTypes.length; i++) {			//For each type of enemy...
      let numberEnemies = Math.floor(RAWS.settings.base_spawn_rate 	//Determine how many should spawn
      * this.enemyTypes[i].spawnRate) 
      * (1 + (this.doorsEntered * .2));					//More monsters in successive dimensions
 
        for (let j = 0; j < numberEnemies; j++) {
          retArr.push({ 
            ...new Entity(), 
            ...RAWS.entities[this.enemyTypes[i].id], 
            ...this.getAcceptableCoordinateAsObject() 
          });
        }
      }
    return retArr; 
  },

  initEntities: (function () {
    let e = initializeMatrix(RAWS.settings.rows,RAWS.settings.cols,null);

    return {
      isNullAt: function (x, y) {
        return e[x][y] === null;
      },
      despawnEntityAt: function (x, y) {
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
      },
      getPropOfEntityAt: function (prop, x, y) {
        if (e[x][y] !== null) {
          return e[x][y][prop];
        }
      }
    };
  })(),
  
  initPlayer: (function() {
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

  initMap: (function() {
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

  isNewHighScore: false,
  
  isSeen: [],
    
  keyPressed: -1,

  loop: function () {
    if (this.player.shards !== 0 	//chance of player randomly regenerating
    && this.player.shards % 7 == 0) {	//1 hp with each loop
      this.randomRegen();
    }
 
    let proposedMove = this.determinePlayerDirection();
    
    let monsterPresent, doorPresent = false;	//checks to prevent moving through obstacles
 
    for (let i = 0; i < this.enemyTypes.length; i++) {	//check for a monster at proposed
      monsterPresent = monsterPresent 			//move location. Consider using
      || this.checkForEntityWithIdAt(			//BST instead of linear search!
        this.enemyTypes[i].id, 
        proposedMove.x, 
        proposedMove.y
      );
    }

    if (monsterPresent) {				//if there's a monster, player
      monsterPresent = this.playerAttacks(		//attacks and monsterPresent
        this.enemies[this.getEnemyAt(			//updates in case monster is slain
          proposedMove.x,
          proposedMove.y
        )]
      );
    }
  
    if (!monsterPresent					//pick up shards 
    && this.checkForEntityWithIdAt(
      "shard",
      proposedMove.x,
      proposedMove.y
    )) {
      this.pickupShard(this.player);
    }
  
    if (!monsterPresent 				//pick up potions
    && this.checkForEntityWithIdAt(
      "potion",
      proposedMove.x,
      proposedMove.y
    )){
      this.pickupPotion();
    }
  
    if (!monsterPresent &&				//pick up restores 
    this.checkForEntityWithIdAt(
      "restore", 
      proposedMove.x, 
      proposedMove.y
    )) {
      this.pickupRestore();
    }

    if (!this.entities.isNullAt(proposedMove.x,proposedMove.y)	//move through door 
    && this.entities.getIdAt(proposedMove.x,proposedMove.y) === "door") {
      this.newDimensionFrom(proposedMove.x, proposedMove.y);
      doorPresent = true;
    }
    
    if (!monsterPresent && !doorPresent) {		//despawn any entities
      this.entities.despawnEntityAt(		//picked up by player
        proposedMove.x, 
        proposedMove.y); 
    } 
 
    if (!monsterPresent && !doorPresent	 		//else, move one square
    && this.map.at(proposedMove.x,proposedMove.y) 
      === RAWS.map.text.floor) {
      this.movePlayerTo(proposedMove.x,proposedMove.y);
    }
  
    if (!doorPresent) {					//monsters in range attack,
      for (let i = 0; i < this.enemies.length; i++) {   //other move toward player
        if (this.enemies[i].x > 0 
        && this.enemies[i].y > 0 
        && Math.abs(this.player.get("x") - this.enemies[i].x) < 2 
        && Math.abs(this.player.get("y") - this.enemies[i].y) < 2) {
          this.enemyAttacks(this.enemies[i]);
        } else {
          if ((this.enemies[i].id === "maxion"		//minions have a 5% chance 
            || random(20) > 1)				//of not moving toward player
          && this.monsterOnScreen(i)) {
            this.determineDirectionAndMoveEnemy(i);
          }	
        }	
      }
    }
  	
    if (this.player.get("hp") < 1) {			//check to see if player died
      this.player.hpAdj(
        Math.abs(this.player.get("hp"))			//create floor at 0 hp
      );
      this.play = false;
    }
 
    if (this.shardsCollectedOnLevel 			//open dimension doors if
      === this.shardsRequiredToAdvance	//enough shards collected
    && this.doorsNotAppeared) {
        this.appearDoors();
        VIEW.drawStatus("The shards have opened doors to other dimensions!");
    }

    this.updateTilesSeenByPlayer(
      this.player.get("viewDistance")
    );
  },
 
  map: [],
  
  maybeUpdateHighScores: function () {
    if (this.highscore < this.player.get("shards")) {
      this.highscore = this.player.get("shards");
      this.isNewHighScore = true;
    }
    document.cookie = 			//this code will need to
      "highscores=" 			//change if we ever store
      + this.highscore 			//more than just the high score
      + "; SameSite=Strict;";		//in cookies

  },

  monsterNotDespawned: function(idx) {
    return this.enemies[idx].x > 0 && this.enemies[idx].y > 0;
  },

  monsterOnScreen: function (i) {
    if ((this.enemies[i].x > (this.player.get("x") - (VIEW.rowsVisible/2))
      && this.enemies[i].x < (this.player.get("x") + (VIEW.rowsVisible/2)))
    && (this.enemies[i].y > (this.player.get("y") - (VIEW.colsVisible/2))
      && this.enemies[i].y < (this.player.get("y") + (VIEW.colsVisible/2)))) { 
      return true;
    }

    return false;
  },

  movePlayerTo: function (x,y) {
    this.entities.despawnEntityAt(
      this.player.get("x"),
      this.player.get("y")
    );
    this.entities.placeAt(x, y, this.player);
    this.player.updateCoords(x, y);
  },

  moveEnemyTo: function (idx,x,y) {
    if (this.monsterNotDespawned(idx) 
    && this.map.at(x,y) === RAWS.map.text.floor 
    && (this.entities.isNullAt(x,y) 
      || this.entities.getIdAt(x,y) === "shard")) {
      this.entities.despawnEntityAt(
        this.enemies[idx].x,
        this.enemies[idx].y
      );
   
      if (this.checkForEntityWithIdAt("shard",x,y)) {
        this.enemies[idx].shards++;
      }

      this.entities.placeAt(x,y, this.enemies[idx]);
		
      this.enemies[idx].x = x;
	  this.enemies[idx].y = y;
    }
  }, 

  noEntitiesOnSquare: function (x, y) {
    if (!this.entities.rowDefined(x) 
    && !this.entities.isNullAt(x, y)) {
      return false;
    }
    return true;
  },

  newDimensionFrom: function (x, y) {
    this.currentDimension = RAWS.dimensions[            //determine which dimension
     this.entities.getDimensionOfDoorAt(x, y)           //player stepped into
    ];

    this.doorsEntered++;
    this.potionsCollected = 0;
    this.doorsNotAppeared = true;
    this.shardsCollectedOnLevel = 0;
    
    this.map.generate();
    
    this.enemies = this.initEnemies();

    this.entities.clear();
    this.placeEntitiesOnMap();
  
    this.wasSeen = initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, false);
    
    this.spawnPlayer();
  },
  
  pickupPotion: function () {
    this.potionsCollected++;
    this.currentDimension.potionEffect();
    if (this.potionsCollected === RAWS.settings.potions_per_level) {
        VIEW.drawStatus("There are no more potions... in this realm.");
    }
  },
  
  pickupRestore: function() {
    this.player.hpAdj(this.player.get("base_hp")-this.player.get("hp"));
  },
  
  pickupShard: function (entity) {
    entity.picksUp("shards");
    if (entity.isPlayer) {
      this.shardsCollectedOnLevel++;
    }
  },
   
  placeEntitiesOnMap: function () {
    const potionsToGenerate = RAWS.settings.potions_per_level;

    let numberMapZones = RAWS.settings.potions_per_level;	//create 'zones' on map based on
    if (numberMapZones % 2 !== 0) { numberMapZones++; }		//how many potions should spawn
    let mapZoneRows = 2;	    
    let mapZoneCols = Math.floor(numberMapZones / mapZoneRows);
    let zoneWidth = Math.floor(RAWS.settings.cols / mapZoneCols);
    let zoneHeight = Math.floor(RAWS.settings.rows / mapZoneRows);
 
    for (let row = 0; row < mapZoneRows; row++) {		//for each zone, render a potion
      for (let col = 0; col < mapZoneCols; col++) {		//somewhere within zone bounds
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
          const dimColor = this.currentDimension.potionColor;		//render potions in the correct
          potion.render.color = dimColor;			//color for the current dimension
          this.entities.placeAt(potion.x,potion.y, potion);
          
          this.voronoiSites.push({x: potion.x, y: potion.y});   //save info to use later
          this.potionZoneParams.push({				//to spawn other things near potions
            x1: (zoneHeight * row),
            x2: ((zoneHeight * row) + (zoneHeight-1)),
            y1: (zoneWidth * col),
            y2: ((zoneWidth * col) + (zoneWidth-1))
  	  });
        }
      }

    }

    let voronoi = new Voronoi();				//convert potion spawn zones
								//into a voronoi hive map
    let bbox = { 
      x1: 0, 
      xr: RAWS.settings.rows-1, 
      yt: 0, 
      rb: RAWS.settings.cols-1 
    };

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
    
    for (let site = 0; site < this.voronoiSites.length; site++) {	//divide target number
      const numberShards = (RAWS.settings.base_spawn_rate               //of shards between
      * RAWS.entities.shard.spawnRate) / this.voronoiSites.length;      //potion spawn zones
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
  
    
        if (isInVoronoiCell(						//throw out shards
          shard.x, 							//outside of voronoi cell
 	  shard.y, 
 	  this.voronoiSites[site].x, 
	  this.voronoiSites[site].y, 
	  this.voronoiDiagram
        )) {
          if (this.entities.isNullAt(shard.x,shard.y)
          || this.entities.getIdAt(shard.x,shard.y) !== "potion"){
            this.entities.placeAt(shard.x,shard.y,shard);
          }
        } 
      }
    }

    const numberRestore = RAWS.settings.base_spawn_rate			//spawn restore orbs
    * RAWS.entities.restore.spawnRate;					//(not dependent on potions)
  
    for (let i = 0; i < numberRestore; i++) {
      const restore = {
          ...new Entity(),
          ...RAWS.entities.restore,
          ...this.getAcceptableCoordinateAsObject()
      }
  
      this.entities.placeAt(restore.x,restore.y,restore);
    }
    
    for (let i = 0; i < this.enemies.length; i++) {			//spawn monsters
      this.entities.placeAt(
        this.enemies[i].x,
        this.enemies[i].y, 
        this.enemies[i]
      );
    }    
  },

  play: true,
  
  player: {},

  playerAttacks: function (defender) {
    if (defender.canFight()) {
      
      const totalDefense = (defender.def
      * (1 + this.doorsEntered * .2))           //buff enemies more in successive dimensions
      + (this.currentDimension.id === "def" ? 1 : 0);  //+1 to def in def dimensions 

      const totalAttack = random(20)
      + (this.player.get("atk") - RAWS.entities.player.atk); //roll d20, add atk - base atk
   
      if (totalAttack > totalDefense) {
        const damage = Math.floor(this.player.get("atk")/2) //half of damage is guaranteed  
        + random(Math.ceil(this.player.get("atk")/2));      //other half is random
        
        defender.hp -= damage;
  
        if (defender.hp < 1) {
          this.despawnEnemyAt(defender.x, defender.y); 
    
          if (random(2)) { this.player.lucky(); } //50% chance of lucky effect on victory
    
          for (let i = 0; i < defender.shards; i++) {
            this.pickupShard(this.player); //player picks up defenders shards     
          }
    
          return false;
        }
      } else {
        VIEW.drawStatus("You missed!");
      }
    
      return true;
    }
  },

  potionsCollected: 0,

  potionZoneParams: [],
  
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
        this.entities.despawnEntityAt(
          this.enemies[i].x,
          this.enemies[i].y);
  
        this.enemies[i].x = x;
        this.enemies[i].y = y;
  
        this.entities.placeAt(x,y,this.enemies[i]);
        acceptablePlacement = true;
      }
    }
  },

  shardsRequiredToAdvance: -1,

  startView: function () {
    let interval = setInterval(function() {
      VIEW.refreshScreen( 
        GAME.map,
        GAME.currentDimension,
        GAME.entities, 
        GAME.player.get("x"), 
        GAME.player.get("y")
      )}, 
      (1000 / RAWS.settings.fps)
    );
  },

  spawnPlayer: function() {
    let playerPlacementSuccessful = false;
    let timeout = 0;

    while (!playerPlacementSuccessful 
    && timeout < 100000) {

      const startingCoords = this.getAcceptableCoordinateAsObject();

      if (startingCoords.x - this.player.get("viewDistance") > 0
      && startingCoords.x + this.player.get("viewDistance") < this.map.rowLength()
      && startingCoords.y - this.player.get("viewDistance") > 0
      && startingCoords.y + this.player.get("viewDistance") < this.map.colLength()) {

        this.player.updateCoords(
          startingCoords.x, 
          startingCoords.y
        ); 
    
        playerPlacementSuccessful = true;
      } else {
        timeout++;
      }
    }

    if (!playerPlacementSuccessful) {
      console.log("Critical error: could not place player!");
    } else {
      this.entities.placeAt(this.player.get("x"), this.player.get("y"), this.player);
    }
  },

  start: async function () {

    VIEW.checkForMobileDevice();

    this.map = this.initMap;
 
    this.player = this.initPlayer;
    this.enemies = this.initEnemies();
    this.entities = this.initEntities;
    this.entities.clear();
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
    
    VIEW.setMaskOpacity(VIEW.maskOpacity);
    this.maybeUpdateHighScores();
    
    let endString = "You died. ";

    if (this.isNewHighScore) {
      endString = endString + "New high score though!";
    }
      
    VIEW.drawStatus(endString);
    
    clearInterval();
  },

  shardsCollectedOnLevel: 0,
  
  updateTilesSeenByPlayer: function () {
    this.isSeen = initializeMatrix(
      RAWS.settings.rows, 
      RAWS.settings.cols, 
      false
    );

    let oneWayViewDist = 
      Math.floor(this.player.get("viewDistance")/2);
    
    let row = this.player.get("x") - oneWayViewDist;
    let rowMax = row + this.player.get("viewDistance");

    let col = this.player.get("y") - oneWayViewDist;
    let colMax = this.player.get("y") + oneWayViewDist;

    for (row; row < rowMax; row++) {				//mark tiles around player
      for (col; col < colMax; col++) {				//as seen
        if (this.map.rowsAreDefined
        && typeof this.map.at(row,col) !== 'undefined') {
          this.isSeen[row][col] = true;
          if (this.wasSeen[row][col] === false) {
            this.wasSeen[row][col] = true;			//update wasSeen too!
          }
        }
      }
      col = this.player.get("y") - oneWayViewDist;
    }
  },
  
  voronoiDiagram: {},
  
  voronoiSites: [], 

  wasSeen: initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, false)
};
