import { createBrowserRouter } from 'react-router-dom'
import { LoginPage, RegisterPage } from '../features/auth'
import NotFoundPage from '../pages/NotFoundPage'
import PortalHomePage from '../pages/PortalHomePage'
import { MainLayout } from '../shared/components/layout/MainLayout'
import { LOGIN_PATH, REGISTER_PATH } from '../shared/constants/routes'
import { featureRegistry } from './featureRegistry'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: LOGIN_PATH, element: <LoginPage /> },
      { path: REGISTER_PATH, element: <RegisterPage /> },
    ],
  },
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
