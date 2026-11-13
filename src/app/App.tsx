import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from '../shared/components/ui'
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { router } from './router'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
