import { isKeyDown } from "../engine/input.js";
import { checkCollision } from "../engine/physics.js";

/**
 * Resolves vertical collision between player and echo.
 * Horizontal collisions ignored.
 * Player is never pushed down by echo; echo is lighter.
 */
export function playerEchoCollision(player, echo) {
if (!echo.active) return;
    
    // 1. Standard collision check
    if (!checkCollision(player, echo)) {
        if (player.groundedOnEcho) player.groundedOnEcho = false;
        return;
    }

    const playerBottom = player.y + player.h;
    const echoTop = echo.y;

    // 2. Landing or Standing logic
    if (!isKeyDown("ArrowDown")) {
        // If falling onto it OR already marked as standing on it
        if ((player.vy >= 0 && playerBottom <= echoTop + 10) || player.groundedOnEcho) {
            
            // THE FIX: Snap to exactly 0.5 pixels ABOVE the echo
            // This prevents the platform collision logic from "stealing" the player
            player.y = echo.y - player.h - 0.5; 
            
            player.vy = 0;
            player.grounded = true;
            player.groundedOnEcho = true;
        }
    }

    // ===== Echo landing on player =====
    const playerTop = player.y;
    const echoBottom = echo.y + echo.h;
    const echoOldBottom = echoBottom - (echo.vy || 0);

    if (echoBottom > playerTop && echoOldBottom <= playerTop) {
        echo.y = player.y - echo.h;
        echo.vy = 0;
        echo.grounded = true;
    }
}
