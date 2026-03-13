import { useState, useEffect } from "react"
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

  useEffect(() => {
    const token = localStorage.getItem("token")
    const email = localStorage.getItem("email")
    if (token && email) {
      setUser({ email })
      setView("dashboard")
    }
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

  if (view === "auth") return <Auth onLogin={handleLogin} />

  if (view === "dashboard") return (
    <Dashboard
      email={user?.email}
      onNewUpload={() => setView("upload")}
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