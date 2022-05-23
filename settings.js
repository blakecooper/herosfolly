//Default font size (in em)
const DEFAULT_FONT_SIZE = 1.5;

//Minimum number of potential monsters per floor
const BASE_ENEMIES_PER_FLOOR = 4;

const MINION_BASE_HP = 10;
const MINION_BASE_ATK = 4; 
const MINION_BASE_DEF = 3;

const MAXION_BASE_HP = 22;
const MAXION_BASE_ATK = 6;
const MAXION_BASE_DEF = 6;

//Number of shards per floor
const SHARDS_PER_LEVEL = 1000;

//In the future, this will hold color change spectra for various effects
const PALETTES = {
    "deteriorate": [
        "#000000",
        "#00001C",  
        "#000039",
        "#000055",
        "#000071",
        "#00008E",
        "#0000AA",
        "#0000C6",
        "#0000E3", 
        "#0000FF"
    ],
    "leeching": [
        "#FFFFFF",
        "#D5FFD5",
        "#AAFFAA",
        "#80FF80",
        "#55FF55",
        "#2BFF2B",
        "#00FF00"
    ]
};

const KEYMAP = {
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
};

const MAX_NUMBER_HIGH_SCORES = 1;

const deteriorationDamage = [1, 1, 2, 3, 5, 8, 13, 21];

const FPS = 24;

const SECONDS_DISPLAY_STATUS = 3;
