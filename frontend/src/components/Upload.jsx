import { useState, useCallback } from "react"
import { api } from "../api"

export default function Upload({ onUploadSuccess, onBack }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (selectedFile) => {
    if (!selectedFile?.name.endsWith(".pdf")) {
      setError("Please upload a PDF file")
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const data = await api.postForm("/upload", formData)
      onUploadSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button onClick={onBack}
          className="text-gray-400 hover:text-white text-sm transition-colors">
          ← Back
        </button>
      </div>

      <h1 className="text-4xl font-bold text-indigo-400 mb-2">StudyBuddy 📚</h1>
      <p className="text-gray-400 mb-8">Upload your lecture notes to get started</p>

      {/* Drop Zone */}
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

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
          disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
      >
        {loading ? "Building knowledge base..." : "Upload & Parse"}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-3 max-w-lg w-full">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}