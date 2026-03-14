import { useState } from "react"
import { api } from "../api"

export default function Summary({ sessionId, onBack }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post("/summary", { session_id: sessionId })
      setSummary(data.summary)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">

        {/* Boxed header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(99,57,255,0.4)",
          borderRadius: "16px", padding: "1rem 1.5rem",
          marginBottom: "2rem"
        }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(99,57,255,0.4)",
            borderRadius: "8px", padding: "0.4rem 1rem",
            color: "#6a6a8a", fontSize: "0.8rem", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "rgba(255,255,255,0.2)" }}
            onMouseLeave={e => { e.target.style.color = "#6a6a8a"; e.target.style.borderColor = "rgba(255,255,255,0.08)" }}
          >
            ← Back
          </button>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: "1.1rem", color: "#fff", margin: 0
          }}>Summary</h1>
          <div style={{ width: "80px" }} />
        </div>

        {/* Generate screen */}
        {!summary && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(99,57,255,0.4)",
            borderRadius: "20px", padding: "4rem 2rem",
            textAlign: "center"
          }}>
            <p style={{ color: "#4a4a6a", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Get a clean structured summary of your document
            </p>
            <button onClick={generateSummary} disabled={loading} style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #6339ff,#3b5b61)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 32px rgba(99,57,255,0.35)",
              opacity: loading ? 0.5 : 1, transition: "all 0.2s"
            }}>
              {loading ? "Summarizing..." : "Generate Summary"}
            </button>
            {error && <p style={{ color: "#ff6b6b", marginTop: "1rem", fontSize: "0.85rem" }}>{error}</p>}
          </div>
        )}

        {/* Summary content */}
        {summary && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {[
              { title: "Overview", content: (
                <p style={{ color: "#d0d0f0", lineHeight: 1.7, fontSize: "0.9rem", margin: 0 }}>{summary.overview}</p>
              )},
              { title: "Topics Covered", content: (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {summary.topics_covered?.map((topic, i) => (
                    <span key={i} style={{
                      padding: "0.3rem 0.85rem",
                      background: "rgba(99,57,255,0.15)",
                      border: "1px solid rgba(99,57,255,0.25)",
                      borderRadius: "999px", fontSize: "0.8rem", color: "#a78bfa"
                    }}>{topic}</span>
                  ))}
                </div>
              )},
              { title: "Key Concepts", content: (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {summary.key_concepts?.map((concept, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem", color: "#c0c0e0" }}>
                      <span style={{ color: "#6339ff", flexShrink: 0 }}>▸</span>{concept}
                    </li>
                  ))}
                </ul>
              )},
              { title: "Important Details", content: (
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {summary.important_details?.map((detail, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.875rem", color: "#c0c0e0" }}>
                      <span style={{ color: "#00d4ff", flexShrink: 0 }}>•</span>{detail}
                    </li>
                  ))}
                </ul>
              )}
            ].map(({ title, content }) => (
              <div key={title} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px", padding: "1.5rem"
              }}>
                <h2 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 600,
                  fontSize: "0.85rem", color: "#6339ff", margin: "0 0 1rem",
                  textTransform: "uppercase", letterSpacing: "0.08em"
                }}>{title}</h2>
                {content}
              </div>
            ))}

            <button onClick={() => setSummary(null)} style={{
              width: "100%", padding: "0.75rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", color: "#4a4a6a",
              fontSize: "0.85rem", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,57,255,0.4)"; e.currentTarget.style.color = "#fff" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#4a4a6a" }}
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}