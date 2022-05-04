//Minimum number of potential monsters per floor
const BASE_ENEMIES_PER_FLOOR = 4;

//Number of shards per floor
const SHARDS_PER_LEVEL = 10;

//In the future, this will hold color change spectra for various effects
const PALETTES = {
    "deteriorate": [
        "#FFFFFF",
        "#E3E3FF",  
        "#C6C6FF",
        "#AAAAFF",
        "#8E8EFF",
        "#7171FF",
        "#5555FF",
        "#3939FF",
        "#1C1CFF", 
        "#0000FF"
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
	"54": RIGHT,
	"55": UPLEFT,
	"56": UP,
	"57": UPRIGHT,
	"97": DOWNLEFT,
	"98": DOWN,
	"99": DOWNRIGHT,
	"100": LEFT,
	"102": RIGHT,
	"103": UPLEFT,
	"104": UP,
	"105": UPRIGHT,
	"190": WAIT
};

const MAX_NUMBER_HIGH_SCORES = 1;

const deteriorationDamage = [1, 1, 2, 3, 5, 8, 13, 21];

const FPS = 25;

const SECONDS_DISPLAY_STATUS = 3;
