// Konfigurasi Server
const SERVER_IP = "mc.cr3scent.asia";
const API_URL = `https://api.mcsrvstat.us/3/${SERVER_IP}`;

// Fungsi Copy IP
function copyIP() {
    navigator.clipboard.writeText(SERVER_IP).then(() => {
        const ipText = document.getElementById("ip-text");
        const originalText = ipText.innerText;
        
        // Efek Visual Saat Copy
        ipText.innerText = "COPIED!";
        document.querySelector(".ip-box").style.background = "#00ff88";
        
        setTimeout(() => {
            ipText.innerText = originalText;
            document.querySelector(".ip-box").style.background = "#d4af37";
        }, 2000);
    }).catch(err => {
        console.error('Gagal copy IP: ', err);
    });
}

// Fungsi Cek Status Server
async function checkServerStatus() {
    const statusDot = document.getElementById("status-dot");
    const statusText = document.getElementById("status-text");
    const playerCount = document.getElementById("player-count");

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.online) {
            statusDot.classList.add("online");
            statusDot.classList.remove("offline");
            statusText.innerText = "Server Online";
            playerCount.innerText = `${data.players.online} / ${data.players.max} Players`;
        } else {
            statusDot.classList.add("offline");
            statusDot.classList.remove("online");
            statusText.innerText = "Server Offline";
            playerCount.innerText = "0 Players";
        }
    } catch (error) {
        console.error("Error fetching status:", error);
        statusText.innerText = "Status Unknown";
    }
}

// Jalankan saat website load
document.addEventListener("DOMContentLoaded", checkServerStatus);
