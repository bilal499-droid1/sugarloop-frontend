import { Navigate, Outlet } from 'react-router-dom'
import { useStaffAuth } from '../../context/StaffAuthContext'

/**
 * Gates the admin-only corner of the console. Mount inside `RequireStaffAuth`, which has
 * already established that somebody is signed in — this only asks which somebody.
 *
 * Redirects a branch manager to the order board rather than rendering a "not allowed"
 * screen. There is nothing for them to do about it and no other route they wanted; the
 * board is where they were going.
 *
 * This is convenience, not security. `/staff/users` is admin-gated at the router level on
 * the server (`requireRole(STAFF_ROLE.ADMIN)`), so deleting this component would change
 * what the console *offers*, not what a manager can *do* — every call would still 403.
 */
export default function RequireAdmin() {
  const { isAdmin } = useStaffAuth()

  if (!isAdmin) return <Navigate to="/staff/orders" replace />

  return <Outlet />
}
