import { useCallback, useEffect, useRef, useState } from 'react'
import { requestOtp, verifyOtp } from '../../lib/api'
import { describeOtpError, formatWait } from '../../lib/otp'

/**
 * Proving the customer holds the number they are ordering under.
 *
 * This is the only thing standing between the shop and a prank Cash-on-Delivery order:
 * nobody has paid anything at this point, so the callback number is the entire handle the
 * branch has on whoever placed it. Verifying it makes a prank cost the prankster a real,
 * reachable number.
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

export default function PhoneVerification({ phone, onVerified }) {
  const [step, setStep] = useState('idle') // idle → sent
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [resendAt, setResendAt] = useState(null)
  const [devCode, setDevCode] = useState(null)

  const resendIn = useCountdown(resendAt)
  const codeRef = useRef(null)

  // Changing the number invalidates a code sent to the old one, so the step resets rather
  // than leaving a code box that silently belongs to a different phone.
  useEffect(() => {
    setStep('idle')
    setCode('')
    setError(null)
    setDevCode(null)
  }, [phone])

  const send = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      const result = await requestOtp(phone)
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
  }, [busy, phone])

  const submit = useCallback(
    async (value) => {
      if (busy || value.length !== CODE_LENGTH) return
      setBusy(true)
      setError(null)

      try {
        await verifyOtp({ phone, code: value })
        onVerified(phone)
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
    [busy, phone, onVerified]
  )

  /** Auto-submits on the sixth digit — nobody wants to type a code and then hunt for a
   *  button, and the length is fixed so there is nothing ambiguous about when it is done. */
  const onCodeChange = (event) => {
    const next = event.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(next)
    if (next.length === CODE_LENGTH) submit(next)
  }

  return (
    <div className="mb-4 bg-white rounded-2xl border border-[#ececec] p-5">
      <h2 className="mt-0 mb-1 font-display font-bold text-base text-black">
        Verify your number
      </h2>
      <p className="mt-0 mb-4 text-xs text-text-body">
        {step === 'sent'
          ? `Enter the ${CODE_LENGTH}-digit code we sent to ${phone}.`
          : `We will send a ${CODE_LENGTH}-digit code to ${phone} to confirm it is yours.`}
      </p>

      {/* The single most confusing thing about this build: no WhatsApp or SMS account
          exists yet, so NOTHING arrives on a real handset. Said before the customer
          waits for a message that is never coming, not after. */}
      {devCode === null && step === 'sent' && (
        <p className="mt-0 mb-3 text-[0.7rem] text-text-body">
          Not arriving? Message delivery is not switched on in this build.
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
          disabled={busy || resendIn > 0}
          className={`w-full h-11 rounded-lg font-display font-bold text-sm ${
            busy || resendIn > 0
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
