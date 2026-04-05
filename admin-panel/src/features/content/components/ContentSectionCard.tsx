import { Link } from 'react-router-dom'
import type { ContentSectionOption } from '@/shared/types/content'

interface ContentSectionCardProps {
  option: ContentSectionOption
}

export function ContentSectionCard({ option }: ContentSectionCardProps) {
  return (
    <Link
      to={option.to}
      className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <p className="text-base font-semibold text-slate-900">{option.title}</p>
      <p className="mt-1 text-sm text-slate-600">{option.description}</p>
    </Link>
  )
}
