import { useState } from "react"
import { api } from "../api"

function FlashCard({ card, index }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer w-full"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "160px"
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-xs text-indigo-400 font-medium">Card {index + 1} · Click to reveal</span>
          <p className="text-white font-medium text-sm leading-relaxed">{card.question}</p>
          <span className="text-xs text-gray-500">Question</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-indigo-900 border border-indigo-700 rounded-xl p-5 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-xs text-indigo-300 font-medium">Card {index + 1} · Click to flip back</span>
          <p className="text-indigo-100 text-sm leading-relaxed">{card.answer}</p>
          <span className="text-xs text-indigo-400">Answer</span>
        </div>
      </div>
    </div>
  )
}

export default function Flashcards({ sessionId, onBack }) {
  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generated, setGenerated] = useState(false)

  const generateFlashcards = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post("/flashcards", { session_id: sessionId })
      setFlashcards(data.flashcards)
      setGenerated(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full text-white">
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">

        {/* Boxed header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(99,57,255,0.3)",
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
          }}>Flashcards</h1>
          {/* Spacer to keep title centered */}
          <div style={{ width: "80px" }} />
        </div>

        {/* Generate screen */}
        {!generated ? (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(99,57,255,0.4)",
            borderRadius: "20px", padding: "4rem 2rem",
            textAlign: "center",
            boxShadow: "0 0 24px rgba(99,57,255,0.1), inset 0 0 24px rgba(99,57,255,0.03)",
          }}>
            <p style={{ color: "#4a4a6a", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Generate flashcards from your uploaded notes
            </p>
            <button onClick={generateFlashcards} disabled={loading} style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #6339ff, #3b5b61)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 32px rgba(99,57,255,0.35)",
              opacity: loading ? 0.5 : 1, transition: "all 0.2s"
            }}>
              {loading ? "Generating..." : "Generate Flashcards"}
            </button>
            {error && (
              <p style={{ color: "#ff6b6b", marginTop: "1rem", fontSize: "0.85rem" }}>
                {error}
              </p>
            )}
          </div>
        ) : (
          <>
            <p style={{ color: "#4a4a6a", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              {flashcards.length} cards generated · Click any card to flip it
            </p>
            <div className="grid grid-cols-1 gap-4">
              {flashcards.map((card, i) => (
                <FlashCard key={i} card={card} index={i} />
              ))}
            </div>
            <button onClick={() => { setGenerated(false); setFlashcards([]) }} style={{
              marginTop: "2rem", width: "100%", padding: "0.75rem",
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
          </>
        )}
      </div>
    </div>
  )
}