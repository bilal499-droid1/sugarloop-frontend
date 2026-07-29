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
import chocoholic1 from '../../assets/category/chocoholic 1.jpg'
import chocoholic3 from '../../assets/category/chcoholic 3.jpg'
import lotus1 from '../../assets/category/lotus 1.jpg'
import lotus3 from '../../assets/category/lotus 3.jpg'
import nutella2 from '../../assets/category/nutella 2.jpg'
import nutella3 from '../../assets/category/nutella 3.jpg'
import coffeeDonut1 from '../../assets/category/coffee 1.jpg'
import coffeeDonut2 from '../../assets/category/coffee 2.jpg'
import saltedCaramel1 from '../../assets/category/salted caramel 1.jpg'
import saltedCaramel3 from '../../assets/category/salted caramel 3.jpg'
import bostonCreme1 from '../../assets/category/boston creme 1.jpg'
import bostonCreme2 from '../../assets/category/boston creme 2.jpg'
import bostonCreme3 from '../../assets/category/boston creme 3.jpg'
import butterCream1 from '../../assets/category/butter cream 1.jpg'
import butterCream2 from '../../assets/category/butter cream 2.jpg'
import mixBerry1 from '../../assets/category/mix berry 1.jpg'
import mixBerry2 from '../../assets/category/mix berry 2.jpg'
import mixBerry3 from '../../assets/category/mix berry 3.jpg'
import brownieFilled2 from '../../assets/category/brownie filled 2.jpg'
import mango1 from '../../assets/category/mango 1.jpg'
import mango2 from '../../assets/category/mango 2.jpg'
import classicOreo1 from '../../assets/category/classic oreo 1.jpg'
import classicOreo2 from '../../assets/category/classic oreo 2.jpg'
import chocolateSprinkle1 from '../../assets/category/chocolate sprinkle 1.jpg'
import chocolateSprinkle2 from '../../assets/category/chocolate sprinkle 2.jpg'
import classicChocolate2 from '../../assets/category/classic chocolate 2.jpg'
import whiteChocolate1 from '../../assets/category/white chocolate 1.jpg'
import whiteChocolate2 from '../../assets/category/whitechocolate 2.jpg'
import vanillaGlazed1 from '../../assets/category/vanilla glazed 1.jpg'
import vanillaGlazed2 from '../../assets/category/vanilla glazed 2.jpg'
import chocolateCroissant1 from '../../assets/category/chocolate croissant 1.jpg'
import chocolateCroissant2 from '../../assets/category/chocolate croissant 2.jpg'
import chocolateCroissant3 from '../../assets/category/chocolate croissant 3 (2).jpg'
import butterCreamCroissant1 from '../../assets/category/butter cream croissant 1.jpg'
import butterCreamCroissant2 from '../../assets/category/buttercream croissant 2.jpg'
import butterCroissant1 from '../../assets/category/butter croissant 1.jpg'
import bakedCinnamon1 from '../../assets/category/baked cinnamo 1.jpg'
import bakedCinnamon2 from '../../assets/category/baked cinnamon 2.jpg'
import signatureChicken1 from '../../assets/category/signature chicken 1.jpg'
import smokedTikka1 from '../../assets/category/tikka sandwich 1.jpg'
import smokedTikka2 from '../../assets/category/tikka sandwich 2.jpg'
// Note: 'fajita sandwich 2.jpg', 'iced cappuccino 1.jpg' and 'iced latte 2.jpg'
// are corrupt on disk (all-0xFF filler, no JPEG data) so they aren't imported.
import sizzlingFajita1 from '../../assets/category/fajita sandwich 1.jpg'
import passionFruit1 from '../../assets/category/passion fruit chiller 1.jpg'
import passionFruit2 from '../../assets/category/passion fruit chiller 2.jpg'
import wildBerry1 from '../../assets/category/wild berry chiller 1.jpg'
// Shipped exactly as supplied (2:3 portrait, 3857x5786). ProductCard and
// ProductGallery detect non-square photos and switch to object-contain, so this
// is shown whole instead of being sliced to fill the square frame.
import strawberryChillerSc from '../../assets/sssc1.jpg'
import strawberryChiller2 from '../../assets/category/strawberry chiller 2.jpg'
import cappuccinoImg from '../../assets/category/cappuccino.jpg'
import latteImg from '../../assets/category/latte.jpg'
import spanishLatteImg from '../../assets/category/spanish latte.jpg'
import caramelLatteImg from '../../assets/category/caramel latte.jpg'
import icedCappuccino2 from '../../assets/category/iced cappuccino 2.jpg'
import icedLatte1 from '../../assets/category/iced latte 1.jpg'
import icedCaramelLatte1 from '../../assets/category/iced caramel latte 1.jpg'

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
  { id: 16, name: 'Chocolate Glazed', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', description: DESCRIPTION, reviews: REVIEWS },
  { id: 17, name: 'Vanilla Glazed', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [vanillaGlazed1, vanillaGlazed2], description: DESCRIPTION, reviews: REVIEWS },

  // ---- Fresh Bakes ----
  { id: 18, name: 'Chocolate Croissant', price: 379, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [chocolateCroissant1, chocolateCroissant2, chocolateCroissant3], description: DESCRIPTION, reviews: REVIEWS },
  { id: 19, name: 'Butter Cream Croissant', price: 370, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [butterCreamCroissant1, butterCreamCroissant2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 20, name: 'Butter Croissant', price: 299, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [butterCroissant1], description: DESCRIPTION, reviews: REVIEWS },
  { id: 21, name: 'Baked Cinnamon', price: 299, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [bakedCinnamon1, bakedCinnamon2], description: DESCRIPTION, reviews: REVIEWS },

  // ---- Sandwiches ----
  { id: 22, name: 'Signature Chicken', price: 349, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [signatureChicken1], description: DESCRIPTION, reviews: REVIEWS },
  { id: 23, name: 'Classic Scrambled Egg', price: 349, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', description: DESCRIPTION, reviews: REVIEWS },
  { id: 24, name: 'Smoked Tikka Melt', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [smokedTikka1, smokedTikka2], description: DESCRIPTION, reviews: REVIEWS },
  { id: 25, name: 'Sizzling Fajita', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [sizzlingFajita1], description: DESCRIPTION, reviews: REVIEWS },
  { id: 26, name: 'Signature Beef Melt', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', description: DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Hot Coffee ----
  { id: 27, name: 'Cappuccino', price: 499, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [cappuccinoImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 28, name: 'Latte', price: 499, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [latteImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 29, name: 'Spanish Latte', price: 599, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [spanishLatteImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 30, name: 'Caramel Latte', price: 599, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [caramelLatteImg], description: DRINK_DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Iced Coffee ----
  { id: 31, name: 'Iced Cappuccino', price: 599, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedCappuccino2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 32, name: 'Iced Latte', price: 599, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedLatte1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 33, name: 'Iced Spanish Latte', price: 699, category: 'Drinks', type: 'Iced Coffee', size: 'sm', description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 34, name: 'Iced Caramel Latte', price: 699, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedCaramelLatte1], description: DRINK_DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Frappes (Blended Iced, 799) ----
  { id: 35, name: 'Caramel Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 36, name: 'Cookies & Cream Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 37, name: 'Hazelnut Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 38, name: 'Double Chocolate Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 39, name: 'Mocha Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', description: DRINK_DESCRIPTION, reviews: REVIEWS },

  // ---- Drinks / Chillers + Extras ----
  { id: 40, name: 'Passion Fruit Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [passionFruit1, passionFruit2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 41, name: 'Wild Berry Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [wildBerry1], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 42, name: 'Strawberry Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [strawberryChillerSc, strawberryChiller2], description: DRINK_DESCRIPTION, reviews: REVIEWS },
  { id: 43, name: 'Water', price: 120, category: 'Drinks', type: 'Extras', size: 'sm', description: 'Chilled bottled water.', reviews: REVIEWS },
])
