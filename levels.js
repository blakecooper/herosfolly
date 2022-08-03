let LEVEL = {

  addBorder: function (map) {
    for (let col = 0; col < map[0].length; col++) {
      map[0][col], map[map.length-1][col] = 
        RAWS.map.text.wall;
    }

    for (let row = 0; row < map.length; row++) {
      map[row][0], map[row][map[row].length] = 
        RAWS.map.text.wall;
    }

    return map;
  },

  addHallways: function (map, roomRows, roomCols) {
    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
      for (let roomCol = 0; roomCol < roomCols; roomCol++) {

        let statsIdx = (roomRow * roomCols) + roomCol;

        if (this.roomStats[statsIdx].width !== -1 
        && roomCol < roomCols - 1) {
          this.buildHallway(
            CONSTS.HORIZONTAL,
            map,
            roomRow,
            roomCol,
            statsIdx
          );
        }

        if (this.roomStats[statsIdx].width !== -1
        && roomRow < roomRows - 1) {
          this.buildHallway(
            CONSTS.VERTICAL,
            map,
            roomRow,
            roomCol,
            statsIdx
          );
        }
      }
    }
    return map;
  },

  buildHallway: function (mode, map, row, col, statsIdx) {
    let x = Math.floor(
      (this.roomStats[statsIdx].width + this.roomStats[statsIdx].rowOffset) / 2
    ) + (row * RAWS.settings.max_room_size);

    let y = Math.floor(
      (this.roomStats[statsIdx].height + this.roomStats[statsIdx].colOffset) / 2
    ) + (col * RAWS.settings.max_room_size);

    if (typeof map[x] !== 'undefined') {
      if (map[x][y] !== RAWS.map.text.wall) {
        while (map[x][y] !== RAWS.map.text.wall 
        && x < RAWS.settings.rows
        && y < RAWS.settings.cols) {

          if (mode === CONSTS.HORIZONTAL) {
            y++;
          } else if (mode === CONSTS.VERTICAL) {
            x++;
          }
        }
      }

      map[x][y] = RAWS.map.text.floor;

      if (mode === CONSTS.HORIZONTAL) {
        y++;
      } else if (mode === CONSTS.VERTICAL) {
        x++;
      }

      if (mode === CONSTS.HORIZONTAL) {
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
      } else if (mode === CONSTS.VERTICAL) {
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
      }

      if (y === (RAWS.settings.cols)) {                //Edge cases: cap off
        map[x][y-1] = RAWS.map.text.wall;              //hallways that go
      }                                                //off the edge of the map

      if (x === (RAWS.settings.rows)) {
        map[x-1][y] = RAWS.map.text.wall;
      }
    }
  },

  generate: function () {

    let map = initializeMatrix(
      RAWS.settings.rows,
      RAWS.settings.cols,
      CONSTS.SPACE
    );

    let roomRows =                                                 //partition map into zones
      Math.floor(RAWS.settings.rows/RAWS.settings.max_room_size);  //where rooms can generate
    let roomCols = 
      Math.floor(RAWS.settings.cols/RAWS.settings.max_room_size);

    for (let roomRow = 0; roomRow < roomRows; roomRow++) {
      for (let roomCol = 0; roomCol < roomCols; roomCol++) {

        let room = this.generateRoom();

        if (random(10) > RAWS.settings.chance_in_10_rooms_dont_spawn){

          let rowOffset = random(                                    //determines how far from
            RAWS.settings.max_room_size - room.length                //the edges of the zone
          );                                                         //the room is placed

          let colOffset = random(
            RAWS.settings.max_room_size - room[0].length
          );

          this.roomStats.push({                                      //store room gen data
            width: room.length,                                      //for connecting hallways
            height: room[0].length,
            rowOffset: rowOffset,
            colOffset: colOffset
          });

        } else {
          this.roomStats.push({
            width: -1,
            height: -1,
            rowOffset: -1,
            colOffset: -1
          });
        }  

        if (this.roomStats[this.roomStats.length - 1].width !== -1) {
          for (let row = 0; row < room.length; row++) {            //add room to map
            for (let col = 0; col < room[0].length; col++) {
              map
              [(RAWS.settings.max_room_size * roomRow) 
                + this.roomStats[this.roomStats.length - 1].rowOffset + row]
              [(RAWS.settings.max_room_size * roomCol) 
                + this.roomStats[this.roomStats.length - 1].colOffset + col] 
              = room[row][col];
            }
          }
        }
      }
    }

    if (this.noRooms()) {                                          //in the (highly unlikely)
      let room = this.generateRoom();                              //case that no rooms spawn,
                                                                   //generate one room and
      let rowOffset = random(                                      //place it on the map
        RAWS.settings.max_room_size - room.length
      );
      let colOffset = random(
        RAWS.settings.max_room_size - room[0].length
      );

      this.roomStats.push({
        width: room.length,
        height: room[0].length,
        rowOffset: rowOffset,
        colOffset: colOffset
      });

      for (let row = 0; row < room.length; row++) {
        for (let col = 0; col < room[0].length; col++) {
          map[rowOffset + row][colOffset + col] = room[row][col];
        }
      }
    }

    return this.addBorder(                                    //generate hallways,
      this.addHallways(                                       //enclose the map with
        map,                                                  //a border and return
        roomRows,
        roomCols
      )
    );
  },

  generateRoom: function () {
    let room = initializeMatrix(                                                //initialize a 
      random(RAWS.settings.max_room_size - RAWS.settings.min_room_size + 1)     //matrix of random
        + RAWS.settings.min_room_size,                                          //acceptable room
      random(RAWS.settings.max_room_size - RAWS.settings.min_room_size + 1)     //size
        + RAWS.settings.min_room_size,
      RAWS.map.text.floor
    );

    for (let row = 0; row < room.length; row++) {
      for (let col = 0; col < room[0].length; col++) {
        if (row === 0
        || col === 0
        || row === room.length - 1
        || col === room[0].length - 1) {
          room[row][col] = RAWS.map.text.wall;                                  //wall it off
        }
      }
    }
    return room;
  },

  noRooms: function () {
    for (let i = 0; i < this.roomStats.length; i++) {
      if (this.roomStats[i].width !== null) {
        return false;
      }
    }
    return true;
  },

  roomStats: [],
};
