import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import { productService } from '@/features/products/services/productService'
import type { ProductFormPayload } from '@/shared/types/product'

const emptyForm: ProductFormPayload = {
	name: '',
	base_price: 0,
	marked_price: 0,
	coopan_price: 0,
	description: '',
	size: '',
	version: '',
	stok: 0,
	isActive: true,
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

const normalizeProductPayload = (form: ProductFormPayload): ProductFormPayload => ({
	...form,
	name: form.name.trim(),
	description: form.description.trim(),
	size: form.size.trim(),
	version: (form.version || '').trim(),
	base_price: Number.isFinite(form.base_price) ? Math.max(0, form.base_price) : 0,
	marked_price: Number.isFinite(form.marked_price) ? Math.max(0, form.marked_price) : 0,
	coopan_price: Number.isFinite(form.coopan_price) ? Math.max(0, form.coopan_price) : 0,
	stok: Number.isFinite(form.stok) ? Math.max(0, Math.trunc(form.stok)) : 0,
})

const validateProductPayload = (form: ProductFormPayload, files: File[]): string | null => {
	if (!form.name || !form.description || !form.size) {
		return 'Name, description, and size are required.'
	}

	if (files.length === 0) {
		return 'Please add at least one product image before saving'
	}

	const invalidFile = files.find((file) => !file.type.startsWith('image/'))
	if (invalidFile) {
		return `Only image files are allowed (${invalidFile.name} is invalid).`
	}

	const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES)
	if (oversizedFile) {
		return `Image ${oversizedFile.name} is larger than 5MB.`
	}

	if (form.coopan_price > form.marked_price) {
		return 'Offer price cannot be greater than marked price.'
	}

	if (form.marked_price > 0 && form.base_price > form.marked_price) {
		return 'Base price cannot be greater than marked price.'
	}

	return null
}

export default function CreateProductPage() {
	const navigate = useNavigate()
	const [form, setForm] = useState<ProductFormPayload>(emptyForm)
	const [newImageFiles, setNewImageFiles] = useState<File[]>([])
	const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([])
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		const objectUrls = newImageFiles.map((file) => URL.createObjectURL(file))
		setNewImagePreviewUrls(objectUrls)

		return () => {
			objectUrls.forEach((url) => URL.revokeObjectURL(url))
		}
	}, [newImageFiles])

	const addNewImageFiles = (files: File[]) => {
		if (files.length === 0) return

		const invalidFile = files.find((file) => !file.type.startsWith('image/'))
		if (invalidFile) {
			setError(`Only image files are allowed (${invalidFile.name} is invalid).`)
			return
		}

		const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES)
		if (oversizedFile) {
			setError(`Image ${oversizedFile.name} is larger than 5MB.`)
			return
		}

		setError(null)
		setNewImageFiles((prev) => [...prev, ...files])
	}

	const removeNewImageFile = (index: number) => {
		setNewImageFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
	}

	const onSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (isSubmitting) return

		setError(null)

		const normalizedForm = normalizeProductPayload(form)
		const validationError = validateProductPayload(normalizedForm, newImageFiles)
		if (validationError) {
			setError(validationError)
			return
		}

		try {
			setIsSubmitting(true)
			await productService.create({
				...normalizedForm,
				imageFiles: newImageFiles,
			})
			setForm(normalizedForm)
			navigate('/products/list')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save product')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section className="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-2xl font-semibold text-slate-900">Create Product</h2>
					<p className="mt-1 text-sm text-slate-600">
						Add a new catalog item for the portfolio and order flow.
					</p>
				</div>
				<Link
					to="/products/list"
					className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					Back to Products
				</Link>
			</div>

			{error ? <p className="rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

			<form className="space-y-4" onSubmit={onSave}>
				<div className="grid gap-4 md:grid-cols-2">
					<label className="grid gap-1 text-sm">
						<span className="text-slate-600">Name</span>
						<input
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.name}
							onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
							required
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span className="text-slate-600">Size</span>
						<input
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.size}
							onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
							required
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span className="text-slate-600">Version</span>
						<input
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.version || ''}
							onChange={(event) => setForm((prev) => ({ ...prev, version: event.target.value }))}
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span className="text-slate-600">Stock</span>
						<input
							type="number"
							min={0}
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.stok}
							onChange={(event) => setForm((prev) => ({ ...prev, stok: Number(event.target.value || 0) }))}
							required
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span className="text-slate-600">Base Price</span>
						<input
							type="number"
							min={0}
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.base_price}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, base_price: Number(event.target.value || 0) }))
							}
							required
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span className="text-slate-600">Marked Price</span>
						<input
							type="number"
							min={0}
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.marked_price}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, marked_price: Number(event.target.value || 0) }))
							}
							required
						/>
					</label>

					<label className="grid gap-1 text-sm md:col-span-2">
						<span className="text-slate-600">Offer Price</span>
						<input
							type="number"
							min={0}
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.coopan_price}
							onChange={(event) =>
								setForm((prev) => ({ ...prev, coopan_price: Number(event.target.value || 0) }))
							}
							required
						/>
					</label>

					<label className="grid gap-1 text-sm md:col-span-2">
						<span className="text-slate-600">Description</span>
						<textarea
							rows={4}
							className="rounded-lg border border-slate-300 px-3 py-2"
							value={form.description}
							onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
							required
						/>
					</label>

					<label className="inline-flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
						/>
						<span className="text-slate-700">Active</span>
					</label>
				</div>

				<div className="space-y-3 rounded-lg border border-slate-200 p-4">
					<p className="text-sm font-medium text-slate-700">Images</p>
					<label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
						Upload images
						<input
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={(event) => addNewImageFiles(Array.from(event.target.files || []))}
						/>
					</label>

					{newImagePreviewUrls.length > 0 ? (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
							{newImagePreviewUrls.map((url, index) => (
								<div key={`${url}-${index}`} className="space-y-2 rounded-lg border border-slate-200 p-2">
									<img
										src={url}
										alt={`Upload preview ${index + 1}`}
										className="h-24 w-full rounded-md object-cover"
									/>
									<button
										type="button"
										className="w-full rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
										onClick={() => removeNewImageFile(index)}
									>
										Remove
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-xs text-slate-500">No images selected.</p>
					)}
				</div>

				<div className="flex flex-wrap items-center justify-end gap-2 pt-2">
					<Link
						to="/products/list"
						className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
					>
						Cancel
					</Link>
					<button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
>
                        {isSubmitting ? 'Saving product...' : 'Save Product'}
                    </button>
				</div>
			</form>
		</section>
	)
}
