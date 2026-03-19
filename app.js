// ===== REPORT SYSTEM WITH COOLDOWN =====
const webhookURL = "https://discord.com/api/webhooks/1477337691950420160/vmF4-lTK1_wfxxyXlOCKgEk84HUc_kh2XkHdHpi0ENpRlgihGgVcGJeQsSx-5EnDkApd"; // <-- replace with your webhook
let lastReportTime = 0;
const cooldown = 30000; // 30 seconds

function openReport() {
    document.getElementById("reportModal").classList.remove("hidden");
}

function closeReport() {
    document.getElementById("reportModal").classList.add("hidden");
    document.getElementById("reportText").value = "";
    document.getElementById("reportStatus").innerText = "";
    document.getElementById("sendReportBtn").disabled = false;
}

async function sendReport() {
    const now = Date.now();
    const btn = document.getElementById("sendReportBtn");
    
    if (now - lastReportTime < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastReportTime)) / 1000);
        document.getElementById("reportStatus").innerText = `⏳ Please wait ${remaining}s before sending again.`;
        return;
    }

    const feedback = document.getElementById("reportText").value.trim();
    if (!feedback) {
        document.getElementById("reportStatus").innerText = "⚠ Please enter feedback.";
        return;
    }

    // Disable button immediately to prevent spamming
    btn.disabled = true;

    const word = document.getElementById("hangul")?.innerText || "N/A";
    const roman = document.getElementById("romanization")?.innerText || "Hidden";
    const meaning = document.getElementById("meaning")?.innerText || "Hidden";
    const category = window.currentCategory || "Default";
    const modeName = window.mode || "Flashcard";

    const payload = {
        embeds: [{
            title: "📘 Flashcard Report",
            color: 15158332,
            fields: [
                { name: "Word", value: word, inline: true },
                { name: "Romanization", value: roman, inline: true },
                { name: "Meaning", value: meaning, inline: false },
                { name: "Category", value: category, inline: true },
                { name: "Mode", value: modeName, inline: true },
                { name: "Correction", value: feedback, inline: false }
            ],
            footer: { text: "Time: " + new Date().toLocaleString() }
        }]
    };

    try {
        await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        lastReportTime = now;
        document.getElementById("reportStatus").innerText = "✅ Report sent successfully!";
        setTimeout(closeReport, 1500);

    } catch (error) {
        document.getElementById("reportStatus").innerText = "❌ Failed to send report.";
        btn.disabled = false; // Re-enable if error
    }

    // Ensure cooldown blocks further clicks
    setTimeout(() => { btn.disabled = false; }, cooldown);
}
