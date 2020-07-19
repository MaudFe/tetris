/*****************************
 * UTILITIES FOR TETRIS GAME *
 *****************************/

/* VARIABLES */
let main_canvas = document.getElementById("main-grid");
let main_context = main_canvas.getContext("2d");
let linesDisplay = document.getElementById("lines-display");
let scoreDisplay = document.getElementById("score-display");
let lines = 0;
let score = 0;
const ROWS = 20,
  COLS = 10;
const WIDTH = 300,
  HEIGHT = 600;
const block_width = WIDTH / COLS,
  block_height = HEIGHT / ROWS;
let main_grid = [];
let upNext_grid = [];
let game_over;
let interval;
let intervalRender;
let moving = []; // Currently moving tetro
let currentX, currentY; // Coordinates of the current tetro
let settled; // Is the current tetro settled on the grid or not
let next = [];
let upNext_canvas = document.getElementById("up-next-grid");
let upNext_context = upNext_canvas.getContext("2d");

const shapes = [
  [1, 1, 1, 1], // I Shape
  [1, 1, 1, 0, // J Shape
   0, 0, 1, ],
  [1, 1, 1, 0, // L Shape
   1,],
  [1, 1, 0, 0, // O Shape
   1, 1, ],
  [0, 1, 1, 0, // S Shape
   1, 1, ],
  [0, 1, 0, 0, // T Shape
   1, 1, 1, ],
  [1, 1, 0, 0, // Z Shape
   0, 1, 1, ],
];

const colors = [
  'cyan', 'blue', 'orange', 'gold', 'red', '#ADFF2F', 'darkviolet'
];

/* FUNCTIONS */

// To toggle the navbar containing the rules of Tetris.
$(".navbar-toggler").click(function () {
  $("#rulesToggleNavbar").toggle();
});

// creates a new 4x4 shape in global variable 'current'
function newShape() {
  let random_id = Math.floor(Math.random() * shapes.length); // Using Math.floor and Math.random to get an int randomly
  let shape = shapes[random_id]; // To keep the same color and shape together

  for (let y = 0; y < 4; y++) {
    moving[y] = [];
    for (let x = 0; x < 4; x++) {
      let i = 4 * y + x;
      if (typeof shape[i] !== "undefined" && shape[i]) {
        moving[y][x] = random_id + 1;
      } else {
        moving[y][x] = 0;
      }
    }
  }

  settled = false; // The created shapes now moves
  currentX = 5; // Starting positions for the shape
  currentY = 0;
}

// Init the main game board
function newGrid() {
  for (let y = 0; y < ROWS; y++) {
    main_grid[y] = [];
    for (let x = 0; x < COLS; x++) {
      main_grid[y][x] = 0;
    }
  }
}

function newUpNext() {
  for (let y = 0; y < ROWS/4; y++) {
    upNext_grid[y] = [];
    for (let x = 0; x < COLS/2; x++) {
      upNext_grid[y][x] = 0;
    }
  }
}

// Keeps the game going : shape moving down or settling and creating new shape
function tick() {
  if (clear(0, 1)) {
    // If the shape can move down
    currentY++;
  } else {
    // If the shape has settled
    settle();
    clear(0, 1);
    clearLine();
    if (game_over) {
      clearAllIntervals();
      return false;
    }
    newShape();
  }
}

// The shape stops and settles on the grid
function settle() {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (moving[y][x]) {
        main_grid[y + currentY][x + currentX] = moving[y][x];
      }
    }
  }
  settled = true;
}

// Creates a rotation of the current moving tetro anticlockwise
function rotate(moving) {
  let newMoving = [];
  for (let y = 0; y < 4; y++) {
    newMoving[y] = [];
    for (let x = 0; x < 4; x++) {
      newMoving[y][x] = moving[3 - x][y];
    }
  }

  return newMoving;
}

// Check if bottom lines are filled, if yes clears them
function clearLine() {
  for (let y = ROWS - 1; y >= 0; y--) {
    let rowFilled = true;
    for (let x = 0; x < COLS; x++) {
      if (main_grid[y][x] === 0) {
        rowFilled = false;
        break;
      }
    }
    if (rowFilled) {
      for (let z = y; z > 0; z--) {
        for (let x = 0; x < COLS; x++) {
          main_grid[z][x] = main_grid[z - 1][x];
        }
      }
      score += 10;
      lines += 1;
      linesDisplay.innerHTML = lines;
      scoreDisplay.innerHTML = score;
      y++;
    }
  }
}

// Checks if the next position is clear to move down
function clear(offsetX, offsetY, newMoving) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  offsetX = currentX + offsetX;
  offsetY = currentY + offsetY;
  newMoving = newMoving || moving;

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (newMoving[y][x]) {
        if (
          typeof main_grid[y + offsetY] === "undefined" ||
          typeof main_grid[y + offsetY][x + offsetX] === "undefined" ||
          main_grid[y + offsetY][x + offsetX] ||
          x + offsetX < 0 ||
          y + offsetY >= ROWS ||
          x + offsetX >= COLS
        ) {
          if (offsetY === 1 && settled) {
            game_over = true; // It's finished if the shape hits to top row
            chronoStop();
            alert("Game over...");
            document.getElementById("start-button").disabled = false;
          }
          return false;
        }
      }
    }
  }
  return true;
}

document.getElementById("start-button").onclick = function(){
  newGame();
  chronoStart();
  document.addEventListener('keydown', controlShape)
  document.getElementById("start-button").disabled = true;
};


function newGame() {
  clearAllIntervals();
  intervalRender = setInterval(render, 30);
  newGrid();
  newUpNext();
  newShape();
  game_over = false;
  interval = setInterval(tick, 600);
}

function clearAllIntervals() {
  clearInterval(interval);
  clearInterval(intervalRender);
}

// Draw a square (block) at (x, y) coordinates
function drawBlock(x, y) {
  main_context.fillRect(block_width * x, block_height * y, block_width - 1, block_height - 1);
  main_context.strokeRect(block_width * x, block_height * y, block_width - 1, block_height - 1);
}

function drawNext(x, y) {
  upNext_context.fillRect(block_width * x, block_height * y, block_width - 1, block_height - 1);
  upNext_context.strokeRect(block_width * x, block_height * y, block_width - 1, block_height - 1);
}

let invalid = {};
const upNext_block = 5;
function invalidateNext() { 
  invalid.next = true; 
}


// Draw the grid and the moving shape
function render() {
  main_context.clearRect(0, 0, WIDTH, HEIGHT);
  main_context.strokeStyle = "grey";
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if (main_grid[y][x]) {
        main_context.fillStyle = colors[main_grid[y][x] - 1];
        drawBlock(x, y);
      }
    }
  }

  main_context.fillStyle = "#202020";
  main_context.strokeStyle = "grey";
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (moving[y][x]) {
        main_context.fillStyle = colors[moving[y][x] - 1];
        drawBlock(currentX + x, currentY + y);
      }
    }
  }

  console.log("yo")
  let upNext_display = (upNext_block) / 2; 
  upNext_context.save();
  upNext_context.translate(0.5, 0.5);
  upNext_context.clearRect(0, 0, upNext_display*block_width, upNext_display*block_height);
  upNext_context.strokeStyle = 'grey';
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (next) {
        upNext_context.fillStyle = colors[next - 1];
        drawNext(x, y);
      }
    }
  }
  upNext_context.strokeRect(0, 0, upNext_display*block_width - 1, upNext_display*block_height - 1);
  upNext_context.restore();
  invalid.next = false;

}


function controlShape(e) {
  e.preventDefault();
  if (e.keyCode === 37) {
    if (clear(-1)) {
      currentX--;
    }
  } else if (e.keyCode === 39) {
    if (clear(1)) {
      currentX++;
    }
  } else if (e.keyCode === 32) {
    while (clear(0, 1)) {
      currentY++;
    }
    tick();
  } else if (e.keyCode === 38) {
    let rotation = rotate(moving);
    if (clear(0, 0, rotation)) {
      moving = rotation;
    }
  } else if (e.keyCode === 40) {
    if (clear(0, 1)) {
      currentY++;
    }
  }
  render();
};


/**************************
* UTILITIES FOR THE TIMER *
***************************/

let setTime = 0;
let timeStart = 0;
let timeNow = 0;
let timeInter = 0;
let tTime = [];
let nTime = 0;

function showTime(time) {
  let tMin = time.getMinutes();
  let tSec = time.getSeconds();
  let tMil = Math.round(time.getMilliseconds() / 10); 
  if (tMin < 10) {
    tMin = "0" + tMin;
  }
  if (tSec < 10) {
    tSec = "0" + tSec;
  }
  if (tMil < 10) {
    tMil = "0" + tMil;
  }
  document.getElementById("chrono").innerHTML =
    tMin + "min " + tSec + "sec " + tMil;
}

function getChrono() {
  timeNow = new Date();
  Inter = timeNow - timeStart;
  timeInter = new Date(Inter);
  showTime(timeInter);
}

function chronoStart() {
  chronoStop();
  if (timeInter == 0) {
    timeStart = new Date();
  } else {
    timeNow = new Date();
    Pause = timeNow - timeInter;
    timeStart = new Date(Pause);
  }
  setTime = setInterval(getChrono, 10);
}

function chronoStop() {
  clearInterval(setTime);
  timeInter = 0;
}

