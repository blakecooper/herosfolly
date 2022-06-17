let screenWidth = -1;
let screenHeight = -1;
let buffer = 125;

let rowsVisible = -1;
let colsVisible = -1;

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
});
//window.addEventListener("resize", () => {
//	sizeElementsToWindow();	
//});

let bodyBackground = 'black';

function closeSpan() {
    if (player.HP < player.BASE_HP) {
        return "</span>";
    } else {
        return "";
    }
}

function damageSpan() {

    let html = "";

    if (player.HP < player.BASE_HP) {
        html = "<span class=";

        if (player.HP < (player.BASE_HP / 3)) {
            html += "red";
        } else {
            html += "yellow";
        }

        html += ">";

    }
    
    return html;
}

function draw(entity) {
    $(entity).innerHTML = "";

    let html = "";

    let rowz = (player.X - Math.floor(rowsVisible/2)) > 0 ? player.X-Math.floor(rowsVisible/2) : 0;
    let colz = (player.Y - Math.floor(colsVisible/2)) > 0 ? player.Y-Math.floor(colsVisible/2) : 0;

    let endRow;
    let endCol;

    if (rowz === 0) { 
        endRow = rowsVisible; 
    } else {
        endRow = (player.X + Math.ceil(rowsVisible/2)) < ROWS ? player.X+Math.ceil(rowsVisible/2) :  ROWS;
    }
    
    if (colz === 0) { 
        endCol = colsVisible; 
    } else {
        endCol = (player.Y + Math.ceil(colsVisible/2)) < COLS ? player.Y+Math.ceil(colsVisible/2) : COLS;
    }

    if (endRow === ROWS) { rowz = ROWS-rowsVisible; }
    if (endCol === COLS) { colz = COLS-colsVisible; }
    
    for (let row = rowz; row < endRow; row++) {
        for (let col = colz; col < endCol; col++) {
            if (Matrix[entity][row][col] === entity || Matrix[entity][row][col] === MAXION) {
                html += "<span style='background-color: " + bodyBackground + ";'>";
            }

            html += Matrix[entity][row][col];
            
            if (Matrix[entity][row][col] === entity || Matrix[entity][row][col] === MAXION) {
                html += "</span>";
            }
        }
        html += "<br>";
    }

    $(entity).innerHTML = html;
}

function drawMap(map) {
	
	$("level").innerHTML = "";
	let html = "";

    let rowz = (player.X - Math.floor(rowsVisible/2)) > 0 ? player.X-Math.floor(rowsVisible/2) : 0;
    let colz = (player.Y - Math.floor(colsVisible/2)) > 0 ? player.Y-Math.floor(colsVisible/2) : 0;

    let endRow;
    let endCol;

    if (rowz === 0) { 
        endRow = rowsVisible; 
    } else {
        endRow = (player.X + Math.ceil(rowsVisible/2)) < ROWS ? player.X+Math.ceil(rowsVisible/2) :  ROWS;
    }
    
    if (colz === 0) { 
        endCol = colsVisible; 
    } else {
        endCol = (player.Y + Math.ceil(colsVisible/2)) < COLS ? player.Y+Math.ceil(colsVisible/2) : COLS;
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

function drawStats() {

    $("stats").innerHTML = "HP: " 
        + damageSpan()
		+ player.HP
        + closeSpan()
        + "/" + player.BASE_HP
        + " ATK: "
		+ player.ATK
        + " DEF: "
		+ player.DEF
        + " SHARDS: "
		+ player.SHARDS
        + " TOP: "
        + highscores
        + " DLVL: " 
        + level;
}

function clearStatus() {
    $("status").innerHTML = "";
}

function drawStatus(message) {
    $("status").innerHTML = message;
    let timeout = setTimeout(function() {
        clearStatus();
    }, 1000 * SECONDS_DISPLAY_STATUS);
}

function refreshScreen(map) {
    drawMap(map);
    drawStats();
    draw(MINION.SYMBOL);
    for (potion of POTION) {
        draw(potion);
    }
    draw(PLAYER.SYMBOL);
    draw(SHARD);
    draw(BUFF);
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
