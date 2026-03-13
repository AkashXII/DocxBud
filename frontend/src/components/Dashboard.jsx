import { useState, useEffect } from "react"
import { api } from "../api"

export default function Dashboard({ email, onNewUpload, onResumeDoc, onLogout }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await api.get("/documents")
        setDocuments(data.documents)
      } catch (err) {
        console.error("Failed to fetch documents:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">StudyBuddy 📚</h1>
            <p className="text-gray-500 text-sm mt-1">{email}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {/* New upload button */}
        <button
          onClick={onNewUpload}
          className="w-full py-4 border-2 border-dashed border-indigo-800 hover:border-indigo-500
            rounded-xl text-indigo-400 hover:text-indigo-300 transition-colors mb-6 font-medium"
        >
          + Upload New Document
        </button>

        {/* Document list */}
        <h2 className="text-gray-400 text-sm font-medium mb-3">Your Documents</h2>

        {loading && (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        )}

        {!loading && documents.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <div className="text-4xl mb-3">📄</div>
            <p>No documents yet — upload your first PDF!</p>
          </div>
        )}

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              onClick={() => onResumeDoc(doc)}
              className="bg-gray-900 border border-gray-800 hover:border-indigo-700
                rounded-xl p-5 cursor-pointer transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                    📄 {doc.filename}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{doc.page_count} pages</span>
                    <span>{doc.word_count?.toLocaleString()} words</span>
                    <span>{doc.chunk_count} chunks</span>
                  </div>
                </div>
                <span className="text-gray-600 group-hover:text-indigo-400 transition-colors text-lg">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}