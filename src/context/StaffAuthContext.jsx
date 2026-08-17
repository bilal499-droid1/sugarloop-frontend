import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as staffApi from '../lib/staffApi'

const StaffAuthContext = createContext(null)

/**
 * The staff console's session.
 *
 * `status` starts at `'checking'` rather than `'signedOut'` on purpose. The access
 * token lives only in memory (see `staffApi.js`), so every hard reload of `/staff/*`
 * looks identical to a first visit unless something asks the refresh cookie whether a
 * session is still good. Rendering the login form before that answer comes back would
 * flash a logged-out screen at an operator mid-shift who just refreshed the page.
 *
 *   'checking'   the one-time cookie check on mount is still running
 *   'signedIn'   staffUser is populated, the console renders
 *   'signedOut'  no session — show the login form
 */
export function StaffAuthProvider({ children }) {
  const [staffUser, setStaffUser] = useState(null)
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    // Told about failures the API client discovers on its own — a refresh that fails
    // in the middle of some other call, well after this mount effect has finished.
    staffApi.setSessionLostHandler(() => {
      setStaffUser(null)
      setStatus('signedOut')
    })

    let active = true
    staffApi.bootstrap().then((user) => {
      if (!active) return
      setStaffUser(user)
      setStatus(user ? 'signedIn' : 'signedOut')
    })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      staffUser,
      status,
      isSignedIn: status === 'signedIn',
      isAdmin: staffUser?.role === 'admin',

      async login(email, password) {
        const user = await staffApi.login({ email, password })
        setStaffUser(user)
        setStatus('signedIn')
        return user
      },

      async logout() {
        await staffApi.logout()
        setStaffUser(null)
        setStatus('signedOut')
      },
    }),
    [staffUser, status]
  )

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext)
  if (!context) throw new Error('useStaffAuth must be used inside a StaffAuthProvider')
  return context
}
