import { useState, useEffect } from "react"
import { api } from "../api"

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load fonts
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    setTimeout(() => setMounted(true), 50)
  }, [])

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
    <div style={{
      minHeight: "100vh",
      background: "#04040f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Gradient orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,57,255,0.15) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Grain overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px"
      }} />

      <div style={{
        width: "100%", maxWidth: "420px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "2rem",
            fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em"
          }}>DocXBud</h1>
          <p style={{ color: "#4a4a6a", fontSize: "0.9rem", marginTop: "0.4rem" }}>
            AI-Powered Study Assistant
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px", padding: "2rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)"
        }}>
          {/* Toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.05)",
            borderRadius: "12px", padding: "4px", marginBottom: "1.75rem"
          }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null) }}
                style={{
                  flex: 1, padding: "0.6rem", borderRadius: "9px", border: "none",
                  cursor: "pointer", fontSize: "0.85rem", fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s ease",
                  background: mode === m ? "linear-gradient(135deg, #6339ff, #00d4ff)" : "transparent",
                  color: mode === m ? "#fff" : "#4a4a6a",
                  boxShadow: mode === m ? "0 4px 16px rgba(99,57,255,0.3)" : "none"
                }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {["email", "password"].map((field) => (
              <div key={field}>
                <label style={{
                  display: "block", fontSize: "0.75rem", fontWeight: 500,
                  color: "#4a4a6a", marginBottom: "0.4rem", textTransform: "uppercase",
                  letterSpacing: "0.08em"
                }}>{field}</label>
                <input
                  type={field}
                  value={field === "email" ? email : password}
                  onChange={(e) => field === "email" ? setEmail(e.target.value) : setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={field === "email" ? "you@example.com" : "••••••••"}
                  style={{
                    width: "100%", padding: "0.75rem 1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px", color: "#fff",
                    fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif",
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(99,57,255,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: "1rem", padding: "0.75rem 1rem",
              background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.2)",
              borderRadius: "10px", color: "#ff6b6b", fontSize: "0.85rem"
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={!email || !password || loading}
            style={{
              width: "100%", marginTop: "1.5rem", padding: "0.85rem",
              background: "linear-gradient(135deg, #6339ff, #00d4ff)",
              border: "none", borderRadius: "12px", color: "#fff",
              fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 32px rgba(99,57,255,0.35)",
              opacity: (!email || !password || loading) ? 0.5 : 1,
              transition: "all 0.2s ease",
              letterSpacing: "0.01em"
            }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = "translateY(-1px)" }}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  )
}