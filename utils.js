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
	if (Matrix[POTION][x][y] === POTION) {
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

    if (game.getCookies.length > 0 && game.getCookies.search(key) !== -1) {

        let highscoresString = game.getCookies.substring(game.getCookies().search(key) + key.length);

        let idx = 0;

        while (idx < game.getCookies().length && highscoresString[idx] !== ";") {
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
    console.log("game.getCookies() updated: " + document.cookie);
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
    for (let mat in Matrix) {
        if (Matrix[mat][checkX][checkY] !== SPACE) {
            return false;
        }
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
  if (typeof Object.beget !== 'function') {
    Object.beget = function (o) {
      let F = function () {};
      F.prototype = o;
      return new F();
    };
  }

