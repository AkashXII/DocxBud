import { useState, useRef, useEffect } from "react"
import { api } from "../api"

export default function Chat({ sessionId, documentId, filename, onFlashcards, onQuiz, onSummary,onBack }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `I've read **${filename}**. Ask me anything about it!`
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  useEffect(() => {
  const loadHistory = async () => {
    if (!documentId) return
    try {
      const data = await api.get(`/messages/${documentId}`)
      if (data.messages.length > 0) {
        const formatted = data.messages.map(m => ({
          role: m.role,
          text: m.content
        }))
        setMessages(formatted)
      }
    } catch (err) {
      console.error("Failed to load history:", err)
    }
  }
  loadHistory()
}, [documentId])
  const sendMessage = async () => {
    const query = input.trim()
    if (!query || loading) return

    setMessages(prev => [...prev, { role: "user", text: query }])
    setInput("")
    setLoading(true)

    try {
      const data = await api.post("/ask", {
        session_id: sessionId,
        query,
        document_id: documentId
      })
      setMessages(prev => [...prev, { role: "assistant", text: data.answer }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "⚠️ Sorry, something went wrong. Try again.",
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">

{/* Header */}
<div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
  <button onClick={onBack}
    className="text-gray-400 hover:text-white text-sm transition-colors mr-2">
    ← Back
  </button>
  <span className="text-2xl">📚</span>
  <div>
    <h1 className="font-bold text-indigo-400">StudyBuddy</h1>
    <p className="text-xs text-gray-500 truncate max-w-xs">{filename}</p>
  </div>
  <div className="ml-auto flex items-center gap-3">
    <button onClick={onSummary}
      className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700
        hover:border-indigo-500 rounded-lg transition-colors">
      📋 Summary
    </button>
    <button onClick={onFlashcards}
      className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700
        hover:border-indigo-500 rounded-lg transition-colors">
      🃏 Flashcards
    </button>
    <button onClick={onQuiz}
      className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700
        hover:border-indigo-500 rounded-lg transition-colors">
      📝 Quiz
    </button>
    <span className="text-xs text-green-400 bg-green-950 border border-green-800 px-2 py-1 rounded-full">
      ● Ready
    </span>
  </div>
</div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : msg.error
                  ? "bg-red-950 border border-red-800 text-red-300 rounded-bl-sm"
                  : "bg-gray-800 text-gray-100 rounded-bl-sm"
              }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-4">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask something about your notes..."
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm
              resize-none focus:outline-none focus:border-indigo-500 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
              disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}