import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { leadAuthService } from '@/features/leads/services/leadAuthService'

interface LeadProfileState {
  id: string
  name: string
  email: string
  phone: string
  role: 'lead'
}

export default function LeadProfilePage() {
  const [profile, setProfile] = useState<LeadProfileState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  const loadProfile = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const user = await leadAuthService.me()
      setProfile(user)
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: '',
      })
      setIsUnauthorized(false)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setIsUnauthorized(true)
      } else {
        setError('Unable to load lead profile right now.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSaving) return

    setError('')
    setSuccess('')

    const payload: {
      name?: string
      email?: string
      phone?: string
      password?: string
    } = {}

    const normalizedName = form.name.trim()
    const normalizedEmail = form.email.trim().toLowerCase()
    const normalizedPhone = form.phone.trim()
    const normalizedPassword = form.password.trim()

    if (!normalizedName || !normalizedEmail || !normalizedPhone) {
      setError('Name, email, and phone are required.')
      return
    }

    payload.name = normalizedName
    payload.email = normalizedEmail
    payload.phone = normalizedPhone
    if (normalizedPassword) payload.password = normalizedPassword

    setIsSaving(true)

    try {
      const updated = await leadAuthService.updateProfile(payload)
      setProfile(updated)
      setForm((prev) => ({ ...prev, password: '' }))
      setSuccess('Profile updated successfully.')
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        if (err.response?.status === 401) {
          setIsUnauthorized(true)
          setError('Your lead session has expired. Please log in again.')
        } else {
          setError(err.response?.data?.message || 'Unable to update profile right now.')
        }
      } else {
        setError('Unable to update profile right now.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const onLogout = async () => {
    await leadAuthService.logout()
    setIsUnauthorized(true)
    setProfile(null)
    setSuccess('')
  }

  if (isLoading) {
    return <section className="ui-page-card">Loading profile...</section>
  }

  if (isUnauthorized) {
    return (
      <section className="ui-page-card-narrow">
        <h2 className="ui-title">Lead Profile</h2>
        <p className="ui-subtitle">
          You are not logged in as a lead. Please sign in to view and update your profile.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="ui-btn-primary" to="/lead/login">
            Go to Lead Login
          </Link>
          <Link className="ui-btn-secondary" to="/lead/register">
            Register as Lead
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="ui-page-card-narrow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="ui-title">Lead Profile</h2>
          <p className="mt-1 text-sm text-surface-700">Logged in as {profile?.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="ui-btn-secondary"
        >
          Lead Logout
        </button>
      </div>

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
          New Password (optional)
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="ui-input"
          />
        </label>

        {error ? <p className="ui-status-error">{error}</p> : null}
        {success ? <p className="ui-status-success">{success}</p> : null}

        <button
          type="submit"
          disabled={isSaving}
          className="ui-btn-primary"
        >
          {isSaving ? 'Saving changes...' : 'Update Profile'}
        </button>
      </form>
    </section>
  )
}