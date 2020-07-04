document.addEventListener("DOMContentLoaded", () => {

  // The Basics
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  const width = 10;
  let nextRandom = 0;
  let timerId;
  let score = 0;
  const colors = [
    "deepskyblue",
    "navy",
    "orange",
    "yellow",
    "yellowgreen",
    "darkviolet",
    "red",
  ];

  // The Tetrominoes
  const iTetro = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ]; // OK

  const jTetro = [
    [1, width + 1, width * 2 + 1, width * 2], 
    [width, width * 2, width * 2 + 1, width * 2 + 2], 
    [1, width + 1, width * 2 + 1, 2], 
    [width, width + 1, width + 2, width * 2 + 2], 
  ]; //OK 

  const lTetro = [
    [1, width + 1, width * 2 + 1, width*2+2],
    [width+2, width*2, width*2+1, width * 2 + 2],
    [0, 1, width + 1, width * 2 + 1],
    [width, width + 1, width + 2, width * 2],
  ];

  const oTetro = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const sTetro = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ];

  const tTetro = [
    [width, width + 1, width + 2, width * 2+1],
    [1, width, width + 1, width * 2 + 1],
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
  ];

  const zTetro = [
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2],
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2],
  ];

  const tetrominoes = [iTetro, jTetro, lTetro, oTetro, sTetro, tTetro, zTetro];

  let currentPosition = 4;
  let currentRotation = 0;

  // Select a Tetromino and its first rotation randomly
  let random = Math.floor(Math.random() * tetrominoes.length); // Math.floor round a number to its closest int
  let current = tetrominoes[random][currentRotation];

  // Draw a tetromino
  function draw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add("tetromino");
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }

  // Undraw the tetromino
  function undraw() {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove("tetromino");
      squares[currentPosition + index].style.backgroundColor = "";
    });
  }

  // Assign functions to keyCodes
  function control(e) {
    if (e.keyCode === 37 || e.keyCode === 81) {
      moveLeft();
    } else if (e.keyCode === 38 || e.keyCode === 90) {
      rotation();
    } else if (e.keyCode === 39 || e.keyCode === 68) {
      moveRight();
    } else if (e.keyCode === 40 || e.keyCode === 83) {
      moveDown();
    }
  }
  document.addEventListener("keyup", control);

  // Move Down function
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  // Freeze the tetromino when it reaches a bottom wall
  function freeze() {
    if (
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains(
          "bottom-wall"
        )
      )
    ) {
      current.forEach((index) =>
        squares[currentPosition + index].classList.add("bottom-wall")
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
        squares[currentPosition + index].classList.contains("bottom-wall")
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
      current.some((index) => squares[currentPosition + index].classList.contains("bottom-wall"))) {
      currentPosition -= 1;
    }

    draw();
  }

   ///FIX ROTATION OF TETROMINOS A THE EDGE 
   function isAtRight() {
    return current.some(index=> (currentPosition + index + 1) % width === 0)  
  }
  
  function isAtLeft() {
    return current.some(index=> (currentPosition + index) % width === 0)
  }
  
  function checkRotatedPosition(P){
    P = P || currentPosition;       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1;    //if so, add one to wrap it back around
        checkRotatedPosition(P); //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1;
      checkRotatedPosition(P);
      }
    }
  }

  // Rotate the tetromino
  function rotation() {
    undraw();
    currentRotation ++;
    if (currentRotation === current.length) {
      // If the current rotation gets to 4; goes to the first one
      currentRotation = 0;
    }
    current = tetrominoes[random][currentRotation];
    checkRotatedPosition();
    draw();
  }

  // Show up the next up tetramino in our mini grid
  const displaySquares = document.querySelectorAll(".next-up-grid div");
  const displayWidth = 4;
  const displayIndex = 0;

  // Array of the tetrominos on their first rotation only
  const nextTetro = [
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], // iTetro
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2], // jTetro
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth*2+2], //lTetro
    [0, 1, displayWidth, displayWidth + 1] // oTetro
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // sTetro
    [displayWidth, displayWidth + 1, displayWidth + 2, displayWidth * 2+1], // tTetro
    [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2 + 2], // zTetro
  ];

  // Display the shape of the next tetromino
  function displayShape() {
    
    // Remove any tetromino from the grid
    displaySquares.forEach((square) => {
      square.classList.remove("tetromino");
      square.style.backgroundColor = "";
    });

    nextTetro[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add("tetromino");
      displaySquares[displayIndex + index].style.backgroundColor =
        colors[nextRandom];
    });
  }

  // Making the buttons work
  startBtn.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      draw();
      timerId = setInterval(moveDown, 1000);
      nextRandom = Math.floor(Math.random() * tetrominoes.length);
      displayShape();
    }
  });

  // Add score
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ];

      if (
        row.every((index) => squares[index].classList.contains("bottom-wall"))
      ) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach((index) => {
          squares[index].classList.remove("bottom-wall");
          squares[index].classList.remove("tetromino");
          squares[index].style.backgroundColor = "";
        });
        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach((cell) => grid.appendChild(cell));
      }
    }
  }

  // Game over function
  function gameOver() {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains("bottom-wall")
      )
    ) {
      scoreDisplay.innerHTML = "Game Over ...";
      clearInterval(timerId);
    }
  }
});
