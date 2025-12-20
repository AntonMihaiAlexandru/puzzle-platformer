const buttonIdleImg = new Image();
buttonIdleImg.src = new URL("../sprites/assets/switch_red.png", import.meta.url);

const buttonPressedImg = new Image();
buttonPressedImg.src = new URL("../sprites/assets/switch_red_pressed.png", import.meta.url);

export function createButton(x, y, w, h) {
    return {
        x, y, w, h,
        pressed: false,
        lastPressedTime: 0 // timestamp when it was last pressed
    };
}

// Update button state: pressed if player or any enemy stands on it
export function updateButton(button, player, enemies, echo, now) {
    const wasPressed = button.pressed;
    button.pressed = false;

    if (rectOverlap(player, button)) button.pressed = true;

    for (let e of enemies) {
        if (rectOverlap(e, button)) {
            button.pressed = true;
            break;
        }
    }

    if (echo && echo.active && rectOverlap(echo, button)) {
        button.pressed = true;
    }

    // Track the time when pressed
    if (button.pressed && !wasPressed) {
        button.lastPressedTime = now; 
        console.log(`Button pressed at (${button.x},${button.y})`);
    }
}


export function drawButton(ctx, button) {
  const img = button.pressed ? buttonPressedImg : buttonIdleImg;
  if (!img.complete) return;

  const SCALE_X = 1.6;
  const SCALE_Y = 2.7; 

  const drawW = button.w * SCALE_X;
  const drawH = button.h * SCALE_Y;

  const drawX = button.x - (drawW - button.w) / 2;
  const drawY = button.y - (drawH - button.h) / 2;

    
   ctx.drawImage(
  img,
  drawX,
  drawY,
  drawW,
  drawH
);


   
}


// Helper
function rectOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}
