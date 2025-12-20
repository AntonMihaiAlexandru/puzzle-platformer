export function createSpike(x, y, w = 32, h = 32) {
    return { x, y, w, h, type: "spike" };
}

export function drawSpike(ctx, spike) {
    const spikeSize = 32; // Width of a single triangle
    const numSpikes = Math.max(1, Math.floor(spike.w / spikeSize));

    ctx.fillStyle = "#99aab5";
    ctx.strokeStyle = "#2c2f33";
    ctx.lineWidth = 2;

    for (let i = 0; i < numSpikes; i++) {
        const startX = spike.x + (i * spikeSize);
        const tipX = startX + spikeSize / 2;
        const tipY = spike.y;
        const baseY = spike.y + spike.h;

        ctx.beginPath();
        ctx.moveTo(startX, baseY);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(startX + spikeSize, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}