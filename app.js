document.addEventListener("DOMContentLoaded", () => {
  // The Basics
  const rows = 20;
  const columns = 10;
  const boardSize = rows * columns;

  const board = getBoard();
  let squares = Array.from(board.querySelectorAll("div"));
  const startBtn = document.querySelector("#start-button");
  const gameBtn = document.querySelector("#new-game-button");
  const scoreDisplay = document.querySelector("#score-display");
  const linesDisplay = document.querySelector(".lines-display");
  const width = 10;
  let currentIndex = 0;
  let currentRotation = 0;
  let nextRandom = 0;
  let timerId;
  let score = 0;
  let lines = 0;
  const colors = [
    "url(images/blue_block.png)",
    "url(images/navy_block.png)",
    "url(images/pink_block.png)",
    "url(images/yellow_block.png)",
    "url(images/green_block.png)",
    "url(images/purple_block.png)",
    "url(images/peach_block.png)",
  ];

  // To toggle the navbar containing the rules of Tetris.
  $(".navbar-toggler").click(function () {
    $("#rulesToggleNavbar").toggle();
  });

  // We need to create the board ourselves properly (not typing 200 divs in html)
  function getBoard() {
    // Creating the board
    let board = document.querySelector(".grid");
    for (let i = 0; i < boardSize; i++) {
      let boardUnit = document.createElement("div");
      board.appendChild(boardUnit);
    }

    // Setting the base of the board
    for (let i = 0; i < columns; i++) {
      let boardUnit = document.createElement("div");
      boardUnit.setAttribute("class", "block3");
      board.appendChild(boardUnit);
    }

    // Creating the Up Next Grid
    let upNextGrid = document.querySelector(".next-up-grid");
    for (let i = 0; i < 16; i++) {
      let gridUnit = document.createElement("div");
      upNextGrid.appendChild(gridUnit);
    }

    return board;
  }

  // Assign functions to keyCodes
  function control(event) {
    if (event.keyCode === 37 || event.keyCode === 81) {
      moveLeft();
    } else if (event.keyCode === 38 || event.keyCode === 90) {
      rotation();
    } else if (event.keyCode === 39 || event.keyCode === 68) {
      moveRight();
    } else if (event.keyCode === 40 || event.keyCode === 83) {
      moveDown();
    }
  }

  // Speeding up the tetromino moving down when the down-associated key is pressed
  document.addEventListener("keydown", control);

  // The Tetrominoes from the original game
  const iTetro = [
    [1, rows + 1, rows * 2 + 1, rows * 3 + 1],
    [rows, rows + 1, rows + 2, rows + 3],
    [1, rows + 1, rows * 2 + 1, rows * 3 + 1],
    [rows, rows + 1, rows + 2, rows + 3]
  ]; // OK

  const jTetro = [
    [1, rows + 1, rows * 2 + 1, 2],
    [rows, rows + 1, rows + 2, rows * 2 + 2],
    [1, rows + 1, rows * 2 + 1, rows * 2],
    [rows, rows * 2, rows * 2 + 1, rows * 2 + 2]
  ]; //OK

  const lTetro = [
    [1, rows + 1, rows * 2 + 1, width * 2 + 2],
    [rows * 2, rows * 2 + 1, rows * 2 + 2, rows + 2],
    [0, 1, rows + 1, rows * 2 + 1],
    [rows, rows + 1, rows + 2, rows * 2]
  ]; // OK

  const oTetro = [
    [0, 1, rows, rows + 1],
    [0, 1, rows, rows + 1],
    [0, 1, rows, rows + 1],
    [0, 1, rows, rows + 1]
  ]; // OK

  const sTetro = [
    [0, rows, rows + 1, rows * 2 + 1],
    [rows + 1, rows + 2, rows * 2, rows * 2 + 1],
    [0, rows, rows + 1, rows * 2 + 1],
    [rows + 1, rows + 2, rows * 2, rows * 2 + 1]
  ]; // OK

  const tTetro = [
    [1, rows, rows + 1, rows + 2],
    [1, rows + 1, rows + 2, rows * 2 + 1],
    [rows, rows + 1, rows + 2, rows * 2 + 1],
    [1, rows, rows + 1, rows * 2 + 1]
  ]; // OK

  const zTetro = [
    [1, rows, rows + 1, rows * 2],
    [rows, rows + 1, rows * 2 + 1, rows * 2 + 2],
    [1, rows, rows + 1, rows * 2],
    [rows, rows + 1, rows * 2 + 1, rows * 2 + 2]
  ]; // OK

  const tetrominoes = [iTetro, jTetro, lTetro, oTetro, sTetro, tTetro, zTetro];

  // Select a Tetromino and its first rotation randomly
  let random = Math.floor(Math.random() * tetrominoes.length); // Math.floor round a number to its closest int
  let current = tetrominoes[random][currentRotation];

  let currentPosition = 4;

  // Draw a tetromino
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("block");
      squares[currentPosition + index].style.backgroundImage = colors[random];
    });
  }

  // Undraw the tetromino
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("block");
      squares[currentPosition + index].style.backgroundImage = "none";
    });
  }

  // Making the buttons work
  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      fStop();

    } else {
      fStart();
      draw();
      timerId = setInterval(moveDown, 1000);
      nextRandom = Math.floor(Math.random() * tetrominoes.length);
      displayShape();
    }
  });

  // Move Down function
  function moveDown() {
    undraw();
    currentPosition = currentPosition += width;
    draw();
    freeze();
  }

  // Move the tetromino left, unless there is an edge or a blockage
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    );

    if (!isAtLeftEdge) {
      currentPosition -= 1;
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("block2")
      )
    ) {
      currentPosition += 1;
    }

    draw();
  }

  // Move the tetromino right, unless there is an edge or a blockage
  function moveRight() {
    undraw();
    const isAtRigthEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    );

    if (!isAtRigthEdge) {
      currentPosition += 1;
    }

    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("block2")
      )
    ) {
      currentPosition -= 1;
    }

    draw();
  }

  // Freeze the tetromino when it reaches a bottom wall
  function freeze() {
    if (
      // If tetromino has settled
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains("block3") || squares[currentPosition + index + width].classList.contains('block2')
      )
    ) {
      current.forEach((index) =>
        squares[index + currentPosition].classList.add("block2")
      );
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * tetrominoes.length);
      current = tetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }
  freeze()

  // Rotate the tetromino
  function rotation() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) {
      // If the current rotation gets to 4; goes to the first one
      currentRotation = 0;
    }
    current = tetrominoes[random][currentRotation];
    draw();
  }

  // Show up the next up tetramino in our mini grid
  const displaySquares = document.querySelectorAll(".next-up-grid div");
  const displayWidth = 4;
  const displayIndex = 0;

  // Array of the tetrominos on their first rotation only
  const nextTetro = [
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], // iTetro
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], // jTetro
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2], //lTetro
    [0, 1, displayWidth, displayWidth + 1], // oTetro
    [0, displayWidth, displayIndex + 1, displayIndex * 2 + 1], // sTetro
    [1, displayIndex, displayIndex + 1, displayIndex + 2], // tTetro
    [1, displayIndex, displayIndex + 1, displayIndex * 2] // zTetro
  ];

  // Display the shape of the next tetromino
  function displayShape() {
    // Remove any tetromino from the grid
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundImage = "none";
    });

    nextTetro[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("block");
      displaySquares[displayIndex + index].style.backgroundImage =
        colors[nextRandom];
    });
  }

  // Add score
  function addScore() {
    for (currentIndex = 0; currentIndex < boardSize; currentIndex += rows) {
      const row = [
        currentIndex,
        currentIndex + 1,
        currentIndex + 2,
        currentIndex + 3,
        currentIndex + 4,
        currentIndex + 5,
        currentIndex + 6,
        currentIndex + 7,
        currentIndex + 6,
        currentIndex + 7,
        currentIndex + 8,
        currentIndex + 9,
      ];

      if (row.every((index) => squares[index].classList.contains("block2"))) {
        score += 10;
        lines += 1;
        scoreDisplay.innerHTML = score;
        linesDisplay.innerHTML = lines;
        row.forEach((index) => {
          squares[index].classList.remove("block2") ||
            squares[index].classList.remove("block");
          squares[index].style.backgroundImage = "none";
        });
        const squaresRemoved = squares.splice(currentIndex, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => board.appendChild(cell));
      }
    }
  }

  // Game over function
  function gameOver() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("block2")
      )
    ) {
      scoreDisplay.innerHTML = "Game Over ...";
      clearInterval(timerId);
      fStop();
    }
  }

  gameBtn.addEventListener("click", () => {
    location.reload();
  });

  let setTm = 0;
  let tmStart = 0;
  let tmNow = 0;
  let tmInterv = 0;
  let tTime = [];
  var nTime = 0;
  function affTime(tm) {
    //affichage du compteur
    var vMin = tm.getMinutes();
    var vSec = tm.getSeconds();
    var vMil = Math.round(tm.getMilliseconds() / 10); //arrondi au centième
    if (vMin < 10) {
      vMin = "0" + vMin;
    }
    if (vSec < 10) {
      vSec = "0" + vSec;
    }
    if (vMil < 10) {
      vMil = "0" + vMil;
    }
    document.getElementById("chrono").innerHTML =
      vMin + "min " + vSec + "sec " + vMil;
  }

  function fChrono() {
    tmNow = new Date();
    Interv = tmNow - tmStart;
    tmInterv = new Date(Interv);
    affTime(tmInterv);
  }

  function fStart() {
    fStop();
    if (tmInterv == 0) {
      tmStart = new Date();
    } else {
      //si on repart après un clic sur Stop
      tmNow = new Date();
      Pause = tmNow - tmInterv;
      tmStart = new Date(Pause);
    }
    setTm = setInterval(fChrono, 10); //lancement du chrono tous les centièmes de secondes
  }

  function fStop() {
    clearInterval(setTm);
    tTime[nTime] = tmInterv;
  }
});



