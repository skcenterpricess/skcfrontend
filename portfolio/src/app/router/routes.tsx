import { Navigate, createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/app/layout/AppLayout'
import { ProtectedRoute } from '@/shared/routing/ProtectedRoute'
import AboutPage from '@/pages/abouts/AboutPage'
import ContactPage from '@/pages/contacts/ContactPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import HomePage from '@/pages/home'
import LeadLoginPage from '@/pages/auth/LeadLoginPage'
import LeadProfilePage from '@/pages/auth/LeadProfilePage'
import LeadRegisterPage from '@/pages/auth/LeadRegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import CartPage from '@/pages/dashboard/carts/CartPage'
import ProjectsPage from '@/pages/products/index.product'
import ProductDetailPage from '@/pages/products/view.product'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProductDetailPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'achievements', element: <AboutPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'about-us', element: <Navigate to="/achievements" replace /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'lead/register', element: <LeadRegisterPage /> },
      { path: 'lead/login', element: <LeadLoginPage /> },
      { path: 'lead/profile', element: <LeadProfilePage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
