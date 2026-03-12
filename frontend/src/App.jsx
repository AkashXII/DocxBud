import { useState } from "react"
import Upload from "./components/Upload"
import Chat from "./components/Chat"
import Flashcards from "./components/Flashcards"

export default function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState("upload") // "upload" | "chat" | "flashcards"

  const handleUploadSuccess = (data) => {
    setSession({ sessionId: data.session_id, filename: data.filename })
    setView("chat")
  }

  if (view === "flashcards" && session) {
    return <Flashcards sessionId={session.sessionId} onBack={() => setView("chat")} />
  }

  if (view === "chat" && session) {
    return (
      <Chat
        sessionId={session.sessionId}
        filename={session.filename}
        onFlashcards={() => setView("flashcards")}
      />
    )
  }

  return <Upload onUploadSuccess={handleUploadSuccess} />
}