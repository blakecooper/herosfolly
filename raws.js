const RAWS = {
    //TODO: refine this process!
  "colors": {
    "RED": "#A00000",
    "LIGHTRED": "#F30000",
    "GREEN": "#00B100",
    "LIGHTGREEN": "#08FF00",
    "BLUE": "#115FF0",
    "LIGHTBLUE": "#0A98DD",
    "YELLOW": "yellow",
    "ORANGE": "brown",
    "WHITE": "white"
  },
  "settings": {
    "chance_in_10_rooms_dont_spawn": 0,
    "is_seen_opacity": .9,
    "min_room_size": 4,
    "max_room_size": 9,
    "rows": 128,
    "cols": 256,
    "potions_per_level": 24,
    "default_font_size": 1.5,
    "base_spawn_rate": 600,
    "shards_required_to_advance": 50,
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
      "exit": "x",
      "door": "O",
      "void": "X"
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
      },
      "viewDistance": 12
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
        "color": "ORANGE" 
      },
      "spawnRate": .15,
      "isMonstrous": true,
      "viewDistance": 11
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
        "color": "ORANGE"
      },
      "spawnRate": .05,
      "isMonstrous": true,
      "viewDistance": 10
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
      "spawnRate": .1
    },
    "shard": {
      "id": "shard",
      "render": {
        "symbol": "*",
        "color": "YELLOW"
      },
      "onConsume": function (consumer) {
        if (consumer.holdsShards()) {
          consumer.shards++;
        }
      },
      "spawnRate": 2.5
    },
    "restore": {
      "id": "restore",
      "render": {
        "symbol": ".",
        "color": "GREEN"
      },
      "onConsume": function (consumer) {
        if (consumer.canFight()) {
          consumer.hp = consumer.base_hp;
        }
      },
      "spawnRate": .1
    },
    "door": {
      "id": "door",
      "spawnRate": .05 //spawn rate for each dimension's doors
    }
  },
  "dimensions": {
    "hp": {
      "id": "hp",
      "bgColor": "GREEN",
      "potionColor": "LIGHTGREEN",
      "potionEffect": function() {
        GAME.player.baseHpUp();
      }
    },
    "atk": {
      "id": "atk",
      "bgColor": "RED",
      "potionColor": "LIGHTRED",
      "potionEffect": function () {
        GAME.player.atkUp();
      }
    },
    "def": {
      "id": "def",
      "bgColor": "BLUE",
      "potionColor": "LIGHTBLUE",
      "potionEffect": function () {
        GAME.player.defUp();
      }
    }
  }
}
