# Sugarloop / Roots International — Session Handoff

Project: Vite + React marketing site in `D:\roots-international`, matching Figma designs and sample images.
GitHub repo: https://github.com/bilal499-droid1/sugarloop-frontend (already pushed, remote `origin/main` configured).

## Standing directives (apply to ALL future work)
- **Make the app mobile responsive using Tailwind CSS.** Install any needed library, just ask first. This directive is still open — no mobile CSS has been implemented yet.
- **Never crop images.** When using `object-fit: cover` on an image, always look up the source image's *exact native pixel dimensions* (PowerShell: `[System.Drawing.Image]::FromFile(path).Size`) and set the CSS `aspect-ratio` to exactly that ratio. Estimated/rounded ratios (e.g. `3/4` when the real ratio is `601/888`) still crop and the user has corrected this twice — don't repeat it.
- Confirm with the user before `git push` unless they've given explicit inline permission in that same turn.
- Dev server: `npm run dev` — port drifts across restarts (5173/5174/5175) because old processes sometimes linger. Check `Get-NetTCPConnection` (PowerShell tool, not Bash/git-bash — `$_` gets mangled there) to find/kill stray listeners.

## Completed so far
- **Hero.jsx/css**: Fixed logo (`src/assets/sugarLoop 1.png`) import/placement before "Home" in nav; nav centered at top of hero (`justify-content: space-between`, removed extra bottom margin).
- **DrinksStrip.jsx/css**: 4 placeholder images now use `src/assets/Rectangle 910.png` (native 480×1042); `aspect-ratio: 480/1042` so nothing is cropped.
- **About.jsx/css**: Text and image columns swapped (text now left/first, image right/second); image is `src/assets/about.jpg`; grid `align-items: start` so image top aligns with "ABOUT US" heading top.
- **MenuCarousel.jsx/css**: Reverted to grid-based 3-card layout (not coverflow). All three cards use `src/assets/Rectangle 1025.png` (native 601×888), `aspect-ratio: 601/888` to avoid cropping. Labels rendered via CSS (`.menu-carousel__label`), not baked into image.
- **Footer.jsx/css**: Fixed Instagram/LinkedIn icons via `react-icons/fa` (`FaInstagram`, `FaLinkedin`), positioned far right; Sugarloop logo (`src/assets/sugarLoop 1.png`) positioned far left. `react-icons` added to `package.json`.
- `.gitignore` created (`node_modules/`, `dist/`, `.vite/`, `*.log`, `.DS_Store`).
- All above pushed to `origin/main` on the GitHub repo.

## In progress / not yet done
**Mobile responsiveness** — currently being researched, no code changes made yet.
- User provided Figma link: `https://www.figma.com/design/xUneNwNBlRg0Kw0eGEcJbw/Roots-International?node-id=2779-6184&t=DwwyEPjI7lQonDfh-0`
- That node-id (`2779-6184`) is just an image asset ("Rectangle 1069", a pastry photo) — NOT the mobile layout frame. Don't refetch it expecting a page layout.
- The actual mobile design frame was located by searching Figma metadata for unique site copy ("TASTE THE LOOP"): **frame `2819:6527`, named "iPhone 14 & 15 Pro - 1"**, fileKey `xUneNwNBlRg0Kw0eGEcJbw`, position x=81984 y=7036, size 393×3141. Use this node ID directly with `get_design_context` / `get_screenshot` next time instead of re-deriving it.
- User also asked to reference `src/assets/sample3.png` (a 116×887px mobile mockup thumbnail — low-res but shows overall section order: header/nav, hero, about, drinks strip, menu, footer).
- A `get_screenshot` call for node `2819:6527` had succeeded and returned a short-lived asset URL, but the download/view of that screenshot was never completed (interrupted). **Next step in a new session: re-run `get_screenshot` (or `get_design_context`) for fileKey `xUneNwNBlRg0Kw0eGEcJbw`, node `2819:6527` fresh — the previous asset URL will have expired.**
- Figma file metadata is huge (1.6M+ chars) — if `get_metadata` is needed again, don't grep the raw dump with Bash (unreliable on giant single-line JSON); instead save to a temp file and parse with `node -e '...JSON.parse...'` and string search.

## Next steps for a new session
1. Fetch fresh Figma screenshot/design context for node `2819:6527` (mobile frame) to get exact mobile spacing/typography/breakpoints.
2. Cross-reference with `assets/sample3.png`.
3. Implement Tailwind-based responsive breakpoints across `Hero`, `About`, `DrinksStrip`, `MenuCarousel`, `Footer`, and `App.jsx`.
4. Test in browser at mobile viewport widths before considering done.
5. Confirm with user before pushing to GitHub.
