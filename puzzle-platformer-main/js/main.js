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

// ==== GLOBALS ====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startMenu = document.getElementById("startMenu");
const startBtn = document.getElementById("startBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const levelMenu = document.getElementById("levelMenu");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const retryLevelBtn = document.getElementById("retryLevelBtn");

let gameStarted = false;
let currentLevel = 1;
let levelCompleted = false;

let platforms = [];
let exit = {};

// ==== CANVAS RESIZE ====
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==== START GAME ====
async function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    startMenu.style.display = "none";

    playSound("bg"); // background music

    // Load level and get all relevant data
    const levelData = await loadLevel(currentLevel);

    player.x = levelData.playerSpawn.x;
    player.y = levelData.playerSpawn.y;
    player.history = [];
    resetEcho(levelData.playerSpawn);

    updateCamera(player, canvas);
    
    platforms = levelData.platforms;
    exit = levelData.exit;

    // Set camera world size
    camera.worldWidth = levelData.worldWidth;
    camera.worldHeight = levelData.worldHeight;

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
    const levelData = await nextLevel();   // rename to levelData
    player.x = levelData.playerSpawn.x;
    player.y = levelData.playerSpawn.y;

    // Reset player history and echo
    player.history = [];
    resetEcho(levelData.playerSpawn);

    platforms = getPlatforms();
    exit = getExit();
    levelCompleted = false;
});

// For retry
retryLevelBtn.addEventListener("click", async () => {
    levelMenu.style.display = "none";
    const levelData = await retryLevel();  // rename to levelData
    player.x = levelData.playerSpawn.x;
    player.y = levelData.playerSpawn.y;

    // Reset player history and echo
    player.history = [];
    resetEcho(levelData.playerSpawn);

    platforms = getPlatforms();
    exit = getExit();
    levelCompleted = false;
});

// ==== GAME LOOP ====
function update() {
    if (levelCompleted) return;

    player.groundedOnEcho = false;
    updateEcho(platforms, canvas);
    playerEchoCollision(player, echo);
    updatePlayer(platforms, canvas, player.groundedOnEcho);

    if (checkCollision(player, exit)) {
        levelCompleted = true;
        levelMenu.style.display = "block";
    }

    echo.grounded = false;
for (let p of platforms) {
    let prevY = echo.y;
    resolveCollision(echo, p);
    if (echo.y !== prevY && echo.vy >= 0) echo.grounded = true; // landed
}


    // Future updates for other gameplay elements go here
}

updateCamera();

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw platforms
    ctx.fillStyle = "gray";
    for (let p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

    // Draw exit
    ctx.fillStyle = "gold";
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);

    // Draw player
    drawPlayer(ctx);

    // Draw Echo
    drawEcho(ctx);

    // Future draws: echoes, particles, etc.

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