import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '@/features/products/services/productService'
import type { Product, ProductFormPayload, ProductImage } from '@/shared/types/product'

type PageMode = 'full' | 'create' | 'list' | 'edit'

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

export default function ProductsPage({ mode = 'full', editId }: { mode?: PageMode; editId?: string }) {
  const navigate = useNavigate()
  const isCreateOnly = mode === 'create'
  const isEditOnly = mode === 'edit'
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [refreshTick, setRefreshTick] = useState(0)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })

  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [viewTarget, setViewTarget] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormPayload>(emptyForm)
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([])

  useEffect(() => {
    const objectUrls = newImageFiles.map((file) => URL.createObjectURL(file))
    setNewImagePreviewUrls(objectUrls)

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [newImageFiles])

  const modalTitle = useMemo(() => (editTarget ? 'Edit Product' : 'Create Product'), [editTarget])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.list({
        page,
        limit,
        search: search || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'active',
        sortBy,
        sortOrder,
        refresh: refreshTick > 0,
      })
      setProducts(response.records)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [page, limit, search, statusFilter, sortBy, sortOrder, refreshTick])

  const openCreate = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setExistingImages([])
    setNewImageFiles([])
    setEditorOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditTarget(product)
    setForm({
      name: product.name,
      base_price: product.base_price,
      marked_price: product.marked_price,
      coopan_price: product.coopan_price,
      description: product.description,
      size: product.size,
      version: product.version || '',
      stok: product.stok,
      isActive: product.isActive,
    })
    setExistingImages(product.images || [])
    setNewImageFiles([])
    setEditorOpen(true)
  }

  const closeEditor = () => {
    if (isCreateOnly || isEditOnly) {
      navigate('/products/list')
      return
    }

    setEditorOpen(false)
    setEditTarget(null)
    setForm(emptyForm)
    setExistingImages([])
    setNewImageFiles([])
  }

  useEffect(() => {
    if (isCreateOnly && !editorOpen) {
      openCreate()
    }
  }, [isCreateOnly, editorOpen])

  useEffect(() => {
    if (!isEditOnly || editorOpen || loading) return
    if (!editId) {
      setError('Missing product id for edit view')
      return
    }

    const target = products.find((item) => item._id === editId)
    if (target) {
      openEdit(target)
      return
    }

    const hydrateEdit = async () => {
      try {
        const product = await productService.getById(editId)
        openEdit(product)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Product not found for edit view')
      }
    }

    hydrateEdit()
  }, [isEditOnly, editorOpen, loading, editId, products])

  const addNewImageFiles = (files: File[]) => {
    if (files.length === 0) return
    setNewImageFiles((prev) => [...prev, ...files])
  }

  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((image) => image.public_id !== publicId))
  }

  const removeNewImageFile = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    try {
      if (editTarget) {
        await productService.update(editTarget._id, {
          ...form,
          imageFiles: newImageFiles,
          retainImagePublicIds: existingImages.map((image) => image.public_id),
        })
      } else {
        if (newImageFiles.length === 0) {
          setError('Please add at least one product image before saving')
          return
        }

        await productService.create({
          ...form,
          imageFiles: newImageFiles,
        })
      }
      closeEditor()
      if (isCreateOnly || isEditOnly) {
        navigate('/products/list')
      }
      setRefreshTick((prev) => prev + 1)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    }
  }

  const onDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this product?')
    if (!confirmed) return

    try {
      await productService.remove(id)
      setRefreshTick((prev) => prev + 1)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  return (
    <>
      {!isCreateOnly && !isEditOnly && (
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
              <p className="mt-1 text-sm text-slate-600">
                Manage the catalog for portfolio, cart, and offline order flow.
              </p>
            </div>
            <button
              className="rounded-lg bg-admin-700 px-4 py-2 text-sm font-medium text-white hover:bg-admin-900"
              onClick={() => {
                if (mode === 'list' || mode === 'full') {
                  navigate('/products/create')
                  return
                }
                openCreate()
              }}
            >
              Create Product
            </button>
          </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:col-span-2"
          placeholder="Search product"
          value={search}
          onChange={(event) => {
            setPage(1)
            setSearch(event.target.value)
          }}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) => {
            setPage(1)
            setStatusFilter(event.target.value)
          }}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="name">Name</option>
          <option value="base_price">Base price</option>
          <option value="marked_price">Marked price</option>
          <option value="coopan_price">Offer price</option>
          <option value="stok">Stock</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={limit}
          onChange={(event) => {
            setPage(1)
            setLimit(Number(event.target.value))
          }}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="mt-4 rounded bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Images</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {!loading && products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No products found.
                </td>
              </tr>
            ) : null}
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.size}
                    {product.version ? ` · ${product.version}` : ''}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="flex items-center gap-3">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] uppercase tracking-wide text-slate-400">
                        No image
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.images?.length || 0} files</p>
                      <p className="text-xs text-slate-500">Gallery</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <p>Offer Rs. {product.coopan_price}</p>
                  <p className="text-xs text-slate-500 line-through">Rs. {product.marked_price}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{product.stok}</td>
                <td className="px-4 py-3 text-slate-700">
                  {product.avgRating || 0} ({product.ratingCount || 0})
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      onClick={() => setViewTarget(product)}
                    >
                      View
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
                      onClick={() => {
                        if (mode === 'list') {
                          navigate(`/products/edit/${product._id}`)
                          return
                        }
                        openEdit(product)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      onClick={() => onDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
          <p>
            Page {pagination.page} of {pagination.pages} · Total {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              className="rounded border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage((prev) => Math.min(pagination.pages || 1, prev + 1))}
              disabled={page >= (pagination.pages || 1)}
            >
              Next
            </button>
          </div>
        </div>
        </section>
      )}

      {editorOpen || isCreateOnly || isEditOnly ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form className="w-full max-w-3xl space-y-4 rounded-xl bg-white p-6 shadow-xl" onSubmit={onSave}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{modalTitle}</h3>
              <button type="button" className="text-sm text-slate-500" onClick={closeEditor}>
                Close
              </button>
            </div>

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
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, stok: Number(event.target.value || 0) }))
                  }
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
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  required
                />
              </label>

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="text-slate-600">Product Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  onChange={(event) => {
                    addNewImageFiles(Array.from(event.target.files || []))
                    event.currentTarget.value = ''
                  }}
                />
                <p className="text-xs text-slate-500">
                  Add one or more gallery images. Existing retained images stay in place unless you remove them.
                </p>
              </label>

              <div className="grid gap-4 md:col-span-2 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">Current images</h4>
                    <span className="text-xs text-slate-500">{existingImages.length}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingImages.length === 0 ? (
                      <p className="text-sm text-slate-500">No existing images retained.</p>
                    ) : (
                      existingImages.map((image) => (
                        <div key={image.public_id} className="group relative overflow-hidden rounded-lg border border-slate-200">
                          <img src={image.url} alt="Product gallery" className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white opacity-90 shadow-sm"
                            onClick={() => removeExistingImage(image.public_id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">New uploads</h4>
                    <span className="text-xs text-slate-500">{newImageFiles.length}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {newImagePreviewUrls.length === 0 ? (
                      <p className="text-sm text-slate-500">No new images selected.</p>
                    ) : (
                      newImagePreviewUrls.map((previewUrl, index) => (
                        <div key={`${previewUrl}-${index}`} className="group relative overflow-hidden rounded-lg border border-slate-200">
                          <img src={previewUrl} alt={`Selected product image ${index + 1}`} className="h-28 w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-90 shadow-sm"
                            onClick={() => removeNewImageFile(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                <span className="text-slate-700">Active product</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                onClick={closeEditor}
              >
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {viewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Product details</h3>
              <button type="button" className="text-sm text-slate-500" onClick={() => setViewTarget(null)}>
                Close
              </button>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <strong>Name:</strong> {viewTarget.name}
              </p>
              <p>
                <strong>Description:</strong> {viewTarget.description}
              </p>
              <p>
                <strong>Size / Version:</strong> {viewTarget.size} / {viewTarget.version || '-'}
              </p>
              <p>
                <strong>Prices:</strong> Base Rs. {viewTarget.base_price}, Marked Rs. {viewTarget.marked_price}, Offer Rs.{' '}
                {viewTarget.coopan_price}
              </p>
              <p>
                <strong>Stock:</strong> {viewTarget.stok}
              </p>
              <p>
                <strong>Rating:</strong> {viewTarget.avgRating || 0} ({viewTarget.ratingCount || 0} reviews)
              </p>
              <div>
                <strong>Images:</strong>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {viewTarget.images?.length ? (
                    viewTarget.images.map((image) => (
                      <img
                        key={image.public_id}
                        src={image.url}
                        alt={viewTarget.name}
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                      />
                    ))
                  ) : (
                    <p className="text-slate-500">No product images available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
