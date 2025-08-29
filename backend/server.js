// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure .env has OPENAI_API_KEY=your_key
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Backend is running! Use POST /api/generate to test.");
});

// ✅ Study guide generator API
app.post("/api/generate", async (req, res) => {
  try {
    const { subject, topics, time } = req.body;

    // Build the prompt
    const prompt = `Generate a personalized study guide.
    Subject: ${subject}
    Topics: ${topics}
    Available study time: ${time || "N/A"} hours.
    Include a structured timeline, key points, and suggested exercises.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast & cost-efficient
      messages: [
        { role: "system", content: "You are a helpful study guide generator." },
        { role: "user", content: prompt }
      ]
    });

    res.json({ guide: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to generate study guide" });
  }
});

// Start server
// POST /api/search
// body: { query: "Photosynthesis" }
app.post("/api/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    const title = encodeURIComponent(query.trim());
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

    // fetch Wikipedia summary
    const wikiResp = await fetch(wikiUrl, { method: "GET", headers: { "Accept": "application/json" } });

    if (!wikiResp.ok) {
      // If exact page not found, try search API
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${title}&format=json&origin=*`;
      const searchResp = await fetch(searchUrl);
      const searchJson = await searchResp.json();
      const first = searchJson?.query?.search?.[0];
      if (!first || !first.title) {
        return res.status(404).json({ error: "No results found on Wikipedia." });
      }
      // fetch summary of first search result
      const summaryResp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(first.title)}`);
      const summaryJson = await summaryResp.json();
      return res.json({
        source: "wikipedia",
        title: summaryJson.title,
        extract: summaryJson.extract || "No summary available."
      });
    }

    const wikiJson = await wikiResp.json();
    // wikiJson.extract contains the summary
    return res.json({
      source: "wikipedia",
      title: wikiJson.title || query,
      extract: wikiJson.extract || "No summary available."
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch information." });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
