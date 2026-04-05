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

export default function ContactPage() {
  const [contacts, setContacts] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('new')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })

  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Lead | null>(null)
  const [viewTarget, setViewTarget] = useState<Lead | null>(null)
  const [form, setForm] = useState<LeadFormPayload>(emptyForm)

  const modalTitle = useMemo(() => (editTarget ? 'Update Contact Status' : 'Create Contact'), [editTarget])

  const loadContacts = async () => {
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
      setContacts(response.records)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [page, limit, search, status, sortBy, sortOrder, refreshTick])

  const openEdit = (contact: Lead) => {
    setEditTarget(contact)
    setForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      status: contact.status,
      notes: contact.notes || '',
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
    try {
      if (editTarget) {
        await leadService.update(editTarget._id, form)
      } else {
        await leadService.create(form)
      }
      closeEditor()
      setRefreshTick((prev) => prev + 1)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact')
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading contacts...</div>
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Contact Submissions</h2>
        <p className="mt-2 text-sm text-slate-600">Manage incoming contact submissions from your portfolio website.</p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
          <label className="flex-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Search</span>
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search contacts"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>

          <label className="w-full sm:w-40">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="w-full sm:w-40">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Sort By</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="updatedAt">Date Updated</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="status">Status</option>
            </select>
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              onClick={() => setRefreshTick((prev) => prev + 1)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {contacts.length === 0 ? (
          <p className="mt-6 text-slate-600">No contact submissions found.</p>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {contacts.map((contact) => (
                <article key={contact._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{contact.name}</p>
                      <p className="text-sm text-slate-600">{contact.email} | {contact.phone}</p>
                      <p className="mt-1 text-xs text-slate-500">Status: <span className="font-medium">{contact.status}</span></p>
                      <p className="mt-1 text-xs text-slate-500">Submitted: {new Date(contact.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewTarget(contact)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEdit(contact)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <p className="text-slate-600">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= pagination.pages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Modal */}
      {viewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-slate-900">Contact Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-600"><span className="font-medium">Name:</span> {viewTarget.name}</p>
              <p className="text-slate-600"><span className="font-medium">Email:</span> {viewTarget.email}</p>
              <p className="text-slate-600"><span className="font-medium">Phone:</span> {viewTarget.phone}</p>
              <p className="text-slate-600"><span className="font-medium">Message:</span> {viewTarget.message}</p>
              <p className="text-slate-600"><span className="font-medium">Status:</span> {viewTarget.status}</p>
              <p className="text-slate-600"><span className="font-medium">Notes:</span> {viewTarget.notes || 'None'}</p>
              <p className="text-xs text-slate-500"><span className="font-medium">Created:</span> {new Date(viewTarget.createdAt).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setViewTarget(null)}
              className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeEditor}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-slate-900">{modalTitle}</h3>
            <form onSubmit={onSave} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as LeadStatus }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Message</span>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Notes (Internal)</span>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
