const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// === MENIU DE START ===
const startMenu = document.getElementById("startMenu");
const startBtn = document.getElementById("startBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

let gameStarted = false;
// === SOUNDTRACK ===
const backgroundMusic = new Audio("sounds/undertale.mp3");
backgroundMusic.loop = true;   
backgroundMusic.volume = 0.1;  
// === SOUND EFFECTS ===
const jumpSound = new Audio("sounds/jumpSound.mp3");
jumpSound.volume = 0.7;  

function startGame() {
  if (gameStarted) return; // evită restartul
  gameStarted = true;
  startMenu.style.display = "none";  
   backgroundMusic.play().catch(err => {
    console.log("Autoplay blocked:", err);
   });
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
let jumpCooldown = 0;    // cooldown după săritură (în frame-uri)
let landCooldown = 0;      // cooldown după aterizare (în frame-uri)
let prevGrounded = false;  // grounded în frame-ul anterior
let prevSpace = false;     // pentru edge-press la Space

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
  w: 68,
  h: 68,
  vy: 0,
  grounded: false,
  ledgeGrabbed: false,
  ledgeX: 0,
  ledgeY: 0,
  ledgeSide: null // "left" or "right"
};
 
const imgGrass = new Image();
imgGrass.src = "assets/grass.png";  


// === SPRITE-URI PLAYER ===
const playerSprites = {
  idle: new Image(),
  jump: new Image(),
  walkA: new Image(),
  walkB: new Image(),
  ledge_grab: new Image(),
}; 


playerSprites.idle.src  = "assets/slime_front.png";
playerSprites.jump.src  = "assets/slime_jump.png";
playerSprites.walkA.src = "assets/slime_walk_a.png";
playerSprites.walkB.src = "assets/slime_walk_b.png";
playerSprites.ledge_grab.src = "assets/ledge_grab.png";

// stare animație
let playerState = "idle";   // "idle" | "walk" | "jump"
let facingRight = true;     // pentru flip stânga/dreapta
let walkFrame = 0;          // 0 = walkA, 1 = walkB
let walkTimer = 0;
const WALK_FRAME_DELAY = 10; // schimbă între A/B la fiecare ~10 frame-uri



let platforms = [];
let exit = {};

async function loadLevel(num = 1) {
  const res = await fetch(`levels/level${num}.json`);
  const data = await res.json();
  player.x = data.playerStart.x;
  player.y = data.playerStart.y;
  platforms = data.platforms;
  exit = data.exit;
  

const levelWidth  = Math.max(...platforms.map(p => p.x + p.w), exit.x + exit.w);
const levelHeight = Math.max(...platforms.map(p => p.y + p.h), exit.y + exit.h);
const offsetX = 0;
const offsetY = Math.max(0, (canvas.height - levelHeight) / 2);
player.x += offsetX;
player.y += offsetY;
platforms.forEach(p => { p.x += offsetX; p.y += offsetY; });
exit.x += offsetX;
exit.y += offsetY;


let floor = platforms.reduce((a, b) => (a.w > b.w ? a : b)); 
floor.x = 0;
floor.w = canvas.width;
floor.h = 40;
floor.y = canvas.height - floor.h;


player.x = 30;
player.y = floor.y - player.h - 1;

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
  if (levelCompleted) return;

// ===== Handle ledge grabbing state =====
if (player.ledgeGrabbed) {
  // Lock player position
  player.x = player.ledgeX;
  player.y = player.ledgeY;
  player.vy = 0;

  // Determine if player is still pressing toward the ledge
  let stillHolding =
    (player.ledgeSide === "left" && keys["ArrowRight"]) ||
    (player.ledgeSide === "right" && keys["ArrowLeft"]);

  // Release conditions
  if (!stillHolding) {
    player.ledgeGrabbed = false;
    player.ledgeSide = null;
  }

  // Climb or drop
  if (keys["ArrowUp"] || keys["Space"]) {
    player.ledgeGrabbed = false;
    player.ledgeSide = null;
    player.vy = -10; // jump upward
  } else if (keys["ArrowDown"]) {
    player.ledgeGrabbed = false;
    player.ledgeSide = null; // drop down
  }

  // Skip normal movement while hanging
  return;
}


  // ===== Mișcare stânga / dreapta =====
  if (keys["ArrowLeft"])  { player.x -= 3; facingRight = false; }
  if (keys["ArrowRight"]) { player.x += 3; facingRight = true;  }

  // ===== Cooldown săritură =====
  if (jumpCooldown > 0) jumpCooldown--;

  // ===== Săritură =====
  if (keys["Space"] && player.grounded && jumpCooldown === 0) {
    player.vy = -12;
    player.grounded = false;
    jumpCooldown = 15;

    if (typeof jumpSound !== "undefined") {
      jumpSound.currentTime = 0;
      jumpSound.play();
    }
  }

  // ===== Gravitație =====
  player.vy += gravity;
  player.y  += player.vy;

  // înainte de coliziuni presupunem că e în aer;
  // coliziunile vor seta grounded = true dacă atinge ceva
  player.grounded = false;

  // ===== Coliziuni platforme =====
  for (let p of platforms) {
    resolveCollision(player, p);
  }

  // ===== Coliziuni margini ecran =====
  resolveCollisionWithBounds(player, canvas);

// ===== Check for ledge grab =====
if (!player.grounded && !player.ledgeGrabbed && player.vy > 0) {
  for (let p of platforms) {
    // Check proximity to edges
    const nearLeftEdge = Math.abs((player.x + player.w) - p.x) < 10;
    const nearRightEdge = Math.abs(player.x - (p.x + p.w)) < 10;
    const playerHandsY = player.y + player.h * 0.7;         //70% din varful platformei
    const handsAtEdgeHeight = playerHandsY > p.y && playerHandsY < p.y + 40;

    const pressingLeft = keys["ArrowLeft"];
    const pressingRight = keys["ArrowRight"];

    if (handsAtEdgeHeight) {
      if (nearLeftEdge && pressingRight) {
        // Grab left edge
        player.ledgeGrabbed = true;
        player.ledgeSide = "left";
        player.ledgeX = p.x - player.w + 2;
        player.ledgeY = p.y - player.h + 50;
        player.vy = 0;
        break;
      }
      if (nearRightEdge && pressingLeft) {
        // Grab right edge
        player.ledgeGrabbed = true;
        player.ledgeSide = "right";
        player.ledgeX = p.x + p.w - 2;
        player.ledgeY = p.y - player.h + 50;
        player.vy = 0;
        break;
      }
    }
  }
}



  // ===== Stare animație (după coliziuni ca să știm grounded corect) =====
  if (!player.grounded) {
    playerState = "jump";
    walkFrame = 0; 
    walkTimer = 0;
  } else if (keys["ArrowLeft"] || keys["ArrowRight"]) {
    playerState = "walk";
  } else {
    playerState = "idle";
    walkFrame = 0; 
    walkTimer = 0;
  }

  // ===== Alternare cadre (walkA ↔ walkB) =====
  if (playerState === "walk" && player.grounded) {
    walkTimer++;
    if (walkTimer >= WALK_FRAME_DELAY) {
      walkTimer = 0;
      walkFrame = 1 - walkFrame; // 0 -> 1 -> 0 ...
    }
  }

  // ===== Verificare ieșire din nivel =====
  if (checkCollision(player, exit)) {
    levelCompleted = true;
    levelMenu.style.display = "block";
  }
}




function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  
 // ===== Desenăm playerul cu sprite + flip stânga/dreapta =====
let sprite;
  if (player.ledgeGrabbed) {
    // dacă e atârnat, folosește sprite special (sau fallback)
    sprite = playerSprites.ledge_grab || playerSprites.idle;
} else if (playerState === "jump") {
  sprite = playerSprites.jump;
} else if (playerState === "walk") {
  sprite = (walkFrame === 0) ? playerSprites.walkA : playerSprites.walkB;
} else {
  sprite = playerSprites.idle;
}

if (sprite && sprite.complete && sprite.naturalWidth > 0) {
    ctx.save();

    // Dacă avem ledge_grab → mărim sprite-ul
    let scale = player.ledgeGrabbed ? 1.0 : 1.0;  // schimbă 1.3 cât vrei

    let w = player.w * scale;
    let h = player.h * scale;

    if (!facingRight) {
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
        ctx.scale(-1, 1);

        ctx.drawImage(
            sprite,
            -w / 2,
            -h / 2,
            w,
            h
        );

    } else {
        ctx.drawImage(
            sprite,
            player.x - (w - player.w) / 2,
            player.y - (h - player.h) / 2,
            w,
            h
        );
    }

    ctx.restore();
}



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