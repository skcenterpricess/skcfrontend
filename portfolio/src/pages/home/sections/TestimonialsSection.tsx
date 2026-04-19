import type { Testimonial } from '@/shared/types/content'
import { sectionShell } from '@/pages/home/constants'

interface TestimonialsSectionProps {
  isLoading: boolean
  testimonials: Testimonial[]
}

export function TestimonialsSection({ isLoading, testimonials }: TestimonialsSectionProps) {
  const loadingCards = Array.from({ length: 3 }).map((_, index) => (
    <div key={index} className="rounded-[1.5rem] border border-brand-100 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded-full bg-brand-100" />
      <div className="mt-3 h-6 w-3/4 animate-pulse rounded-full bg-brand-100" />
      <div className="mt-4 h-16 animate-pulse rounded-2xl bg-surface-100" />
    </div>
  ))

  return (
    <section className={sectionShell}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Testimonials</p>
          <h2 className="mt-2 text-3xl font-black text-brand-900">What people say after working together</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-brand-700">
          Short, high-confidence quotes keep the page moving while still adding social proof.
        </p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{loadingCards}</div>
        ) : testimonials.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial._id} className="rounded-[1.5rem] border border-brand-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent-100 to-brand-100 ring-1 ring-brand-200">
                    {testimonial.image ? (
                      <img src={testimonial.image} alt={testimonial.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-brand-700">
                        {testimonial.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-bold text-brand-900">{testimonial.name}</p>
                    <p className="text-sm text-brand-600">{testimonial.designation}</p>
                  </div>
                </div>

                <p className="mt-5 text-base leading-7 text-brand-700">"{testimonial.message}"</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-surface-100 px-6 py-10 text-center text-brand-700">
            Testimonials will appear here when there are active customer quotes to feature.
          </div>
        )}
      </div>
    </section>
  )
}
