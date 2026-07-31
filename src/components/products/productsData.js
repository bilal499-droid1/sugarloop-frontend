// Catalogue transcribed from the printed menu board (src/assets/category/look.jpg).
// Menu sections map onto the site's four categories like this:
//   DONUTS (Signature + Classic)            -> Donuts
//   FRESH BAKES                             -> Croissants
//   SANDWICHES                              -> Sandwiches
//   FRAPPES + BEVERAGES + COFFEES           -> Drinks
// `type` keeps the menu's own sub-heading so the grouping isn't lost.
// Items with no photo in src/assets/category yet simply omit `images`; ProductCard
// renders a neutral placeholder tile for those.
// Each product carries an `images` array (shot 1 first). `image` is derived from
// `images[0]` for the grid/card views; the detail page scrolls through the rest.
import chocoholic1 from '../../assets/category/chocoholic 1.webp'
import chocoholic3 from '../../assets/category/chcoholic 3.webp'
import lotus1 from '../../assets/category/lotus 1.webp'
import lotus3 from '../../assets/category/lotus 3.webp'
import nutella2 from '../../assets/category/nutella 2.webp'
import nutella3 from '../../assets/category/nutella 3.webp'
import coffeeDonut1 from '../../assets/category/coffee 1.webp'
import coffeeDonut2 from '../../assets/category/coffee 2.webp'
import saltedCaramel1 from '../../assets/category/salted caramel 1.webp'
import saltedCaramel3 from '../../assets/category/salted caramel 3.webp'
import bostonCreme1 from '../../assets/category/boston creme 1.webp'
import bostonCreme2 from '../../assets/category/boston creme 2.webp'
import bostonCreme3 from '../../assets/category/boston creme 3.webp'
import butterCream1 from '../../assets/category/butter cream 1.webp'
import butterCream2 from '../../assets/category/butter cream 2.webp'
import mixBerry1 from '../../assets/category/mix berry 1.webp'
import mixBerry2 from '../../assets/category/mix berry 2.webp'
import mixBerry3 from '../../assets/category/mix berry 3.webp'
import brownieFilled2 from '../../assets/category/brownie filled 2.webp'
import mango1 from '../../assets/category/mango 1.webp'
import mango2 from '../../assets/category/mango 2.webp'
import classicOreo1 from '../../assets/category/classic oreo 1.webp'
import classicOreo2 from '../../assets/category/classic oreo 2.webp'
import chocolateSprinkle1 from '../../assets/category/chocolate sprinkle 1.webp'
import chocolateSprinkle2 from '../../assets/category/chocolate sprinkle 2.webp'
import classicChocolate2 from '../../assets/category/classic chocolate 2.webp'
import whiteChocolate1 from '../../assets/category/white chocolate 1.webp'
import whiteChocolate2 from '../../assets/category/whitechocolate 2.webp'
import vanillaGlazed1 from '../../assets/category/vanilla glazed 1.webp'
import vanillaGlazed2 from '../../assets/category/vanilla glazed 2.webp'
import chocolateGlazed1 from '../../assets/category/chocolate glazed 1.webp'
import chocolateGlazed2 from '../../assets/category/chocolate glazed 2.webp'
import chocolateCroissant1 from '../../assets/category/chocolate croissant 1.webp'
import chocolateCroissant2 from '../../assets/category/chocolate croissant 2.webp'
import chocolateCroissant3 from '../../assets/category/chocolate croissant 3 (2).webp'
import butterCreamCroissant1 from '../../assets/category/butter cream croissant 1.webp'
import butterCreamCroissant2 from '../../assets/category/buttercream croissant 2.webp'
import butterCroissant1 from '../../assets/category/butter croissant 1.webp'
import bakedCinnamon1 from '../../assets/category/baked cinnamo 1.webp'
import bakedCinnamon2 from '../../assets/category/baked cinnamon 2.webp'
import signatureChicken1 from '../../assets/category/signature chicken 1.webp'
import smokedTikka1 from '../../assets/category/tikka sandwich 1.webp'
import smokedTikka2 from '../../assets/category/tikka sandwich 2.webp'
// Note: 'iced cappuccino 1.jpg' and 'iced latte 2.jpg' are corrupt on disk
// (all-0xFF filler, no JPEG data) so they aren't imported.
import sizzlingFajita1 from '../../assets/category/fajita sandwich 1.webp'
import sizzlingFajita2 from '../../assets/category/fajita sandwich 2.webp'
import passionFruit1 from '../../assets/category/passion fruit chiller 1.webp'
import passionFruit2 from '../../assets/category/passion fruit chiller 2.webp'
import wildBerry1 from '../../assets/category/wild berry chiller 1.webp'
// Supplied as 2:3 portraits, square-cropped from the top so they fill the gallery
// frame edge to edge like the other chiller shots instead of sitting in bars.
import wildBerry2 from '../../assets/category/wild berry chiller 2.webp'
// Was a 2:3 portrait shown whole, which left it in bars while the square shots
// beside it filled the frame. Cropped square about the centre - the glass sits
// mid-frame, so that keeps it from rim to base where a top crop cut the base off.
import strawberryChillerSc from '../../assets/sssc1.webp'
import strawberryChiller2 from '../../assets/category/strawberry chiller 2.webp'
import cappuccinoImg from '../../assets/category/cappuccino.webp'
import latteImg from '../../assets/category/latte.webp'
import spanishLatteImg from '../../assets/category/spanish latte.webp'
import caramelLatteImg from '../../assets/category/caramel latte.webp'
import icedCappuccino2 from '../../assets/category/iced cappuccino 2.webp'
import icedLatte1 from '../../assets/category/iced latte 1.webp'
import icedCaramelLatte1 from '../../assets/category/iced caramel latte 1.webp'
import icedSpanishLatte1 from '../../assets/category/iced spanish latte 1.webp'
// Frappe studio shots live in src/assets (not category/), square 2194x2194 on white.
import caramelFrappe1 from '../../assets/caramel.webp'
import cookiesCreamFrappe1 from '../../assets/Cookies&Cream.webp'
import hazelnutFrappe1 from '../../assets/Hazlenut.webp'
import doubleChocolateFrappe1 from '../../assets/DoubleChocolate.webp'
import mochaFrappe1 from '../../assets/Mocha.webp'

export const CATEGORIES = ['Croissants', 'Donuts', 'Drinks', 'Sandwiches']

const DESCRIPTION =
  'Baked fresh every morning with simple, honest ingredients. Best enjoyed the same day, alongside your favorite coffee.'

const DRINK_DESCRIPTION =
  'Made to order with freshly pulled espresso and whole milk. Tell us if you would like it lighter, sweeter, or extra cold.'

const REVIEWS = [
  { name: 'Amara Okafor', rating: 5, text: 'Genuinely one of the best bakes I\'ve had in the city. Will be back for more.' },
  { name: 'Daniyal Raza', rating: 4, text: 'Really good flavor and texture, still fresh even a few hours after pickup.' },
]

const withPrimaryImage = (products) =>
  products.map((product) => ({ ...product, image: product.images?.[0] }))

export const PRODUCTS = withPrimaryImage([
  // ---- Donuts / Signature (299) ----
  { id: 1, name: 'Chocoholic', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [chocoholic1, chocoholic3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 2, name: 'Lotus', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [lotus1, lotus3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 3, name: 'Nutella', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [nutella2, nutella3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 4, name: 'Coffee', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [coffeeDonut1, coffeeDonut2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 5, name: 'Salted Caramel', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [saltedCaramel1, saltedCaramel3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 6, name: 'Boston Creme', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [bostonCreme1, bostonCreme2, bostonCreme3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 7, name: 'Butter Cream', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [butterCream1, butterCream2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 8, name: 'Mix Berry', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [mixBerry1, mixBerry2, mixBerry3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 9, name: 'Brownie Filled', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [brownieFilled2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 10, name: 'Mango', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [mango1, mango2], description: DESCRIPTION, reviews: REVIEWS },

  // ---- Donuts / Classic ----
  { id: 12, name: 'Classic Oreo', price: 185, category: 'Donuts', type: 'Classic', size: 'sm', images: [classicOreo1, classicOreo2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 13, name: 'Chocolate Sprinkle', price: 185, category: 'Donuts', type: 'Classic', size: 'sm', images: [chocolateSprinkle1, chocolateSprinkle2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 14, name: 'Classic Chocolate', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [classicChocolate2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 15, name: 'White Chocolate', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [whiteChocolate1, whiteChocolate2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 16, name: 'Chocolate Glazed', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [chocolateGlazed1, chocolateGlazed2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 17, name: 'Vanilla Glazed', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [vanillaGlazed1, vanillaGlazed2], description: DESCRIPTION, reviews: REVIEWS },

  // ---- Fresh Bakes ----
  { id: 18, name: 'Chocolate Croissant', price: 379, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [chocolateCroissant1, chocolateCroissant2, chocolateCroissant3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 19, name: 'Butter Cream Croissant', price: 370, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [butterCreamCroissant1, butterCreamCroissant2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 20, name: 'Butter Croissant', price: 299, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [butterCroissant1], description: DESCRIPTION, reviews: REVIEWS },
  { id: 21, name: 'Baked Cinnamon', price: 299, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [bakedCinnamon1, bakedCinnamon2], description: DESCRIPTION, reviews: REVIEWS },

  // ---- Sandwiches ----
  { id: 22, name: 'Signature Chicken', price: 349, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [signatureChicken1], description: DESCRIPTION, reviews: REVIEWS },
  { id: 24, name: 'Smoked Tikka Melt', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [smokedTikka1, smokedTikka2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 25, name: 'Sizzling Fajita', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [sizzlingFajita1, sizzlingFajita2], description: DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Hot Coffee ----
  { id: 27, name: 'Cappuccino', price: 499, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [cappuccinoImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 28, name: 'Latte', price: 499, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [latteImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 29, name: 'Spanish Latte', price: 599, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [spanishLatteImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 30, name: 'Caramel Latte', price: 599, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [caramelLatteImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Iced Coffee ----
  { id: 31, name: 'Iced Cappuccino', price: 599, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedCappuccino2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 32, name: 'Iced Latte', price: 599, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedLatte1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 33, name: 'Iced Spanish Latte', price: 699, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedSpanishLatte1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 34, name: 'Iced Caramel Latte', price: 699, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedCaramelLatte1], description: DRINK_DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Frappes (Blended Iced, 799) ----
  { id: 35, name: 'Caramel Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [caramelFrappe1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 36, name: 'Cookies & Cream Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [cookiesCreamFrappe1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 37, name: 'Hazelnut Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [hazelnutFrappe1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 38, name: 'Double Chocolate Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [doubleChocolateFrappe1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 39, name: 'Mocha Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [mochaFrappe1], description: DRINK_DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Chillers + Extras ----
  { id: 40, name: 'Passion Fruit Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [passionFruit1, passionFruit2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 41, name: 'Wild Berry Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [wildBerry1, wildBerry2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 42, name: 'Strawberry Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [strawberryChillerSc, strawberryChiller2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 43, name: 'Water', price: 120, category: 'Drinks', type: 'Extras', size: 'sm', description: 'Chilled bottled water.', reviews: REVIEWS },
])
