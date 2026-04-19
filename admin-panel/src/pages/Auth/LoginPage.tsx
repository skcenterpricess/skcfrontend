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
    if (isLoading) return

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    if (!normalizedEmail || !normalizedPassword) {
      setError('Email and password are required.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await login({ email: normalizedEmail, password: normalizedPassword })
      setEmail(normalizedEmail)
      setPassword('')
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
    <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900">Admin Sign In</h2>
      <p className="mt-2 text-sm text-slate-600">JWT stays in secure cookies, never in storage.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            autoComplete="email"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            autoComplete="current-password"
            required
          />
        </label>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          disabled={isLoading}
          className="w-full rounded-lg bg-admin-700 bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          type="submit"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </section>
  )
}
