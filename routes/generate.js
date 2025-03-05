const axios = require("axios");
const express = require("express");
const router = express.Router();

// Load environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("API Key loaded:", GEMINI_API_KEY ? "✅" : "❌ Missing API Key");

// Easter egg responses
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

// API Route
router.post("/generate", async (req, res) => {
  try {
    console.log("🔵 API /generate called");

    const { problem, tone } = req.body;

    if (!problem || problem.trim() === "") {
      return res.status(400).json({ excuse: "Please enter a problem first!" });
    }

    if (!tone || !tonePrompts[tone]) {
      return res.status(400).json({ excuse: "Invalid tone selected!" });
    }

    const lowerCaseProblem = problem.trim().toLowerCase();

    // Check for Easter eggs
    if (easterEggs[lowerCaseProblem]) {
      return res.json({ excuse: easterEggs[lowerCaseProblem] });
    }

    // Construct prompt based on tone
    const prompt = `Generate a very short and snappy excuse (one sentence) for: "${problem}". ${tonePrompts[tone]}`;

    console.log("🟡 Sending request to Gemini API...");

    // Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      }
    );

    console.log("🟢 Response received from Gemini API");

    // Extract AI-generated excuse
    const excuse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Sorry, I couldn't come up with an excuse.";

    // If tone is formal, return excuse as is
    if (tone === "formal") {
      return res.json({ excuse });
    }

    // Add emoji for funny/sarcastic tones
    const emoji = getRelevantEmoji(excuse);
    return res.json({ excuse: `${excuse} ${emoji}` });

  } catch (error) {
    console.error("🔴 Error fetching excuse from Gemini:", error.response?.data || error.message);
    return res.status(500).json({ excuse: "Oops! Something went wrong. Try again later!" });
  }
});

module.exports = router;
