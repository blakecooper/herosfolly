const game = (function() {

  //move this to utils
  if (typeof Object.beget !== 'function') {
    Object.beget = function (o) {
      let F = function () {};
      F.prototype = o;
      return new F();
    };
  }

  const map = generateLevel();
  
  //Locate player on map
  const playerCoords = getAcceptableCoordinate();
  player.x = playerCoords[0];
  player.y = playerCoords[1];

  const enemies = (function() {
    const retArr = [];

    for (let i = 0; i < ENEMIES.length; i++) {
      const numberEnemies =
      Math.floor(SPAWN.enemy.number * ENEMIES[i].spawnRate);
      for (let j = 0; j < numberEnemies; j++) {
        const enemy = Object.beget(ENEMIES[i]);
        const coords = getAcceptableCoordinate();
        enemy.x = coords[0];
        enemy.y = coords[1];
        retArr.push(enemy); 
      }
    }

    return retArr; 
  })();
  
  //this is to initialize... how to refresh? Track monster locations before moves/attacks, then check every monster that moved and update? Or just flash it every time?
  const entityMatrix = (() => {
    const matrix = initializeMatrix(map.length,map[0].length,"&nbsp");

    matrix[player.x][player.y] = player.renderable.symbol;

    for (let i = 0; i < enemies.length; i++) {
      matrix[enemies[i].x][enemies[i].y] = enemies[i].renderable.symbol;
    }    
 
    for (let i = 0; i < SPAWN.shards.number; i++) {
      const coords = getAcceptableCoordinate();

      matrix[coords[0]][coords[1]] = SHARD.renderable.symbol;
    }
  });
  
  function getAcceptableCoordinate() {
    let acceptable = false;
    let coordsArr = [-1, -1];

    while (!acceptable) {
      coordsArr[0] = getRandomCoordinate(map.length);
      coordsArr[1] = getRandomCoordinate(map[0].length);

      if (map[coordsArr[0]][coordsArr[1]] === MAP.text.floor) {
        acceptable = true;
      }
    }
    return coordsArr;
  }
  
  const cookies = document.cookie;

  function getCookies() {
    return this.cookies;
  }

  //initialize by retrieving directly
  const highscore = getHighScores();
  
  let isNewHighScore = false;
    
  let keyPressed = -1;
  let play = true;
  
  function attack(aggressor, defender) {
    let atkBonus = 0;
  
    if (aggressor.TYPE === MINION || aggressor.TYPE === MAXION) {
      atkBonus = Math.ceil(level/4);
    } else {
      atkBonus = Math.ceil(aggressor.ATK/5);
    }
    
    let defenderHit = (random(20) + atkBonus) > defender.DEF;
  
    if (defenderHit) {
      let dmgToDefender = Math.floor(aggressor.ATK/2) + random(Math.ceil(aggressor.ATK/2));
      defender.HP -= dmgToDefender;
      if (defender.HP < 1) {
        let type = defender.TYPE;
  
        if (type === "M") {
          type = "m";
        }
        Matrix[type][defender.X][defender.Y] = SPACE;
        defender.X = -1;
        defender.Y = -1;
  
        if (random(2) < 1 && aggressor.HP < aggressor.BASE_HP) {
          aggressor.HP++;
        }
  
        for (let i = 0; i < defender.SHARDS; i++) {
          pickupShard(aggressor);     
        }
  
        return false;
      }
    } else {
      if (aggressor === player) {
        drawStatus("You missed!");
      } else if (aggressor.TYPE === MINION) {
        drawStatus("The minion missed!");
      } else if (aggressor.TYPE === MAXION) {
        drawStatus("The Maxion missed!");
      }
    }
  
    return true;
  }
  
  function buildLevel() {
    spawnExit();
  
  
  
    //Get rid of any monsters right next to player
    for (let row = (player.X - 1); row < (player.X + 2); row++) {
      for (let col = (player.Y - 1); col < (player.Y + 2); col++) {
        if (Matrix[MINION][row][col] === MINION || Matrix[MINION][row][col] === MAXION) {
          
          relocateMonsterAtIdx(getEnemyAt(row, col));
        }
      }
    }
  
  
    if (random(10) < 1) {
      spawnBuffs();
    } 
  	
  }
  
  function clearShards() {
    player.SHARDS += shardsOnLevel;
    shardsOnLevel = 0;
    Matrix[SHARD] = initializeMatrix(ROWS, COLS, SPACE);
    player.ATK++;
    drawStatus("Level cleared! ATK up!");

  function getMap() {
    return map;
  }

  }
  
  function enemyMoves(idx) {
  
  	let randomMovementChoice = random(2);
  	
  	if ((player.X < enemies[idx].X) && (player.Y < enemies[idx].Y)) {
  		if (randomMovementChoice === 0) {
  			moveEnemyTo(idx, (enemies[idx].X - 1),(enemies[idx].Y));
  		} else {
  			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y - 1));
  		}
  	} else if ((player.X < enemies[idx].X) && (player.Y === enemies[idx].Y)) {
  		moveEnemyTo(idx, (enemies[idx].X - 1), enemies[idx].Y);
  	} else if ((player.X < enemies[idx].X) && (player.Y > enemies[idx].Y)) {
  		if (randomMovementChoice === 0) {
  			moveEnemyTo(idx, (enemies[idx].X - 1),(enemies[idx].Y));
  		} else {
  			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y + 1));
  		}
  	} else if ((player.X === enemies[idx].X) && (player.Y < enemies[idx].Y)) {
  		moveEnemyTo(idx, enemies[idx].X, (enemies[idx].Y - 1));
  	} else if ((player.X === enemies[idx].X) && (player.Y > enemies[idx].Y)) {
  		moveEnemyTo(idx, enemies[idx].X, (enemies[idx].Y + 1));
  	} else if ((player.X > enemies[idx].X) && (player.Y < enemies[idx].Y)) {
  		if (randomMovementChoice === 0) {
  			moveEnemyTo(idx, (enemies[idx].X + 1),(enemies[idx].Y));
  		} else {
  			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y - 1));
  		}
  	} else if ((player.X > enemies[idx].X) && (player.Y === enemies[idx].Y)) {
  		moveEnemyTo(idx, (enemies[idx].X + 1), enemies[idx].Y);
  	} else if ((player.X > enemies[idx].X) && (player.Y > enemies[idx].Y)) {
  		if (randomMovementChoice === 0) {
  			moveEnemyTo(idx, (enemies[idx].X + 1),(enemies[idx].Y));
  		} else {
  			moveEnemyTo(idx, (enemies[idx].X),(enemies[idx].Y + 1));
  		}
  	}
  }
  
  function getDroppedShards() {
  	let key = "hoarderType=";
  	let type = ""
  	if (cookies.length > 0) {
  		if (cookies.search(key) !== -1) {
  			let str = cookies.substring(cookies.search(key) + key.length);
  			let idx = 0;
  			while (idx < cookies.length && str[idx]!==";") {
  				type += str[idx];
  				idx++;	
  			}
  
  			typeMonsterKilledPlayer = type;
  		}
  
  		key = "hoarderLevel=";
  		let lvl = 0;
  
  		if (cookies.search(key) !== -1) {
  			let str = cookies.substring(cookies.search(key) + key.length);
  			let idx = 0;
  			while (idx < cookies.length && str[idx]!==";") {
  				lvl += str[idx];
  				idx++;	
  			}
  
  			 hoarderLevel = parseInt(lvl);
  		}
  
  		key = "shardsLost=";
  		let shards = 0;
  
  		if (cookies.search(key) !== -1) {
  			let str = cookies.substring(cookies.search(key) + key.length);
  			let idx = 0;
  			while (idx < cookies.length && str[idx]!==";") {
  				shards += str[idx];
  				idx++;	
  			}
  
  			 shardsLost = parseInt(shards);
  		}
  		
  	}
  }
  
  function Minion (shards, x, y) {
      this.TYPE = MINION.TYPE; 
  		this.BASE_HP = MINION.HP;
  		this.HP = MINION.HP;
      this.ATK = MINION.ATK;
  		this.DEF = MINION.DEF;
      this.SHARDS = shards;
      this.X = x;
      this.Y = y;
      this.RESIDUAL_DAMAGE_PENDING = false;
  }
  
  function Maxion (shards, x, y) {
      this.TYPE = MAXION.TYPE; 
  		this.BASE_HP = MAXION.HP;
  		this.HP = MAXION.HP;
  		this.ATK = MAXION.ATK;
  		this.DEF = MAXION.DEF;
      this.SHARDS = shards;
      this.X = x;
      this.Y = y;
      this.RESIDUAL_DAMAGE_PENDING = false;
  }
  
  function monsterStealsShards(idx) {
  	typeMonsterKilledPlayer = enemies[idx].TYPE;
  	shardsLost = enemies[idx].SHARDS;
  }
  
  async function start() {
  	
    getHighScores();
  
    getDroppedShards();
  
    checkForMobileDevice();
    
    newLevel();
    
    setInterval(refreshScreen(map), (1000 / FPS));
  
  	while (play) {
  	
  		await waitingKeypress();
  
  		if (keyPressed > 0) {
  			loop();
  		}	
  	}
  
    maybeUpdateHighScores();
    
    if (isNewHighScore) {
      drawStatus("New high score!");
    }
  
    clearInterval();
  }
  
  function loop() {
  
    if (player.SHARDS !== 0 &&
      (player.SHARDS + steps) % 777 === 0) {
      randomRegen();
    }
  
  	//Get coordinates of proposed player move
  	let proposedPlayerX = player.X;
  	let proposedPlayerY = player.Y
  
  	if (KEYMAP[keyPressed] === LEFT) {
  		proposedPlayerY--;
  	} else if (KEYMAP[keyPressed] === RIGHT) {
  		proposedPlayerY++;
  	} else if (KEYMAP[keyPressed] === UP) {
  		proposedPlayerX--;
  	} else if (KEYMAP[keyPressed] === DOWN) {
  		proposedPlayerX++;
  	} else if (KEYMAP[keyPressed] === DOWNRIGHT) {
  		proposedPlayerX++;
  		proposedPlayerY++;
  	} else if (KEYMAP[keyPressed] === DOWNLEFT) {
  		proposedPlayerX++;
  		proposedPlayerY--;
  	} else if (KEYMAP[keyPressed] === UPRIGHT) {
  		proposedPlayerX--;
  		proposedPlayerY++;
  	} else if (KEYMAP[keyPressed] === UPLEFT) {
  		proposedPlayerX--;
  		proposedPlayerY--;
  	}
  
    steps++;
  
    //These conditions need to prevent the player from moving (and also updating the player x and y coordinates incorrectly)
  	let monsterPresent = false;
    let moveDownStairs = false;
  
  	//Complete player's move based on what's in the proposed move square
  	if (checkForMonsters(proposedPlayerX,proposedPlayerY)) {
  		monsterPresent = attack(player, enemies[getEnemyAt(proposedPlayerX,proposedPlayerY)]);
      if (shardsOnLevel > 0 && monstersCleared()) {
        clearShards();
      }
    }
  
  	if (!monsterPresent && checkForShards(proposedPlayerX,proposedPlayerY)) {
  		pickupShard(player);	
  		Matrix[SHARD][proposedPlayerX][proposedPlayerY] = SPACE;
  	}
  
  	if (!monsterPresent && checkForPotions(proposedPlayerX,proposedPlayerY)){
  		pickupPotion();
  		entityMatrix[proposedPlayerX][proposedPlayerY] = SPACE;
  	}
  
    if (!monsterPresent && checkForBuffs(proposedPlayerX, proposedPlayerY)) {
      pickupBuff();
      Matrix[BUFF][proposedPlayerX][proposedPlayerY] = SPACE;
    }
  
  	if (!monsterPresent && map[proposedPlayerX][proposedPlayerY] === EXIT) {
  		newLevel();	
      moveDownStairs = true;
    }
  	
  	if (!monsterPresent && !moveDownStairs && map[proposedPlayerX][proposedPlayerY] !== WALL) {
  		movePlayerTo(proposedPlayerX,proposedPlayerY);
  	}
  
  	//Check for enemies next to player; those enemies attack, others move toward player
  	for (let i = 0; i < enemies.length; i++) {
  	
  		if ((enemies[i].X > 0 && enemies[i].Y > 0) && (Math.abs(player.X - enemies[i].X) < 2) && (Math.abs(player.Y - enemies[i].Y) < 2)) {
  			attack(enemies[i],player);
  			if(player.HP < 1) {
  				monsterStealsShards(i);
  			}
  		} else {
  			if (enemies[i].TYPE === MAXION || random(20) > 1) {
  				enemyMoves(i);
  			}	
  		}	
  	}
  	
  	//Check to see if player has died during the loop
  	if (player.HP < 1) {
  		player.HP = 0;
  		play = false;
  		drawStatus("You died.");
  	}
  
  }
  
  function newLevel() {
    buildLevel();
  	
    if (player.DETERIORATING) {
      playerDeteriorates();
    }
  
    if (player.LEECHING) {
      playerLeeches();
    }
  }
  
  function pickupBuff() {
    playerBuffed();
    player.DETERIORATING = true;
  }
  
  function pickupPotion() {
    playerCured();
    player.LEECHING = true;
  }
  
  function pickupShard(entity) {
  	entity.SHARDS++;
    shardsOnLevel--;
  
    if (shardsOnLevel === 0) {
      entity.ATK++;
      if (entity === player) {
        drawStatus("Level cleared! ATK up!");
      }
    }
  
  }
  
  function Player(shards, x, y) {
    this.TYPE = PLAYER.TYPE;
    this.BASE_HP = PLAYER.HP;
    this.HP = PLAYER.HP;
    this.ATK = PLAYER.ATK;
    this.DEF = PLAYER.DEF;
    this.SHARDS = shards;
    this.X = x;
    this.Y = y;
    this.DETERIORATING = PLAYER.DETERIORATING;
    this.DETERIORATION = PLAYER.DETERIORATION;
    this.LEECHING = PLAYER.LEECHING;
    this.LEECH = PLAYER.LEECH;
  }
  
  function playerDeteriorates() {
    if (player.DETERIORATION < PALETTES.deteriorate.length) {
      player.DETERIORATION++;
      updateUIColor(BACKGROUND, PALETTES.deteriorate);
    } else {
      player.BASE_HP--;
      if (player.HP > player.BASE_HP) {
        player.HP = player.BASE_HP;
      }
      player.ATK--;
      player.DEF--;
      drawStatus("You are deteriorating! Losing HP, ATK and DEF.");
    }
  }
  
  function playerLeeches() {
    if (player.LEECH < PALETTES.leeching.length) {
      player.LEECH++;
      updateUIColor(TEXT, PALETTES.leeching);
    } else {
      if (random(2) > 0) {
        player.HP = player.HP - 5;
        drawStatus("Your lifeforce is leeching away! Lost 5 HP!");
      }
    }
  }
  
  function playerBuffed() {
  	player.BASE_HP += Math.ceil(level/ITEMS.potion.renderable.symbolS_EVERY);
    player.BASE_DEF += Math.ceil(level/ITEMS.potion.renderable.symbolS_EVERY);
    player.DEF = player.BASE_DEF;
    player.DETERIORATION = 0;
    if (!player.DETERIORATING) {
      player.DETERIORATING = true;
    }
  
    drawStatus("Player buffed! Max HP and DEF up!");
    updateUIColor(BACKGROUND, PALETTES.deteriorate);
  }
  
  function playerCured() {
  	if (player.HP < player.BASE_HP) {
  		player.HP = player.BASE_HP;
    }
  
    player.LEECH = 0;
    updateUIColor(TEXT, PALETTES["leeching"]);
    drawStatus("You feel better! HP restored!");
  }
  
  function randomRegen() {
    if (player.HP < player.BASE_HP) {
      player.HP++;
      drawStatus("You feel a benevolent presence! 1 HP gained.");
    }
  }
  
  function spawnBuffs() {
    //TODO: actual spawner
    for (let i =0; i < 50; i++) {
    let acceptablePlacement = false;
  
    while (!acceptablePlacement) {
  		let x = getRandomCoordinate(ROWS);
  		let y = getRandomCoordinate(COLS);
  
      if (map[x][y] !== null && map[x][y] === MAP.text.floor) {
        Matrix[BUFF][x][y] = BUFF;
        acceptablePlacement = true;
      }
    }
  
    }
  }
  
  function spawnExit() {
  	let acceptableExit = false;
  	while (!acceptableExit) {
  		let x = getRandomCoordinate(ROWS);
  		let y = getRandomCoordinate(COLS);		
  
      //Exit shouldn't be within 1 of map edge
      if (x < 2) {
        x = 2;
      }
  
      if (y < 2) {
        y = 2;
      }
  
  		if (map[x][y] !== null && map[x][y] === MAP.text.floor && noEntitiesOnSquare(x,y)) {
        
         
        let numberFloorsNearby = 0;
  
        for (let row = (x-1); row < (x+2); row++) {
          for (let col = (y-1); col < (y+2); col++) {
            if ((row !== x || col !== y) && map[row][col] === MAP.text.floor) {
              numberFloorsNearby++;
            }
          }
        }
  
        if (numberFloorsNearby > 5) {
          map[x][y] = MAP.text.floor;		
  			  acceptableExit = true;
        }
        
  		}
  	}
  }
  
  

  //The following variables and functions are from utils.js... move them back?

let isMobile = false;

function $(e) {
	return document.getElementById(e);
}

function avoidWalls(axis, value) {
	let mapDimension = ROWS - 1;

	if (axis == COL) {
		mapDimension = COLS - 1;
	}
	
	if (value == 0) { 
		return ++value;
	} else if (value == mapDimension) { 
		return --value;
	} else {
		return value;
	}
}

function checkForMobileDevice() {
	window.addEventListener("load", () => {
		console.log(navigator.userAgent);
		let mobile = navigator.userAgent.toLowerCase().match(/mobile/i);
		if (mobile !== null) {
			isMobile = true;
		}
	});
}

function checkForMonsters(x,y) {
	if (Matrix[MINION][x][y] === MINION || 
		Matrix[MINION][x][y] === MAXION) {
		return true;
	}

	return false;
}

function checkForPotions(x,y) {
	if (entityMatrix[x][y] === ITEMS.potion.renderable.symbol) {
		return true;
	}

	return false;
}

function checkForBuffs(x,y) {
    if (Matrix[BUFF][x][y] === BUFF) {
        return true;
    }

    return false;
}

function checkForShards(x,y) {
	if (Matrix[SHARD][x][y] === SHARD) {
		return true;
	}

	return false;
}

function getEnemyAt(x,y) {
	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].X === x && enemies[i].Y === y) {
			return i;
		}
    }

	return -1;
}

function getHighScores() {
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
}

function getRandomCoordinate(axis) {
	let mapLimit = ROWS;

	if  (axis === COLS) {
		mapLimit = COLS;
	}

    return avoidWalls(axis, random(mapLimit-1));
}

function initializeAllMatrices() {
    for (let grid in Matrix) {
        Matrix[grid] = initializeMatrix(ROWS, COLS, SPACE);
    }
}

function initializeMatrix(rows, cols, character) {
    let matrix = [];

    for (let row = 0; row < rows; row++) {
        matrix.push([]);
        
        for (let col = 0; col < cols; col++) {
            matrix[row].push(character);
        }
    }

    return matrix;
}

function loadAll() {
    const game = {};
    
    return game;
}
function maybeUpdateHighScores() {

    if (highscores < player.SHARDS) {
        highscores = player.SHARDS;
        isNewHighScore = true;
    }
    
    document.cookie = "highscores=" + highscores + "; hoarderType=" + typeMonsterKilledPlayer + "; hoardedLevel=" + level + "; shardsLost=" + shardsLost + "; SameSite=Strict;";
    console.log("cookies updated: " + document.cookie);
}

function monstersCleared() {
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].HP > 0) {
            return false;
        }
    }

    return true;
}

function movePlayerTo(x,y) {
	Matrix[PLAYER][player.X][player.Y] = SPACE;
	Matrix[PLAYER][x][y] = PLAYER;
	player.X = x;
	player.Y = y;
}

function moveEnemyTo(idx,x,y) {
	if (enemies[idx].X > 0 && enemies[idx].Y > 0 && map[x][y] === FLOOR && Matrix[MINION][x][y] === SPACE) {
		Matrix[MINION][enemies[idx].X][enemies[idx].Y] = SPACE;
		if (checkForShards(x,y)) {
			enemies[idx].SHARDS++;
			Matrix[SHARD][x][y] = SPACE;
		}

		if (enemies[idx].TYPE == MINION) {
			Matrix[MINION][x][y] = MINION;
		} else if (enemies[idx].TYPE == MAXION) {
			Matrix[MINION][x][y] = MAXION;
		}
		enemies[idx].X = x;
		enemies[idx].Y = y;
	}
} 

function noEntitiesOnSquare(checkX, checkY) {
  if (entityMatrix[checkX] !== undefined && entityMatrix[checkX][checkY] !== SPACE) {
    return false;
    }
  return true;
  }

function random(value) {
	return Math.floor(Math.random() * value);
}

function relocateMonsterAtIdx(i) {
    let acceptablePlacement = false;

    while (!acceptablePlacement) {
        let x = getRandomCoordinate(ROWS);
        let y = getRandomCoordinate(COLS);

        if (map[x][y] === FLOOR && noEntitiesOnSquare(x, y)) {
	    Matrix[MINION][enemies[i].X][enemies[i].Y] = SPACE;

            enemies[i].X = x;
            enemies[i].Y = y;

            acceptablePlacement = true;
        }
    }
}

function waitingKeypress() {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
	document.addEventListener('touchstart', handleTouchStart);        
   	document.addEventListener('touchmove', handleTouchMove);
    function onKeyHandler(e) {
	for (key in KEYMAP) {
		if (e.keyCode === parseInt(key)) {
        		document.removeEventListener('keydown', onKeyHandler);
			keyPressed = e.keyCode;
			resolve();
		}
      }
    }
    	var xDown = null;                                                        	var yDown = null;

	function getTouches(evt) {
  		return evt.touches ||             // browser API
         	evt.originalEvent.touches; // jQuery
	}                                                     
                                                                         
	function handleTouchStart(evt) {
    		const firstTouch = getTouches(evt)[0];                                      
    		xDown = firstTouch.clientX;                                     
    		yDown = firstTouch.clientY;                                      
	};                                                
                                                                         
	function handleTouchMove(evt) {
		//detect quadrant
		//determine slop of line
		//designate x, y or x+y shift as necessary

		if ( ! xDown || ! yDown ) {
        		return;
    		}
    	
		var xUp = evt.touches[0].clientX;                                   		
		var yUp = evt.touches[0].clientY;

    		var xDiff = xDown - xUp;
    		var yDiff = yDown - yUp;
                
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

	};
  });

}
  start(); 
})();
