import { player } from "./player.js"; // reference player

const ecoFront = new Image();
ecoFront.src = new URL("../sprites/assets/eco_front.png", import.meta.url);

const ecoWalkA = new Image();
ecoWalkA.src = new URL("../sprites/assets/eco_walk_a.png", import.meta.url);

const ecoWalkB = new Image();
ecoWalkB.src = new URL("../sprites/assets/eco_walk_b.png", import.meta.url);

const ecoJump = new Image();
ecoJump.src = new URL("../sprites/assets/eco_jump.png", import.meta.url);

let echoSpriteToDraw = ecoFront;

export const echo = {
    x: 50,
    y: 350,
    w: 68,
    h: 68,
    vy: 0,
    grounded: false,
    active: false,
    delay: 180,      // frames behind
    facingRight: true
};

export function updateEcho(platforms, canvas) {
    if (player.history.length < echo.delay) return;

    echo.active = true;

    const frame = player.history[player.history.length - echo.delay];
    if (!frame) return;

    // COPY absolute position (after collisions!)
    echo.x = frame.x;
    echo.y = frame.y;
    echo.grounded = frame.grounded;
    echo.facingRight = frame.facingRight;

    // Choose sprite for visuals
    if (!echo.grounded) {
        echoSpriteToDraw = ecoJump;
    } else if (Math.abs(frame.vx ?? 0) > 0.1) {
        echoSpriteToDraw = (Math.floor(Date.now() / 120) % 2 === 0) ? ecoWalkA : ecoWalkB;
    } else {
        echoSpriteToDraw = ecoFront;
    }
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
    if (!echo.active || !echoSpriteToDraw) return;
    if (!echoSpriteToDraw.complete) return;

    ctx.save();
    ctx.globalAlpha = 0.4;  // ghost effect

    if (!echo.facingRight) {
        ctx.translate(echo.x + echo.w / 2, echo.y + echo.h / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(echoSpriteToDraw, -echo.w / 2, -echo.h / 2, echo.w, echo.h);
    } else {
        ctx.drawImage(echoSpriteToDraw, echo.x, echo.y, echo.w, echo.h);
    }

    ctx.restore();
}
