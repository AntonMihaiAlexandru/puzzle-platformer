const keys = {};
const prevKeys = {}; // Track previous frame state

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

export function isKeyDown(key) {
    return keys[key];
}

// Returns true only on the first frame a key is pressed
export function isKeyJustPressed(key) {
    return keys[key] && !prevKeys[key];
}

// Call this at the very END of your game loop in main.js
export function updateInputState() {
    for (let code in keys) {
        prevKeys[code] = keys[code];
    }
}