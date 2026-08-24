import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FaChartBar,
  FaClipboardList,
  FaDonate,
  FaEnvelopeOpenText,
  FaSignOutAlt,
  FaUsers,
  FaWarehouse,
} from 'react-icons/fa'
import { useStaffAuth } from '../../context/StaffAuthContext'
import SugarLoopMark from '../SugarLoopMark'

const NAV_ITEMS = [{ label: 'Orders', to: '/staff/orders', icon: FaClipboardList }]

// `shrink-0` matters on the narrow layout: the nav is a scrolling strip there, and without
// it flexbox would squeeze every label into a column of stacked letters rather than let
// the row run off the edge to be scrolled.
const navLinkClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-2 px-3 py-2 rounded-lg text-sm font-display font-medium transition-colors ${
    isActive ? 'bg-accent text-white' : 'text-text-body hover:bg-black/5'
  }`

/** The staff console's shell: brand, who's signed in, sign out, and the section nav.
 *  Deliberately its own layout rather than a reuse of `ShopNav` — this is an
 *  operator's tool, not a page a customer will ever land on, and borrowing the
 *  storefront's hamburger/cart chrome would imply features that aren't here.
 *
 *  On a narrow screen the nav drops to its own row and scrolls sideways, the same
 *  edge-to-edge strip the menu carousel uses. A hamburger was the other option and is
 *  the wrong one here: this is a counter tool where someone crosses between Orders and
 *  Stock all shift, and putting every section behind an open-then-choose costs a tap on
 *  the most repeated move in the console. Scrolled-off sections stay one swipe away, and
 *  the active pill is visible from anywhere in the strip. */
export default function StaffLayout() {
  const { staffUser, isAdmin, logout } = useStaffAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navRef = useRef(null)

  // Without this the strip always starts at Orders, so the section you are actually in
  // can sit off the right edge — the console would answer "where am I" with a blank.
  // `nearest` on both axes leaves an already-visible link alone rather than yanking the
  // strip, and stops a sideways scroll from dragging the page vertically as a side effect.
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const showActive = () =>
      nav.querySelector('[aria-current="page"]')?.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
      })

    showActive()

    // Two things move the pill after that first call and both land too late to be waited
    // on by hand: the display font swaps in and every label grows, and the page finishes
    // loading its rows, which raises the vertical scrollbar and takes ~15px off the strip.
    // Either one walks the pill back off the edge. Observing the strip catches the width
    // the scrollbar steals, observing the pill catches the font, and neither needs a guess
    // at how long to wait. Scrolling resizes nothing, so this cannot feed itself.
    const observer = new ResizeObserver(showActive)
    observer.observe(nav)
    const active = nav.querySelector('[aria-current="page"]')
    if (active) observer.observe(active)

    return () => observer.disconnect()
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/staff/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="bg-white border-b border-border-light">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-2">
            <SugarLoopMark className="h-9 w-auto aspect-[432/288]" />
            <span className="font-display font-bold text-sm text-accent tracking-tight">Staff</span>
          </div>

          {/* Ordered last until `lg`, so it wraps below the brand and the account block
              rather than between them. The negative margin cancels the header's own
              padding so the strip scrolls edge to edge instead of stopping short in a way
              that reads as the row simply being cut off — the width has to grow by the same
              40px, since a negative margin alone slides the strip left without widening it
              and leaves the last section clipped against a dead gutter. */}
          <nav
            ref={navRef}
            className="order-last w-[calc(100%+2.5rem)] -mx-5 px-5 overflow-x-auto flex items-center gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-none lg:w-auto lg:mx-0 lg:px-0 lg:overflow-visible"
          >
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
            {/* Both roles, unlike the admin-only links below: the server scopes a manager
                to their own branch rather than refusing them, so the report is theirs to
                read for the shift they are actually running. */}
            <NavLink to="/staff/reports" className={navLinkClass}>
              <FaChartBar className="text-xs" aria-hidden="true" />
              Reports
            </NavLink>
            {/* Hidden rather than disabled for a branch manager: every /staff/users route
                is admin-only server-side, so the link would lead nowhere but a 403. An
                offer the API is guaranteed to refuse is worse than no offer. */}
            {isAdmin && (
              <>
                <NavLink to="/staff/products" className={navLinkClass}>
                  <FaDonate className="text-xs" aria-hidden="true" />
                  Products
                </NavLink>
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

          <div className="flex min-w-0 items-center gap-2 ml-auto text-right sm:gap-3">
            {/* The name is the way into Account — where the one thing a staff member can
                change about themselves, their password, lives. */}
            <NavLink
              to="/staff/account"
              className={({ isActive }) =>
                `min-w-0 leading-tight px-2 py-1 rounded-lg no-underline transition-colors ${
                  isActive ? 'bg-accent/10' : 'hover:bg-black/5'
                }`
              }
            >
              <p className="m-0 truncate font-display font-bold text-sm text-black">
                {staffUser?.name}
              </p>
              <p className="m-0 truncate text-xs text-text-body">
                {staffUser?.role === 'admin' ? 'Admin' : staffUser?.branch?.name ?? 'Branch manager'}
              </p>
            </NavLink>
            {/* The label goes before the icon does: "Sign out" beside a door glyph is the
                one control here nobody needs words for, and dropping it buys the branch
                name enough room to stay readable on a phone. */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex shrink-0 items-center gap-2 h-9 px-3 rounded-lg border border-border-light bg-white text-xs font-display font-medium text-text-body cursor-pointer hover:border-accent hover:text-accent"
            >
              <FaSignOutAlt aria-hidden="true" />
              <span className="max-sm:hidden">Sign out</span>
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
