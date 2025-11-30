import { isKeyDown } from "../engine/input.js";
import { checkCollision } from "../engine/physics.js";

/**
 * Resolves vertical collision between player and echo.
 * Horizontal collisions ignored.
 * Player is never pushed down by echo; echo is lighter.
 */
export function playerEchoCollision(player, echo) {
    if (!echo.active) return;
    if (!checkCollision(player, echo)) return;

    const playerBottom = player.y + player.h;
    const playerOldBottom = playerBottom - player.vy;
    const playerTop = player.y;
    const echoBottom = echo.y + echo.h;
    const echoOldBottom = echoBottom - echo.vy;
    const echoTop = echo.y;

    // ===== Player landing on echo =====
    if(!isKeyDown("ArrowDown")) {
        if (playerBottom > echoTop && playerOldBottom <= echoTop) {
            // Player crossed into echo from above
            player.y = echo.y - player.h;
            player.vy = 0;
            player.grounded = true;
            player.groundedOnEcho = true;
        }
}

    // ===== Echo landing on player =====
    if (echoBottom > playerTop && echoOldBottom <= playerTop) {
        // Echo crossed into player from above
        echo.y = player.y - echo.h;
        echo.vy = 0;
        echo.grounded = true;
    }
}
