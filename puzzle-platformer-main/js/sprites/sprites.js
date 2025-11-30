// sprites.js
export const playerSprites = {
    idle: new Image(),
    jump: new Image(),
    walkA: new Image(),
    walkB: new Image(),
    ledge_grab: new Image()
};

playerSprites.idle.src  = "js/sprites/assets/slime_front.png";
playerSprites.jump.src  = "js/sprites/assets/slime_jump.png";
playerSprites.walkA.src = "js/sprites/assets/slime_walk_a.png";
playerSprites.walkB.src = "js/sprites/assets/slime_walk_b.png";
playerSprites.ledge_grab.src = "js/sprites/assets/ledge_grab.png";
