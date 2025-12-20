// Change this to Render URL
const BASE_URL = "https://puzzle-backend-qk2v.onrender.com"; 

export async function sendPlayerTime(playerName, level, timeMs) {
    try {
        const res = await fetch(`${BASE_URL}/time`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName, level, timeMs })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

export async function getLeaderboard(level) {
    try {
        const res = await fetch(`${BASE_URL}/leaderboard/${level}`);
        return await res.json();
    } catch (err) {
        console.error("Leaderboard fetch error:", err);
        return [];
    }
}

export async function getPlayerRank(level, playerName) {
    try {
        const res = await fetch(`${BASE_URL}/rank/${level}/${playerName}`);
        return await res.json();
    } catch (err) {
        console.error("Rank fetch error:", err);
        return { rank: "???" };
    }
}