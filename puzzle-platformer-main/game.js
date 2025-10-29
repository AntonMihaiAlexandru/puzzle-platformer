const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// === MENIU DE START ===
const startMenu = document.getElementById("startMenu");
const startBtn = document.getElementById("startBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

let gameStarted = false;

function startGame() {
  if (gameStarted) return; // evită restartul
  gameStarted = true;
  startMenu.style.display = "none";
  loadLevel(currentLevel).then(() => {
    requestAnimationFrame(loop); // pornește bucla de joc
  });
}

startBtn?.addEventListener("click", startGame);
fullscreenBtn?.addEventListener("click", () => {
  if (canvas.requestFullscreen) canvas.requestFullscreen();
});

// Pornește și din tastatură (Space / Enter)
document.addEventListener("keydown", (e) => {
  if (!gameStarted && (e.code === "Space" || e.code === "Enter")) {
    startGame();
  }
});

// === DIMENSIUNEA LUMII 
const BASE_WIDTH = 800;
const BASE_HEIGHT = 480;

//=== FULLSCREEN CONFIG ===
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); 


const levelMenu = document.getElementById("levelMenu");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const retryLevelBtn = document.getElementById("retryLevelBtn");

let currentLevel = 1;
let levelCompleted = false;

nextLevelBtn.addEventListener("click", () => {
    levelMenu.style.display = "none";   // hide menu
    currentLevel++;
    loadLevel(currentLevel).then(() => {
        levelCompleted = false;
    });
});

retryLevelBtn.addEventListener("click", () => {
    levelMenu.style.display = "none";   // hide menu
    loadLevel(currentLevel).then(() => {
        levelCompleted = false;
    });
});


const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const gravity = 0.6;

let player = {
  x: 50,
  y: 350,
  w: 32,
  h: 32,
  vy: 0,
  grounded: false
};

let platforms = [];
let exit = {};

async function loadLevel(num = 1) {
  const res = await fetch(`levels/level${num}.json`);
  const data = await res.json();
  player.x = data.playerStart.x;
  player.y = data.playerStart.y;
  platforms = data.platforms;
  exit = data.exit;
  // === Centrăm nivelul pe ecran ===
const levelWidth = Math.max(...platforms.map(p => p.x + p.w), exit.x + exit.w);
const levelHeight = Math.max(...platforms.map(p => p.y + p.h), exit.y + exit.h);

// Calculăm offsetul de centrare
const offsetX = (canvas.width - levelWidth) / 2;
const offsetY = (canvas.height - levelHeight) / 2;

// Aplicăm offset pentru toate obiectele
player.x += offsetX;
player.y += offsetY;
platforms.forEach(p => { p.x += offsetX; p.y += offsetY; });
exit.x += offsetX;
exit.y += offsetY;

}

function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w &&
         rect1.x + rect1.w > rect2.x &&
         rect1.y < rect2.y + rect2.h &&
         rect1.y + rect1.h > rect2.y;
}

//Collision for multiple directions
function resolveCollision(player, platform) {
  const dx = (player.x + player.w/2) - (platform.x + platform.w/2);
  const dy = (player.y + player.h/2) - (platform.y + platform.h/2);

  const combinedHalfWidths = (player.w + platform.w) / 2;
  const combinedHalfHeights = (player.h + platform.h) / 2;

  const overlapX = combinedHalfWidths - Math.abs(dx);
  const overlapY = combinedHalfHeights - Math.abs(dy);

  if (overlapX > 0 && overlapY > 0) {
    // Resolve the smaller penetration first
    if (overlapX < overlapY) {
      if (dx > 0) player.x += overlapX;   // Hit from right
      else player.x -= overlapX;          // Hit from left
    } else {
      if (dy > 0) {
        player.y += overlapY;             // Hit from bottom
        if(player.vy < 0) player.vy = 0;
        }
      else {
        player.y -= overlapY;             // Hit from top
        player.grounded = true;
        player.vy = 0;
      }
    }
  }
}

//Collision with the edges
function resolveCollisionWithBounds(player, canvas) {
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    if (player.y < 0) { player.y = 0; if (player.vy < 0) player.vy = 0; }
    if (player.y + player.h > canvas.height) { player.y = canvas.height - player.h; player.vy = 0; player.grounded = true; }
}

function update() {
  if (!levelCompleted) {
  // Player movement
  if (keys["ArrowLeft"]) player.x -= 3;
  if (keys["ArrowRight"]) player.x += 3;
  if (keys["Space"] && player.grounded) {
    player.vy = -12;
    player.grounded = false;
  }

  // Gravity
  player.vy += gravity;
  player.y += player.vy;
  player.grounded = false;

  // Platform collisions
for (let p of platforms){
  resolveCollision(player, p);
}
resolveCollisionWithBounds(player,canvas);

  // Exit check
  if (!levelCompleted && checkCollision(player, exit)) {
    levelCompleted = true;
    levelMenu.style.display = "block";  // show the menu
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Draw platforms
  ctx.fillStyle = "gray";
  for (let p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

  // Draw exit
  ctx.fillStyle = "gold";
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Load current level and start game
loadLevel(currentLevel).then(loop);