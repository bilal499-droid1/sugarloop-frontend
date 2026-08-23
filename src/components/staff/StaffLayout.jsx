import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FaClipboardList, FaEnvelopeOpenText, FaSignOutAlt, FaUsers, FaWarehouse } from 'react-icons/fa'
import { useStaffAuth } from '../../context/StaffAuthContext'
import SugarLoopMark from '../SugarLoopMark'

const NAV_ITEMS = [{ label: 'Orders', to: '/staff/orders', icon: FaClipboardList }]

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-display font-medium transition-colors ${
    isActive ? 'bg-accent text-white' : 'text-text-body hover:bg-black/5'
  }`

/** The staff console's shell: brand, who's signed in, sign out, and the section nav.
 *  Deliberately its own layout rather than a reuse of `ShopNav` — this is an
 *  operator's tool, not a page a customer will ever land on, and borrowing the
 *  storefront's hamburger/cart chrome would imply features that aren't here. */
export default function StaffLayout() {
  const { staffUser, isAdmin, logout } = useStaffAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/staff/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="bg-white border-b border-border-light">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-4 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-2">
            <SugarLoopMark className="h-9 w-auto aspect-[432/288]" />
            <span className="font-display font-bold text-sm text-accent tracking-tight">Staff</span>
          </div>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon className="text-xs" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            {/* Stock is only reachable with a branch in play — an admin without one
                selected yet has nothing meaningful to toggle, so the link jumps
                straight into the picker rather than a page that immediately errors. */}
            <NavLink to="/staff/stock" className={navLinkClass}>
              <FaWarehouse className="text-xs" aria-hidden="true" />
              Stock
            </NavLink>
            {/* Hidden rather than disabled for a branch manager: every /staff/users route
                is admin-only server-side, so the link would lead nowhere but a 403. An
                offer the API is guaranteed to refuse is worse than no offer. */}
            {isAdmin && (
              <>
                <NavLink to="/staff/enquiries" className={navLinkClass}>
                  <FaEnvelopeOpenText className="text-xs" aria-hidden="true" />
                  Enquiries
                </NavLink>
                <NavLink to="/staff/team" className={navLinkClass}>
                  <FaUsers className="text-xs" aria-hidden="true" />
                  Team
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3 ml-auto text-right">
            {/* The name is the way into Account — where the one thing a staff member can
                change about themselves, their password, lives. */}
            <NavLink
              to="/staff/account"
              className={({ isActive }) =>
                `leading-tight px-2 py-1 rounded-lg no-underline transition-colors ${
                  isActive ? 'bg-accent/10' : 'hover:bg-black/5'
                }`
              }
            >
              <p className="m-0 font-display font-bold text-sm text-black">{staffUser?.name}</p>
              <p className="m-0 text-xs text-text-body">
                {staffUser?.role === 'admin' ? 'Admin' : staffUser?.branch?.name ?? 'Branch manager'}
              </p>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border-light bg-white text-xs font-display font-medium text-text-body cursor-pointer hover:border-accent hover:text-accent"
            >
              <FaSignOutAlt aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 py-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
