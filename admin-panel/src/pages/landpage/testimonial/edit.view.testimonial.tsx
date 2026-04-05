import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { contentService } from '@/features/content/services/contentService'
import type { Testimonial } from '@/shared/types/content'

type TestimonialForm = {
	name: string
	designation: string
	message: string
	imageFile: File | null
	isActive: boolean
}

const emptyForm: TestimonialForm = {
	name: '',
	designation: '',
	message: '',
	imageFile: null,
	isActive: true,
}

type TestimonialLocationState = {
	testimonial?: Testimonial
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

export default function EditTestimonialPage() {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const location = useLocation()
	const initialTestimonial = (location.state as TestimonialLocationState | null)?.testimonial

	const [form, setForm] = useState<TestimonialForm>(emptyForm)
	const [existingImage, setExistingImage] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let isCancelled = false

		const hydrate = async () => {
			if (!id) {
				navigate('/content/testimonials/list', { replace: true })
				return
			}

			if (initialTestimonial) {
				setForm({
					name: initialTestimonial.name,
					designation: initialTestimonial.designation,
					message: initialTestimonial.message,
					imageFile: null,
					isActive: initialTestimonial.isActive ?? true,
				})
				setExistingImage(initialTestimonial.image || '')
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				const data = await contentService.listTestimonials({
					page: 1,
					limit: 100,
					refresh: true,
				})

				if (isCancelled) return
				const target = data.records.find((item) => item._id === id)
				if (!target) {
					setError('Testimonial not found for edit view')
					setLoading(false)
					return
				}

				setForm({
					name: target.name,
					designation: target.designation,
					message: target.message,
					imageFile: null,
					isActive: target.isActive ?? true,
				})
				setExistingImage(target.image || '')
				setError(null)
			} catch (err) {
				if (!isCancelled) {
					setError(normalizeError(err, 'Failed to load testimonial for edit'))
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
	}, [id, initialTestimonial, navigate])

	const onSave = async (event: FormEvent) => {
		event.preventDefault()
		if (!id) return

		try {
			setSaving(true)
			await contentService.updateTestimonial(id, {
				name: form.name,
				designation: form.designation,
				message: form.message,
				image: form.imageFile || undefined,
				isActive: form.isActive,
			})
			navigate('/content/testimonials/list')
		} catch (err) {
			setError(normalizeError(err, 'Failed to update testimonial'))
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return <div className="rounded-2xl bg-white p-8 shadow-sm">Loading testimonial...</div>
	}

	return (
		<section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-slate-900">Edit Testimonial</h2>
				<button
					onClick={() => navigate('/content/testimonials/list')}
					className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
				>
					Back To List
				</button>
			</div>

			{error ? <p className="mb-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

			<form onSubmit={onSave} className="w-full max-w-2xl space-y-4">
				<div className="grid gap-4 md:grid-cols-2">
					<label className="text-sm font-medium text-slate-700">
						Name
						<input
							required
							value={form.name}
							onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
							className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
						/>
					</label>

					<label className="text-sm font-medium text-slate-700">
						Designation
						<input
							required
							value={form.designation}
							onChange={(event) => setForm((prev) => ({ ...prev, designation: event.target.value }))}
							className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
						/>
					</label>
				</div>

				<label className="block text-sm font-medium text-slate-700">
					Message
					<textarea
						required
						rows={4}
						value={form.message}
						onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
						className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
					/>
				</label>

				<div className="grid gap-4 md:grid-cols-2">
					<label className="text-sm font-medium text-slate-700">
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

					<label className="text-sm font-medium text-slate-700">
						Status
						<select
							value={String(form.isActive)}
							onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value === 'true' }))}
							className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
						>
							<option value="true">Active</option>
							<option value="false">Inactive</option>
						</select>
					</label>
				</div>

				{existingImage && !form.imageFile ? (
					<div className="rounded-lg border border-slate-200 p-3">
						<p className="mb-2 text-xs text-slate-500">Current image</p>
						<img src={existingImage} alt="Current testimonial" className="h-20 w-20 rounded-full object-cover" />
					</div>
				) : null}

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={() => navigate('/content/testimonials/list')}
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
