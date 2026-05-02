import brandImage from '@/assets/heros.png'

export function BrandSection() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-accent-200/70 bg-gradient-to-br from-accent-50 via-white to-accent-100/80 px-6 py-8 text-surface-900 shadow-[0_18px_55px_rgba(180,83,9,0.14)] sm:px-8 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-700">Brand Story</p>
          <h2 className="max-w-xl text-3xl font-black leading-tight text-surface-900 sm:text-4xl">
            Built for Everyday Strength and Long-Lasting Trust
          </h2>
          <p className="max-w-2xl text-base leading-8 text-surface-700 sm:text-lg">
            SKC Hardware delivers reliable products and practical solutions for homes, shops, and project sites.
            We focus on quality you can feel, service you can count on, and a catalog that keeps improving with
            modern needs.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-accent-300 bg-accent-100 px-4 py-2 font-medium text-accent-800">
              Durable Hardware Range
            </span>
            <span className="rounded-full border border-accent-300 bg-white px-4 py-2 font-medium text-accent-800">
              Trusted Local Support
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-3 -top-3 h-20 w-20 rounded-full bg-accent-300/40 blur-2xl" />
          <div className="absolute -bottom-4 right-4 h-24 w-24 rounded-full bg-accent-500/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-accent-200/70 bg-white p-3 shadow-xl">
            <img
              src={brandImage}
              alt="SKC Hardware brand"
              className="h-[19rem] w-full rounded-[1.25rem] object-cover sm:h-[22rem]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}