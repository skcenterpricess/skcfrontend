import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Lead, LeadFormPayload, LeadStatus } from '@/shared/types/lead'
import { leadService } from '@/features/leads/services/leadService'

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'closed']

const emptyForm: LeadFormPayload = {
  name: '',
  email: '',
  phone: '',
  message: '',
  status: 'new',
  notes: '',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })

  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Lead | null>(null)
  const [viewTarget, setViewTarget] = useState<Lead | null>(null)
  const [form, setForm] = useState<LeadFormPayload>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  const modalTitle = useMemo(() => (editTarget ? 'Edit Lead' : 'Create Lead'), [editTarget])

  const loadLeads = async () => {
    try {
      setLoading(true)
      const response = await leadService.list({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        refresh: refreshTick > 0,
      })
      setLeads(response.records)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [page, limit, search, status, sortBy, sortOrder, refreshTick])

  const openCreate = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setEditorOpen(true)
  }

  const openEdit = (lead: Lead) => {
    setEditTarget(lead)
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      status: lead.status,
      notes: lead.notes || '',
    })
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
  }

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    if (isSaving) return

    const payload: LeadFormPayload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      message: form.message.trim(),
      status: form.status,
      notes: form.notes?.trim() || '',
    }

    if (!payload.name || !payload.email || !payload.phone || !payload.message) {
      setError('Name, email, phone, and message are required.')
      return
    }

    try {
      setIsSaving(true)
      if (editTarget) {
        await leadService.update(editTarget._id, payload)
      } else {
        await leadService.create(payload)
      }
      closeEditor()
      setRefreshTick((prev) => prev + 1)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lead')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading leads...</div>
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Lead List</h2>
          <p className="mt-2 text-sm text-slate-600">Create, edit, and view incoming portfolio leads.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
        >
          Create
        </button>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-3 lg:grid-cols-6">
        <input
          placeholder="Search leads"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="createdAt">Created At</option>
          <option value="updatedAt">Updated At</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="status">Status</option>
        </select>

        <select
          value={sortOrder}
          onChange={(event) => {
            setSortOrder(event.target.value as 'asc' | 'desc')
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <select
          value={String(limit)}
          onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="5">5 / page</option>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>

        <button
          onClick={() => setRefreshTick((prev) => prev + 1)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
        >
          Refresh
        </button>
      </div>

      {error && <p className="mt-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {leads.length === 0 ? (
        <p className="mt-6 text-slate-600">No leads found.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {leads.map((lead) => (
            <article key={lead._id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{lead.name}</p>
                  <p className="text-sm text-slate-600">{lead.email} | {lead.phone}</p>
                  <p className="mt-1 text-xs text-slate-500">Status: {lead.status}</p>
                  <p className="mt-1 text-xs text-slate-500">Updated: {new Date(lead.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewTarget(lead)}
                    className="rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEdit(lead)}
                    className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
        <p>
          Page {pagination.page} of {pagination.pages} | Total {pagination.total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={pagination.page <= 1}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
            disabled={pagination.page >= pagination.pages}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onSave} className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900">{modalTitle}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Phone
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as LeadStatus }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Message
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Notes
              <textarea
                rows={3}
                value={form.notes || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {viewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl space-y-3 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900">Lead Details</h3>
            <p className="text-sm text-slate-600"><span className="font-medium">Name:</span> {viewTarget.name}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Email:</span> {viewTarget.email}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Phone:</span> {viewTarget.phone}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Status:</span> {viewTarget.status}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Message:</span> {viewTarget.message}</p>
            <p className="text-sm text-slate-600"><span className="font-medium">Notes:</span> {viewTarget.notes || '-'}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setViewTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
