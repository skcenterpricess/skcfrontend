import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { userManagementService } from '@/features/users/services/userManagementService'
import { useAuth } from '@/features/auth/context/AuthContext'
import type { ManagedUser } from '@/shared/types/userManagement'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'true' | 'false'>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as const,
    isActive: true,
  })

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const result = await userManagementService.list({
        page,
        limit,
        search: search || undefined,
        isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'true',
        sortBy,
        sortOrder,
        refresh: refreshTick > 0,
      })
      setUsers(result.records)
      setPagination(result.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [page, limit, search, isActiveFilter, sortBy, sortOrder, refreshTick])

  const onCreateUser = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const created = await userManagementService.create(form)
      setUsers((prev) => [created, ...prev])
      setForm({ name: '', email: '', password: '', role: 'admin', isActive: true })
      setRefreshTick((prev) => prev + 1)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const toggleUserStatus = async (record: ManagedUser) => {
    try {
      const updated = await userManagementService.update(record.id, { isActive: !record.isActive })
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setRefreshTick((prev) => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const normalizeRole = (value: string | undefined) =>
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '')

  const isSuperadminRole = (value: string | undefined) => {
    const normalized = normalizeRole(value)
    return normalized === 'superadmin' || normalized === 'superadim'
  }

  const canOnboard = isSuperadminRole(user?.role)

  return (
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">Users Management</h2>
        <p className="mt-2 text-slate-600">Superadmin can onboard admin users for portal access.</p>
      </header>

      {error ? <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-3 lg:grid-cols-6">
        <input
          placeholder="Search users"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={isActiveFilter}
          onChange={(event) => {
            setIsActiveFilter(event.target.value as 'all' | 'true' | 'false')
            setPage(1)
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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

      {canOnboard && (
        <section className="space-y-4 rounded-xl border border-slate-200 p-4">
          <header>
            <h3 className="text-lg font-semibold text-slate-900">Onboard User</h3>
            <p className="text-sm text-slate-600">
              Create a new admin account that can log in to the portal and manage leads/content.
            </p>
          </header>

          <form onSubmit={onCreateUser} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Active
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={String(form.isActive)}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isActive: event.target.value === 'true' }))
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>

            <div className="md:col-span-2">
              <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white" type="submit">
                Onboard User
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-4">
        <header>
          <h3 className="text-lg font-semibold text-slate-900">Onboarded Users</h3>
          <p className="text-sm text-slate-600">Manage all onboarded users and update their active status.</p>
        </header>

        {isLoading ? (
          <p className="text-slate-600">Loading users...</p>
        ) : (
          <div className="space-y-3">
            {users.map((record) => (
              <article key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="font-medium text-slate-900">{record.name}</p>
                  <p className="text-sm text-slate-600">{record.email}</p>
                  <p className="text-xs text-slate-500">
                    Role: {record.role} | Status: {record.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                {canOnboard && !isSuperadminRole(record.role) ? (
                  <button
                    onClick={() => toggleUserStatus(record)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  >
                    Mark as {record.isActive ? 'Inactive' : 'Active'}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between text-sm text-slate-600">
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
    </section>
  )
}
