import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://studygen-api.onrender.com";

export default function SearchInfo() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function onSearch(e) {
    e.preventDefault();
    if (!q.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`${API_URL}/api/search?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Request failed");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError("Error fetching information.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>🔎 Search Info Online</h3>
      <form onSubmit={onSearch} style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="what are neutrons"
          aria-label="Search query"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</button>
      </form>

      <div className="output-box" style={{ marginTop: 12 }}>
        {error && <div>✖ {error}</div>}
        {!error && loading && <div>⏳ Fetching…</div>}
        {!error && !loading && data && (
          <div>
            <strong>{data.title}</strong>
            <p style={{ marginTop: 8 }}>{data.extract}</p>
            <a href={data.url} target="_blank" rel="noreferrer">Open on Wikipedia ↗</a>
          </div>
        )}
      </div>
    </div>
  );
}
