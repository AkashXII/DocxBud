import { useState, useEffect } from "react"
import PixelBlast from "./components/PixelBlast"
import Auth from "./components/Auth"
import Dashboard from "./components/Dashboard"
import Upload from "./components/Upload"
import Chat from "./components/Chat"
import Flashcards from "./components/Flashcards"
import Quiz from "./components/Quiz"
import Summary from "./components/Summary"

export default function App() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [view, setView] = useState("auth")
  const [bgReady, setBgReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const email = localStorage.getItem("email")
    if (token && email) {
      setUser({ email })
      setView("dashboard")
    }
    // Give PixelBlast 800ms to initialize before showing UI
    const timer = setTimeout(() => setBgReady(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (email) => {
    setUser({ email })
    setView("dashboard")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("email")
    setUser(null)
    setSession(null)
    setView("auth")
  }

  const handleUploadSuccess = (data) => {
    setSession({
      sessionId: data.session_id,
      documentId: data.document_id,
      filename: data.filename
    })
    setView("chat")
  }

  const handleResumeDoc = (doc) => {
    setSession({
      sessionId: doc.session_id,
      documentId: doc._id,
      filename: doc.filename
    })
    setView("chat")
  }

  const renderView = () => {
    if (view === "auth") return <Auth onLogin={handleLogin} />

    if (view === "dashboard") return (
      <Dashboard
        email={user?.email}
        onResumeDoc={handleResumeDoc}
        onLogout={handleLogout}
      />
    )

    if (view === "upload") return (
      <Upload
        onUploadSuccess={handleUploadSuccess}
        onBack={() => setView("dashboard")}
      />
    )

    if (view === "flashcards" && session)
      return <Flashcards sessionId={session.sessionId} onBack={() => setView("chat")} />

    if (view === "quiz" && session)
      return <Quiz sessionId={session.sessionId} onBack={() => setView("chat")} />

    if (view === "summary" && session)
      return <Summary sessionId={session.sessionId} onBack={() => setView("chat")} />

    if (view === "chat" && session)
      return (
        <Chat
          sessionId={session.sessionId}
          documentId={session.documentId}
          filename={session.filename}
          onFlashcards={() => setView("flashcards")}
          onQuiz={() => setView("quiz")}
          onSummary={() => setView("summary")}
          onBack={() => setView("dashboard")}
        />
      )

    return <Auth onLogin={handleLogin} />
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", background: "#04040f" }}>

      {/* Persistent PixelBlast background — never unmounts */}
      <div style={{
  position: "fixed",
  top: 0, left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 0
}}>
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#6339ff"
          patternDensity={0.8}
          speed={0.3}
          edgeFade={0.6}
        />
      </div>

      {/* Dark overlay to tone down pixel blast */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "rgba(4, 4, 15, 0.75)",
        pointerEvents: "none"
      }} />

      {/* Page content — fades in after PixelBlast initializes */}
      <div style={{
        position: "relative", zIndex: 2,
        opacity: bgReady ? 1 : 0,
        transition: "opacity 0.4s ease"
      }}>
        {renderView()}
      </div>

    </div>
  )
}