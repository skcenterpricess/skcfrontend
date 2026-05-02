import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="ui-page-card text-center">
      <h2 className="text-3xl font-semibold text-surface-900">404</h2>
      <p className="mt-2 text-surface-700">The page you are looking for does not exist.</p>
      <Link className="ui-link-inline mt-4 inline-block" to="/">
        Return Home
      </Link>
    </section>
  )
}
