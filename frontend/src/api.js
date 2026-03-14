const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const getToken = () => localStorage.getItem("token")

export const api = {
  post: async (path, body, requiresAuth = true) => {
    const headers = { "Content-Type": "application/json" }
    if (requiresAuth) headers["Authorization"] = `Bearer ${getToken()}`
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "Request failed")
    return data
  },

  postForm: async (path, formData) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${getToken()}` },
      body: formData
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "Upload failed")
    return data
  },

  get: async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Authorization": `Bearer ${getToken()}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || "Request failed")
    return data
  }
}