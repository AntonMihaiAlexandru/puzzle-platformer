// === Imports ===
import { playerSprites } from "./sprites/sprites.js";
import { loadLevel, getPlatforms, getExit, nextLevel, retryLevel } from "./levels/loader.js";
import { player, updatePlayer, drawPlayer } from "./entities/player.js";
import { isKeyDown } from "./engine/input.js";
import { resolveCollision, resolveCollisionWithBounds, gravity, checkCollision } from "./engine/physics.js";
import { playSound } from "./engine/sound.js";
import { camera, updateCamera } from "./engine/camera.js";
import { updateEcho, drawEcho, echo, resetEcho } from "./entities/echo.js";
import { playerEchoCollision } from "./entities/collisions.js";
import { createEnemy, updateEnemy, drawEnemy } from "./entities/enemy.js";

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
let levelCompleted = false;
let currentLevelData = null;

let enemies = [];
let platforms = [];
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

    // Reset player
    player.x = levelData.playerSpawn.x;
    player.y = levelData.playerSpawn.y;
    player.history = [];

    // Reset echo
    resetEcho(levelData.playerSpawn);

    // Reset platforms and exit
    platforms = levelData.platforms;
    exit = levelData.exit;

    // Reset enemies
    enemies = [];
    if (levelData.enemies) {
        enemies = levelData.enemies.map(e => 
            createEnemy(e.x, e.y, e.w || 50, e.h || 50, e.speed || 2)
        );
    }

    // Reset level state
    levelCompleted = false;
}


// ==== START GAME ====
async function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    startMenu.style.display = "none";

    playSound("bg"); // background music

    // Load level and get all relevant data
    const levelData = await loadLevel(currentLevel);

    // Initialize everything (player, echo, enemies, platforms, exit)
    initLevel(levelData);

    // Update camera after initializing player
    updateCamera(player, canvas);

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
    const levelData = await nextLevel();
    initLevel(levelData);
});

// For GameOver
GameOverRetryBtn.addEventListener("click", async () => {
    GameOverMenu.style.display = "none";
    const levelData = await retryLevel(); // reload current level
    initLevel(levelData);
    gameOver = false;
});

// For retry
retryLevelBtn.addEventListener("click", async () => {
    levelMenu.style.display = "none";
    const levelData = await retryLevel();
    initLevel(levelData);
    gameOver = false;
});

// ==== GAME LOOP ====
function update() {
    if (!gameStarted || levelCompleted || gameOver) return;

    // ==== Player ====
    player.groundedOnEcho = false;
    updatePlayer(platforms, canvas, player.groundedOnEcho);

    // ==== Echo ====
    updateEcho(platforms, canvas);
    playerEchoCollision(player, echo);

    echo.grounded = false;
for (let p of platforms) {
    let prevY = echo.y;
    resolveCollision(echo, p);
    if (echo.y !== prevY && echo.vy >= 0) echo.grounded = true; // landed
}

//==== Enemies ====
for (let enemy of enemies) {
    updateEnemy(enemy, platforms, canvas);

    // Simple player collision
    if (player.x < enemy.x + enemy.w &&
        player.x + player.w > enemy.x &&
        player.y < enemy.y + enemy.h &&
        player.y + player.h > enemy.y) {
        
        // Trigger Game Over
        gameOver = true;
        GameOverMenu.style.display = "flex"; // show overlay
        break; // stop checking other enemies
    }
}

// ==== Exit ====
    if (checkCollision(player, exit)) {
        levelCompleted = true;
        levelMenu.style.display = "block";
    }

    // Future gameplay elements
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Apply camera transformations
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // ===== Platforms =====
    ctx.fillStyle = "gray";
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    // ===== Exit =====
    ctx.fillStyle = "gold";
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);

    // ===== Player =====
    drawPlayer(ctx);

    // ===== Enemies =====
    for (let enemy of enemies) {
        drawEnemy(ctx, enemy);
    }

    // ===== Echo =====
    drawEcho(ctx);

    // ===== Future visual elements =====

    ctx.restore();
}

function loop() {
    update();
    updateCamera(player, canvas);
    draw();
    requestAnimationFrame(loop);
}

// Start the game immediately if desired
// startGame(); // or wait for user input (start button)