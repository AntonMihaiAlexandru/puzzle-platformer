let currentLevelData = null;
let currentLevel = 1;

// Load JSON level file
export async function loadLevel(levelNumber) {
    const response = await fetch(`./js/levels/level${levelNumber}.json`);
    if (!response.ok) throw new Error(`Failed to load level${levelNumber}.json`);

    currentLevelData = await response.json();

    // Calculate world width/height automatically from platforms and exit
    const allX = currentLevelData.platforms.map(p => p.x + p.w)
                  .concat(currentLevelData.exit.x + currentLevelData.exit.w);
    const allY = currentLevelData.platforms.map(p => p.y + p.h)
                  .concat(currentLevelData.exit.y + currentLevelData.exit.h);
    const worldWidth = Math.max(...allX, currentLevelData.playerStart.x + 200);
    const worldHeight = Math.max(...allY, currentLevelData.playerStart.y + 200);

    return {
        playerSpawn: currentLevelData.playerStart,
        platforms: currentLevelData.platforms,
        exit: currentLevelData.exit,
        enemies: currentLevelData.enemies || [],
        worldWidth,
        worldHeight
    };
}

// helper to get enemies
export function getEnemies() {
    return currentLevelData?.enemies || [];
}

// Helpers to get parts of the current level
export function getPlatforms() {
    return currentLevelData?.platforms || [];
}

export function getExit() {
    return currentLevelData?.exit || {};
}

// Load next/previous levels
export async function nextLevel() {
    currentLevel++;
    return await loadLevel(currentLevel);
}

export async function retryLevel() {
    return await loadLevel(currentLevel);
}
