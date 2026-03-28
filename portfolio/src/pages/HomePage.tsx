import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
        Portfolio
      </p>
      <h1 className="text-4xl font-bold text-slate-900">Build in public, ship with quality.</h1>
      <p className="max-w-2xl text-slate-600">
        This portfolio frontend is public-first with secure cookie-based auth for private
        sections. Architecture is aligned with the admin panel project.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
        >
          View Projects
        </Link>
        <Link
          to="/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Private Dashboard
        </Link>
      </div>
    </section>
  )
}
