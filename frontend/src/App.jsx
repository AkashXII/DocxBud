import { useState, useCallback } from "react"

export default function App() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null) //new

  const handleFile = (selectedFile) => {
    if (!selectedFile?.name.endsWith(".pdf")) {
      setError("Please upload a PDF file")
      return
    }
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Upload failed")
      setResult(data)
      setSessionId(data.session_id) //new
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-2">DocXBud</h1>
      <p className="text-gray-400 mb-8">Upload your lecture notes to get started</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        className={`w-full max-w-lg border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${dragging ? "border-indigo-400 bg-indigo-950" : "border-gray-600 hover:border-indigo-500 bg-gray-900"}`}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          id="fileInput"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <div className="text-5xl mb-4">📄</div>
          {file ? (
            <p className="text-green-400 font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-gray-300 font-medium">Drag & drop your PDF here</p>
              <p className="text-gray-500 text-sm mt-1">or click to browse</p>
            </>
          )}
        </label>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
          disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
      >
        {loading ? "Building knowledge base..." : "Upload & Parse"}
      </button>

      {error && (
        <div className="mt-4 text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-3 max-w-lg w-full">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full">
          <h2 className="text-lg font-semibold text-indigo-300 mb-3"> Knowledge Base Ready</h2>
          <div className="flex gap-6 mb-4 text-sm">
            <div>
              <p className="text-gray-500">Pages</p>
              <p className="text-white font-bold text-xl">{result.page_count}</p>
            </div>
            <div>
              <p className="text-gray-500">Words</p>
              <p className="text-white font-bold text-xl">{result.word_count}</p>
            </div>
            <div>
              <p className="text-gray-500">Chunks</p>
              <p className="text-white font-bold text-xl">{result.chunk_count}</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs font-mono">
            session: {sessionId}
          </p>
        </div>
      )}
    </div>
  )
}