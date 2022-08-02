let LEVEL = {

  generateHallways: function (map, roomStats, roomRows, roomCols) {
    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
      for (let roomCol = 0; roomCol < roomCols; roomCol++) {
            
        let statsIdx = (roomRow * roomCols) + roomCol;

        if (roomStats[statsIdx][0] !== null && roomCol < roomCols - 1) {
          let x = 
          Math.floor(
            (roomStats[statsIdx][0] + roomStats[statsIdx][2]) / 2
          ) + (roomRow * RAWS.settings.max_room_size);
                
          let y = 
          Math.floor((roomStats[statsIdx][1] + roomStats[statsIdx][3]) / 2) 
          + (roomCol * RAWS.settings.max_room_size);

          //Move from the middle of the room to the nearest wall
          let ySteps = 0;

          while (map[x][y + ySteps] !== RAWS.map.text.wall) {
            ySteps++;
          }

          y += ySteps;

          map[x][y] = RAWS.map.text.floor;

          y++;

          //Edge case: room is one room away from the right, 
          //and there's no room on the right
          let roomOnTheRight = true;

          if (statsIdx === ((roomRow * roomCols) + roomCols - 1)) {
            if (roomStats[(roomRow * roomCols) + roomCols - 1] === null) {
              roomOnTheRight = false;
            }
          }
            
          while(y < RAWS.settings.cols && map[x][y] !== RAWS.map.text.floor) {
            map[x][y] = RAWS.map.text.floor;

            if (x-1 > 0) {
              map[x-1][y] = RAWS.map.text.wall;
            }

            if (x+1 < RAWS.settings.rows) {
              map[x+1][y] = RAWS.map.text.wall;
            }
                
            y++;
          }

          //Edge case: a hallway leads off the edge of the map (cap it with a wall)
          if (y === (RAWS.settings.cols)){
            map[x][y-1] = RAWS.map.text.wall;
          }
        }


        if (roomStats[statsIdx][0] !== null && roomRow < roomRows - 1) {
            
          //Same but for down
          x = Math.floor((roomStats[statsIdx][0] + roomStats[statsIdx][2]) / 2) 
          + (roomRow * RAWS.settings.max_room_size);
                
          y = Math.floor((roomStats[statsIdx][1] + roomStats[statsIdx][3]) / 2) 
          + (roomCol * RAWS.settings.max_room_size);

          //Find the wall
          if (map[x][y] !== RAWS.map.text.wall) {
            while (map[x][y] !== RAWS.map.text.wall && x < RAWS.settings.rows) {
              x++;
            }
          }
            
          map[x][y] = RAWS.map.text.floor;

          x++;

          while (x < RAWS.settings.rows && map[x][y] !== RAWS.map.text.floor) {
            map[x][y] = RAWS.map.text.floor;

            if (y-1 > 0) {
              map[x][y-1] = RAWS.map.text.wall;
            }

            if (y+1 < RAWS.settings.cols) {
              map[x][y+1] = RAWS.map.text.wall;
            }
    
            x++;
          }

          //Edge case: hallways leads off the bottom of the map (cap it with a wall)
          if (x === (RAWS.settings.rows)){
            map[x-1][y] = RAWS.map.text.wall;
          }
        }
      }
    }
    return map;
  },

  roomStats: [],

  generate: function () {

    let map = initializeMatrix(
      RAWS.settings.rows, 
      RAWS.settings.cols, 
      null
    );

    let connected = false;

    while (!connected) {

      let roomRows =                                                 //partition map into zones
        Math.floor(RAWS.settings.rows/RAWS.settings.max_room_size);  //where rooms can generate
      let roomCols = 
        Math.floor(RAWS.settings.cols/RAWS.settings.max_room_size);
  
      for (let roomRow = 0; roomRow < roomRows; roomRow++) {
        for (let roomCol = 0; roomCol < roomCols; roomCol++) {

          //TODO: put this back and see what happens!
            //NOTE: will need to declare null stats in an else statement!
          //Random chance of room not appearing
          //    if (random(10)) > 1){
            
          let room = this.generateRoom();

          let rowOffset = random(                                    //determines how far from
            RAWS.settings.max_room_size - room.length                //the edges of the zone
          );                                                         //the room is placed
          
          let colOffset = random(
            RAWS.settings.max_room_size - room[0].length
          );

          this.roomStats[(roomRow * roomCols) + roomCol].push({      //store room gen data
            width: room.length,                                      //for connecting hallways
            height: room[0].length,
            rowOffset: rowOffset,
            colOffset: colOffset
          });

          //   } else { console.log("Room not generated"); }
//KEEP REFACTORING STARTING HERE!
          if (room !== null) {
            for (let row = 0; row < room.length; row++) {
              for (let col = 0; col < room[0].length; col++) {
                map
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
            map
            [(RAWS.settings.max_room_size * roomRow) + rowOffset + row]
            [(RAWS.settings.max_room_size * roomCol) + colOffset + col] 
            = room[row][col];
          }
        }
      }
   
      map = this.generateHallways(map, roomStats, roomRows, roomCols);
      map = this.generateBorder(map);

      if (this.isConnected(map)) {
        connected = true;
      }
    }

    //Replace the null values with spaces
    for (let row = 0; row < RAWS.settings.rows; row++) {
      for (let col = 0; col < RAWS.settings.cols; col++) {
        if (map[row][col] === null) {
          map[row][col] = CONSTS.SPACE;
        }
      }
    }
    return map;
  },

  generateBorder: function (map) {
    for (let col = 0; col < map[0].length; col++) {
      map[0][col], map[map.length-1][col]  = RAWS.map.text.wall;
    }

    for (let row = 0; row < map.length; row++) {
      map[row][0], map[row][map[row].length] = RAWS.map.text.wall;
    }

    return map;
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

  isConnected: function (map) {
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

        if (map[x][y] === RAWS.map.text.floor) {
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
                    if (map[row][col] === RAWS.map.text.floor && !connected[row][col]) {
                        connected[row][col] = true;
                        floorList.push([row,col]);
                    }
                }
            }
        }
    }

    for (let row = 0; row < RAWS.settings.rows; row++) {
        for (let col = 0; col < RAWS.settings.cols; col++) {
            if (map[row][col] === RAWS.map.text.floor && connected[row][col] === false) {
                return false;
            }
        }
    }

    return true;
}
*/
