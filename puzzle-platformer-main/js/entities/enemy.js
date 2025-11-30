import { gravity, resolveCollisionVertical, resolveCollisionWithBounds } from "../engine/physics.js";

export function createEnemy(x, y, w = 50, h = 50, speed = 2, type = "basic") {
    return {
        x,
        y,
        w,
        h,
        speed,
        vx: speed,
        vy: 0,
        grounded: false,
        type,
        direction: 1 // initially moving right
    };
}

export function updateEnemy(enemy, platforms, canvas) {
    // Horizontal movement
    enemy.x += enemy.speed * enemy.direction;

    // Gravity
    enemy.vy += gravity;
    enemy.y += enemy.vy;

    // Reset grounded
    enemy.grounded = false;

    // Vertical collisions only (sit on top of platforms)
    for (let p of platforms) resolveCollisionVertical(enemy, p);

    // Horizontal collisions: just reverse direction if hitting a wall, don't move y
    for (let p of platforms) {
        // Check horizontal overlap
        const overlapY = enemy.y + enemy.h > p.y && enemy.y < p.y + p.h;
        if (!overlapY) continue;

        if (enemy.direction > 0 && enemy.x + enemy.w > p.x && enemy.x < p.x) {
            // moving right hits wall
            enemy.direction *= -1;
        } else if (enemy.direction < 0 && enemy.x < p.x + p.w && enemy.x + enemy.w > p.x + p.w) {
            // moving left hits wall
            enemy.direction *= -1;
        }
    }

    // Bounds collision
    if (enemy.x < 0) enemy.direction = 1;
    if (enemy.x + enemy.w > canvas.width) enemy.direction = -1;

    // Patrol logic: reverse if no ground ahead
    if (enemy.grounded) {
        const lookAhead = 2; // pixels to check ahead
        let groundAhead = false;

        for (let p of platforms) {
            const aheadX = enemy.direction > 0 ? enemy.x + enemy.w + lookAhead : enemy.x - lookAhead;
            if (aheadX >= p.x && aheadX <= p.x + p.w &&
                Math.abs(enemy.y + enemy.h - p.y) <= 2) {
                groundAhead = true;
                break;
            }
        }

        if (!groundAhead) enemy.direction *= -1;
    }
}

export function drawEnemy(ctx, enemy) {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
}
