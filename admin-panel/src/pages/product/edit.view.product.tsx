import { useParams } from 'react-router-dom'
import ProductsPage from './index'

export default function EditProductPage() {
	const { id } = useParams<{ id: string }>()
	return <ProductsPage mode="edit" editId={id} />
}
