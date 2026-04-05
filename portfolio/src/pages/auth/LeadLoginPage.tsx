import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { leadAuthService } from '@/features/leads/services/leadAuthService'

export default function LeadLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await leadAuthService.login({ email, password })
      navigate('/lead/profile', { replace: true })
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || 'Invalid lead credentials.')
      } else {
        setError('Invalid lead credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="ui-page-card-narrow max-w-md">
      <h2 className="ui-title">Lead Login</h2>
      <p className="ui-subtitle">Sign in to access and update your lead profile.</p>

      <form onSubmit={onSubmit} className="ui-form-grid">
        <label className="ui-label">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="ui-input"
          />
        </label>

        <label className="ui-label">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ui-input"
          />
        </label>

        {error ? <p className="ui-status-error">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-btn-primary"
        >
          {isSubmitting ? 'Signing in...' : 'Lead Sign In'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Need an account?{' '}
        <Link className="ui-link-inline" to="/lead/register">
          Register as lead
        </Link>
      </p>
    </section>
  )
}