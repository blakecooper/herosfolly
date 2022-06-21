function testDOMAccess() {
  console.log($("level"));
}

function $(e) {
	return document.getElementById(e);
}

let bodyBackground = 'black';
let rowsVisible = -1;
let colsVisible = -1;

function closeSpan() {
    if (player.HP < player.BASE_HP) {
        return "</span>";
    } else {
        return "";
    }
}

function damageSpan() {

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
}

function random(value) {
	return Math.floor(Math.random() * value);
}

function refreshScreen(map, entities, x, y) {
    console.log("Check");
    drawMap(map, x, y);
    drawStats();
    draw(entities, x, y);
}

function drawEntities() {
    draw(ITEMS.potion.renderable.symbol);
    draw(player.renderable.symbol);
    draw(SHARD.renderable.symbol);
}

function drawMap(map, x, y) {
    $("level").innerHTML = "";
	let html = "";

    let rowz = (x - Math.floor(rowsVisible/2)) > 0 
    ? x-Math.floor(rowsVisible/2) : 0;
    
    let colz = (y - Math.floor(colsVisible/2)) > 0
    ? y-Math.floor(colsVisible/2) : 0;

    let endRow;
    let endCol;

    if (rowz === 0) { 
        endRow = rowsVisible; 
    } else {
        endRow = (x + Math.ceil(rowsVisible/2)) < ROWS 
        ? x+Math.ceil(rowsVisible/2) :  ROWS;
    }
    
    if (colz === 0) { 
        endCol = colsVisible; 
    } else {
        endCol = (y + Math.ceil(colsVisible/2)) < COLS 
        ? y+Math.ceil(colsVisible/2) : COLS;
    }

    if (endRow === ROWS) { rowz = ROWS-rowsVisible; }
    if (endCol === COLS) { colz = COLS-colsVisible; }
    
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
	html = "";
}
function draw(entityMatrix, x, y) {
    $("entities").innerHTML = "";

    let html = "";

    let rowz = (x - Math.floor(rowsVisible/2)) > 0 
    ? x-Math.floor(rowsVisible/2) : 0;
    
    let colz = (y - Math.floor(colsVisible/2)) > 0 
    ? y-Math.floor(colsVisible/2) : 0;

    let endRow;
    let endCol;

    if (rowz === 0) { 
        endRow = rowsVisible; 
    } else {
        endRow = (x + Math.ceil(rowsVisible/2)) < ROWS 
        ? x+Math.ceil(rowsVisible/2) :  ROWS;
    }
    
    if (colz === 0) { 
        endCol = colsVisible; 
    } else {
        endCol = (y + Math.ceil(colsVisible/2)) < COLS 
        ? y+Math.ceil(colsVisible/2) : COLS;
    }

    if (endRow === ROWS) { rowz = ROWS-rowsVisible; }
    if (endCol === COLS) { colz = COLS-colsVisible; }
    
    for (let row = rowz; row < endRow; row++) {
        for (let col = colz; col < endCol; col++) {
            if (entityMatrix[row][col].renderable !== undefined) {
                html += "<span style='background-color: " + bodyBackground 
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
}

function drawStats() {

    $("stats").innerHTML = "hp: " 
        + damageSpan()
		+ player.hp
        + closeSpan()
        + "/" + player.base_hp
        + " atk: "
		+ player.atk
        + " def: "
		+ player.def
        + " shards: "
		+ player.shards
        + " top: "
        + highscores;
}

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
  const entityMatrix = initializeMatrix(map.length,map[0].length,SPACE);

    entityMatrix[player.x][player.y] = player.renderable.symbol;

    for (let i = 0; i < enemies.length; i++) {
      entityMatrix[enemies[i].x][enemies[i].y] = enemies[i];
    }    
 
    for (let i = 0; i < SPAWN.shards.number; i++) {
      const coords = getAcceptableCoordinate();

      entityMatrix[coords[0]][coords[1]] = SHARD;
    }

    for (let i = 0; i < SPAWN.potions.number; i++) {
      const coords = getAcceptableCoordinate();

      entityMatrix[coords[0]][coords[1]] = ITEMS.potion;
    }


  function getEntityMatrix() { return entityMatrix; }
    
    //Get rid of any monsters right next to player
    for (let row = (player.x - 1); row < (player.x + 2); row++) {
      for (let col = (player.y - 1); col < (player.y + 2); col++) {
        if (entityMatrix[row][col].id === "minion" || entityMatrix[row][col].id === "maxion") {
          
          relocateMonsterAtIdx(getEnemyAt(row, col));
        }
      }
    }

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
  
    if (aggressor.id === "minion" || aggressor.id === "maxion") {
      atkBonus = Math.ceil(level/4);
    } else {
      atkBonus = Math.ceil(aggressor.atk/5);
    }
    
    let defenderHit = (random(20) + atkBonus) > defender.def;
  
    if (defenderHit) {
      let dmgToDefender = Math.floor(aggressor.atk/2) + random(Math.ceil(aggressor.atk/2));
      defender.hp -= dmgToDefender;
      if (defender.hp < 1) {
        let type = defender.id;
  
        if (type === "M") {
          type = "m";
        }
        entityMatrix[defender.x][defender.y] = SPACE;
        defender.x = -1;
        defender.y = -1;
  
        if (random(2) < 1 && aggressor.hp < aggressor.base_hp) {
          aggressor.hp++;
        }
  
        for (let i = 0; i < defender.shards; i++) {
          pickupShard(aggressor);     
        }
  
        return false;
      }
    } else {
      if (aggressor === player) {
        drawStatus("You missed!");
      } else if (aggressor.id === "minion") {
        drawStatus("The minion missed!");
      } else if (aggressor.TYPE === "maxion") {
        drawStatus("The Maxion missed!");
      }
    }
  
    return true;
  }
  

  function getMap() {
    return map;
  }

  function enemyMoves(idx) {
  
  	let randomMovementChoice = random(2);
  	
  	if ((player.x < enemies[idx].X) && (player.y < enemies[idx].y)) {
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
  }
  
  async function start() {
    getHighScores();
   
//    checkForMobileDevice();
     
    setInterval(refreshScreen(map, entityMatrix, player.x, player.y), (1000 / FPS));
  
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
  
    console.log("Player's coords: " + player.x + ", " + player.y);
    if (player.shards !== 0 &&
      player.shards % 7 == 0) {
      randomRegen();
    }
  
  	//Get coordinates of proposed player move
  	let proposedPlayerX = player.x;
  	let proposedPlayerY = player.y;
    
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
  
  
    //These conditions need to prevent the player from moving (and also updating the player x and y coordinates incorrectly)
  	let monsterPresent = false;
    let moveDownStairs = false;
  
  	//Complete player's move based on what's in the proposed move square
  	if (checkForMonsters(proposedPlayerX,proposedPlayerY)) {
  		monsterPresent = attack(player, enemies[getEnemyAt(proposedPlayerX,proposedPlayerY)]);
    }
  
  	if (!monsterPresent && checkForShards(proposedPlayerX,proposedPlayerY)) {
  		pickupShard(player);	
  		entityMatrix[proposedPlayerX][proposedPlayerY] = SPACE;
  	}
  
  	if (!monsterPresent && checkForPotions(proposedPlayerX,proposedPlayerY)){
  		pickupPotion();
  		entityMatrix[proposedPlayerX][proposedPlayerY] = SPACE;
  	}
  
    if (!monsterPresent && checkForBuffs(proposedPlayerX, proposedPlayerY)) {
      pickupBuff();
      Matrix[BUFF][proposedPlayerX][proposedPlayerY] = SPACE;
    }
  
  	if (!monsterPresent && !moveDownStairs && map[proposedPlayerX][proposedPlayerY] !== MAP.text.wall) {
  		movePlayerTo(proposedPlayerX,proposedPlayerY);
  	}
  
  	//Check for enemies next to player; those enemies attack, others move toward player
  	for (let i = 0; i < enemies.length; i++) {
  	
  		if ((enemies[i].x > 0 && enemies[i].y > 0) && (Math.abs(player.x - enemies[i].x) < 2) && Math.abs(player.y - enemies[i].y < 2)) {
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
  		drawStatus("You died.");
  	}
    //TODO: start here! why are we not auto-refreshing with setInterval?? 
      refreshScreen(map, entityMatrix,player.x,player.y);
  }
  
  function pickupBuff() {
  }
  
  function pickupPotion() {
  }
  
  function pickupShard(entity) {
  	entity.shards++;  
  }
   
  function randomRegen() {
    if (player.hp < player.base_hp) {
      player.hp++;
      drawStatus("You feel a benevolent presence! 1 HP gained.");
    }
  }

  //The following variables and functions are from utils.js... move them back?

let isMobile = false;

function $(e) {
	return document.getElementById(e);
}

function avoidWalls(axis, value) {
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
}

function checkForMobileDevice() {
	window.addEventListener("load", () => {
		let mobile = navigator.userAgent.toLowerCase().match(/mobile/i);
		if (mobile !== null) {
			isMobile = true;
		}
	});
}

function checkForMonsters(x,y) {
	if (entityMatrix[x][y] === ENEMIES[0].renderable.symbol  || 
		entityMatrix[x][y] === ENEMIES[1].renderable.symbol) {
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

//TODO: redo buffs
function checkForBuffs(x,y) {
//    if (Matrix[BUFF][x][y] === BUFF) {
//        return true;
//    }

    return false;
}

function checkForShards(x,y) {
	if (entityMatrix[x][y] === SHARD.renderable.symbol) {
		return true;
	}

	return false;
}

function getEnemyAt(x,y) {
	for (let i = 0; i < enemies.length; i++) {
		if (enemies[i].x === x && enemies[i].y === y) {
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

function loadAll() {
    const game = {};
    
    return game;
}
function maybeUpdateHighScores() {

    if (highscores < player.shards) {
        highscores = player.shards;
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
	entityMatrix[player.x][player.y] = SPACE;
	entityMatrix[x][y] = player.renderable.symbol;
	player.x = x;
	player.y = y;
}

function moveEnemyTo(idx,x,y) {
	if (enemies[idx].x > 0 && enemies[idx].y > 0 && map[x][y] === MAP.text.floor && entityMatrix[x][y] === SPACE) {
		entityMatrix[enemies[idx].x][enemies[idx].y] = SPACE;
		if (checkForShards(x,y)) {
			enemies[idx].shards++;
		}

        entityMatrix[x][y] = enemies[idx].renderable.symbol;
		
        enemies[idx].x = x;
		enemies[idx].y = y;
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

        if (map[x][y] === MAP.text.floor && noEntitiesOnSquare(x, y)) {
	    entityMatrix[enemies[i].x][enemies[i].y] = SPACE;

            enemies[i].x = x;
            enemies[i].y = y;

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
let screenWidth = -1;
let screenHeight = -1;
let buffer = 125;


//For testing purposes:
let displayedCoords = false;

window.addEventListener("load", () => {

    screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;

    //TODO: more efficient way to do the following?
    let origFont = window.getComputedStyle(document.body).getPropertyValue('font-size');
    let idx = 0;

    while(origFont[idx] !== 'p') {
        idx++;
    }

    origFont = origFont.substring(0,idx);

    rowsVisible = Math.floor(screenHeight/(origFont)*DEFAULT_FONT_SIZE);
    //this is necessary because the font is not square (yet):
    rowsVisible /= 3;
    colsVisible = Math.floor(screenWidth/(origFont) * DEFAULT_FONT_SIZE);
    $('body').style.fontSize = DEFAULT_FONT_SIZE + "em";

    start();
});
//window.addEventListener("resize", () => {
//	sizeElementsToWindow();	
//});





function clearStatus() {
    $("status").innerHTML = "";
}

function drawStatus(message) {
    $("status").innerHTML = message;
    let timeout = setTimeout(function() {
        clearStatus();
    }, 1000 * SECONDS_DISPLAY_STATUS);
}

function sizeElementsToWindow() {

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
}


function updateUIColor(element, palette) {
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
