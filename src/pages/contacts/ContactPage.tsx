import { useState } from 'react'
import type { FormEvent } from 'react'
import { leadService } from '@/features/leads/services/leadService'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus(null)

    try {
      await leadService.register({ ...form, status: 'new' })
      setStatus('Thanks! Your lead was submitted successfully.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to submit lead')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="ui-page-card">
      <h2 className="ui-title">Contact</h2>
      <p className="ui-subtitle">Register your interest and our team will reach out.</p>

      <form onSubmit={onSubmit} className="ui-form-grid md:grid-cols-2">
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

        <label className="ui-label md:col-span-2">
          Phone
          <input
            required
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="ui-input"
          />
        </label>

        <label className="ui-label md:col-span-2">
          Message
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            className="ui-textarea"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ui-btn-primary"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Lead'}
          </button>
        </div>
      </form>

      {status ? <p className="ui-status-info mt-4">{status}</p> : null}
    </section>
  )
}
