import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-admin-700">
        Admin Panel
      </p>
      <h1 className="text-4xl font-bold text-slate-900">Operations, moderation, and publishing.</h1>
      <p className="max-w-2xl text-slate-600">
        This admin frontend is protected with role-based route guards and cookie-backed JWT
        sessions. Its architecture mirrors the portfolio app for maintainability.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg bg-admin-700 px-4 py-2 text-sm font-medium text-white"
        >
          Open Dashboard
        </Link>
        <Link
          to="/users"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Manage Users
        </Link>
      </div>
    </section>
  )
}
