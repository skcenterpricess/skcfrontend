import { useAuth } from '@/features/auth/context/AuthContext'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()

  const firstName = user?.name?.split(' ')[0] ?? 'Admin'

  const quickLinks = [
    {
      icon: '📦',
      label: 'View Products',
      description: 'Browse our full product catalog',
      href: '/projects',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: '🛒',
      label: 'My Cart',
      description: 'Manage items and checkout',
      href: '/cart',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: '⭐',
      label: 'Achievements',
      description: 'Explore our milestones',
      href: '/achievements',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: '💬',
      label: 'Contact Us',
      description: 'Get in touch with our team',
      href: '/contact',
      color: 'from-pink-500 to-rose-500',
    },
  ]

  const dashboardStats = [
    { label: 'Account Status', value: 'Active', icon: '✓', badge: 'Verified' },
    { label: 'User Role', value: 'Admin', icon: '👤', badge: 'Premium' },
    { label: 'Email', value: user?.email ?? 'Not set', icon: '✉️', badge: 'Confirmed' },
  ]

  return (
    <section className="space-y-8 pb-4">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 px-6 py-8 text-white sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.1),_transparent_50%)]" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200 backdrop-blur">
            Dashboard Panel
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-200/90">
              Welcome back
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
              Hey, {firstName}! 👋
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              You're logged in as an admin. Use this dashboard to navigate the portfolio, manage your cart, 
              and explore our products and achievements.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Browse Products
            </Link>
            <Link
              to="/cart"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              View My Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950 truncate">{stat.value}</p>
              </div>
              <div className="rounded-full bg-slate-100 px-2 py-1 text-lg">{stat.icon}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {stat.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links Grid */}
      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Quick Access
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Jump to key areas</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="group relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />

              <div className="relative space-y-3">
                <div className="text-3xl">{link.icon}</div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 group-hover:text-cyan-700 transition">
                    {link.label}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {link.description}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                <span className="text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Portfolio Overview */}
      <section className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Portfolio Overview
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">What's inside</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { count: '50+', label: 'Products', description: 'Available in catalog' },
              { count: '100+', label: 'Achievements', description: 'Milestones reached' },
              { count: '99%', label: 'Satisfaction', description: 'Client feedback' },
              { count: '24/7', label: 'Support', description: 'Always available' },
            ].map((item, index) => (
              <div key={index} className="rounded-lg bg-white p-4 text-center">
                <p className="text-2xl font-black text-cyan-700">{item.count}</p>
                <p className="mt-1 font-bold text-slate-950">{item.label}</p>
                <p className="mt-1 text-xs text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h3 className="text-xl font-black text-slate-950">Ready to explore?</h3>
        <p className="mt-2 text-slate-600">
          Start browsing our products, check your cart, or learn about our achievements.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/projects"
            className="rounded-lg bg-slate-950 px-5 py-2 font-semibold text-white transition hover:bg-slate-800"
          >
            View All Products
          </Link>
          <Link
            to="/achievements"
            className="rounded-lg border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Learn About Us
          </Link>
        </div>
      </section>
    </section>
  )
}
