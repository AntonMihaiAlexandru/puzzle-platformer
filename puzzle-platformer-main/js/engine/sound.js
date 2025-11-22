const sounds = {
  jump: new Audio("sounds/jumpSound.mp3"),
  bgm: new Audio("sounds/undertale.mp3")
};
sounds.bgm.loop = true;
sounds.bgm.volume = 0.1;
sounds.jump.volume = 0.7;

export function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play();
    }
}

function stopMusic() {
    sounds.bgm.pause();
    sounds.bgm.currentTime = 0;
}
