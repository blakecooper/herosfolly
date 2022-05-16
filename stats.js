let STATS = {
	"Player": {
		"BASE_HP":10,
        "BASE_DEF":10,
		"HP":10,
		"DEF":10,
		"ATK":10,
		"SHARDS":0,
        "DETERIORATING":false,
        "DETERIORATION":0,
        "LEECHING":false,
        "LEECH":0,
        "X":-1,
		"Y":-1,
        "TYPE":PLAYER
	},
	"Minion": {
		"BASE_HP":20,
		"HP":6,
		"DEF":4,
		"ATK":3,
        "SHARDS":0,
        "TYPE":MINION
    },
	"Maxion": {
		"BASE_HP":18,
		"HP":18,
		"DEF":7,
		"ATK":6,
        "SHARDS":0,
        "TYPE":MAXION
	}
}

function Minion (hp, atk, def, shards, x, y) {
        this.TYPE = MINION; 
		this.BASE_HP = MINION_BASE_HP;
		this.HP = hp;
		this.ATK = atk;
		this.DEF = def;
        this.SHARDS = shards;
        this.X = x;
        this.Y = y;
        this.RESIDUAL_DAMAGE_PENDING = false;
}

function Maxion (hp, atk, def, shards, x, y) {
        this.TYPE = MAXION; 
		this.BASE_HP = MAXION_BASE_HP;;
		this.HP = hp;
		this.ATK = atk;
		this.DEF = def;
        this.SHARDS = shards;
        this.X = x;
        this.Y = y;
        this.RESIDUAL_DAMAGE_PENDING = false;
}
