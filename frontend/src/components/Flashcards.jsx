import { useState } from "react"

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
          className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-xl p-5
            flex flex-col justify-between backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-xs text-indigo-400 font-medium">Card {index + 1} · Click to reveal</span>
          <p className="text-white font-medium text-sm leading-relaxed">{card.question}</p>
          <span className="text-xs text-gray-500">❓ Question</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-indigo-900 border border-indigo-700 rounded-xl p-5
            flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <span className="text-xs text-indigo-300 font-medium">Card {index + 1} · Click to flip back</span>
          <p className="text-indigo-100 text-sm leading-relaxed">{card.answer}</p>
          <span className="text-xs text-indigo-400">✅ Answer</span>
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
      const res = await fetch("http://localhost:8000/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to generate")
      setFlashcards(data.flashcards)
      setGenerated(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-indigo-400">Flashcards 🃏</h1>
        </div>

        {!generated ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-gray-400 mb-6">Generate flashcards from your uploaded notes</p>
            <button
              onClick={generateFlashcards}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                rounded-lg font-semibold transition-colors"
            >
              {loading ? "Generating flashcards..." : "Generate Flashcards"}
            </button>
            {error && <p className="text-red-400 mt-4">⚠️ {error}</p>}
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">
              {flashcards.length} cards generated · Click any card to flip it
            </p>
            <div className="grid grid-cols-1 gap-4">
              {flashcards.map((card, i) => (
                <FlashCard key={i} card={card} index={i} />
              ))}
            </div>
            <button
              onClick={() => { setGenerated(false); setFlashcards([]) }}
              className="mt-8 w-full py-3 border border-gray-700 hover:border-indigo-500
                rounded-lg text-gray-400 hover:text-white transition-colors text-sm"
            >
              Regenerate
            </button>
          </>
        )}
      </div>
    </div>
  )
}