export function AppFooter() {
  return (
    <footer className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">SKC Portfolio</p>
          <p className="mt-1 text-slate-700">Built to showcase products, achievements, and client trust.</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-medium text-slate-800">All rights reserved.</p>
          <p>Copyright {new Date().getFullYear()} SKC</p>
        </div>
      </div>
    </footer>
  )
}
