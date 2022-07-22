let LEVEL = {

  setSeed: function (str) {

  },

  seed: "",
  
  generateHallways: function (level, roomStats, roomRows, roomCols) {
    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
      for (let roomCol = 0; roomCol < roomCols; roomCol++) {
            
        let statsIdx = (roomRow * roomCols) + roomCol;

        if (roomStats[statsIdx][0] !== null && roomCol < roomCols - 1) {
          let x = 
          Math.floor((roomStats[statsIdx][0] + roomStats[statsIdx][2]) / 2) 
          + (roomRow * RAWS.settings.max_room_size);
                
          let y = 
          Math.floor((roomStats[statsIdx][1] + roomStats[statsIdx][3]) / 2) 
          + (roomCol * RAWS.settings.max_room_size);

          //Move from the middle of the room to the nearest wall
          let ySteps = 0;

          while (level[x][y + ySteps] !== RAWS.map.text.wall) {
            ySteps++;
          }

          y += ySteps;

          level[x][y] = RAWS.map.text.floor;

          y++;

          //Edge case: room is one room away from the right, 
          //and there's no room on the right
          let roomOnTheRight = true;

          if (statsIdx === ((roomRow * roomCols) + roomCols - 1)) {
            if (roomStats[(roomRow * roomCols) + roomCols - 1] === null) {
              roomOnTheRight = false;
            }
          }
            
          while(y < RAWS.settings.cols && level[x][y] !== RAWS.map.text.floor) {
            level[x][y] = RAWS.map.text.floor;

            if (x-1 > 0) {
              level[x-1][y] = RAWS.map.text.wall;
            }

            if (x+1 < RAWS.settings.rows) {
              level[x+1][y] = RAWS.map.text.wall;
            }
                
            y++;
          }

          //Edge case: a hallway leads off the edge of the map (cap it with a wall)
          if (y === (RAWS.settings.cols)){
            level[x][y-1] = RAWS.map.text.wall;
          }
        }


        if (roomStats[statsIdx][0] !== null && roomRow < roomRows - 1) {
            
          //Same but for down
          x = Math.floor((roomStats[statsIdx][0] + roomStats[statsIdx][2]) / 2) 
          + (roomRow * RAWS.settings.max_room_size);
                
          y = Math.floor((roomStats[statsIdx][1] + roomStats[statsIdx][3]) / 2) 
          + (roomCol * RAWS.settings.max_room_size);

          //Find the wall
          if (level[x][y] !== RAWS.map.text.wall) {
            while (level[x][y] !== RAWS.map.text.wall && x < RAWS.settings.rows) {
              x++;
            }
          }
            
          level[x][y] = RAWS.map.text.floor;

          x++;

          while (x < RAWS.settings.rows && level[x][y] !== RAWS.map.text.floor) {
            level[x][y] = RAWS.map.text.floor;

            if (y-1 > 0) {
              level[x][y-1] = RAWS.map.text.wall;
            }

            if (y+1 < RAWS.settings.cols) {
              level[x][y+1] = RAWS.map.text.wall;
            }
    
            x++;
          }

          //Edge case: hallways leads off the bottom of the map (cap it with a wall)
          if (x === (RAWS.settings.rows)){
            level[x-1][y] = RAWS.map.text.wall;
          }
        }
      }
    }
    return level;
  },

  generate: function (seedStr = "default") {

    let level = initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, null);

    this.seed = this.setSeed(seedStr);

    let allConnected = false;

    while (!allConnected) {

      let roomStats = [];

      let roomRows = Math.floor(RAWS.settings.rows/RAWS.settings.max_room_size);
      let roomCols = Math.floor(RAWS.settings.cols/RAWS.settings.max_room_size);
   
      for (let roomRow = 0; roomRow < roomRows; roomRow++) {
        for (let roomCol = 0; roomCol < roomCols; roomCol++) {

          let room = null;
          roomStats.push([null,null,null,null]);
          let rowOffset = null;
          let colOffset = null;

          //Random chance of room not appearing
          //    if (random(10)) > 1){
            room = this.generateRoom();

            rowOffset = random(RAWS.settings.max_room_size - room.length);
            colOffset = random(RAWS.settings.max_room_size - room[0].length);

            let data = [room.length, room[0].length, rowOffset, colOffset];

            roomStats[(roomRow * roomCols) + roomCol] = data;
            //   } else { console.log("Room not generated"); }

          if (room !== null) {
            for (let row = 0; row < room.length; row++) {
              for (let col = 0; col < room[0].length; col++) {
                level
                [(RAWS.settings.max_room_size * roomRow) + rowOffset + row]
                [(RAWS.settings.max_room_size * roomCol) + colOffset + col] 
                = room[row][col];
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
        let room = this.generateRoom();

        let roomRow = 0;
        let roomCol = 0;
                
        rowOffset = random(RAWS.settings.max_room_size - room.length);
        colOffset = random(RAWS.settings.max_room_size - room[0].length);

        roomStats.push([room.length, room[0].length, rowOffset, colOffset]);

        for (let row = 0; row < room.length; row++) {
          for (let col = 0; col < room[0].length; col++) {
            level
            [(RAWS.settings.max_room_size * roomRow) + rowOffset + row]
            [(RAWS.settings.max_room_size * roomCol) + colOffset + col] 
            = room[row][col];
          }
        }
      }
   
      level = this.generateHallways(level, roomStats, roomRows, roomCols);
      level = this.generateBorder(level);

      if (this.isConnected(level)) {
        allConnected = true;
      }
    }

    //Replace the null values with spaces
    for (let row = 0; row < RAWS.settings.rows; row++) {
      for (let col = 0; col < RAWS.settings.cols; col++) {
        if (level[row][col] === null) {
          level[row][col] = CONSTS.SPACE;
        }
      }
    }
    return level;
  },

  generateBorder: function (level) {
    for (let col = 0; col < level[0].length; col++) {
      level[0][col], level[level.length-1][col]  = RAWS.map.text.wall;
    }

    for (let row = 0; row < level.length; row++) {
      level[row][0], level[row][level[row].length] = RAWS.map.text.wall;
    }

    return level;
  },

  generateRoom: function () {
    let room = initializeMatrix(
      random(RAWS.settings.max_room_size - RAWS.settings.min_room_size + 1) 
        + RAWS.settings.min_room_size,
      random(RAWS.settings.max_room_size - RAWS.settings.min_room_size + 1) 
        + RAWS.settings.min_room_size,
      RAWS.map.text.floor
    );

    for (let row = 0; row < room.length; row++) {
      for (let col = 0; col < room[0].length; col++) {
        if (row === 0 
        || col === 0 
        || row === room.length - 1 
        || col === room[0].length - 1) {
          room[row][col] = RAWS.map.text.wall;
        }
      }
    }
    return room;
  },

  isConnected: function (level) {
    //TODO: Optimize for larger maps
    return true;
  }
};
    /*
let connected = initializeMatrix(RAWS.settings.rows, RAWS.settings.cols, false);

    let isFloor = false;

    let x = 0;
    let y = 0;

    while (!isFloor) {
        x = getRandomCoordinate(RAWS.settings.rows);
        y = getRandomCoordinate(RAWS.settings.cols);

        if (level[x][y] === RAWS.map.text.floor) {
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
                    if (level[row][col] === RAWS.map.text.floor && !connected[row][col]) {
                        connected[row][col] = true;
                        floorList.push([row,col]);
                    }
                }
            }
        }
    }

    for (let row = 0; row < RAWS.settings.rows; row++) {
        for (let col = 0; col < RAWS.settings.cols; col++) {
            if (level[row][col] === RAWS.map.text.floor && connected[row][col] === false) {
                return false;
            }
        }
    }

    return true;
}
*/
