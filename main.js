const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');
const resetBtn = document.getElementById('resetBtn');

const CELL_SIZE = 30;
const COLS = 20;
const ROWS = 20;

let player = { x: 1, y: 1 };
let goal = { x: COLS - 2, y: ROWS - 2 };
let maze = [];
let startTime = Date.now();
let timerInterval;
let currentLevel = 1;

class MazeGenerator {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.maze = [];
    this.generate();
  }

  generate() {
    for (let y = 0; y < this.rows; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.maze[y][x] = 1;
      }
    }

    const stack = [];
    const startX = 1;
    const startY = 1;
    
    this.maze[startY][startX] = 0;
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        const wallX = current.x + (next.x - current.x) / 2;
        const wallY = current.y + (next.y - current.y) / 2;
        this.maze[wallY][wallX] = 0;
        this.maze[next.y][next.x] = 0;
        
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    this.maze[1][1] = 0;
    this.maze[this.rows - 2][this.cols - 2] = 0;
  }

  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -2 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
      { x: -2, y: 0 }
    ];

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (newX > 0 && newX < this.cols - 1 && 
          newY > 0 && newY < this.rows - 1 && 
          this.maze[newY][newX] === 1) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  getMaze() {
    return this.maze;
  }
}

function initGame() {
  const generator = new MazeGenerator(COLS, ROWS);
  maze = generator.getMaze();
  player = { x: 1, y: 1 };
  goal = { x: COLS - 2, y: ROWS - 2 };
  startTime = Date.now();
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(updateTimer, 100);
  draw();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timeDisplay.textContent = elapsed;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#34495e';
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  ctx.fillStyle = '#2ecc71';
  ctx.beginPath();
  ctx.arc(
    goal.x * CELL_SIZE + CELL_SIZE / 2,
    goal.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(
    player.x * CELL_SIZE + CELL_SIZE / 2,
    player.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function movePlayer(dx, dy) {
  const newX = player.x + dx;
  const newY = player.y + dy;

  if (newX >= 0 && newX < COLS && newY >= 0 && newY < ROWS && maze[newY][newX] === 0) {
    player.x = newX;
    player.y = newY;
    draw();

    if (player.x === goal.x && player.y === goal.y) {
      clearInterval(timerInterval);
      const time = Math.floor((Date.now() - startTime) / 1000);
      setTimeout(() => {
        alert(`Congratulations! You completed level ${currentLevel} in ${time} seconds!`);
        currentLevel++;
        levelDisplay.textContent = currentLevel;
        initGame();
      }, 100);
    }
  }
}

document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movePlayer(0, -1);
      e.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      movePlayer(0, 1);
      e.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movePlayer(-1, 0);
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      movePlayer(1, 0);
      e.preventDefault();
      break;
  }
});

resetBtn.addEventListener('click', () => {
  currentLevel = 1;
  levelDisplay.textContent = currentLevel;
  initGame();
});

initGame();
    
