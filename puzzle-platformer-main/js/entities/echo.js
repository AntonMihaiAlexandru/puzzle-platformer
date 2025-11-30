import { resolveCollision, resolveCollisionWithBounds, gravity } from "../engine/physics.js";
import { player } from "./player.js"; // directly reference player

export const echo = {
    x: 50,
    y: 350,
    w: 50,
    h: 50,
    offsetX: 9,
    offsetY: 9,
    vy: 0,
    grounded: false,
    active: false,        // becomes true after 3 seconds
    delay: 180,            // 3 seconds at 60fps
};

export function updateEcho(platforms, canvas) {
    if (player.history.length < echo.delay) return;

    echo.active = true;

    let ghostFrame = player.history[player.history.length - echo.delay];

// Replay horizontal movement
if (ghostFrame.facingRight !== echo.facingRight) {
    // Flip direction
    echo.facingRight = ghostFrame.facingRight;
}

echo.x += ghostFrame.vx; // move exactly as the player did

// Replay jumping
if (ghostFrame.justJumped) {
    echo.vy = ghostFrame.vy;   // same jump force as player used
    echo.grounded = false;
}


// Apply gravity each frame
echo.vy += gravity;
echo.y += echo.vy;

// THEN do collisions
for (let p of platforms) resolveCollision(echo, p);
resolveCollisionWithBounds(echo, canvas);

}

export function resetEcho(playerStart) {
    echo.x = playerStart.x;
    echo.y = playerStart.y;
    echo.vy = 0;
    echo.active = false;
    echo.grounded = false;
    echo.facingRight = true;
    echo.delay = 180;
}

export function drawEcho(ctx) {
    if (!echo.active) return;

    ctx.save();
    ctx.globalAlpha = 0.4;               // transparent ghost look
    ctx.fillStyle = "cyan";              // debug visual (replace with slime sprite)
    ctx.fillRect(echo.x + echo.offsetX, echo.y + echo.offsetY, echo.w, echo.h);
    ctx.globalAlpha = 1;
    ctx.restore();
}
