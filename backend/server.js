// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // parse JSON bodies

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health
app.get("/", (req, res) => {
  res.send("✅ Backend is running! Use POST /api/generate and GET /api/search to test.");
});

// Study guide generator
app.post("/api/generate", async (req, res) => {
  try {
    const { subject = "General", topics = "", time = "N/A" } = req.body || {};

    const prompt = `Generate a personalized study guide.
Subject: ${subject}
Topics: ${topics}
Available study time: ${time} hours.
Include a structured timeline, key points, and suggested exercises.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful study guide generator." },
        { role: "user", content: prompt }
      ],
    });

    const guide = completion.choices?.[0]?.message?.content ?? "No guide produced.";
    res.json({ guide });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: "Failed to generate study guide" });
  }
});

/*
  Search route (Wikipedia)
  - GET  /api/search?query=neutron
  - POST /api/search  { "query": "neutron" }
  Returns: { source, title, extract, url }
*/
async function fetchWikiSummaryByTitle(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "StudyGen/1.0 (https://studygen-api.onrender.com)" },
  });
  if (!resp.ok) throw new Error(`Wikipedia summary fetch failed (${resp.status})`);
  return resp.json();
}

app.all("/api/search", async (req, res) => {
  try {
    // Support GET ?query=... and POST { query: "..." }
    const q = (req.method === "GET" ? req.query.query || req.query.q : req.body?.query) || "";
    const query = q.toString().trim();
    if (!query) return res.status(400).json({ error: "Missing query parameter" });

    try {
      // First try the summary endpoint directly
      const summary = await fetchWikiSummaryByTitle(query);
      return res.json({
        source: "wikipedia",
        title: summary.title || query,
        extract: summary.extract || "No summary available.",
        url: (summary.content_urls?.desktop?.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(summary.title || query)}`
      });
    } catch (summaryErr) {
      // If exact page fails, use the search API to find first relevant result
      console.warn("Wiki summary lookup failed, trying search API:", summaryErr.message);
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const searchResp = await fetch(searchUrl, { headers: { "User-Agent": "StudyGen/1.0 (https://studygen-api.onrender.com)" }});
      if (!searchResp.ok) throw new Error("Wikipedia search API error");

      const searchJson = await searchResp.json();
      const first = searchJson?.query?.search?.[0];
      if (!first || !first.title) {
        return res.status(404).json({ error: "No results found on Wikipedia." });
      }

      // Fetch the summary for the first search result
      const summaryJson = await fetchWikiSummaryByTitle(first.title);
      return res.json({
        source: "wikipedia",
        title: summaryJson.title,
        extract: summaryJson.extract || "No summary available.",
        url: (summaryJson.content_urls?.desktop?.page) || `https://en.wikipedia.org/wiki/${encodeURIComponent(summaryJson.title)}`
      });
    }
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Failed to fetch information." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT} (port ${PORT})`);
});

