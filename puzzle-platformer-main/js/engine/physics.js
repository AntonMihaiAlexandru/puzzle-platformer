// Constanta de gravitatie
export const gravity = 0.6;

// Verifica daca exista overlap intre doua dreptunghiuri
export function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w &&
         rect1.x + rect1.w > rect2.x &&
         rect1.y < rect2.y + rect2.h &&
         rect1.y + rect1.h > rect2.y;
}

// Rezolva coliziunile intre jucator si platforme
export function resolveCollision(player, platform) {
  const dx = (player.x + player.w/2) - (platform.x + platform.w/2);
  const dy = (player.y + player.h/2) - (platform.y + platform.h/2);

  const combinedHalfWidths = (player.w + platform.w) / 2;
  const combinedHalfHeights = (player.h + platform.h) / 2;

  const overlapX = combinedHalfWidths - Math.abs(dx);
  const overlapY = combinedHalfHeights - Math.abs(dy);

  if (overlapX > 0 && overlapY > 0) {
    // Corectează întâi suprapunerea mai mică pentru coliziuni
    if (overlapX < overlapY) {
      if (dx > 0) player.x += overlapX;   // Lovit din partea dreapta
      else player.x -= overlapX;          // Lovit din partea stanga
    } else {
      if (dy > 0) { 
        player.y += overlapY; 
        if (player.vy < 0) player.vy = 0; 
      } else { 
        player.y -= overlapY; 
        player.grounded = true; 
        player.vy = 0; 
      }
    }
  }
}

// Repara coliziunile cu marginile jocului
export function resolveCollisionWithBounds(player, canvas) {
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y < 0) { player.y = 0; if (player.vy < 0) player.vy = 0; }
  if (player.y + player.h > canvas.height) { 
    player.y = canvas.height - player.h; 
    player.vy = 0; 
    player.grounded = true; 
  }
}
