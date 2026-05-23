import { Navigate, Outlet } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext'

export function ProtectedRoute() {
  const { currentUser } = useAppData()
  if (!currentUser) return <Navigate to="/welcome" replace />
  return <Outlet />
}
