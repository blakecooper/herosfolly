const RAWS = {
  "settings": {
    "default_font_size": 1.5,
    "base_spawn_rate": 500,
    "keymap": {
       "37": CONSTS.LEFT,
       "38": CONSTS.UP,
       "39": CONSTS.RIGHT,
       "40": CONSTS.DOWN,
       "49": CONSTS.DOWNLEFT,
       "50": CONSTS.DOWN,
       "51": CONSTS.DOWNRIGHT,
       "52": CONSTS.LEFT,
       "52": CONSTS.WAIT,
       "54": CONSTS.RIGHT,
       "55": CONSTS.UPLEFT,
       "56": CONSTS.UP,
       "57": CONSTS.UPRIGHT,
       "97": CONSTS.DOWNLEFT,
       "98": CONSTS.DOWN,
       "99": CONSTS.DOWNRIGHT,
       "100": CONSTS.LEFT,
       "101": CONSTS.WAIT,
       "102": CONSTS.RIGHT,
       "103": CONSTS.UPLEFT,
       "104": CONSTS.UP,
       "105": CONSTS.UPRIGHT,
       "190": CONSTS.WAIT
    },
    "fps": 24,
    "seconds_display_status": 3
  },
  "map": {
    "text": {
      "floor": "#",
      "wall": "-",
      "exit": "x"
    }
  }, 
  "entities": {
    //Don't change this method! It's responsible
    //for making entities in-game!
    "make": function (o) {
        let e = new Entity();
        for (prop in this[o]) {
            e[prop] = this[o][prop];
        }
        return e;
    },
    "player": {
      "id": "player",
      "base_hp": 10,
      "hp": 10,
      "atk": 10,
      "def": 10,
      "shards": 0,
      "render": {
        "symbol": "@",
        "color": "WHITE"
      },
      "lucky": function () {
        if (this.hp < this.base_hp) {
          this.hp++;
        }  
      }
    },
    "minion": {
      "id": "minion",
      "base_hp": 10,
      "hp": 10,
      "atk": 4,
      "def": 3,
      "shards": 0,
      "render": {
        "symbol": "m",
        "color": "red"
      },
      "spawnRate": 1,
	"isMonstrous": true
    },
    "maxion": {
      "id": "maxion",
      "base_hp": 22,
      "hp": 22,
      "atk": 6,
      "def": 6,
      "shards": 0,
      "render": {
        "symbol": "M",
        "color": "red"
      },
      "spawnRate": .2,
      "isMonstrous": true
    },
    "potion": {
      "id": "potion",
      "render": {
          "symbol": "!",
          "color": ""
      },
      "onConsume": function (consumer) {
        if (consumer.canFight()) {
            consumer.hp++;
        }
      },
      "spawnRate": .2
    },
    "shard": {
      "id": "shard",
      "render": {
        "symbol": "*",
        "color": "yellow"
      },
      "onConsume": function (consumer) {
        if (consumer.holdsShards()) {
          consumer.shards++;
        }
      },
      "spawnRate": 2
    },
    "restore": {
      "id": "restore",
      "render": {
        "symbol": "%",
        "color": "green"
      },
      "onConsume": function (consumer) {
        if (consumer.canFight()) {
          consumer.hp = consumer.base_hp;
        }
      },
      "spawnRate": .2
    }
  }
}
