const sounds = {
  jump: new Audio("sounds/jumpSound.mp3"),
  bgm: new Audio("sounds/undertale.mp3"),
  gameOver: new Audio("sounds/sfx_death.mp3"),
  levelComplete: new Audio("sounds/level_complete.mp3"),
  grassStep: new Audio("sounds/running_grass.mp3"),
  doorOpen: new Audio("sounds/door.mp3")
};
sounds.bgm.loop = true;
sounds.bgm.volume = 0.1;
sounds.jump.volume = 0.7;
sounds.grassStep.volume = 0.5;
sounds.doorOpen.volume = 0.4;

sounds.grassStep.loop = true;

export function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play();
    }
}

// ===== LOOP SOUNDS (footsteps) =====
export function startLoopSound(name) {
  const s = sounds[name];
  if (s && s.paused) {
    s.play();
  }
}

export function stopSound(name) {
  const s = sounds[name];
  if (s && !s.paused) {
    s.pause();
    s.currentTime = 0;
  }
}

function stopMusic() {
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
}
