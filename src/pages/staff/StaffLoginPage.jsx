import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import SugarLoopMark from '../../components/SugarLoopMark'
import { useStaffAuth } from '../../context/StaffAuthContext'
import { isApiConfigured } from '../../lib/api'

export default function StaffLoginPage() {
  const { status, login } = useStaffAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in — a bookmark or a back-button to /staff/login shouldn't ask
  // twice. Sends the operator to wherever RequireStaffAuth caught them, or /staff/orders.
  if (status === 'signedIn') {
    return <Navigate to={location.state?.from?.pathname ?? '/staff/orders'} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname ?? '/staff/orders', { replace: true })
    } catch (err) {
      // Deliberately one message regardless of whether the email or the password was
      // wrong — telling them apart lets an attacker enumerate valid staff emails.
      setError(
        err?.code === 'UNAUTHORIZED' || err?.status === 401
          ? 'Incorrect email or password.'
          : err?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f9] px-5">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <SugarLoopMark className="h-16 w-auto aspect-[432/288]" />
        </div>

        <div className="bg-white border border-border-light rounded-2xl p-6 lg:p-8">
          <h1 className="m-0 mb-1 font-display font-bold text-xl text-black">Staff sign in</h1>
          <p className="m-0 mb-6 text-sm text-text-body">
            For branch managers and admin. Customers order from the storefront — there's
            nothing here for them.
          </p>

          {!isApiConfigured && (
            <p className="mb-4 px-3 py-2 rounded-lg bg-[#fff4e5] text-xs text-[#8a5a00]">
              No API is configured for this build (VITE_API_BASE_URL is empty), so sign-in
              cannot reach a server.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-display font-medium text-xs text-text-body">Email</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 px-3 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
                placeholder="you@sugarloop.pk"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-display font-medium text-xs text-text-body">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-3 rounded-lg border border-border-light font-display text-sm text-black outline-none focus:border-accent"
                placeholder="••••••••••••"
              />
            </label>

            {error && (
              <p role="alert" className="m-0 text-xs text-[#c0392b]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 mt-2 bg-accent text-white border-none rounded-lg font-display font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
