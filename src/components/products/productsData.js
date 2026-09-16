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
import chocoholic2 from '../../assets/chocoholic2.webp'
import chocoholic3 from '../../assets/category/chcoholic 3.webp'
import lotus1 from '../../assets/category/lotus 1.webp'
import lotus2 from '../../assets/lotus2.webp'
import lotus3 from '../../assets/category/lotus 3.webp'
import nutella1 from '../../assets/nutella1.webp'
import nutella2 from '../../assets/category/nutella 2.webp'
import nutella3 from '../../assets/category/nutella 3.webp'
import coffeeDonut1 from '../../assets/category/coffee 1.webp'
import coffeeDonut2 from '../../assets/category/coffee 2.webp'
import coffeeDonut3 from '../../assets/coffee3.webp'
import saltedCaramel1 from '../../assets/category/salted caramel 1.webp'
import saltedCaramel2 from '../../assets/saltedcaramel2.webp'
import saltedCaramel3 from '../../assets/category/salted caramel 3.webp'
import bostonCreme1 from '../../assets/category/boston creme 1.webp'
import bostonCreme2 from '../../assets/category/boston creme 2.webp'
import bostonCreme3 from '../../assets/category/boston creme 3.webp'
import mixBerry1 from '../../assets/category/mix berry 1.webp'
import mixBerry2 from '../../assets/category/mix berry 2.webp'
import mixBerry3 from '../../assets/category/mix berry 3.webp'
import blueberry1 from '../../assets/category/blueberry 1.webp'
import blueberry2 from '../../assets/category/blueberry 2.webp'
import chocolateBounty1 from '../../assets/Brownies/chocolate-bounty-1.webp'
import chocolateBounty2 from '../../assets/Brownies/chocolate-bounty-2.webp'
import peanutButter1 from '../../assets/Brownies/peanut-butter-1.webp'
import peanutButter2 from '../../assets/Brownies/peanut-butter-2.webp'
import brookie1 from '../../assets/Brownies/brookie-1.webp'
import brookie2 from '../../assets/Brownies/brookie-2.webp'
import classicFudge1 from '../../assets/Brownies/classic-fudge-1.webp'
import classicFudge2 from '../../assets/Brownies/classic-fudge-2.webp'
// import brownieFilled1 from '../../assets/browniefilled1.webp'
// import brownieFilled2 from '../../assets/category/brownie filled 2.webp'
import mango1 from '../../assets/category/mango 1.webp'
import mango2 from '../../assets/category/mango 2.webp'
import classicOreo1 from '../../assets/category/classic oreo 1.webp'
import classicOreo2 from '../../assets/category/classic oreo 2.webp'
import chocolateSprinkle1 from '../../assets/category/chocolate sprinkle 1.webp'
import chocolateSprinkle2 from '../../assets/category/chocolate sprinkle 2.webp'
import classicChocolate1 from '../../assets/classicchocolate1.webp'
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
import butterCroissant2 from '../../assets/buttercroissant2.webp'
// import snicker1 from '../../assets/crafted/snicker-1.webp'
// import snickers2 from '../../assets/crafted/snickers-2.webp'
import tiramisu1 from '../../assets/crafted/tiramisu-1.webp'
import tiramisu2 from '../../assets/crafted/tiramisu-2.webp'
import tiramisu3 from '../../assets/crafted/tiramisu-3.webp'
import kinder1 from '../../assets/crafted/kinder-1.webp'
import kinder2 from '../../assets/crafted/kinder-2.webp'
import kinder3 from '../../assets/crafted/kinder-3.webp'
import kitkat1 from '../../assets/crafted/kitkat-1.webp'
import kitkat2 from '../../assets/crafted/kitkat-2.webp'
import kitkat3 from '../../assets/crafted/kitkat-3.webp'
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
// beside it filled the frame. Cropped square about the center - the glass sits
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
import waterImg from '../../assets/water.webp'

// Donuts lead: they are the signature line, the biggest section of the printed
// board, and the order the home page's menu carousel already presents.
export const CATEGORIES = ['Donuts', 'Brownies', 'Croissants', 'Drinks', 'Sandwiches']

// The generic placeholder the whole board used to share. Only the two commented-out
// rows still reference it, so it is parked here for when they come back.
// const DESCRIPTION =
//   'Baked fresh every morning with simple, honest ingredients. Best enjoyed the same day, alongside your favorite coffee.'

const withPrimaryImage = (products) =>
  products.map((product) => ({ ...product, image: product.images?.[0] }))

export const PRODUCTS = withPrimaryImage([
  // ---- Donuts / Signature (299) ----
  { id: 1, name: 'Chocoholic', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [chocoholic1, chocoholic2, chocoholic3], description: 'Molten chocolate center topped with crunchy chocolate bits.' },
  { id: 2, name: 'Lotus', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [lotus1, lotus2, lotus3], description: 'Lotus cookie butter filling topped with a Lotus Biscoff biscuit.' },
  { id: 3, name: 'Nutella', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [nutella1, nutella2, nutella3], description: 'Filled with rich Nutella spread and topped with powdered sugar.' },
  { id: 4, name: 'Coffee', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [coffeeDonut1, coffeeDonut2, coffeeDonut3], description: 'Espresso creamy center topped with coffee infused cream.' },
  { id: 5, name: 'Salted Caramel', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [saltedCaramel1, saltedCaramel2, saltedCaramel3], description: 'Sugar doughnut with a sweet and salty caramel center.' },
  { id: 6, name: 'Boston Creme', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [bostonCreme1, bostonCreme2, bostonCreme3], description: 'Vanilla custard filling topped with rich chocolate.' },
  { id: 8, name: 'Mix Berry', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [mixBerry1, mixBerry2, mixBerry3], description: 'Mixed berry cream filled in a white chocolate topped donut.' },
  { id: 48, name: 'Blueberry', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [blueberry1, blueberry2], description: 'Center-filled donut with a sweet and tart blueberry cream filling.' },
  // { id: 9, name: 'Brownie Filled', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [brownieFilled1, brownieFilled2], description: DESCRIPTION },
  { id: 10, name: 'Mango', price: 299, category: 'Donuts', type: 'Signature', size: 'sm', images: [mango1, mango2], description: 'Donut filled with sweet, tangy and fluffy mango cream, topped with sugar.' },

  // ---- Donuts / Classic ----
  { id: 12, name: 'Classic Oreo', price: 185, category: 'Donuts', type: 'Classic', size: 'sm', images: [classicOreo1, classicOreo2], description: 'Donut topped with chocolate glaze and crushed Oreos.' },
  { id: 13, name: 'Chocolate Sprinkle', price: 185, category: 'Donuts', type: 'Classic', size: 'sm', images: [chocolateSprinkle1, chocolateSprinkle2], description: 'Classic donut with dark chocolate glaze and sprinkles.' },
  { id: 14, name: 'Classic Chocolate', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [classicChocolate1, classicChocolate2], description: 'Ring doughnut coated in a chocolate glaze.' },
  { id: 15, name: 'White Chocolate', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [whiteChocolate1, whiteChocolate2], description: 'Doughnut covered in a sweet white chocolate glaze.' },
  { id: 16, name: 'Chocolate Glazed', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [chocolateGlazed1, chocolateGlazed2], description: 'Donut featuring a rich chocolate coating with a decorative drizzle.' },
  { id: 17, name: 'Vanilla Glazed', price: 230, category: 'Donuts', type: 'Classic', size: 'sm', images: [vanillaGlazed1, vanillaGlazed2], description: 'Traditional doughnut coated in a sweet, glossy vanilla glaze.' },

  // ---- Donuts / Crafted Donuts (429) ----
  // { id: 44, name: 'Snickers', price: 429, category: 'Donuts', type: 'Crafted Donuts', size: 'sm', images: [snicker1, snickers2], description: DESCRIPTION },
  { id: 45, name: 'Tiramisu Creme', price: 429, category: 'Donuts', type: 'Crafted Donuts', size: 'sm', images: [tiramisu1, tiramisu2, tiramisu3], description: 'Cocoa dusted donut with a rich coffee filling and cream topping.' },
  { id: 46, name: 'Kinder Cream', price: 429, category: 'Donuts', type: 'Crafted Donuts', size: 'sm', images: [kinder1, kinder2, kinder3], description: 'Donut filled with a milky white cream filling.' },
  { id: 47, name: 'KitKat Crunch', price: 429, category: 'Donuts', type: 'Crafted Donuts', size: 'sm', images: [kitkat1, kitkat2, kitkat3], description: 'Molten chocolate center topped with KitKat bits and chocolate drizzle.' },

  // ---- Fresh Bakes ----
  { id: 18, name: 'Chocolate Croissant', price: 379, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [chocolateCroissant1, chocolateCroissant2, chocolateCroissant3], description: 'Flaky, buttery chocolate filled croissant dipped in rich chocolate.' },
  { id: 19, name: 'Butter Cream Croissant', price: 370, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [butterCreamCroissant1, butterCreamCroissant2], description: 'Flaky pastry filled with sweet, velvety buttercream.' },
  { id: 20, name: 'Butter Croissant', price: 299, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [butterCroissant1, butterCroissant2], description: 'Classic golden, flaky croissant with a rich, buttery taste.' },
  { id: 21, name: 'Baked Cinnamon', price: 299, category: 'Croissants', type: 'Fresh Bakes', size: 'sm', images: [bakedCinnamon1, bakedCinnamon2], description: 'Soft, sweet pastry swirled with cinnamon and topped with a light glaze.' },

  // ---- Sandwiches ----
  { id: 22, name: 'Signature Chicken', price: 349, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [signatureChicken1], description: 'Soft, classic white bread sandwich filled with creamy, seasoned chicken spread.' },
  { id: 24, name: 'Smoked Tikka Melt', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [smokedTikka1, smokedTikka2], description: 'Toasted, golden panini packed with smoky, spiced tikka chicken.' },
  { id: 25, name: 'Sizzling Fajita', price: 499, category: 'Sandwiches', type: 'Sandwiches', size: 'sm', images: [sizzlingFajita1, sizzlingFajita2], description: 'Grilled, crispy panini loaded with fajita chicken and fresh lettuce and cucumber.' },

  // ---- Drinks / Hot Coffee ----
  { id: 27, name: 'Cappuccino', price: 499, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [cappuccinoImg], description: 'Classic hot espresso with steamed milk and rich foam.' },
  { id: 28, name: 'Latte', price: 499, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [latteImg], description: 'Smooth espresso combined with velvety steamed milk and a light foam layer.' },
  { id: 29, name: 'Spanish Latte', price: 599, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [spanishLatteImg], description: 'Rich hot espresso sweetened with condensed milk and steamed milk.' },
  { id: 30, name: 'Caramel Latte', price: 599, category: 'Drinks', type: 'Hot Coffee', size: 'sm', images: [caramelLatteImg], description: 'Latte infused with sweet caramel.' },

  // ---- Drinks / Iced Coffee ----
  { id: 31, name: 'Iced Cappuccino', price: 599, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedCappuccino2], description: 'Chilled espresso drink topped with a layer of cold foam.' },
  { id: 32, name: 'Iced Latte', price: 599, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedLatte1], description: 'Chilled espresso poured over cold milk and ice.' },
  { id: 33, name: 'Iced Spanish Latte', price: 699, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedSpanishLatte1], description: 'Sweet and creamy blend of rich espresso and sweetened condensed milk over ice.' },
  { id: 34, name: 'Iced Caramel Latte', price: 699, category: 'Drinks', type: 'Iced Coffee', size: 'sm', images: [icedCaramelLatte1], description: 'Chilled espresso and milk over ice with a sweet caramel drizzle.' },

  // ---- Drinks / Frappes (Blended Iced, 799) ----
  { id: 35, name: 'Caramel Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [caramelFrappe1], description: 'Blended iced coffee featuring a rich caramel flavor.' },
  { id: 36, name: 'Cookies & Cream Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [cookiesCreamFrappe1], description: 'Frappe loaded with crushed chocolate cookies.' },
  { id: 37, name: 'Hazelnut Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [hazelnutFrappe1], description: 'Blended iced coffee rich with creamy hazelnut flavor.' },
  { id: 38, name: 'Double Chocolate Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [doubleChocolateFrappe1], description: 'Blended coffee loaded with rich chocolate.' },
  { id: 39, name: 'Mocha Frappe', price: 799, category: 'Drinks', type: 'Blended Iced', size: 'sm', images: [mochaFrappe1], description: 'Smooth iced blend of espresso and chocolate.' },

  // ---- Drinks / Chillers + Extras ----
  { id: 40, name: 'Passion Fruit Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [passionFruit1, passionFruit2], description: 'Refreshing, ice-cold beverage bursting with tangy tropical passion fruit flavor.' },
  { id: 41, name: 'Wild Berry Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [wildBerry1, wildBerry2], description: 'Cool, fruity drink blended with a sweet and tart mix of wild berries.' },
  { id: 42, name: 'Strawberry Chiller', price: 299, category: 'Drinks', type: 'Chillers', size: 'sm', images: [strawberryChillerSc, strawberryChiller2], description: 'Crisp and icy beverage with sweet strawberry flavor.' },
  { id: 43, name: 'Water', price: 120, category: 'Drinks', type: 'Extras', size: 'sm', images: [waterImg], description: 'Chilled bottled water.' },

  // ---- Brownies ----
  { id: 49, name: 'Chocolate Bounty', price: 420, category: 'Brownies', type: 'Brownies', size: 'sm', images: [chocolateBounty1, chocolateBounty2], description: 'Rich chocolate brownie layered with sweet coconut and a tempered chocolate top.' },
  { id: 50, name: 'Peanut Butter', price: 399, category: 'Brownies', type: 'Brownies', size: 'sm', images: [peanutButter1, peanutButter2], description: 'Fudge brownie swirled with creamy, nutty peanut butter.' },
  { id: 51, name: 'Brookie', price: 399, category: 'Brownies', type: 'Brownies', size: 'sm', images: [brookie1, brookie2], description: 'A hybrid combining a chewy chocolate chip cookie and a rich brownie.' },
  { id: 52, name: 'Classic Fudge', price: 370, category: 'Brownies', type: 'Brownies', size: 'sm', images: [classicFudge1, classicFudge2], description: 'Intensely chocolatey fudge brownie with a perfectly crackly crust.' },
])
