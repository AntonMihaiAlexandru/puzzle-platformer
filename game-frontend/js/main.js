// === Imports ===
import { playerSprites } from "./sprites/sprites.js";
import { loadLevel, getPlatforms, getExit, nextLevel, retryLevel } from "./levels/loader.js";
import { player, updatePlayer, drawPlayer } from "./entities/player.js";
import { resolveCollision, resolveCollisionWithBounds, gravity, checkCollision } from "./engine/physics.js";
import { playSound } from "./engine/sound.js";
import { camera, updateCamera } from "./engine/camera.js";
import { updateEcho, drawEcho, echo, resetEcho } from "./entities/echo.js";
import { playerEchoCollision } from "./entities/collisions.js";
import { createEnemy, updateEnemy, drawEnemy } from "./entities/enemy.js";
import { createButton, updateButton, drawButton } from "./entities/button.js";
import { createDoor, updateDoor, drawDoor } from "./entities/door.js";
import { isKeyDown, isKeyJustPressed, updateInputState } from "./engine/input.js"; // Updated
import { drawLever } from "./entities/lever.js";
import { drawSpike } from "./entities/spike.js";
import { sendPlayerTime, getLeaderboard, getPlayerRank } from "./api.js";

// ==== GLOBALS ====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startMenu = document.getElementById("startMenu");
const startBtn = document.getElementById("startBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const levelMenu = document.getElementById("levelMenu");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const retryLevelBtn = document.getElementById("retryLevelBtn");

const GameOverMenu = document.getElementById("GameOverMenu");
const GameOverRetryBtn = document.getElementById("GameOverRetryBtn");
let gameOver = false;
let gameStarted = false;
let currentLevel = 1;
const params = new URLSearchParams(window.location.search);
const levelParam = params.get("level");

if (levelParam) {
  currentLevel = parseInt(levelParam, 10) || 1;
}

let levelCompleted = false;
let currentLevelData = null;
let buttons = [];
let levers = [];
let doors = [];
let spikes = [];
let showInteractPrompt = false;

let worldWidth = 0;
let worldHeight = 0;

let timer = 0;              // total elapsed time
let lastTime = performance.now();
let timerPaused = true;     // true = not running


let enemies = [];
let platforms = [];
// ==== PLATFORM TILES ====
const grassLeft = new Image();
grassLeft.src = new URL("./sprites/assets/grass_left.png", import.meta.url);

const grassMid = new Image();
grassMid.src = new URL("./sprites/assets/grass_mid.png", import.meta.url);

const grassRight = new Image();
grassRight.src = new URL("./sprites/assets/grass_right.png", import.meta.url);

const doorImg = new Image();
doorImg.src = new URL("./sprites/assets/door_closed_top.png", import.meta.url);

const dirtMid = new Image();
dirtMid.src = new URL("./sprites/assets/dirt_mid.png", import.meta.url);

let exit = {};

// ==== CANVAS RESIZE ====
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function initLevel(levelData) {
    gameOver = false;
    GameOverMenu.style.display = "none";

    const playerSpawn = levelData.playerSpawn || levelData.playerStart;
    player.x = playerSpawn.x;
    player.y = playerSpawn.y;
    player.history = [];
    resetEcho(playerSpawn);

    worldWidth = levelData.worldWidth || 3200;
    worldHeight = levelData.worldHeight || 1080;
    platforms = levelData.platforms || [];
    exit = levelData.exit || {};
    spikes = levelData.spikes || [];

    buttons = levelData.buttons || [];
    levers = levelData.levers || [];
    doors = levelData.doors || [];

    console.log("Buttons loaded:", buttons.length);
    console.log("Doors loaded:", doors.length);
    if (doors[0]) {
        console.log("Door 0 linked buttons:", doors[0].buttons);
    }

    enemies = [];
    if (levelData.enemies) {
        enemies = levelData.enemies.map(e =>
            createEnemy(e.x, e.y, e.w || 50, e.h || 50, e.speed || 2)
        );
    }

    levelCompleted = false;
}



// ==== START GAME ====
async function startGame() {

    if (gameStarted) return;
    // Wake up the backend immediately!
    fetch("https://puzzle-backend-qk2v.onrender.com").catch(() => {});
    gameStarted = true;
    startMenu.style.display = "none";

    timerPaused = false; // start running
    lastTime = performance.now();

    playSound("bgm"); // background music

    // Load level and get all relevant data
    const levelData = await loadLevel(currentLevel);

    // Initialize everything (player, echo, enemies, platforms, exit)
    initLevel(levelData);

    // Update camera after initializing player
    updateCamera(player, canvas, worldWidth, worldHeight);

    // Start the game loop
    requestAnimationFrame(loop);
}



// ==== BUTTON EVENTS ====
startBtn?.addEventListener("click", startGame);
fullscreenBtn?.addEventListener("click", () => {
    if (canvas.requestFullscreen) canvas.requestFullscreen();
});
document.addEventListener("keydown", e => {
    if (!gameStarted && (e.code === "Space" || e.code === "Enter")) startGame();
});

// For next level
nextLevelBtn.addEventListener("click", async () => {
    levelMenu.style.display = "none";
    currentLevel++;
    const levelData = await nextLevel();
    initLevel(levelData);
    timerPaused = false;         // continue timer
    lastTime = performance.now();
});

// For GameOver
GameOverRetryBtn.addEventListener("click", async () => {
    GameOverMenu.style.display = "none";
    const levelData = await retryLevel(); // reload current level
    initLevel(levelData);
    gameOver = false;
    // If retrying and level is NOT 1 → do NOT reset timer
    if (currentLevel === 1) timer = 0;
    timerPaused = false;
    lastTime = performance.now();
    gameOver = false;
});

// For retry
retryLevelBtn.addEventListener("click", async () => {
    levelMenu.style.display = "none";
    const levelData = await retryLevel();
    initLevel(levelData);
    gameOver = false;
    if (currentLevel === 1) timer = 0; // Reset only at level 1
    timerPaused = false; 
    lastTime = performance.now();
});

// ==== GAME LOOP ====
function update() {

    // Timer only runs during gameplay
    if (!timerPaused && !gameOver && !levelCompleted) {
        let now = performance.now();
        timer += (now - lastTime) / 1000;
        lastTime = now;
    } else {
        lastTime = performance.now(); // prevent time jump after unpause
    }

    if (gameOver || levelCompleted) return;
    
    if (!gameStarted || levelCompleted || gameOver) return;

const now = performance.now();

if (gameOver || levelCompleted || !gameStarted) return;

    const interactJustPressed = isKeyJustPressed("KeyE");
    
    // Reset the prompt state each frame
    showInteractPrompt = false;

    // Handle Levers
    for (let lever of levers) {
        if (checkCollision(player, lever)) {
            // Player is touching a lever, so show the prompt!
            showInteractPrompt = true;

            if (interactJustPressed) {
                lever.activated = !lever.activated;
                playSound("leverFlip");
            }
        }
    }

// Update all buttons
for (let button of buttons) updateButton(button, player, enemies, echo, now);

// Update all doors
for (let door of doors)  updateDoor(door, door.interval);

// ===== Collision with doors =====
for (let door of doors) {
    if (door.solid) {
        resolveCollision(player, door);
        for (let enemy of enemies) {
            resolveCollision(enemy, door);
        }
    }
}


    // ==== Player ====
    
    updatePlayer( platforms, { width: worldWidth, height: worldHeight }, player.groundedOnEcho);

    // ==== Echo ====
    updateEcho(platforms, canvas);
    playerEchoCollision(player, echo);

    echo.grounded = false;
for (let p of platforms) {
    let prevY = echo.y;
    resolveCollision(echo, p);
    if (echo.y !== prevY && echo.vy >= 0) echo.grounded = true; // landed
}

for (let spike of spikes) {
    // We create a smaller "lethal zone"
    const lethalZone = {
        x: spike.x + 24,
        y: spike.y + 8,
        w: spike.w - 42,
        h: spike.h - 8
    };

    if (checkCollision(player, lethalZone)) {
        if (!gameOver) {
            gameOver = true;
            GameOverMenu.style.display = "flex";
            playSound("gameOver");
        }
        break;
    }
}

//==== Enemies ====
for (let enemy of enemies) {
    updateEnemy(enemy, platforms, worldWidth);

    const enemyHurtBox = {
        x: enemy.x + 16,
        y: enemy.y + 16,
        w: enemy.w - 32,
        h: enemy.h - 16
    };

    if (checkCollision(player, enemyHurtBox)) {
        if (!gameOver) {
            gameOver = true;
            GameOverMenu.style.display = "flex";
            playSound("gameOver");
        }
        break; // stop checking other enemies
    }
}

// ==== Exit ====
// Inside update() function in main.js
if (checkCollision(player, exit)) {
    if (!levelCompleted) {
        levelCompleted = true;
        timerPaused = true;
        playSound("levelComplete");

        const FINAL_LEVEL = 5; // Change this to your last level number!

        if (currentLevel === FINAL_LEVEL) {
            // Show the name entry menu
            document.getElementById("gameEndMenu").style.display = "block";
            
document.getElementById("submitScoreBtn").onclick = async () => {
    const nameInput = document.getElementById("playerNameInput");
    const submitBtn = document.getElementById("submitScoreBtn");
    const list = document.getElementById("finalScoreList");
    
    const name = nameInput.value.trim() || "Anonymous";
    const totalTimeMs = Math.floor(timer * 1000);
    
    // 1. Show Loading State
    submitBtn.disabled = true;
    submitBtn.innerText = "Connecting to Server...";
    list.innerHTML = `<li style="list-style:none; text-align:center; color: #aaa;">
                        Waking up database... please wait...
                      </li>`;

    try {
        // 2. Send and Fetch
        await sendPlayerTime(name, "total_game", totalTimeMs);
        
        // Show progress update
        submitBtn.innerText = "Fetching Leaderboard...";
        
        const [rankResponse, scores] = await Promise.all([
            getPlayerRank("total_game", name),
            getLeaderboard("total_game")
        ]);
        
        // 3. Success! Hide input and show results
        nameInput.style.display = "none";
        submitBtn.style.display = "none";
        document.getElementById("finalLeaderboard").style.display = "block";
        
        const rank = rankResponse.rank || "???";
        
        list.innerHTML = `
            <li style="color: gold; list-style: none; text-align: center; margin-bottom: 15px; font-size: 1.2em;">
                🏆 GLOBAL RANK: #${rank}
            </li>
            ${scores.map((s, i) => `
                <li style="${s.player_name === name ? 'color: #00ff00; font-weight: bold;' : ''}; list-style: none;">
                    ${i + 1}. ${s.player_name} - ${formatTime(s.time_ms / 1000)}
                </li>
            `).join('')}
        `;
    } catch (err) {
        // 4. Error Handling
        submitBtn.disabled = false;
        submitBtn.innerText = "Retry Submission";
        list.innerHTML = `<li style="color: red; list-style:none;">Connection failed. Is the server running?</li>`;
        console.error("Leaderboard Error:", err);
    }
};
        } else {
            // Not the end yet? Show the normal next level menu
            levelMenu.style.display = "block";
        }
    }
}


    // Future gameplay elements
}

function formatTime(t) {
    let minutes = Math.floor(t / 60);
    let seconds = Math.floor(t % 60);
    let ms = Math.floor((t % 1) * 100); // two decimals

    return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}.${String(ms).padStart(2,"0")}`;
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.imageSmoothingEnabled = false;
    ctx.save();

    // Apply camera transformations
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

// ===== Platforms (grass tiles) =====
const TILE_W = 32;
const TILE_H = 32;

for (let p of platforms) {

  if (!grassLeft.complete || !grassMid.complete || !grassRight.complete || !dirtMid.complete) {
    ctx.fillStyle = "gray";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    continue;
  }

  const tilesX = Math.ceil(p.w / TILE_W);
  const tilesY = Math.ceil(p.h / TILE_H);

  for (let ty = 0; ty < tilesY; ty++) {
    const drawY = p.y + ty * TILE_H;
    const drawH = Math.min(TILE_H, p.h - ty * TILE_H);

    const isTopRow = ty === 0;

    for (let tx = 0; tx < tilesX; tx++) {
      const drawX = p.x + tx * TILE_W;
      const drawW = Math.min(TILE_W, p.w - tx * TILE_W);

      let img;

      if (isTopRow) {
        // TOP SURFACE
        if (tx === 0) img = grassLeft;
        else if (tx === tilesX - 1) img = grassRight;
        else img = grassMid;
      } else {
        // BELOW SURFACE
        img = dirtMid;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }
  }
}

// Draw spikes
for (let spike of spikes) {
    drawSpike(ctx, spike);
}

    // ===== Exit =====
   if (doorImg.complete && doorImg.naturalWidth > 0) {
  ctx.drawImage(doorImg, exit.x, exit.y, exit.w, exit.h);
} else {
  // fallback dacă nu s-a încărcat încă
  ctx.fillStyle = "gold";
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
}

// Draw doors
for (let door of doors) {
    drawDoor(ctx, door);
}

// Draw buttons
for (let button of buttons) {
    drawButton(ctx, button);
}

// Draw levers
for (let lever of levers) {
    drawLever(ctx, lever);
}

    // ===== Player =====
    drawPlayer(ctx);

    // ===== Enemies =====
    for (let enemy of enemies) {
        drawEnemy(ctx, enemy);
    }

    // ===== Echo =====
    drawEcho(ctx);

// --- DRAW INTERACT PROMPT ---
    if (showInteractPrompt) {
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("[E] Interact", player.x + player.w / 2, player.y - 20);
    }

// ===== TIMER DISPLAY =====
ctx.save();
ctx.resetTransform(); // important — ignore camera movement

ctx.font = "24px Arial";
ctx.fillStyle = "white";
ctx.textAlign = "right";

ctx.fillText(formatTime(timer), canvas.width - 20, canvas.height - 20);
ctx.restore();


    // ===== Future visual elements =====

    ctx.restore();
}

function loop() {
    update();
    updateCamera(player, canvas, worldWidth, worldHeight);
    draw();
    updateInputState();
    requestAnimationFrame(loop);
}