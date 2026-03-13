import { useState, useEffect,useRef} from "react"
import { api } from "../api"
import PixelBlast from "../components/PixelBlast"
import { Button } from "../components/moving-border"
export default function Dashboard({ email, onNewUpload, onResumeDoc, onLogout }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef(null)
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
    setTimeout(() => setMounted(true), 50)

    const fetchDocs = async () => {
      try {
        const data = await api.get("/documents")
        setDocuments(data.documents)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  return (
    <div style={{
  minHeight: "100vh",
  fontFamily: "'DM Sans', sans-serif",
  position: "relative",
  overflow: "hidden",
  background: "#04040f"
}}>
  
  {/* PixelBlast Background */}
  <div style={{
    position: "absolute",
    inset: 0,
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
      {/* Orbs */}
      <div style={{
        position: "fixed", top: "-30%", right: "-15%",
        width: "700px", height: "700px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,57,255,0.1) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", left: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Navbar */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "1.25rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(20px)",
        background: "rgba(4,4,15,0.8)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>

          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: "1.1rem", color: "#fff"
          }}>DocXBud</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ color: "#4a4a6a", fontSize: "0.85rem" }}>{email}</span>
          <button onClick={onLogout} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "0.4rem 1rem",
            color: "#6a6a8a", fontSize: "0.8rem", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "rgba(255,255,255,0.2)" }}
            onMouseLeave={e => { e.target.style.color = "#6a6a8a"; e.target.style.borderColor = "rgba(255,255,255,0.08)" }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Hero text */}
        <div style={{
          marginBottom: "2.5rem",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "2.2rem",
            fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em"
          }}>
            Your Library
          </h2>
          <p style={{ color: "#4a4a6a", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            {documents.length > 0
              ? `${documents.length} document${documents.length > 1 ? "s" : ""} ready to study`
              : "Upload your first document to get started"}
          </p>
        </div>

        {/* Upload button */}
<div style={{ marginBottom: "2rem", display: "flex", justifyContent: "center" }}>
  <Button
    duration={3500}
    borderRadius="1.25rem"
    onClick={handleUploadClick}
    borderClassName="bg-[radial-gradient(#6339ff_40%,transparent_60%)]"
  >
    Upload Document
  </Button>

  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf"
    hidden
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (file) {
        onNewUpload(file)
      }
    }}
  />
</div>
        {/* Documents */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem", color: "#4a4a6a" }}>
            Loading your documents...
          </div>
        )}

        {!loading && documents.length === 0 && (
          <div style={{
            textAlign: "center", padding: "4rem",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "20px", color: "#4a4a6a"
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 1rem",
              background: "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4a4a6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="#4a4a6a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>No documents yet</p>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", opacity: 0.6 }}>Upload a PDF to begin studying</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {documents.map((doc, i) => (
            <div key={doc._id} onClick={() => onResumeDoc(doc)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px", padding: "1.25rem 1.5rem",
                cursor: "pointer", transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: "1rem",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${i * 0.05}s`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(99,57,255,0.08)"
                e.currentTarget.style.borderColor = "rgba(99,57,255,0.25)"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* File icon */}
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
                background: "linear-gradient(135deg, rgba(99,57,255,0.2), rgba(0,212,255,0.1))",
                border: "1px solid rgba(99,57,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#8b6fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" stroke="#8b6fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, color: "#e0e0ff", fontWeight: 500,
                  fontSize: "0.95rem", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis"
                }}>{doc.filename}</p>
                <p style={{ margin: "0.25rem 0 0", color: "#4a4a6a", fontSize: "0.78rem" }}>
                  {doc.page_count} pages · {doc.word_count?.toLocaleString()} words · {doc.chunk_count} chunks
                </p>
              </div>

              {/* Arrow */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                <path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}