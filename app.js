import React, { useState } from "react";
import "./index.css"; // keep your styling

function App() {
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [time, setTime] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://localhost:5000/generate-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topics, time }),
      });

      const data = await response.json();
      setResult(data.guide);
    } catch (error) {
      console.error("Error:", error);
      setResult(" Failed to connect to backend. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="brand">
            <span className="brand-mark">📘</span>
            <span className="brand-text">StudyGen</span>
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>
            Generate Your <span className="accent">Study Guide</span> 📖
          </h1>
          <p className="sub">
            Enter your subject, topics, and study time. Let AI create a plan
            instantly.
          </p>

          <form className="form" onSubmit={handleGenerate}>
            <div className="field">
              <span>Subject</span>
              <input
                type="text"
                placeholder="e.g. Math"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <span>Topics</span>
              <input
                type="text"
                placeholder="e.g. Algebra, Geometry, Trigonometry"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <span>Time (in hours)</span>
              <input
                type="number"
                placeholder="e.g. 5"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="cta primary"
              disabled={loading}
            >
              {loading ? "⏳ Generating..." : "✨ Generate Guide"}
            </button>
          </form>

          {result && (
            <div className="card" style={{ marginTop: "20px", padding: "20px" }}>
              <h2>📑 Your Study Guide</h2>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
            </div>
          )}
        </div>
      </section>

      <footer className="site-footer">
        <p>🚀 Built with ❤️ using React + Express</p>
      </footer>
    </div>
  );
}

export default App;
