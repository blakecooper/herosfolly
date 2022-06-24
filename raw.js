const RAW = {
  "settings": {
    "default_font_size": 1.5,
    "base_spawn_rate": 500,
    "keymap": {
       "37": LEFT,
       "38": UP,
       "39": RIGHT,
       "40": DOWN,
       "49": DOWNLEFT,
       "50": DOWN,
       "51": DOWNRIGHT,
       "52": LEFT,
       "52": WAIT,
       "54": RIGHT,
       "55": UPLEFT,
       "56": UP,
       "57": UPRIGHT,
       "97": DOWNLEFT,
       "98": DOWN,
       "99": DOWNRIGHT,
       "100": LEFT,
       "101": WAIT,
       "102": RIGHT,
       "103": UPLEFT,
       "104": UP,
       "105": UPRIGHT,
       "190": WAIT
    },
    "fps": 24,
    "seconds_display_status": 3
  }, 
    "entities": {
      //Don't change this method! It's responsible
      //for making entities in-game!
      "make": function (o) {
          let e = new Entity();
          for (prop in this.o) {
              e[prop] = this.o[prop];
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
        "renderable": {
          "symbol": "@",
          "color": "WHITE"
        },
        "lucky": function () {
          if (this.hp < this.base_hp) {
            this.hp++;
          }  
        }
      },
      "enemies": [
      {
        "id": "minion",
        "base_hp": 10,
        "hp": 10,
        "atk": 4,
        "def": 3,
        "shards": 0,
        "renderable": {
          "symbol": "m",
          "color": "red"
        },
        "spawnRate": 1,
      },
      {
        "id": "maxion",
        "base_hp": 22,
        "hp": 22,
        "atk": 6,
        "def": 6,
        "shards": 0,
        "renderable": {
          "symbol": "M",
          "color": "red"
        },
        "spawnRate": .2,
      }],
    },
    "items": {
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
        }
      },
      "shards": {
        "id": "shard",
        "render": {
          "symbol": "*",
          "color": "yellow"
        },
        "onConsume": function (consumer) {
          if (consumer.holdsShards()) {
            consumer.shards++;
          }
        }
      }
    }
  }
