
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
let LEVELS = [];
const MIN_ROOM_SIZE = 5;
const MAX_ROOM_SIZE = 8;
let ROWS = 128;
let COLS = 320;

function stringToHash(string) {
                  
                let hash = 0;
                  
                if (string.length == 0) return hash;
                  
                for (i = 0; i < string.length; i++) {
                    char = string.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash;
                }
                  
                return hash;
            }

function generateHallways(level, roomStats, roomRows, roomCols) {
    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
        for (let roomCol = 0; roomCol < roomCols; roomCol++) {
            
            let statsIdx = (roomRow * roomCols) + roomCol;

            if (roomStats[statsIdx][0] !== null && roomCol < roomCols - 1) {
                let x = Math.floor((roomStats[statsIdx][0] + roomStats[statsIdx][2]) / 2) + (roomRow * MAX_ROOM_SIZE);
                let y = Math.floor((roomStats[statsIdx][1] + roomStats[statsIdx][3]) / 2) + (roomCol * MAX_ROOM_SIZE);

                //Move from the middle of the room to the nearest wall
                let ySteps = 0;

                while (level[x][y + ySteps] !== MAP.text.wall) {
                    ySteps++;
                }

                y += ySteps;

                level[x][y] = MAP.text.floor;

                y++;

                //Edge case: room is one room away from the right, and there's no room on the right
                let roomOnTheRight = true;

                if (statsIdx === ((roomRow * roomCols) + roomCols - 1)) {
                    if (roomStats[(roomRow * roomCols) + roomCols - 1] === null) {
                        roomOnTheRight = false;
                    }
                }
            
                while(y < COLS && level[x][y] !== MAP.text.floor) {
                    level[x][y] = MAP.text.floor;

                    if (x-1 > 0) {
                        level[x-1][y] = MAP.text.wall;
                    }

                    if (x+1 < ROWS) {
                        level[x+1][y] = MAP.text.wall;
                    }
                
                    y++;
                }

                //Edge case: a hallway leads off the edge of the map (cap it with a wall)
                if (y === (COLS)){
                    level[x][y-1] = MAP.text.wall;
                }
            }


            if (roomStats[statsIdx][0] !== null && roomRow < roomRows - 1) {
            
                //Same but for down
                x = Math.floor((roomStats[statsIdx][0] + roomStats[statsIdx][2]) / 2) + (roomRow * MAX_ROOM_SIZE);
                y = Math.floor((roomStats[statsIdx][1] + roomStats[statsIdx][3]) / 2) + (roomCol * MAX_ROOM_SIZE);

                //Find the wall
                if (level[x][y] !== MAP.text.wall) {
                    while (level[x][y] !== MAP.text.wall && x < ROWS) {
                        x++;
                    }
                }
            
                level[x][y] = MAP.text.floor;

                x++;

                while (x < ROWS && level[x][y] !== MAP.text.floor) {
                    level[x][y] = MAP.text.floor;

                    if (y-1 > 0) {
                        level[x][y-1] = MAP.text.wall;
                    }

                    if (y+1 < COLS) {
                        level[x][y+1] = MAP.text.wall;
                    }
    
                    x++;
                }

                //Edge case: hallways leads off the bottom of the map (cap it with a wall)
                if (x === (ROWS)){
                    level[x-1][y] = MAP.text.wall;
                }
            }
        }
    }

    return level;
}

function generateLevel(string = "default") {

    let level = initializeMatrix(ROWS, COLS, null);

    let allConnected = false;

    while (!allConnected) {


    let roomStats = [];

    let roomRows = Math.floor(ROWS/MAX_ROOM_SIZE);
    let roomCols = Math.floor(COLS/MAX_ROOM_SIZE);
   
    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
        for (let roomCol = 0; roomCol < roomCols; roomCol++) {

            let room = null;
            roomStats.push([null,null,null,null]);
            let rowOffset = null;
            let colOffset = null;

            //Random chance of room not appearing
        //    if (random(10)) > 1){
                room = generateRoom();

                rowOffset = random(MAX_ROOM_SIZE - room.length);
                colOffset = random(MAX_ROOM_SIZE - room[0].length);

                let data = [room.length, room[0].length, rowOffset, colOffset];

                roomStats[(roomRow * roomCols) + roomCol] = data;
                console.log("Room generated: " + data); 
         //   } else { console.log("Room not generated"); }

            if (room !== null) {
                for (let row = 0; row < room.length; row++) {
                    for (let col = 0; col < room[0].length; col++) {
                        level[(MAX_ROOM_SIZE * roomRow) + rowOffset + row][(MAX_ROOM_SIZE * roomCol) + colOffset + col] = room[row][col];

                    }
                }
            }
        }
    }


    //Account for unlikely chance that no rooms generate
    let noRooms = true;

    for (let i = 0; i < roomStats.length; i++) {
        if (roomStats[i][0] !== null) {
            noRooms = false;
        }
    }

    if (noRooms) {
        let room = generateRoom();

        let roomRow = 0;
        let roomCol = 0;
                
        rowOffset = random(MAX_ROOM_SIZE - room.length);
        colOffset = random(MAX_ROOM_SIZE - room[0].length);

        roomStats.push([room.length, room[0].length, rowOffset, colOffset]);

        for (let row = 0; row < room.length; row++) {
            for (let col = 0; col < room[0].length; col++) {
                level[(MAX_ROOM_SIZE * roomRow) + rowOffset + row][(MAX_ROOM_SIZE * roomCol) + colOffset + col] = room[row][col];

            }
        }

    }
   
    level = generateHallways(level, roomStats, roomRows, roomCols);

    if (isConnected(level)) {
        allConnected = true;
    }
    }

    //Replace the null values with spaces
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (level[row][col] === null) {
                level[row][col] = SPACE;
            }
        }
    }
    return level;
}

function generateRoom() {

    let room = initializeMatrix(
        random(MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1) + MIN_ROOM_SIZE,
        random(MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1) + MIN_ROOM_SIZE,
        MAP.text.floor
    );

    for (let row = 0; row < room.length; row++) {
        for (let col = 0; col < room[0].length; col++) {
            if (row === 0 || col === 0 || row === room.length - 1 || col === room[0].length - 1) {
                    room[row][col] = MAP.text.wall;
            }
        }
    }


    return room;
}

function isConnected(level) {
    //TODO: Optimize for larger maps
    return true;
}
    /*
let connected = initializeMatrix(ROWS, COLS, false);

    let isFloor = false;

    let x = 0;
    let y = 0;

    while (!isFloor) {
        x = getRandomCoordinate(ROWS);
        y = getRandomCoordinate(COLS);

        if (level[x][y] === MAP.text.floor) {
            isFloor = true;
        }
    }

    let floorList = [];

    floorList.push([x,y]);
    connected[x][y] = true;


    while (floorList.length > 0) {
        let coords = floorList.pop();
        let checkX = coords[0];
        let checkY = coords[1];
        
        for (let row = (checkX-1); row < checkX+2; row++) {
            for (let col = (checkY-1); col < checkY+2; col++){
                if (row !== checkX || col !== checkY) {
                    if (level[row][col] === MAP.text.floor && !connected[row][col]) {
                        connected[row][col] = true;
                        floorList.push([row,col]);
                    }
                }
            }
        }
    }

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (level[row][col] === MAP.text.floor && connected[row][col] === false) {
                return false;
            }
        }
    }

    return true;
}
*/
