// Cloudinary, so the masters no longer have to survive the Vite bundle. The local
// copies were squeezed to ~0.4 Mbps to keep the deploy shippable, which is what
// made them look soft. Full 1080p at q_auto:best is ~2.17 Mbps, roughly 5x that -
// more than the ~480px render width strictly needs, but it is the sharpest
// setting short of shipping the 55 Mbps camera master.
const CLOUD = 'https://res.cloudinary.com/djyjxr18v/video/upload'
const cloudVideo = (id) => `${CLOUD}/q_auto:best,w_1080,c_limit,f_auto:video/${id}.mp4`
// so_0 grabs frame 0, so the tile shows the first frame instead of black while the
// video buffers.
const cloudPoster = (id) => `${CLOUD}/so_0,w_1080,c_limit,q_auto:best/${id}.jpg`

const PUBLIC_IDS = {
  pm1: 'v1785405201/pm1_ezowug',
  pm2: 'v1785404953/pm2_jjbxzj',
  pm3: 'v1785404914/pm3_ket48g',
  pm5: 'v1785404998/pm5_fjsiy6',
}

// onMobile: below sm the grid is 2 columns, so only these two show and the strip
// stays a single row. All four appear from sm up.
const DRINKS = [
  { id: PUBLIC_IDS.pm1, onMobile: false },
  { id: PUBLIC_IDS.pm2, onMobile: true },
  { id: PUBLIC_IDS.pm3, onMobile: false },
  { id: PUBLIC_IDS.pm5, onMobile: true },
].map((drink) => ({ ...drink, src: cloudVideo(drink.id), poster: cloudPoster(drink.id) }))

export default function DrinksStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 leading-[0]" aria-label="Featured drinks">
      {DRINKS.map((drink, i) => (
        <div
          className={`aspect-[480/1042] overflow-hidden ${drink.onMobile ? '' : 'hidden sm:block'}`}
          key={i}
        >
          {/* muted + playsInline are what allow autoplay on mobile Safari and Chrome */}
          <video
            src={drink.src}
            poster={drink.poster}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  )
}
