let LEVELS = [];
const MIN_ROOM_SIZE = 5;
const MAX_ROOM_SIZE = 8;
const ROWS = 16;
const COLS = 32;
const NUMBER_LEVELS_TO_GENERATE = 30;

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

function generateLevel(string = "default") {

    let level = initializeMatrix(ROWS, COLS, null);

    let roomStats = [];
    //divide level into 4 x 2
    //generate random room size from 5 to 8
    //small chance of room not forming
    //otherwise: print room to square
    //if smaller than 8, offset slightly
 
    let roomRows = Math.floor(ROWS/MAX_ROOM_SIZE);
    let roomCols = Math.floor(COLS/MAX_ROOM_SIZE);
   
    //TODO: introduce (a stable version of) rooms not showing up w/ small probability
    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
        for (let roomCol = 0; roomCol < roomCols; roomCol++) {
            let room = generateRoom();

            let rowOffset = random(MAX_ROOM_SIZE - room.length);
            let colOffset = random(MAX_ROOM_SIZE - room[0].length);

            let data = [room.length, room[0].length, rowOffset, colOffset];

            roomStats.push(data);

            for (let row = 0; row < room.length; row++) {
                for (let col = 0; col < room[0].length; col++) {
                    level[(MAX_ROOM_SIZE * roomRow) + rowOffset + row][(MAX_ROOM_SIZE * roomCol) + colOffset + col] = room[row][col];
                }
            }
        }
    }


    //TODO: account for highly unlikely chance (one in a hundred million) that no rooms generate

    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
        for (let roomCol = 0; roomCol < roomCols; roomCol++) {

            if (roomCol < roomCols - 1) {
            let x = Math.floor((roomStats[(roomRow * roomCols) + roomCol][0] + roomStats[(roomRow * roomCols) + roomCol][2]) / 2) + (roomRow * MAX_ROOM_SIZE);
            let y = Math.floor((roomStats[(roomRow * roomCols) + roomCol][1] + roomStats[(roomRow * roomCols) + roomCol][3]) / 2) + (roomCol * MAX_ROOM_SIZE);

            let ySteps = 0;

            while (level[x][y + ySteps] !== WALL) {
                ySteps++;
            }

            y += ySteps;

            level[x][y] = FLOOR;

            y++;

            while(y < COLS && level[x][y] !== FLOOR) {
                level[x][y] = FLOOR;

                if (x-1 > 0) {
                level[x-1][y] = WALL;
                }

                if (x+1 < ROWS) {
                level[x+1][y] = WALL;
                }
                y++;
            }
            }


            if (roomRow < roomRows - 1) {
            //Same but for down
            x = Math.floor((roomStats[(roomRow * roomCols) + roomCol][0] + roomStats[(roomRow * roomCols) + roomCol][2]) / 2) + (roomRow * MAX_ROOM_SIZE);
            y = Math.floor((roomStats[(roomRow * roomCols) + roomCol][1] + roomStats[(roomRow * roomCols) + roomCol][3]) / 2) + (roomCol * MAX_ROOM_SIZE);

            //Find the wall
            if (level[x][y] !== WALL) {
                while (level[x][y] !== WALL && x < ROWS) {
                    x++;
                }
            }
            level[x][y] = FLOOR;

            x++;

            while (x < ROWS && level[x][y] !== FLOOR) {
                level[x][y] = FLOOR;

                if (y-1 > 0) {
                    level[x][y-1] = WALL;
                }

                if (y+1 < COLS) {
                    level[x][y+1] = WALL;
                }
                x++;
            }

            if (x === (ROWS - 1)){
                level[x][y] = WALL;
            }

            }
        }
    }

    //connect with hallways:
    //find middle right wall
    //find middle down wall
    //break right wall, replace with floor
    //move one right, if not wall:
    //  place floor, place wall above and below
    //if wall: make floor 
    //repeat for down
    return level;
}

function generateRoom() {

    let room = initializeMatrix(
        random(MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1) + MIN_ROOM_SIZE,
        random(MAX_ROOM_SIZE - MIN_ROOM_SIZE + 1) + MIN_ROOM_SIZE,
        FLOOR
    );

    for (let row = 0; row < room.length; row++) {
        for (let col = 0; col < room[0].length; col++) {
            if (row === 0 || col === 0 || row === room.length - 1 || col === room[0].length - 1) {
                    room[row][col] = WALL;
            }
        }
    }


    return room;
}
