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

function maybeUpdateHighScores() {

    if (highscores < player.SHARDS) {
        highscores = player.SHARDS;
        isNewHighScore = true;
    }
    
    document.cookie = "highscores=" + highscores + "; SameSite=Strict;";
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
            enemies[i].X = x;
            enemies[i].Y = y;
            acceptablePlacement = true;
        }
    }
}

function waitingKeypress() {
  return new Promise((resolve) => {
    document.addEventListener('keydown', onKeyHandler);
    function onKeyHandler(e) {
	for (key in KEYMAP) {
		if (e.keyCode === parseInt(key)) {
        		document.removeEventListener('keydown', onKeyHandler);
			keyPressed = e.keyCode;
			resolve();
		}
      }
    }
  });
}
