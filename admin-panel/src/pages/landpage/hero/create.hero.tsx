import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { contentService } from '@/features/content/services/contentService'

type HeaderForm = {
  imageFile: File | null
  heading: string
  description: string
}

const emptyForm: HeaderForm = {
  imageFile: null,
  heading: '',
  description: '',
}

function normalizeError(err: unknown, fallback: string): string {
  const maybeError = err as {
    message?: string
    response?: { status?: number; data?: { message?: string } }
  }

  const status = maybeError.response?.status
  if (status === 400) return maybeError.response?.data?.message || 'Please check the form fields and try again'
  if (status === 401) return 'Your session expired. Please login again'
  if (status === 403) return 'Only superadmin can perform this action'
  if (!status && maybeError.message) return 'Network error or CORS issue. Please check backend URL and CORS config'
  return maybeError.message || fallback
}

export default function CreateHeroPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<HeaderForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSave = async (event: FormEvent) => {
    event.preventDefault()

    if (!form.imageFile) {
      setError('Please upload an image file before saving')
      return
    }

    try {
      setSaving(true)
      await contentService.createHeaderSidebar({
        heading: form.heading,
        description: form.description,
        image: form.imageFile,
      })
      navigate('/content/header-slider/list')
    } catch (err) {
      setError(normalizeError(err, 'Failed to create header slider'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Create Header Slider</h2>
        <button
          onClick={() => navigate('/content/header-slider/list')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Back To List
        </button>
      </div>

      {error ? <p className="mb-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <form onSubmit={onSave} className="w-full max-w-2xl space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Heading
          <input
            required
            value={form.heading}
            onChange={(event) => setForm((prev) => ({ ...prev, heading: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Image File
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={(event) => setForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] ?? null }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {form.imageFile ? <p className="mt-1 text-xs text-slate-500">Selected: {form.imageFile.name}</p> : null}
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/content/header-slider/list')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </section>
  )
}
