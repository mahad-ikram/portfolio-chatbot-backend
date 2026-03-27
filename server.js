const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Allow your specific portfolio website to talk to this server securely
app.use(cors({
    origin: '*' // We will lock this down to 'https://mahad-ikram.github.io' later for extra security
}));
app.use(express.json());

// Initialize Gemini API securely using the hidden environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The AI's "Personality" and Context Engine
const systemInstruction = `You are the official AI Assistant for Muhammad Mahad Ikram's portfolio website. 
Mahad is a Communication Designer and Prepress Executive based in Karachi, Pakistan.
He specializes in FMCG packaging, Esko ArtPro, and 360-degree brand campaigns for multinational clients like Nestlé, Unilever, and KFC.
He is a top-rated freelancer on Fiverr and has a degree in Communication Design from the University of Sindh.
Your goal is to answer client questions about Mahad's work, highlight his technical print expertise, and encourage them to contact him for projects.
Keep your responses professional, friendly, concise, and highly persuasive.`;

app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Using Gemini 1.5 Flash for lightning-fast chatbot responses
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
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