import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { contentService } from '@/features/content/services/contentService'
import type { HeaderSidebar } from '@/shared/types/content'

type HeaderForm = {
	imageFile: File | null
	heading: string
	description: string
}

const emptyForm: HeaderForm = {
	imageFile: null,
	heading: '',
	description: '',
}

type HeaderLocationState = {
	header?: HeaderSidebar
}

function normalizeError(err: unknown, fallback: string): string {
	const maybeError = err as {
		message?: string
		response?: { status?: number; data?: { message?: string } }
	}

	const status = maybeError.response?.status
	if (status === 400) return maybeError.response?.data?.message || 'Please check the form fields and try again'
	if (status === 401) return 'Your session expired. Please login again'
	if (status === 403) return 'Only superadmin can perform this action'
	if (!status && maybeError.message) return 'Network error or CORS issue. Please check backend URL and CORS config'
	return maybeError.message || fallback
}

export default function EditHeroPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const location = useLocation()
	const initialHeader = (location.state as HeaderLocationState | null)?.header

	const [form, setForm] = useState<HeaderForm>(emptyForm)
	const [existingImage, setExistingImage] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let isCancelled = false

		const hydrate = async () => {
			if (!id) {
				navigate('/content/header-slider/list', { replace: true })
				return
			}

			if (initialHeader) {
				setForm({
					imageFile: null,
					heading: initialHeader.heading,
					description: initialHeader.description,
				})
				setExistingImage(initialHeader.image || '')
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				const data = await contentService.listHeaderSidebar({
					page: 1,
					limit: 100,
					refresh: true,
				})

				if (isCancelled) return
				const target = data.records.find((item) => item._id === id)
				if (!target) {
					setError('Header slider not found for edit view')
					setLoading(false)
					return
				}

				setForm({
					imageFile: null,
					heading: target.heading,
					description: target.description,
				})
				setExistingImage(target.image || '')
				setError(null)
			} catch (err) {
				if (!isCancelled) {
					setError(normalizeError(err, 'Failed to load header slider for edit'))
				}
			} finally {
				if (!isCancelled) {
					setLoading(false)
				}
			}
		}

		hydrate()

		return () => {
			isCancelled = true
		}
	}, [id, initialHeader, navigate])

	const onSave = async (event: FormEvent) => {
		event.preventDefault()
		if (!id) return

		try {
			setSaving(true)
			await contentService.updateHeaderSidebar(id, {
				heading: form.heading,
				description: form.description,
				image: form.imageFile || undefined,
			})
			navigate('/content/header-slider/list')
		} catch (err) {
			setError(normalizeError(err, 'Failed to update header slider'))
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return <div className="rounded-2xl bg-white p-8 shadow-sm">Loading header slider...</div>
	}

	return (
		<section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-slate-900">Edit Header Slider</h2>
				<button
					onClick={() => navigate('/content/header-slider/list')}
					className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
				>
					Back To List
				</button>
			</div>

			{error ? <p className="mb-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

			<form onSubmit={onSave} className="w-full max-w-2xl space-y-4">
				<label className="block text-sm font-medium text-slate-700">
					Heading
					<input
						required
						value={form.heading}
						onChange={(event) => setForm((prev) => ({ ...prev, heading: event.target.value }))}
						className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
					/>
				</label>

				<label className="block text-sm font-medium text-slate-700">
					Description
					<textarea
						required
						rows={4}
						value={form.description}
						onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
						className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
					/>
				</label>

				<label className="block text-sm font-medium text-slate-700">
					Image File
					<input
						type="file"
						accept="image/png,image/jpeg,image/jpg"
						onChange={(event) => setForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] ?? null }))}
						className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
					/>
					{form.imageFile ? (
						<p className="mt-1 text-xs text-slate-500">Selected: {form.imageFile.name}</p>
					) : existingImage ? (
						<p className="mt-1 text-xs text-slate-500">Keeping existing image</p>
					) : null}
				</label>

				{existingImage && !form.imageFile ? (
					<div className="rounded-lg border border-slate-200 p-3">
						<p className="mb-2 text-xs text-slate-500">Current image</p>
						<img src={existingImage} alt="Current header slider" className="h-20 w-20 rounded object-cover" />
					</div>
				) : null}

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={() => navigate('/content/header-slider/list')}
						className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
					>
						Cancel
					</button>
					<button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60">
						{saving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</section>
	)
}
