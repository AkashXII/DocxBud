import { useState } from "react"
import { api } from "../api"

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login") // "login" | "register"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)

    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register"
      const data = await api.post(path, { email, password }, false)
      localStorage.setItem("token", data.token)
      localStorage.setItem("email", data.email)
      onLogin(data.email)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-2">StudyBuddy 📚</h1>
      <p className="text-gray-400 mb-8">Your AI-powered study assistant</p>

      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-8">
        {/* Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => { setMode("login"); setError(null) }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors
              ${mode === "login" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode("register"); setError(null) }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors
              ${mode === "register" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Register
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm
                focus:outline-none focus:border-indigo-500 placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm
                focus:outline-none focus:border-indigo-500 placeholder-gray-600"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
            disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  )
}