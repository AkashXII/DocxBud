import { useState } from "react"
import { api } from "../api"

export default function Quiz({ sessionId, onBack }) {
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)

  const generateQuiz = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.post("/quiz", { session_id: sessionId })
      setQuiz(data.quiz)
      setStarted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (optionKey) => {
    if (selected) return
    setSelected(optionKey)
  }

  const handleNext = () => {
    const q = quiz[current]
    setAnswers(prev => [...prev, {
      question: q.question,
      selected,
      correct: q.answer,
      isCorrect: selected === q.answer
    }])
    if (current + 1 >= quiz.length) {
      setFinished(true)
    } else {
      setCurrent(prev => prev + 1)
      setSelected(null)
    }
  }

  const handleRetry = () => {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setFinished(false)
    setStarted(false)
    setQuiz([])
  }

  const score = answers.filter(a => a.isCorrect).length

  const optionStyles = (key) => {
    if (!selected) return "border-gray-700 hover:border-indigo-500 hover:bg-gray-800 cursor-pointer"
    if (key === quiz[current].answer) return "border-green-500 bg-green-950 text-green-300"
    if (key === selected && key !== quiz[current].answer) return "border-red-500 bg-red-950 text-red-300"
    return "border-gray-700 opacity-50"
  }

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
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
          }}>Quiz</h1>
          <div style={{ width: "80px" }} />
        </div>

        {/* Start screen */}
        {!started && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(99,57,255,0.4)",
            borderRadius: "20px", padding: "4rem 2rem",
            textAlign: "center"
          }}>
            <p style={{ color: "#4a4a6a", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Test your knowledge with AI-generated questions
            </p>
            <button onClick={generateQuiz} disabled={loading} style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #6339ff, #3b5b61)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 32px rgba(99,57,255,0.35)",
              opacity: loading ? 0.5 : 1, transition: "all 0.2s"
            }}>
              {loading ? "Generating..." : "Start Quiz"}
            </button>
            {error && <p style={{ color: "#ff6b6b", marginTop: "1rem", fontSize: "0.85rem" }}>{error}</p>}
          </div>
        )}

        {/* Quiz questions */}
        {started && !finished && quiz.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm">Question {current + 1} of {quiz.length}</span>
              <div className="flex gap-1">
                {quiz.map((_, i) => (
                  <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${
                    i < current ? "bg-indigo-500" : i === current ? "bg-indigo-400" : "bg-gray-700"
                  }`} />
                ))}
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl p-6 mb-4">
              <p className="text-white font-medium leading-relaxed">{quiz[current].question}</p>
            </div>

            <div className="space-y-3 mb-6">
              {Object.entries(quiz[current].options).map(([key, value]) => (
                <div key={key} onClick={() => handleSelect(key)}
                  className={`border rounded-xl px-5 py-4 flex items-center gap-4 transition-all ${optionStyles(key)}`}>
                  <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center border ${
                    selected ? "border-current" : "border-gray-600"
                  }`}>{key}</span>
                  <span className="text-sm">{value}</span>
                  {selected && key === quiz[current].answer && <span className="ml-auto text-green-400">✓</span>}
                  {selected && key === selected && key !== quiz[current].answer && <span className="ml-auto text-red-400">✗</span>}
                </div>
              ))}
            </div>

            <button onClick={handleNext} disabled={!selected} style={{
              width: "100%", padding: "0.75rem",
              background: selected ? "linear-gradient(135deg, #6339ff, #00d4ff)" : "rgba(255,255,255,0.05)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "0.95rem", fontWeight: 600, cursor: selected ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif", opacity: selected ? 1 : 0.4,
              transition: "all 0.2s"
            }}>
              {current + 1 >= quiz.length ? "Finish Quiz" : "Next Question →"}
            </button>
          </div>
        )}

        {/* Results */}
        {finished && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px", padding: "2.5rem 2rem",
            textAlign: "center"
          }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "3rem",
              fontWeight: 800, color: "#fff", margin: "0 0 0.5rem"
            }}>
              {score} <span style={{ color: "#4a4a6a", fontSize: "1.5rem" }}>/ {quiz.length}</span>
            </h2>
            <p style={{ color: "#4a4a6a", marginBottom: "2rem", fontSize: "0.95rem" }}>
              {score === quiz.length ? "Perfect score!" : score >= quiz.length / 2 ? "Good job! Keep studying." : "Keep reviewing your notes."}
            </p>

            <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              {answers.map((a, i) => (
                <div key={i} style={{
                  border: `1px solid ${a.isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  background: a.isCorrect ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                  borderRadius: "12px", padding: "1rem"
                }}>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#e0e0ff" }}>{a.question}</p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ color: a.isCorrect ? "#4ade80" : "#f87171" }}>
                      Your answer: {a.selected} — {quiz.find(q => q.question === a.question)?.options[a.selected]}
                    </span>
                    {!a.isCorrect && (
                      <span style={{ color: "#4ade80" }}>
                        Correct: {a.correct} — {quiz.find(q => q.question === a.question)?.options[a.correct]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleRetry} style={{
              width: "100%", padding: "0.75rem",
              background: "linear-gradient(135deg, #6339ff, #00d4ff)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 32px rgba(99,57,255,0.35)"
            }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}