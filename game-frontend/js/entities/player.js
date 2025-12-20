import { isKeyDown } from "../engine/input.js";
import { gravity, resolveCollision, resolveCollisionWithBounds } from "../engine/physics.js";
import { playSound, startLoopSound, stopSound } from "../engine/sound.js";


// Player object
export const player = {
    x: 50,
    y: 350,
    w: 68,
    h: 68,
    vy: 0,
    grounded: false,
    groundedOnEcho: false,
    ledgeGrabbed: false,
    ledgeX: 0,
    ledgeY: 0,
    ledgeSide: null,  // "left" or "right"
    state: "idle",    // idle | walk | jump | ledge
    facingRight: true,
    walkFrame: 0,
    walkTimer: 0
};

player.history = [];
player.maxHistory = 180; // 3 seconds at 60fps

// Walking animation
const WALK_FRAME_DELAY = 10;

// Sprites
const playerSprites = {
    idle: new Image(),
    jump: new Image(),
    walkA: new Image(),
    walkB: new Image(),
    ledge_grab: new Image()
};

playerSprites.idle.src  = "js/sprites/assets/slime_front.png";
playerSprites.jump.src  = "js/sprites/assets/slime_jump.png";
playerSprites.walkA.src = "js/sprites/assets/slime_walk_a.png";
playerSprites.walkB.src = "js/sprites/assets/slime_walk_b.png";
playerSprites.ledge_grab.src = "js/sprites/assets/ledge_grab.png";

let jumpCooldown = 0;

export function updatePlayer(platforms, worldBounds, groundedOverride = false) {
    // ===== Handle ledge grabbing =====
    if (player.ledgeGrabbed) {
        player.x = player.ledgeX;
        player.y = player.ledgeY;
        player.vy = 0;

        let stillHolding =
            (player.ledgeSide === "left" && isKeyDown("ArrowRight")) ||
            (player.ledgeSide === "right" && isKeyDown("ArrowLeft"));

        if (!stillHolding) {
            player.ledgeGrabbed = false;
            player.ledgeSide = null;
        }

        if (isKeyDown("ArrowUp") || isKeyDown("Space")) {
            player.ledgeGrabbed = false;
            player.ledgeSide = null;
            player.vy = -10; // jump upward
        } else if (isKeyDown("ArrowDown")) {
            player.ledgeGrabbed = false;
            player.ledgeSide = null;
        }

        return; // skip normal movement while hanging
    }

    // ===== Horizontal movement =====
    if (isKeyDown("ArrowLeft")) {
        player.x -= 3;
        player.facingRight = false;
    }
    if (isKeyDown("ArrowRight")) {
        player.x += 3;
        player.facingRight = true;
    }

    // ===== Jumping =====
    if (isKeyDown("Space") && player.grounded) {
        player.vy = -12;
        player.grounded = false;
        jumpCooldown = 15;
        playSound("jump");
    }

    // ===== Gravity =====
    player.vy += gravity;
    player.y += player.vy;

    player.grounded = false;

    // ===== Collisions =====
    for (let p of platforms) resolveCollision(player, p);
    resolveCollisionWithBounds(player, worldBounds);

    // Apply grounded override (e.g., standing on echo)
    if (groundedOverride) player.grounded = true;
    
    // ===== FOOTSTEPS (grass) =====
const moving = isKeyDown("ArrowLeft") || isKeyDown("ArrowRight");

if (player.grounded && moving) {
    startLoopSound("grassStep");
} else {
    stopSound("grassStep");
}


    // ===== Check for ledge grab =====
    if (!player.grounded && !player.ledgeGrabbed && player.vy > 0) {
        for (let p of platforms) {
            const nearLeftEdge = Math.abs((player.x + player.w) - p.x) < 10;
            const nearRightEdge = Math.abs(player.x - (p.x + p.w)) < 10;
            const playerHandsY = player.y + player.h * 0.7;
            const handsAtEdgeHeight = playerHandsY > p.y && playerHandsY < p.y + 40;

            const pressingLeft = isKeyDown("ArrowLeft");
            const pressingRight = isKeyDown("ArrowRight");

            if (handsAtEdgeHeight) {
                if (nearLeftEdge && pressingRight) {
                    player.ledgeGrabbed = true;
                    player.ledgeSide = "left";
                    player.ledgeX = p.x - player.w + 2;
                    player.ledgeY = p.y - player.h + 50;
                    player.vy = 0;
                    break;
                }
                if (nearRightEdge && pressingLeft) {
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

    // ===== Update sprite state =====
    if (!player.grounded) {
        player.state = "jump";
        player.walkFrame = 0;
        player.walkTimer = 0;
    } else if (isKeyDown("ArrowLeft") || isKeyDown("ArrowRight")) {
        player.state = "walk";
    } else {
        player.state = "idle";
        player.walkFrame = 0;
        player.walkTimer = 0;
    }

    // Walking animation
    if (player.state === "walk" && player.grounded) {
        player.walkTimer++;
        if (player.walkTimer >= WALK_FRAME_DELAY) {
            player.walkTimer = 0;
            player.walkFrame = 1 - player.walkFrame; // 0 -> 1 -> 0
        }
    }

// ===== Save history frame =====
player.history.push({
    x: player.x,
    y: player.y,
    vy: player.vy,
    vx: (isKeyDown("ArrowRight") ? 3 : isKeyDown("ArrowLeft") ? -3 : 0),
    grounded: player.grounded,
    state: player.state,
    facingRight: player.facingRight,
    justJumped: (player.state === "jump" && player.vy < 0) // detects jump start
});

player.groundedOnEcho = false;

}

export function drawPlayer(ctx) {
    let sprite;
    if (player.ledgeGrabbed) sprite = playerSprites.ledge_grab || playerSprites.idle;
    else if (player.state === "jump") sprite = playerSprites.jump;
    else if (player.state === "walk") sprite = player.walkFrame === 0 ? playerSprites.walkA : playerSprites.walkB;
    else sprite = playerSprites.idle;

    if (!sprite.complete || sprite.naturalWidth === 0) return;

    ctx.save();
    const w = player.w;
    const h = player.h;

    if (!player.facingRight) {
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
    } else {
        ctx.drawImage(sprite, player.x, player.y, w, h);
    }

    ctx.restore();
}