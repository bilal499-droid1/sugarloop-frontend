import { useCallback, useEffect, useRef, useState } from 'react'
import { requestOtp, verifyOtp } from '../../lib/api'
import { describeOtpError, formatWait } from '../../lib/otp'

/**
 * Proving the customer holds the email address they are ordering under.
 *
 * This used to verify the mobile number, and that was the only thing standing between
 * the shop and a prank Cash-on-Delivery order: nobody has paid anything at this point,
 * so the callback number is the entire handle the branch has on whoever placed it, and
 * proving it made a prank cost the prankster a real, reachable SIM.
 *
 * It verifies the email address instead now, because the WhatsApp sender is still
 * waiting on Meta while email needed nothing but an app password. A throwaway inbox is
 * free, so this is a genuine reduction in what the step buys — the number is still
 * collected and still what the branch rings, it is simply no longer proven.
 *
 * Two states, deliberately not two pages — losing the cart to a navigation in the middle
 * of verification would be a worse failure than any this step prevents.
 */

const CODE_LENGTH = 6

/** A live countdown in seconds, driven by a target timestamp rather than a decrement.
 *  A tab that sleeps stops firing intervals; comparing against a deadline means it comes
 *  back correct instead of frozen at whatever it reached. */
function useCountdown(until) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!until) return setRemaining(0)

    const tick = () => setRemaining(Math.max(0, Math.ceil((until - Date.now()) / 1000)))
    tick()

    const timer = setInterval(tick, 500)
    return () => clearInterval(timer)
  }, [until])

  return remaining
}

const inputClass =
  'w-full h-11 px-3 rounded-lg border border-border-light bg-white font-display text-sm text-black outline-none focus:border-accent'

function Notice({ title, detail }) {
  return (
    <div
      className="mb-3 rounded-xl border border-[#f0c8c2] bg-[#fdf3f1] px-4 py-3 text-[#8c2f1d]"
      role="status"
    >
      <p className="m-0 font-display font-bold text-xs">{title}</p>
      {detail && <p className="mt-1 mb-0 text-[0.75rem] leading-snug">{detail}</p>}
    </div>
  )
}

export default function EmailVerification({ email, canSend = true, onVerified }) {
  const [step, setStep] = useState('idle') // idle → sent
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [resendAt, setResendAt] = useState(null)
  const [devCode, setDevCode] = useState(null)

  const resendIn = useCountdown(resendAt)
  const codeRef = useRef(null)

  // Changing the address invalidates a code sent to the old one, so the step resets
  // rather than leaving a code box that silently belongs to a different inbox.
  useEffect(() => {
    setStep('idle')
    setCode('')
    setError(null)
    setDevCode(null)
  }, [email])

  const send = useCallback(async () => {
    if (busy || !canSend) return
    setBusy(true)
    setError(null)

    try {
      const result = await requestOtp(email)
      setStep('sent')
      setCode('')
      setResendAt(Date.now() + (result.resendInSeconds ?? 60) * 1000)
      // Present only when the server is not actually sending anything (dev transport).
      setDevCode(result.devCode ?? null)
      requestAnimationFrame(() => codeRef.current?.focus())
    } catch (caught) {
      const described = describeOtpError(caught)
      setError(described)
      if (described.retryAfterSeconds) {
        setResendAt(Date.now() + described.retryAfterSeconds * 1000)
        // A cooldown means a code IS already out there — show the box so they can use it
        // rather than stranding them on a button they cannot press.
        if (caught.code === 'OTP_COOLDOWN') setStep('sent')
      }
    } finally {
      setBusy(false)
    }
  }, [busy, canSend, email])

  const submit = useCallback(
    async (value) => {
      if (busy || value.length !== CODE_LENGTH) return
      setBusy(true)
      setError(null)

      try {
        await verifyOtp({ email, code: value })
        onVerified(email)
      } catch (caught) {
        const described = describeOtpError(caught)
        setError(described)
        setCode('')
        // A burned challenge can never accept another guess, so go back to requesting one.
        if (described.requiresNewCode) setStep('idle')
        else requestAnimationFrame(() => codeRef.current?.focus())
      } finally {
        setBusy(false)
      }
    },
    [busy, email, onVerified]
  )

  /**
   * Digits only, capped at the code length. It used to fire `submit` the instant a sixth
   * digit landed; it does not any more. Auto-submitting took the decision away — a typo
   * spent an attempt before you could look at what you had typed, and there are only five
   * of those before the challenge is burned. Verify is a button you press.
   */
  const onCodeChange = (event) => {
    setCode(event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
  }

  /**
   * Enter submits the code, not the order.
   *
   * This input sits inside the checkout page's own `<form>`, so without the
   * `preventDefault` an Enter here would bubble up and fire the place-order handler —
   * which mattered far less while the sixth digit auto-submitted, and matters a lot now
   * that pressing something is the only way through.
   */
  const onCodeKeyDown = (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submit(code)
  }

  return (
    <div className="mb-4 bg-white rounded-2xl border border-[#ececec] p-5">
      <h2 className="mt-0 mb-1 font-display font-bold text-base text-black">
        Verify your email
      </h2>
      {/* Three states, because this card is on screen from the start now — including
          before there is an address to name. Saying "we will send a code to " with
          nothing after it reads as a bug. */}
      <p className="mt-0 mb-4 text-xs text-text-body">
        {step === 'sent'
          ? `Enter the ${CODE_LENGTH}-digit code we sent to ${email}.`
          : canSend
            ? `We will send a ${CODE_LENGTH}-digit code to ${email} to confirm it is yours.`
            : `Enter your email above and we will send a ${CODE_LENGTH}-digit code to confirm it is yours.`}
      </p>

      {/* Spam is the one failure this step has that the old SMS flow did not: a first
          message from an address the customer has never had mail from is exactly what
          filters hold back. Said before they sit waiting on an empty inbox, not after. */}
      {devCode === null && step === 'sent' && (
        <p className="mt-0 mb-3 text-[0.7rem] text-text-body">
          Not arriving? Check your spam folder — it can take a minute.
        </p>
      )}

      {error && <Notice title={error.title} detail={error.detail} />}

      {/* Development only: the API echoes the code because nothing is actually sending
          it. Impossible in production — the server refuses to boot with that transport. */}
      {devCode && (
        <div
          className="mb-3 rounded-xl border border-[#cfe0ef] bg-[#f2f8fd] px-4 py-3 text-[#1d5480]"
          role="status"
        >
          <p className="m-0 font-display font-bold text-xs">Development mode</p>
          <p className="mt-1 mb-0 text-[0.75rem]">
            No message was sent. Your code is <strong className="font-price">{devCode}</strong>.
          </p>
        </div>
      )}

      {step === 'sent' ? (
        <>
          <input
            ref={codeRef}
            className={`${inputClass} tracking-[0.5em] text-center font-price text-lg`}
            value={code}
            onChange={onCodeChange}
            onKeyDown={onCodeKeyDown}
            placeholder="······"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            disabled={busy}
            aria-label="Verification code"
          />

          <div className="flex items-center justify-between gap-3 mt-3">
            <button
              type="button"
              onClick={send}
              disabled={busy || resendIn > 0}
              className={`text-xs font-display font-bold bg-none border-none p-0 ${
                busy || resendIn > 0 ? 'text-[#b6bfc7] cursor-not-allowed' : 'text-accent cursor-pointer'
              }`}
            >
              {/* Seconds while it is a short wait, words once it is long — a button
                  counting down from 3180s reads as broken, not throttled. */}
              {resendIn > 0
                ? resendIn <= 90
                  ? `Resend in ${resendIn}s`
                  : `Resend in ${formatWait(resendIn)}`
                : 'Resend code'}
            </button>

            <button
              type="button"
              onClick={() => submit(code)}
              disabled={busy || code.length !== CODE_LENGTH}
              className={`h-10 px-5 rounded-lg font-display font-bold text-sm ${
                busy || code.length !== CODE_LENGTH
                  ? 'bg-accent/40 text-white cursor-not-allowed'
                  : 'bg-accent text-white cursor-pointer'
              }`}
            >
              {busy ? 'Checking…' : 'Verify'}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={busy || resendIn > 0 || !canSend}
          className={`w-full h-11 rounded-lg font-display font-bold text-sm ${
            busy || resendIn > 0 || !canSend
              ? 'bg-accent/40 text-white cursor-not-allowed'
              : 'bg-accent text-white cursor-pointer'
          }`}
        >
          {busy
            ? 'Sending…'
            : resendIn > 0
              ? `Try again in ${resendIn <= 90 ? `${resendIn}s` : formatWait(resendIn)}`
              : 'Send verification code'}
        </button>
      )}
    </div>
  )
}
