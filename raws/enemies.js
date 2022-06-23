const Entity = {
    "id": "",
    "coords": {
        "x": -1,
        "y": -1,
    },
    "canFight": function () {
      if (this.hp !== undefined
      && this.atk !== undefined
      && this.def !== undefined) {
          return true;
      } else {
          return false;
      }
    },
    "holdsShards": function() {
      if (this.shards !== undefined) {
          return true;
      } else {
          return false;
      }
    },
    "isLucky": function () {
      if (this.lucky !== undefined) {
          return true;
      } else {
          return false;
      }
    }
    "render": {
        "symbol": "",
        "color": ""
    }
}

const ENEMIES = [ 
  {
    "id": "minion",
    "hp": 10,
    "atk": 4,
    "def": 3,
    "shards": 0,
    "x": -1,
    "y": -1,
      "hit": function (dmg) {
          this.hp -= dmg;
      },
    "fights": {
    },
    "renderable": {
      "symbol": "m",
      "color": "red"
    },
    "spawnRate": 1,
    "isLucky": false
  },
  {
    "id": "maxion",
    "hp": 22,
    "atk": 6,
    "def": 6,
    "shards": 0,
    "x": -1,
    "y": -1,
      "hit": function (dmg) {
          this.hp -= dmg;
      },
    "fights": {
    },
    "renderable": {
      "symbol": "M",
      "color": "red"
    },
    "spawnRate": .2,
    "isLucky": false
  }
];
