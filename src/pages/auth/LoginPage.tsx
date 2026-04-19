import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '@/features/auth/context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || 'Invalid credentials or session issue.')
      } else {
        setError('Invalid credentials or session issue.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="ui-page-card-narrow max-w-md">
      <h2 className="ui-title">Superadmin Sign In</h2>
      <p className="ui-subtitle">Superadmin portal access. JWT stays in secure cookies, never in storage.</p>
      <form onSubmit={handleSubmit} className="ui-form-grid">
        <label className="ui-label block">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="ui-input"
            required
          />
        </label>
        <label className="ui-label block">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ui-input"
            required
          />
        </label>
        {error ? <p className="ui-status-error">{error}</p> : null}
        <button
          disabled={isLoading}
          className="ui-btn-primary w-full"
          type="submit"
        >
          {isLoading ? 'Signing in...' : 'Superadmin Sign In'}
        </button>
      </form>
    </section>
  )
}
