import { createDoor } from "../entities/door.js";
import { createButton } from "../entities/button.js";
import { createLever } from "../entities/lever.js";
import { createSpike } from "../entities/spike.js";

let currentLevelData = null;
let currentLevel = 1;

export async function loadLevel(levelNumber) {
    const response = await fetch(`./js/levels/level${levelNumber}.json`);
    if (!response.ok) throw new Error(`Failed to load level${levelNumber}.json`);

    currentLevelData = await response.json();

    const spikes = (currentLevelData.spikes || []).map(s => 
    createSpike(s.x, s.y, s.w || 32, s.h || 32)
);

    // 1. Create Buttons
    const buttons = (currentLevelData.buttons || []).map(b => 
        createButton(b.x, b.y, b.w, b.h)
    );

    // 2. Create Levers
    const levers = (currentLevelData.levers || []).map(l => 
        createLever(l.x, l.y, l.w, l.h)
    );

    // 3. Create Doors and Link both Buttons and Levers
    const doors = (currentLevelData.doors || []).map(d => {
        const door = createDoor(d.x, d.y, d.w, d.h, d.type || "single");
        
        // Map button indexes to the actual button objects
        const linkedButtons = (d.buttonIndexes || []).map(idx => buttons[idx]).filter(b => b);
        
        // Map lever indexes to the actual lever objects
        const linkedLevers = (d.leverIndexes || []).map(idx => levers[idx]).filter(l => l);
        
        // Combine them into the door's buttons array (used by updateDoor)
        door.buttons = [...linkedButtons, ...linkedLevers];
        door.interval = d.interval || 2000;
        
        return door;
    });

    // 4. Calculate World Bounds
    const allX = currentLevelData.platforms.map(p => p.x + p.w)
                  .concat(currentLevelData.exit.x + currentLevelData.exit.w);
    const allY = currentLevelData.platforms.map(p => p.y + p.h)
                  .concat(currentLevelData.exit.y + currentLevelData.exit.h);
    
    const worldWidth = Math.max(...allX, currentLevelData.playerStart.x + 200);
    const worldHeight = Math.max(...allY, currentLevelData.playerStart.y + 200);

    return {
        playerSpawn: currentLevelData.playerStart,
        platforms: currentLevelData.platforms,
        spikes,
        buttons,
        levers, // Added levers to the return object
        doors,
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
