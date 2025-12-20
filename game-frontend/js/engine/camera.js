export const camera = {
    x: 0,
    y: 0,
    width: 0,   // viewport width in world coordinates
    height: 0,  // viewport height in world coordinates
    zoom: 0.95     // scale factor
};

export function updateCamera(player, canvas, worldWidth, worldHeight) {
    if (!player || !canvas) return;

    // Camera viewport in world units
    camera.width = canvas.width / camera.zoom;
    camera.height = canvas.height / camera.zoom;

    // Center camera on player
    camera.x = player.x + player.w / 2 - camera.width / 2;
    camera.y = player.y + player.h / 2 - camera.height / 2;

    // Clamp to world bounds
    camera.x = Math.max(0, Math.min(camera.x, worldWidth - camera.width));
    camera.y = Math.max(0, Math.min(camera.y, worldHeight - camera.height));
}
