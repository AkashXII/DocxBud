import { useState } from "react"
import { api } from "../api"
import PixelBlast from "../components/PixelBlast"
export default function Quiz({ sessionId, onBack }) {
  const [quiz, setQuiz] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([]) // { selected, correct, question }
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
    if (selected) return // already answered
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

    {/* PixelBlast background */}
    <div className="absolute inset-0 -z-10 pointer-events-none opacity-90">
      <PixelBlast
        variant="square"
        pixelSize={4}
        color="#4c1d95"
        patternDensity={0.75}
        speed={0.2}
        edgeFade={0.8}
      />
    </div>

    {/* Foreground UI */}
    <div className="relative z-10 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-indigo-400">Quiz </h1>
        </div>

        {/* Start screen */}
        {!started && (
          <div className="text-center py-16">
            
            <p className="text-gray-400 mb-6">
              Test your knowledge with AI-generated questions
            </p>

            <button
              onClick={generateQuiz}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg font-semibold transition-colors"
            >
              {loading ? "Generating quiz..." : "Start Quiz"}
            </button>

            {error && <p className="text-red-400 mt-4">⚠️ {error}</p>}
          </div>
        )}

        {/* Quiz questions */}
        {started && !finished && quiz.length > 0 && (
          <div>

            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-400 text-sm">
                Question {current + 1} of {quiz.length}
              </span>

              <div className="flex gap-1">
                {quiz.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition-colors ${
                      i < current
                        ? "bg-indigo-500"
                        : i === current
                        ? "bg-indigo-400"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-xl p-6 mb-4">
              <p className="text-white font-medium leading-relaxed">
                {quiz[current].question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {Object.entries(quiz[current].options).map(([key, value]) => (
                <div
                  key={key}
                  onClick={() => handleSelect(key)}
                  className={`border rounded-xl px-5 py-4 flex items-center gap-4 transition-all ${optionStyles(
                    key
                  )}`}
                >
                  <span
                    className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center border ${
                      selected ? "border-current" : "border-gray-600"
                    }`}
                  >
                    {key}
                  </span>

                  <span className="text-sm">{value}</span>

                  {selected && key === quiz[current].answer && (
                    <span className="ml-auto text-green-400">✓</span>
                  )}

                  {selected &&
                    key === selected &&
                    key !== quiz[current].answer && (
                      <span className="ml-auto text-red-400">✗</span>
                    )}
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
            >
              {current + 1 >= quiz.length
                ? "Finish Quiz"
                : "Next Question →"}
            </button>
          </div>
        )}

        {/* Results */}
        {finished && (
          <div className="text-center">
            <div className="text-6xl mb-4">
              {score === quiz.length
                ? "🏆"
                : score >= quiz.length / 2
                ? "👍"
                : "📖"}
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {score} / {quiz.length}
            </h2>

            <p className="text-gray-400 mb-8">
              {score === quiz.length
                ? "Perfect score!"
                : score >= quiz.length / 2
                ? "Good job! Keep studying."
                : "Keep reviewing your notes."}
            </p>

            {/* Review */}
            <div className="text-left space-y-3 mb-8">
              {answers.map((a, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 ${
                    a.isCorrect
                      ? "border-green-800 bg-green-950"
                      : "border-red-800 bg-red-950"
                  }`}
                >
                  <p className="text-sm font-medium mb-2">{a.question}</p>

                  <div className="flex gap-4 text-xs">
                    <span
                      className={
                        a.isCorrect ? "text-green-400" : "text-red-400"
                      }
                    >
                      Your answer: {a.selected} —{" "}
                      {
                        quiz.find((q) => q.question === a.question)
                          ?.options[a.selected]
                      }
                    </span>

                    {!a.isCorrect && (
                      <span className="text-green-400">
                        Correct: {a.correct} —{" "}
                        {
                          quiz.find((q) => q.question === a.question)
                            ?.options[a.correct]
                        }
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRetry}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}