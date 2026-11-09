import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import PortalHomePage from '../pages/PortalHomePage'
import { MainLayout } from '../shared/components/layout/MainLayout'
import { featureRegistry } from './featureRegistry'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout features={featureRegistry} />,
        children: [
          { index: true, element: <PortalHomePage features={featureRegistry} /> },
          ...featureRegistry.map((f) => ({ path: f.path, children: f.routes })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
