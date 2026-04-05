import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { leadAuthService } from '@/features/leads/services/leadAuthService'

export default function LeadRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await leadAuthService.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      navigate('/lead/profile', { replace: true })
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || 'Unable to register lead account right now.')
      } else {
        setError('Unable to register lead account right now.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="ui-page-card-narrow max-w-lg">
      <h2 className="ui-title">Lead Registration</h2>
      <p className="ui-subtitle">
        Create your lead account to log in and manage your profile details.
      </p>

      <form onSubmit={onSubmit} className="ui-form-grid">
        <label className="ui-label">
          Name
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="ui-input"
          />
        </label>

        <label className="ui-label">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="ui-input"
          />
        </label>

        <label className="ui-label">
          Phone
          <input
            required
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="ui-input"
          />
        </label>

        <label className="ui-label">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="ui-input"
          />
        </label>

        <label className="ui-label">
          Confirm Password
          <input
            type="password"
            required
            minLength={6}
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
            }
            className="ui-input"
          />
        </label>

        {error ? <p className="ui-status-error">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-btn-primary"
        >
          {isSubmitting ? 'Creating account...' : 'Create Lead Account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already registered?{' '}
        <Link className="ui-link-inline" to="/lead/login">
          Lead login
        </Link>
      </p>
    </section>
  )
}