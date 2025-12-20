import { gravity, resolveCollisionVertical, resolveCollisionWithBounds } from "../engine/physics.js";

const enemyWalkA = new Image();
enemyWalkA.src = new URL("../sprites/assets/slime_normal_walk_a.png", import.meta.url);

const enemyWalkB = new Image();
enemyWalkB.src = new URL("../sprites/assets/slime_normal_walk_b.png", import.meta.url);


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
        direction: 1, // initially moving right
        animTimer: 0


    };
}

export function updateEnemy(enemy, platforms, worldWidth) {
    // Horizontal movement
    enemy.x += enemy.speed * enemy.direction;

    // Gravity
    enemy.vy += gravity;
    enemy.y += enemy.vy;

    // Reset grounded
enemy.grounded = false;

for (let p of platforms) {
    const prevY = enemy.y;
    resolveCollisionVertical(enemy, p);

    if (enemy.y !== prevY && enemy.vy >= 0) {
        enemy.grounded = true;
        enemy.vy = 0;
    }
}

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
    if (enemy.x + enemy.w > worldWidth) enemy.direction = -1;

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
    enemy.animTimer++;
}

export function drawEnemy(ctx, enemy) {
  const img =
    (Math.floor(enemy.animTimer / 12) % 2 === 0)
      ? enemyWalkA
      : enemyWalkB;

  // dacă nu s-a încărcat încă imaginea, nu desenăm
  if (!img || !img.complete || img.naturalWidth === 0) return;

  ctx.save();

  // flip dacă merge spre stânga
  if (enemy.direction < 0) {
    ctx.translate(enemy.x + enemy.w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, enemy.y, enemy.w, enemy.h);
  } else {
    ctx.drawImage(img, enemy.x, enemy.y, enemy.w, enemy.h);
  }

  ctx.restore();
}
