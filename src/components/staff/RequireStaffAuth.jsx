import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStaffAuth } from '../../context/StaffAuthContext'
import SugarLoopMark from '../SugarLoopMark'

/**
 * Gates every `/staff/*` route except the login screen itself.
 *
 * Renders nothing decisive while `status === 'checking'` — that is the one-time
 * cookie check on mount, and redirecting to `/staff/login` before it resolves would
 * bounce an already-signed-in operator through the login screen on every refresh.
 */
export default function RequireStaffAuth() {
  const { status } = useStaffAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <SugarLoopMark className="h-16 w-auto aspect-[432/288] animate-pulse" />
      </div>
    )
  }

  if (status === 'signedOut') {
    // `from` lets the login page send the operator back to the board they were on,
    // rather than always landing on the default `/staff` route after a session drop.
    return <Navigate to="/staff/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
