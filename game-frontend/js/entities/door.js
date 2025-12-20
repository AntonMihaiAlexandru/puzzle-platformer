import { playSound } from "../engine/sound.js";

const doorClosedImg = new Image();
doorClosedImg.src = new URL("../sprites/assets/door_closed.png", import.meta.url);

const doorOpenImg = new Image();
doorOpenImg.src = new URL("../sprites/assets/door_open.png", import.meta.url);


export function createDoor(x, y, w, h, type= "single") {

    return {
        x, y, w, h,
        solid: true, // initially solid
        wasSolid: true,
        type,
        buttons: [],
        permanentlyOpen: false
        };
}

export function updateDoor(door, interval = 15000) {
    // 1. Separate the triggers by type
    const timedButtons = door.buttons.filter(b => b.type !== "lever");
    const levers = door.buttons.filter(b => b.type === "lever");

    const now = performance.now();
    
    // --- BUTTON LOGIC (Permanent) ---
    if (!door.permanentlyOpen && timedButtons.length > 0) {
        const allButtonsPressed = timedButtons.every(b => b.pressed);
        const anyNeverPressed = timedButtons.some(b => b.lastPressedTime === 0);
        
        let allPressedRecently = false;
        if (!anyNeverPressed) {
            const lastTimes = timedButtons.map(b => b.lastPressedTime);
            allPressedRecently = (Math.max(...lastTimes) - Math.min(...lastTimes)) <= interval;
        }

        // If the buttons satisfy the condition, unlock them permanently
        if (allButtonsPressed || allPressedRecently) {
            door.permanentlyOpen = true;
        }
    }

    const leversActive = levers.length > 0 ? levers.every(l => l.activated) : true;

    
    const buttonsSolved = (timedButtons.length === 0 || door.permanentlyOpen);
    
    if (buttonsSolved && leversActive) {
        door.solid = false;
    } else {
        door.solid = true;
    }
      
  if (door.wasSolid && !door.solid) {
    playSound("doorOpen");
  }

 
  door.wasSolid = door.solid;

}

export function drawDoor(ctx, door) {
  const img = door.solid ? doorClosedImg : doorOpenImg;
  if (!img.complete) return;

  const SCALE_X = 1.1; // 🔥 cât de lat vrei sprite-ul
  const SCALE_Y = 1.0; // păstrează înălțimea

  const drawW = door.w * SCALE_X;
  const drawH = door.h * SCALE_Y;

  // centrează sprite-ul pe hitbox
  const drawX = door.x - (drawW - door.w) / 2;
  const drawY = door.y - (drawH - door.h) / 2;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}
