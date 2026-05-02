import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined
    const requestUrl = String(error?.config?.url || '')
    const isLoginRequest = requestUrl.includes('/auth/login')
    const isSessionRequest = requestUrl.includes('/auth/me') || requestUrl.includes('/auth/refresh')

    if ((status === 401 || status === 403) && (!isLoginRequest || isSessionRequest)) {
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            status,
            url: requestUrl,
          },
        }),
      )
    }

    return Promise.reject(error)
  },
)
