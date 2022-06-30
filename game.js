const GAME = {

  dimension: RAWS.dimensions.hp,

  playerAttack: function (defender) {
    if (defender.canFight()) {
  
      let atkRoll = random(20);
   
      let defenderHit = atkRoll > defender.def;
      if (defenderHit) {
        let dmgToDefender = Math.floor(this.player.get("atk")/2) 
        + random(Math.ceil(this.player.get("atk")/2));
        
        defender.hp -= dmgToDefender;
  
        if (defender.hp < 1) {
          let type = defender.id;
    
          this.entityMatrix[defender.x][defender.y] = null;
          defender.x = -1;
          defender.y = -1;
    
          if (random(2)) {
            this.player.lucky();
          }
    
          for (let i = 0; i < defender.shards; i++) {
            this.player.picksUp(shard);     
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
  
    let atkRoll = random(20);
 
    let defenderHit = atkRoll > this.player.get("def");
    if (defenderHit) {
      let dmgToDefender = Math.floor(attacker.atk/2) 
      + random(Math.ceil(attacker.atk/2));
      
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
    let mapDimension = ROWS - 1;
  
    if (axis === COLS) {
      mapDimension = COLS - 1;
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
    if (this.entityMatrix[x][y] !== null
    && this.entityMatrix[x][y].id === "restore") {
      return true;
    }
    return false;
  },

  checkForMonsters: function (x,y) {
    if (this.entityMatrix[x][y] !== null
    && this.entityMatrix[x][y].isMonstrous) {
	  return true;
    }
    return false;
  },

 checkForPotions: function (x,y) {
    if (this.entityMatrix[x][y] !== null
    && this.entityMatrix[x][y].id === "potion") {
      return true;
    }
    return false;
  },

  checkForShards: function (x,y) {
    if (this.entityMatrix[x][y] !== null
    && this.entityMatrix[x][y].id === "shard") {
      return true;
    }
    return false;
  },

  clearMonstersAroundPlayer: function() {
    //Get rid of any monsters right next to player
    for (let row = (this.player.get("x") - 1); row < (this.player.get("x") + 2); row++) {
      for (let col = (this.player.get("y") - 1); col < (this.player.get("y") + 2); col++) {
        if (this.entityMatrix[row][col] !== null && 
        (this.entityMatrix[row][col].id === "minion" 
        || this.entityMatrix[row][col].id === "maxion")) {    
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
      const numberEnemies = Math.floor(RAWS.settings.base_spawn_rate 
        * enemyTypes[i].spawnRate);
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

  initializeEntityMatrix: function () {
    const retMatrix = initializeMatrix(this.map.length,this.map[0].length,null);

    for (dimension in RAWS.dimensions) {
      if (dimension !== this.dimension) {
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
              color: RAWS.dimensions[dimension]["potionColor"],
              symbol: " "
          };
          retMatrix[door.x][door.y] = door;
        } 
      }
    }
    
    const numberShards = RAWS.settings.base_spawn_rate 
    * RAWS.entities.shard.spawnRate;
   
    for (let i = 0; i < numberShards; i++) {
      const shard = {
          ...new Entity(),
          ...RAWS.entities.shard,
          ...this.getAcceptableCoordinateAsObject()
      };
 
      if (retMatrix[shard.x][shard.y] !== null 
      && retMatrix[shard.x][shard.y].id !== "door") {
        retMatrix[shard.x][shard.y] = shard;
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
  
      if (retMatrix[restore.x][restore.y] !== null 
      && retMatrix[restore.x][restore.y].id !== "door") {
        retMatrix[restore.x][restore.y] = restore;
      }
    }
     
    const numberPotions = RAWS.settings.base_spawn_rate * RAWS.entities.potion.spawnRate;
    for (let i = 0; i < numberPotions; i++) {
      const potion = {
          ...new Entity(),
          ...RAWS.entities.potion,
          ...this.getAcceptableCoordinateAsObject()
      }
  
      potion.render.color = this.dimension.potionColor;

      if (retMatrix[potion.x][potion.y] !== null 
      && retMatrix[potion.x][potion.y].id !== "door") {
        retMatrix[potion.x][potion.y] = potion;
      }
    }
  
    for (let i = 0; i < this.enemies.length; i++) {
      if (retMatrix[this.enemies[i].x][this.enemies[i].y] !== null 
      && retMatrix[this.enemies[i].x][this.enemies[i].y].id !== "door") {
        retMatrix[this.enemies[i].x][this.enemies[i].y] = this.enemies[i];
      }
    }    
   
    retMatrix[this.player.get("x")][this.player.get("y")] = this.player;
  
    return retMatrix;
  },
 
  getAcceptableCoordinateAsObject: function () {
    let acceptable = false;
    const coordsArr = [-1, -1];

    while (!acceptable) {
      coordsArr[0] = this.getRandomCoordinate(this.map.length);
      coordsArr[1] = this.getRandomCoordinate(this.map[0].length);

      if (this.map[coordsArr[0]][coordsArr[1]] === RAWS.map.text.floor) {
        acceptable = true;
      }
    }
    
    return {
      x: coordsArr[0],
      y: coordsArr[1]
    };
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

  getRandomCoordinate: function (axis) {
    let mapLimit = ROWS;

    if  (axis === COLS) {
     mapLimit = COLS;
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
    let moveDownStairs = false;
  
    //Complete player's move based on what's in the proposed move square
    if (this.checkForMonsters(proposedPlayerX,proposedPlayerY)) {
      monsterPresent = this.playerAttack(
        this.enemies[this.getEnemyAt(proposedPlayerX,proposedPlayerY)]
      );
    }
  
    if (!monsterPresent 
    && this.checkForShards(proposedPlayerX,proposedPlayerY)) {
      this.entityMatrix[proposedPlayerX][proposedPlayerY] = null;
      this.pickupShard(this.player);
    }
  
    if (!monsterPresent 
    && this.checkForPotions(proposedPlayerX,proposedPlayerY)){
      this.pickupPotion();
      this.entityMatrix[proposedPlayerX][proposedPlayerY] = null;
    }
  
    if (!monsterPresent && 
    this.checkForBuffs(proposedPlayerX, proposedPlayerY)) {
      this.pickupBuff();
      this.entityMatrix[proposedPlayerX][proposedPlayerY] = null;
    }
  
    if (!monsterPresent && !moveDownStairs 
    && this.map[proposedPlayerX][proposedPlayerY] !== RAWS.map.text.wall) {
      this.movePlayerTo(proposedPlayerX,proposedPlayerY);
    }
  
    //Check for enemies next to player
    //Those enemies attack, others move toward player
    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].x > 0 && this.enemies[i].y > 0 
      && Math.abs(this.player.get("x") - this.enemies[i].x) < 2 
      && Math.abs(this.player.get("y") - this.enemies[i].y) < 2) {
        this.monsterAttack(this.enemies[i]);
      } else {
        if (this.enemies[i].id === "maxion" || random(20) > 1) {
          this.enemyMoves(i);
        }	
      }	
    }
  	
    //Check to see if player has died during the loop
    if (this.player.get("hp") < 1) {
      this.player.hpAdj(Math.abs(this.player.get("hp")));
      this.play = false;
      VIEW.drawStatus("You died.");
    }
  
    VIEW.refreshScreen(this.map,this.dimension,this.entityMatrix,this.player.get("x"),this.player.get("y"));
  },

  map: generateLevel(),

  maybeUpdateHighScores: function () {
    if (this.highscore < this.player.shards) {
      this.highscore = this.player.shards;
      this.isNewHighScore = true;
    }
    
    document.cookie = "highscores=" + this.highscore 
      + "; SameSite=Strict;";
  },

  movePlayerTo: function (x,y) {
    this.entityMatrix[this.player.get("x")][this.player.get("y")] = null;
    this.entityMatrix[x][y] = this.player;
    this.player.updateCoords(x, y);
  },

  moveEnemyTo: function (idx,x,y) {
    if (this.enemies[idx].x > 0 && this.enemies[idx].y > 0 
    && this.map[x][y] === RAWS.map.text.floor 
    && this.entityMatrix[x][y] === null) {
      this.entityMatrix[this.enemies[idx].x][this.enemies[idx].y] = null;
	  if (this.checkForShards(x,y)) {
	    this.enemies[idx].shards++;
	  }

      this.entityMatrix[x][y] = this.enemies[idx];
		
      this.enemies[idx].x = x;
	  this.enemies[idx].y = y;
    }
  }, 

  noEntitiesOnSquare: function (checkX, checkY) {
    if (entityMatrix[checkX] !== undefined 
    && entityMatrix[checkX][checkY] !== null) {
      return false;
    }
    return true;
  },

  pickupBuff: function() {
    this.player.hpAdj(this.player.get("base_hp")-this.player.get("hp"));
  },
  
  pickupPotion: function () {
    this.dimension.potionEffect();
  },
  
  pickupShard: function (entity) {
    entity.picksUp("shards");
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

  randomRegen: function () {
    if (this.player.get("hp") < this.player.get("base_hp")) {
      this.player.hpAdj(1);
      VIEW.drawStatus("You feel a benevolent presence! 1 HP gained.");
    }
  },

  relocateMonsterAtIdx: function (i) {
    let acceptablePlacement = false;
  
    while (!acceptablePlacement) {
      let x = getRandomCoordinate(ROWS);
      let y = getRandomCoordinate(COLS);
  
      if (this.map[x][y] === RAWS.map.text.floor 
      && noEntitiesOnSquare(x, y)) {
        entityMatrix[enemies[i].x][enemies[i].y] = null;
  
        enemies[i].x = x;
        enemies[i].y = y;
  
        entityMatrix[x][x] = enemies[i];
        acceptablePlacement = true;
      }
    }
  },
  
  start: async function () {

    //TODO: add this back in after new VIEW is complete
    //checkForMobileDevice();

    this.map = generateLevel(); 
    this.player = this.initializePlayer;

    const startingCoords = this.getAcceptableCoordinateAsObject();

    this.player.updateCoords(startingCoords.x, startingCoords.y); 
    this.enemies = this.populateEnemies();
    this.entityMatrix = this.initializeEntityMatrix();
    this.highScore = this.getHighScores(); 
    setInterval(
      VIEW.refreshScreen(
        this.map,
        this.dimension,
        this.entityMatrix, 
        this.player.get("x"), 
        this.player.get("y")
      ), 
      (1000 / RAWS.settings.fps));
    
    while (this.play) {
      await CONTROLLER.waitingKeypress();
    
      if (keyPressed > 0) {
        GAME.loop();
      }	
    }
    
    this.maybeUpdateHighScores();
      
    if (this.isNewHighScore) {
      VIEW.drawStatus("New high score!");
    }
    
    clearInterval();
  },
};
