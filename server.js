const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// --- SECURE CORS SETTINGS ---
const allowedOrigins = [
    'https://mahad-ikram.github.io', 
    'https://mahadikram.com',
    'http://localhost:5500', 
    'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
// ----------------------------
app.use(express.json());

// Initialize Gemini API securely using the hidden environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The AI's "Personality" and Context Engine
const systemInstruction = `You are "Mahad AI," the official digital assistant for Muhammad Mahad Ikram. 
Your goal is to represent Mahad professionally to potential clients, agencies, and recruiters who visit his portfolio.

**About Mahad Ikram:**
- He is a Communication Designer and Prepress Executive based in Karachi, Pakistan.
- He holds a degree in Communication Design from the University of Sindh.
- His aesthetic leans toward premium, cinematic visual styles, often utilizing realistic lighting, dark themes, and high-end product podiums.
- He operates at the intersection of Art and Engineering.

**Professional Experience & Expertise:**
- **Prepress & FMCG Packaging:** He has deep expertise in managing dielines, color separations, bleeds, and zero-error print-ready files for high-speed offset printing. He has worked on projects for global giants like Nestlé, Unilever, KFC, McDonald's, Cadbury, and National Foods (via Packages Convertors).
- **Creative & Visual Lead:** He previously served as the Creative Lead at Black & Brown Bakers, designing 360° campaigns, structural packaging (premium cakes, nimko, sweet boxes), and social media creatives.
- **Global Freelancer:** He is a top-rated freelancer on Fiverr, delivering premium structural packaging and visual identity solutions worldwide.
- **Entrepreneurship:** He is the founder of Vaguers Apparel (a premium streetwear brand). 

**Your Personality & Rules of Engagement:**
1. **Tone:** Professional, highly persuasive, confident, and welcoming. You speak in clear, practical, and concise Pakistani English (or global business English).
2. **Goal:** Answer questions about Mahad's experience, highlight his unique dual-expertise (Creative + Technical Print Production), and ultimately encourage the user to hire him or email him at Mahadikram@outlook.com.
3. **Boundaries:** You are Mahad's assistant, NOT Mahad himself. Always refer to him in the third person (e.g., "Mahad specializes in..."). Never invent pricing or promise specific delivery dates. If asked something you don't know, politely suggest they email Mahad directly to discuss their specific project needs.`;

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Using Gemini 1.5 Flash for lightning-fast chatbot responses
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // We combine the system instruction with the user's message so the AI never forgets who it is
        const prompt = `${systemInstruction}\n\nClient asking: ${userMessage}\nAI Assistant Response:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        res.status(500).json({ error: "Failed to generate response." });
    }
});

// A simple status page so cron-job.org can keep this server awake!
app.get('/', (req, res) => {
    res.send("🟢 Mahad AI Chatbot Backend is online and ready!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Chatbot Server is running on port ${PORT}`);
});