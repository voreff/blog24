export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://stacknest.site/blogpost/api"

// API endpoints - all handled by PHP backend
export const apiEndpoints = {
  posts: `${API_BASE_URL}/api.php?action=posts`,
  login: `${API_BASE_URL}/api.php?action=login`,
  register: `${API_BASE_URL}/api.php?action=register`,
  verifyEmail: `${API_BASE_URL}/api.php?action=verify-email`,
  like: `${API_BASE_URL}/api.php?action=like`,
  comments: `${API_BASE_URL}/api.php?action=comments`,
  chatUsers: `${API_BASE_URL}/api.php?action=chat-users`,
  chatMessages: `${API_BASE_URL}/api.php?action=chat-messages`,
  sendMessage: `${API_BASE_URL}/api.php?action=send-message`,
  heartbeat: `${API_BASE_URL}/realtime.php?action=heartbeat`,
  onlineStatus: `${API_BASE_URL}/realtime.php?action=online-status`,
  newMessages: `${API_BASE_URL}/realtime.php?action=new-messages`,
  realtimeSSE: `${API_BASE_URL}/realtime.php?action=sse`,
  profile: `${API_BASE_URL}/api.php?action=profile`,
  newsletterSubscribe: `${API_BASE_URL}/api.php?action=newsletter-subscribe`,
  passwordResetRequest: `${API_BASE_URL}/api.php?action=request-password-reset`,
  passwordResetVerify: `${API_BASE_URL}/api.php?action=verify-password-reset`,
  passwordResetConfirm: `${API_BASE_URL}/api.php?action=confirm-password-reset`,
  captcha: `${API_BASE_URL}/captcha.php`,
  uploads: `${API_BASE_URL}/uploads`,
  adminPanel: `${API_BASE_URL}/panel.php`,
  contact: `${API_BASE_URL}/api.php?action=contact`,
}

export const apiCall = async (url: string, options?: RequestInit, timeout: number = 10000) => {
  try {
    console.log("API Call:", { url, method: options?.method || 'GET' })

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Enable cookies/session for CORS
      signal: controller.signal, // Add abort signal for timeout

      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    clearTimeout(timeoutId)
    console.log("API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Response data:", data)
    return data
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("API call timed out:", error)
      throw new Error("Request timeout")
    }
    console.error("API call failed:", error)
    throw error
  }
}
