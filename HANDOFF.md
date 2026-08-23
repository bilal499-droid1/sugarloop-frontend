# Sugarloop — Frontend Handoff

Vite + React storefront **and** staff console for Sugarloop, a Cash-on-Delivery donut
shop with four branches in Islamabad.

| | |
|---|---|
| This repo | `D:\roots-international` → https://github.com/bilal499-droid1/sugarloop-frontend |
| Backend | `D:\sugarloop-backend` → https://github.com/bilal499-droid1/sugarloop-backend |
| Hosting | none — not deployed (`vercel.json` is left from an earlier plan; see below) |

⚠️ **This repository is public.** Client planning material (`BACKEND-*.md`) is gitignored
and must stay that way. Nothing with a credential, a client phone number or a price
negotiation goes in a tracked file.

---

## Standing directives — apply to all future work

- **Never crop images.** With `object-fit: cover`, look up the source image's *exact*
  native pixel dimensions (PowerShell: `[System.Drawing.Image]::FromFile(path).Size`) and
  set CSS `aspect-ratio` to exactly that ratio. Rounded ratios (`3/4` when the real one is
  `601/888`) still crop, and this has been corrected twice.
- **Confirm before `git push`** unless permission was given inline in the same turn.
- **Tailwind only** — there are no `.css` files per component. `src/tokens.css` holds the
  theme (`accent`, `text-body`, `border-light`, `bg-section`, `font-display`, `font-price`);
  use those tokens rather than re-typing hexes.
- **The browser never sends a price.** It sends `{ productId, qty }` and renders whatever
  the server says things cost. Any code path that computes a total locally is a bug.
- Dev server: `npm run dev`. The port drifts (5173/5174/5175) when old processes linger —
  find them with `Get-NetTCPConnection` via the **PowerShell** tool, not Bash (`$_` gets
  mangled in git-bash).

---

## Running the whole thing locally

```powershell
# 1. backend  (D:\sugarloop-backend)
npm run seed        # 4 branches, 43 products, 172 stock rows, 5 staff — prints a password once
npm run dev         # http://localhost:4000

# 2. frontend (D:\roots-international)
cp .env.example .env.local     # VITE_API_BASE_URL=http://localhost:4000/api/v1
npm run dev
```

`VITE_API_BASE_URL` is **inlined at build time** — changing it needs a restart of Vite, and
a rebuild if it ever ships. Leaving it **empty** is a supported mode: every API call
short-circuits and the site runs entirely off the bundled catalogue, which is how a preview
build with no backend behaves.

The backend's `CORS_ORIGINS` must list the dev origin (`http://localhost:5173`) or the
browser blocks calls before they reach a route.

Staff sign-in for local work: `admin@sugarloop.pk` / the password `npm run seed` printed.
Branch managers are `dha1.manager@`, `dha2.manager@`, `bahria4.manager@`, `nust.manager@`.

---

## How the app is put together

```
src/
  lib/
    api.js            storefront client — anonymous, one envelope unwrap, 8s/20s timeouts
    staffApi.js       staff client — Bearer token in MEMORY, refresh-cookie loop, one
                      in-flight refresh shared by all callers
    catalogue.js      merges API products onto the bundled ones by `legacyId`
    checkout.js       cart → quote request shape, plus error-code → human copy
    geocode.js        browser geolocation; the actual geocoding is server-side
    otp.js            phone normalisation + OTP error copy
  context/
    BranchContext     which branch the visitor is shopping (stock is per branch)
    CatalogueContext  the merged menu — branch-scoped, so it sits inside BranchContext
    CartContext       localStorage cart of intent — ids and quantities, never prices
    StaffAuthContext  the console's session; 'checking' → 'signedIn' | 'signedOut'
  components/
    home/ products/ productDetail/   the storefront
    checkout/PhoneVerification.jsx   the OTP step
    staff/                           console shell, auth gate, order panel, badges
  pages/
    storefront pages + staff/ (login, orders, stock)
```

Provider order in `App.jsx` is deliberate: **branch → catalogue → cart**. The catalogue
fetch is branch-scoped, and the cart re-reads names and prices off the catalogue.

`StaffAuthProvider` wraps only the `/staff/*` subtree, and `staffApi.js` is a separate
module from `api.js` on purpose: a bug in the customer cart must not be able to reach an
order board, and nothing on the public site should be able to import a credentialed client.

### Two clients, two credentials

| | storefront (`api.js`) | staff console (`staffApi.js`) |
|---|---|---|
| Credential | OTP session, httpOnly cookie, 4 days | access token in memory (15 min) + refresh cookie (7 days) |
| Sent on | only the endpoints that need it (`withSession`) | every call, as `Authorization: Bearer` |
| Survives reload | yes — cookie | yes — `bootstrap()` trades the cookie for a new access token |
| Never in localStorage | — | **never**; a token there is one XSS from being someone else's |

---

## What works today

- **Storefront on live data** — catalogue, branches, per-branch stock, with the bundled
  `productsData.js` as both the photography source (the API seeds `images: []`) and the
  offline fallback.
- **Checkout** — cart → server quote → address (typed *or* location pin, geocoded
  server-side) → phone OTP → place order → `/order/:orderNumber` tracking.
- **Staff console at `/staff`** — login, order board with per-order legal transitions, the
  fail-reason form, per-branch stock toggles, an admin-only **Team** screen (add, edit,
  reset password, switch off/on), an admin-only **Enquiries** inbox for corporate gifting
  leads, and **Account**, where any staff member changes their own password.
- **Corporate gifting posts for real** — the form submits to `POST /enquiries`, which
  stores the lead and emails the shop. It used to build a `mailto:` draft the visitor had
  to send themselves, which silently did nothing on any device without a configured mail
  client.
- **Mobile** — done. The site is responsive via `clamp()` sizing and `max-[900px]:`
  variants; the old "no mobile CSS yet" directive is closed.
- **The FAQ question form submits for real.** It posts to `POST /enquiries` as
  `kind: 'question'` and comes back with a reference. It used to set a local flag, say
  "we'll get back to you shortly" and send nothing anywhere — and it had no name or email
  field, so there was no address to reply to even in principle. It now takes both, because
  an answer needs somewhere to go. The phone is optional on this kind, server-side.
- **Products screen in the console** — admin-only catalogue management: create, edit,
  discontinue and put back. Closes the gap where changing a price meant a developer
  editing a seed file and re-running it. ⚠️ The price box is in **rupees** and the request
  is in **paisa**; `toPaisa` in `lib/staffApi.js` is the only place that conversion is
  allowed to happen, and it is unit-tested — getting it backwards does not throw, it just
  prices a donut at Rs 2.99.
- **Lint and tests exist.** `npm run check` is lint + tests, matching the backend.

## What is not built

- **Product images from the API.** Blocked on moving Cloudinary to a client-owned account;
  until then the bundle owns the photography and `legacyId` is the join.

## Blocked on the client, not on code

These are the same items the backend README lists, and they gate launch:

1. **No message is actually delivered.** The backend runs `OTP_TRANSPORT=log` and
   `NOTIFY_TRANSPORT=log`, and refuses to boot in production on either. WhatsApp needs the
   client's Meta Business account plus per-template approval (1–3 days each, ×7
   templates). Calendar time — start it now.
2. **Geocoding is on OpenStreetMap.** It resolves areas but not individual buildings, so
   some customers will be told their address cannot be found and pushed to the location
   button. A Maps key is a two-line change in the backend's `.env`.

⚠️ **Not deployed, and not being deployed for now.** `vercel.json` is here from an earlier
plan and is harmless, but there is deliberately no CI and no hosting config — that is a
decision, not an omission, so please don't add any. `npm run check` is the gate.

---

## Lint and tests

```bash
npm run lint          # eslint
npm test              # vitest, jsdom
npm run test:watch
npm run check         # both — run before every commit; there is no CI
```

Tests are co-located as `*.test.{js,jsx}`, matching the backend's convention.

Two config decisions worth knowing, both in `eslint.config.js`:

- **`react/jsx-uses-vars` is on.** Without it `no-unused-vars` cannot see a component
  that is only referenced from JSX, and reports every imported component in the codebase
  as unused — 180 false positives, which is how a team learns to ignore its linter in an
  afternoon.
- **`react-hooks/set-state-in-effect` is off.** It objects to `setLoading(true)` inside
  the effect that starts a fetch, which is the pattern every data-fetching screen here
  uses. Satisfying it means rewriting every page for a performance opinion, not a bug —
  the cascading render it warns about is one extra render on mount. Worth revisiting if
  this codebase adopts the React Compiler.

The four remaining `react-refresh/only-export-components` warnings are the context files
exporting both a provider and its hook. That is deliberate, and the rule is about
fast-refresh ergonomics rather than correctness — left as warnings rather than silenced,
so the count stays visible if it grows.

## Conventions worth matching

- Comments explain **why**, not what. The existing files in `lib/` are the reference —
  match that density rather than the average React codebase's.
- Every API failure the customer can act on gets its own copy, keyed off `error.code`
  (see `describeCheckoutError` in `checkout.js`). Never surface a raw HTTP status.
- Loading states never blank a list that already has content — a bakery site showing an
  empty menu because a server blipped is worse than one showing a slightly stale one.
- List pagination is **cursor**-based (`meta.nextCursor`), because the underlying lists
  change under the reader.
