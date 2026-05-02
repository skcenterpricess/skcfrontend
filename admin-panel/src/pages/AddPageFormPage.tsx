import { ContentSectionCard } from '@/features/content/components/ContentSectionCard'
import { contentSections } from '@/features/content/constants/contentSections'

export default function AddPageFormPage() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-semibold text-slate-900">Add Content Page</h2>
      <p className="mt-2 text-sm text-slate-600">
        Pick a content section to add or update records from the admin panel.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {contentSections.map((option) => (
          <ContentSectionCard key={option.to} option={option} />
        ))}
      </div>
    </section>
  )
}
