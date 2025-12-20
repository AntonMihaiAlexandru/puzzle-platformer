const leverIdleImg = new Image();
leverIdleImg.src = new URL("../sprites/assets/lever.png", import.meta.url);

const leverLeftImg = new Image();
leverLeftImg.src = new URL("../sprites/assets/lever_left.png", import.meta.url);

const leverRightImg = new Image();
leverRightImg.src = new URL("../sprites/assets/lever_right.png", import.meta.url);





export function createLever(x, y, w, h) {
    return {
        x, y, w, h,
        activated: false,
        direction: 0,   // -1 = stânga, 1 = dreapta, 0 = neutral
        type: "lever",
       _usedThisPress: false
    };
}


export function updateLever(lever, player, isEPressed) {
    const isOverlapping =
        player.x < lever.x + lever.w &&
        player.x + player.w > lever.x &&
        player.y < lever.y + lever.h &&
        player.y + player.h > lever.y;

    // o singură activare per apăsare (anti-spam)
    if (isOverlapping && isEPressed && !lever._usedThisPress) {
        lever.activated = !lever.activated;

        // setează direcția în funcție de unde e playerul față de lever
        const playerCenter = player.x + player.w / 2;
        const leverCenter  = lever.x + lever.w / 2;

        // player în stânga -> lever spre dreapta
        lever.direction = (playerCenter < leverCenter) ? 1 : -1;

        lever._usedThisPress = true;
        return true;
    }

    // reset când E nu mai e apăsat
    if (!isEPressed) {
        lever._usedThisPress = false;
    }

    return false;
}


export function drawLever(ctx, lever) {
    let img = leverIdleImg;

    if (lever.activated) {
        img = (lever.direction === 1) ? leverRightImg : leverLeftImg;
    }

    if (!img.complete) return;

    ctx.drawImage(img, lever.x, lever.y, lever.w, lever.h);

    // debug hitbox (opțional)
    // ctx.strokeStyle = "red";
    // ctx.strokeRect(lever.x, lever.y, lever.w, lever.h);
}
