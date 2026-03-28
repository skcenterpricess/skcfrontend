import { useAuth } from '@/features/auth/context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
      <p className="mt-3 text-slate-600">
        Welcome back {user?.name ?? 'Admin'}. This panel is protected by admin role guard.
      </p>
    </section>
  )
}
