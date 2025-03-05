require("dotenv").config({ path: ".env.local" });

const API_KEY = process.env.GEMINI_API_KEY;
console.log("API Key loaded:", API_KEY ? "✅" : "❌ Missing API Key");

const express = require("express");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // FIXED ENV VARIABLE

// Easter eggs
const easterEggs = {
    "i have an exam": "Sorry, the AI is currently taking an exam too. Come back later! 😂",
    "i forgot my assignment": "Just tell them: 'I thought it was optional…' 😆",
    "i overslept": "Tell them your alarm clock betrayed you. It's under investigation. 🕵️‍♂️",
    "my internet went down": "Blame it on the quantum fluctuations. Very technical. 🤖"
};

// Tone-based prompts
const tonePrompts = {
    funny: "Make it witty, humorous, and creative.",
    sarcastic: "Make it dry, ironic, and playful.",
    formal: "Make it professional, polite, and serious."
};

// Keyword-based emoji mapping (for non-formal tones)
const emojiMap = [
    { keywords: ["alarm", "late", "overslept"], emoji: "⏰" },
    { keywords: ["dog", "cat", "pet"], emoji: "🐶" },
    { keywords: ["internet", "wifi", "connection"], emoji: "📶" },
    { keywords: ["work", "boss", "deadline"], emoji: "💼" },
    { keywords: ["school", "exam", "homework"], emoji: "📚" },
    { keywords: ["sick", "doctor", "hospital"], emoji: "🤒" },
    { keywords: ["forgot", "memory", "brain"], emoji: "🤯" },
    { keywords: ["sleep", "nap", "dream"], emoji: "😴" }
];

// Serve static files
app.use(express.static("public"));
app.use(express.json());

// Function to determine the best emoji for an excuse (for non-formal tones)
function getRelevantEmoji(excuse) {
    excuse = excuse.toLowerCase();
    for (const { keywords, emoji } of emojiMap) {
        if (keywords.some(keyword => excuse.includes(keyword))) {
            return emoji;
        }
    }
    return "🎭"; // Default fallback emoji
}

// API endpoint to generate an excuse using Gemini
app.post("/generate", async (req, res) => {
    const { problem, tone } = req.body;

    if (!problem || problem.trim() === "") {
        return res.json({ excuse: "Please enter a problem first!" });
    }

    if (!tone || !tonePrompts[tone]) {
        return res.json({ excuse: "Invalid tone selected!" });
    }

    const lowerCaseProblem = problem.trim().toLowerCase();

    // Check for Easter eggs
    if (easterEggs[lowerCaseProblem]) {
        return res.json({ excuse: easterEggs[lowerCaseProblem] }); // No emojis added
    }

    try {
        // Construct prompt based on tone
        const prompt = `Generate a very short and snappy excuse (one sentence) for: "${problem}". ${tonePrompts[tone]}`;

        // FIXED GEMINI API REQUEST
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            }
        );
        

        // FIXED RESPONSE EXTRACTION
        const excuse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't come up with an excuse.";

        // For formal tone, return the excuse without an emoji
        if (tone === "formal") {
            return res.json({ excuse });
        }

        // Determine the best emoji (for funny and sarcastic tones only)
        const emoji = getRelevantEmoji(excuse);
        res.json({ excuse: `${excuse} ${emoji}` });

    } catch (error) {
        console.error("Error fetching excuse from Gemini:", error.response?.data || error.message);
        res.json({ excuse: "Oops! Something went wrong. Try again later!" });
    }
});

// Serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
