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
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-indigo-400">Summary </h1>
        </div>

        {/* Start screen */}
        {!summary && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-400 mb-6">Get a clean structured summary of your document</p>
            <button
              onClick={generateSummary}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
                rounded-lg font-semibold transition-colors"
            >
              {loading ? "Summarizing..." : "Generate Summary"}
            </button>
            {error && <p className="text-red-400 mt-4">⚠️ {error}</p>}
          </div>
        )}

        {/* Summary content */}
        {summary && (
          <div className="space-y-6">

            {/* Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                 Overview
              </h2>
              <p className="text-gray-200 leading-relaxed">{summary.overview}</p>
            </div>

            {/* Topics Covered */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                 Topics Covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {summary.topics_covered?.map((topic, i) => (
                  <span key={i}
                    className="px-3 py-1 bg-indigo-950 border border-indigo-800 rounded-full text-sm text-indigo-300">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Concepts */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                 Key Concepts
              </h2>
              <ul className="space-y-2">
                {summary.key_concepts?.map((concept, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-indigo-400 mt-0.5">▸</span>
                    {concept}
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                 Important Details
              </h2>
              <ul className="space-y-2">
                {summary.important_details?.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSummary(null)}
              className="w-full py-3 border border-gray-700 hover:border-indigo-500
                rounded-lg text-gray-400 hover:text-white transition-colors text-sm"
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}