const GAME = {

  attack: function () {

    if (aggressor.canFight() && defender.canFight()) {
  
      let atkBonus = 0;
    
      if (aggressor.id === "minion" || aggressor.id === "maxion") {
        //atkBonus not working after refactor. Redesign!
        atkBonus = Math.ceil(level/4);
      } else {
        atkBonus = Math.ceil(aggressor.atk/5);
      }
      let atkRoll = random(20);
   
      let defenderHit = atkRoll > defender.def;
      if (defenderHit) {
        let dmgToDefender = Math.floor(aggressor.atk/2) 
        + random(Math.ceil(aggressor.atk/2));
        
        defender.hp -= dmgToDefender;
  
        if (defender.hp < 1) {
          let type = defender.id;
    
          entityMatrix[defender.x][defender.y] = null;
          defender.x = -1;
          defender.y = -1;
    
          if (random(2) < 1 && aggressor.isLucky()) {
            aggressor.lucky();
          }
    
          for (let i = 0; i < defender.shards; i++) {
            aggressor.shards++;     
          }
    
          return false;
        }
      } else {
        if (aggressor === player) {
          VIEW.drawStatus("You missed!");
        } else if (aggressor.id === "minion") {
          VIEW.drawStatus("The minion missed!");
        } else if (aggressor.id === "maxion") {
          VIEW.drawStatus("The Maxion missed!");
        }
      }
    
      return true;
    }
  },

  avoidWalls: function (axis, value) {
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
    if (entityMatrix[x][y] !== null
    && entityMatrix[x][y].id === "restore") {
      return true;
    }
    return false;
  },

  checkForMonsters: function (x,y) {
    if (entityMatrix[x][y] !== null
    && entityMatrix[x][y].isMonstrous) {
	  return true;
    }
    return false;
  },

 checkForPotions: function (x,y) {
    if (entityMatrix[x][y] !== null
    && entityMatrix[x][y].id === "potion") {
      return true;
    }
    return false;
  },

  checkForShards: function (x,y) {
    if (entityMatrix[x][y] !== null
    && entityMatrix[x][y].id === "shard") {
      return true;
    }
    return false;
  },

  clearMonstersAroundPlayer: function() {
    //Get rid of any monsters right next to player
    for (let row = (player.x - 1); row < (player.x + 2); row++) {
      for (let col = (player.y - 1); col < (player.y + 2); col++) {
        if (entityMatrix[row][col] !== null && 
        (entityMatrix[row][col].id === "minion" 
        || entityMatrix[row][col].id === "maxion")) {    
          relocateMonsterAtIdx(getEnemyAt(row, col));
        }
      }
    }
  },

  cookies: document.cookie,
  
  enemies: (function() {
    const retArr = [];
    
    const enemyTypes = getListOfEntitiesWhere("isMonstrous", true);
  
    for (let i = 0; i < enemyTypes.length; i++) {
      const numberEnemies = Math.floor(RAWS.settings.base_spawn_rate 
        * enemyTypes[i].spawnRate);
      for (let j = 0; j < numberEnemies; j++) {
        retArr.push({ 
          ...new Entity(), 
          ...RAWS.entities[enemyTypes[i].id], 
          ...getAcceptableCoordinateAsObject() 
        });
      }
    }
    return retArr; 
  })(),

  enemyMoves: function() {
    let randomMovementChoice = random(2);
  	
    if ((player.x < enemies[idx].x) && (player.y < enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        moveEnemyTo(idx, (enemies[idx].x - 1),(enemies[idx].y));
      } else {
        moveEnemyTo(idx, (enemies[idx].x),(enemies[idx].y - 1));
      }
    } else if ((player.x < enemies[idx].x) && (player.y === enemies[idx].y)) {
      moveEnemyTo(idx, (enemies[idx].x - 1), enemies[idx].y);
    } else if ((player.x < enemies[idx].x) && (player.y > enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        moveEnemyTo(idx, (enemies[idx].x - 1),(enemies[idx].y));
      } else {
        moveEnemyTo(idx, (enemies[idx].x),(enemies[idx].y + 1));
      }
    } else if ((player.x === enemies[idx].x) && (player.y < enemies[idx].y)) {
      moveEnemyTo(idx, enemies[idx].x, (enemies[idx].y - 1));
    } else if ((player.x === enemies[idx].x) && (player.y > enemies[idx].y)) {
      moveEnemyTo(idx, enemies[idx].x, (enemies[idx].y + 1));
   } else if ((player.x > enemies[idx].x) && (player.y < enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        moveEnemyTo(idx, (enemies[idx].x + 1),(enemies[idx].y));
      } else {
        moveEnemyTo(idx, (enemies[idx].x),(enemies[idx].y - 1));
      }
    } else if ((player.x > enemies[idx].x) && (player.y === enemies[idx].y)) {
      moveEnemyTo(idx, (enemies[idx].x + 1), enemies[idx].y);
    } else if ((player.x > enemies[idx].x) && (player.y > enemies[idx].y)) {
      if (randomMovementChoice === 0) {
        moveEnemyTo(idx, (enemies[idx].x + 1),(enemies[idx].y));
      } else {
        moveEnemyTo(idx, (enemies[idx].x),(enemies[idx].y + 1));
      }
    }
  },

  entityMatrix: (function() {
    const retMatrix = initializeMatrix(map.length,map[0].length,null);
  
    const numberShards = RAWS.settings.base_spawn_rate 
    * RAWS.entities.shard.spawnRate;
   
    for (let i = 0; i < numberShards; i++) {
      const shard = {
          ...new Entity(),
          ...RAWS.entities.shard,
          ...getAcceptableCoordinateAsObject()
      }
  
      retMatrix[shard.x][shard.y] = shard;
    }
    
    const numberRestore = RAWS.settings.base_spawn_rate
    * RAWS.entities.restore.spawnRate;
  
    for (let i = 0; i < numberRestore; i++) {
      const restore = {
          ...new Entity(),
          ...RAWS.entities.restore,
          ...getAcceptableCoordinateAsObject()
      }
  
      retMatrix[restore.x][restore.y] = restore;
    }
     
    const numberPotions = RAWS.settings.base_spawn_rate * RAWS.entities.potion.spawnRate;
    for (let i = 0; i < numberPotions; i++) {
      const potion = {
          ...new Entity(),
          ...RAWS.entities.potion,
          ...getAcceptableCoordinateAsObject()
      }
      
      retMatrix[potion.x][potion.y] = potion;
    }
  
    for (let i = 0; i < enemies.length; i++) {
      retMatrix[enemies[i].x][enemies[i].y] = enemies[i];
    }    
   
    retMatrix[player.x][player.y] = player;
  
    return retMatrix;
  })(),
 
  getAcceptableCoordinateAsObject: function () {
    const acceptable = false;
    const coordsArr = [-1, -1];

    while (!acceptable) {
      coordsArr[0] = getRandomCoordinate(map.length);
      coordsArr[1] = getRandomCoordinate(map[0].length);

      if (map[coordsArr[0]][coordsArr[1]] === RAWS.map.text.floor) {
        acceptable = true;
      }
    }
    
    return {
      x: coordsArr[0],
      y: coordsArr[1]
    }
  },
  
  getEnemyAt: function (x,y) {
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].x === x && enemies[i].y === y) {
        return i;
      }
    }
	return -1;
  },

  getHighScores: function () {
    const key = "highscores=";
    let score = "";

    if (cookies.length > 0 && cookies.search(key) !== -1) {
      let highscoresString = cookies.substring(cookies.search(key) + key.length);
      let idx = 0;

      while (idx < cookies.length && highscoresString[idx] !== ";") {
        score += highscoresString[idx];
        idx++;
      }

      highscores = parseInt(score);
    } else {
      highscores = 0;
    }
  },

  getRandomCoordinate: function (axis) {
    let mapLimit = ROWS;

    if  (axis === COLS) {
      mapLimit = COLS;
    }
    return avoidWalls(axis, random(mapLimit-1));
  },
  
  highscore: getHighScores(),
  
  isNewHighScore: false,
    
  keyPressed: -1,

  loop: function () {
    if (player.shards !== 0 &&
      player.shards % 7 == 0) {
      randomRegen();
    }
  
    //Get coordinates of proposed player move
    let proposedPlayerX = player.x;
    let proposedPlayerY = player.y;
    
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
    if (checkForMonsters(proposedPlayerX,proposedPlayerY)) {
      monsterPresent = attack(
        player, 
        enemies[getEnemyAt(proposedPlayerX,proposedPlayerY)]
      );
    }
  
    if (!monsterPresent 
    && checkForShards(proposedPlayerX,proposedPlayerY)) {
      entityMatrix[proposedPlayerX][proposedPlayerY] = null;
      RAWS.entities.shard.onConsume(player);
    }
  
    if (!monsterPresent 
    && checkForPotions(proposedPlayerX,proposedPlayerY)){
      pickupPotion();
      entityMatrix[proposedPlayerX][proposedPlayerY] = null;
    }
  
    if (!monsterPresent && 
    checkForBuffs(proposedPlayerX, proposedPlayerY)) {
      pickupBuff();
      entityMatrix[proposedPlayerX][proposedPlayerY] = null;
    }
  
    if (!monsterPresent && !moveDownStairs 
    && map[proposedPlayerX][proposedPlayerY] !== RAWS.map.text.wall) {
      movePlayerTo(proposedPlayerX,proposedPlayerY);
    }
  
    //Check for enemies next to player
    //Those enemies attack, others move toward player
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].x > 0 && enemies[i].y > 0 
      && Math.abs(player.x - enemies[i].x) < 2 
      && Math.abs(player.y - enemies[i].y) < 2) {
        attack(enemies[i],player);
      } else {
        if (enemies[i].id === "maxion" || random(20) > 1) {
          enemyMoves(i);
        }	
      }	
    }
  	
    //Check to see if player has died during the loop
    if (player.hp < 1) {
      player.hp = 0;
      play = false;
      VIEW.drawStatus("You died.");
    }
  
    VIEW.refreshScreen(map,entityMatrix,player.x,player.y);
  },

  map: generateLevel(),

  maybeUpdateHighScores: function () {
    if (highscores < player.shards) {
      highscores = player.shards;
      isNewHighScore = true;
    }
    
    document.cookie = "highscores=" + highscores 
      + "; SameSite=Strict;";
  },

  movePlayerTo: function (x,y) {
    entityMatrix[player.x][player.y] = null;
    entityMatrix[x][y] = player;
    player.x = x;
    player.y = y;
  },

  moveEnemyTo: function (idx,x,y) {
    if (enemies[idx].x > 0 && enemies[idx].y > 0 
    && map[x][y] === RAWS.map.text.floor 
    && entityMatrix[x][y] === null) {
      entityMatrix[enemies[idx].x][enemies[idx].y] = null;
	  if (checkForShards(x,y)) {
	    enemies[idx].shards++;
	  }

      entityMatrix[x][y] = enemies[idx];
		
      enemies[idx].x = x;
	  enemies[idx].y = y;
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
    player.hp = player.base_hp;
  },
  
  pickupPotion: function () {
  },
  
  pickupShard: function (entity) {
    if (entity.holdsShards()) {
      entity.shards++;
    }
  },
   
  play: true,
  
  player: {
    ...new Entity(), 
    ...RAWS.entities.player, 
    ...getAcceptableCoordinateAsObject() 
  },

  randomRegen: function () {
    if (player.hp < player.base_hp) {
      player.hp++;
      VIEW.drawStatus("You feel a benevolent presence! 1 HP gained.");
    }
  },

  relocateMonsterAtIdx: function (i) {
    let acceptablePlacement = false;
  
    while (!acceptablePlacement) {
      let x = getRandomCoordinate(ROWS);
      let y = getRandomCoordinate(COLS);
  
      if (map[x][y] === RAWS.map.text.floor 
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
       
    setInterval(
      VIEW.refreshScreen(
        map, 
        entityMatrix, 
        player.x, 
        player.y
      ), 
      (1000 / RAWS.settings.fps));
    
    while (play) {
      await CONTROLLER.waitingKeypress();
    
      if (keyPressed > 0) {
        loop();
      }	
    }
    
    maybeUpdateHighScores();
      
    if (isNewHighScore) {
      VIEW.drawStatus("New high score!");
    }
    
    clearInterval();
  },
};
