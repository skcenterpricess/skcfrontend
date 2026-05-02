import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
      <h2 className="text-3xl font-semibold text-slate-900">404</h2>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <Link className="mt-4 inline-block text-brand-700 underline" to="/">
        Return Home
      </Link>
    </section>
  )
}
