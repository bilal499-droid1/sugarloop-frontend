import croissantDipped from '../../assets/l1.jpg'
import croissantPlain from '../../assets/l2.jpg'
import croissantPowdered from '../../assets/l3.jpg'
import donutCreamTop from '../../assets/D1.png'
import donutGlazed from '../../assets/D2.jpg'
import donutBlueChocChip from '../../assets/D3.jpg'
import donutDarkChocolate from '../../assets/D4.jpg'
import donutOreo from '../../assets/D5.jpg'
import coolerIcedLatte from '../../assets/R1.jpg'
import coolerIcedMacchiato from '../../assets/R2.jpg'
import sandwichGrilled from '../../assets/C1.jpg'

export const CATEGORIES = ['Croissants', 'Donuts', 'Coolers', 'Sandwiches']

const DESCRIPTION =
  'Baked fresh every morning with simple, honest ingredients. Best enjoyed the same day, alongside your favorite coffee.'

const REVIEWS = [
  { name: 'Amara Okafor', rating: 5, text: 'Genuinely one of the best bakes I\'ve had in the city. Will be back for more.' },
  { name: 'Daniyal Raza', rating: 4, text: 'Really good flavor and texture, still fresh even a few hours after pickup.' },
]

export const PRODUCTS = [
  { id: 1, name: 'Chocolate Dipped Croissant', price: 200, category: 'Croissants', size: 'lg', image: croissantDipped, description: DESCRIPTION, reviews: REVIEWS },
  { id: 2, name: 'Butter Croissant', price: 200, category: 'Croissants', size: 'wide', image: croissantPlain, description: DESCRIPTION, reviews: REVIEWS },
  { id: 3, name: 'Almond Croissant', price: 200, category: 'Croissants', size: 'wide', image: croissantPowdered, description: DESCRIPTION, reviews: REVIEWS },

  { id: 4, name: 'Cream Top Donut', price: 200, category: 'Donuts', size: 'lg', image: donutCreamTop, description: DESCRIPTION, reviews: REVIEWS },
  { id: 5, name: 'Classic Glazed Donut', price: 200, category: 'Donuts', size: 'sm', image: donutGlazed, description: DESCRIPTION, reviews: REVIEWS },
  { id: 6, name: 'Blue Choco Chip Donut', price: 200, category: 'Donuts', size: 'sm', image: donutBlueChocChip, description: DESCRIPTION, reviews: REVIEWS },
  { id: 7, name: 'Dark Chocolate Donut', price: 200, category: 'Donuts', size: 'sm', image: donutDarkChocolate, description: DESCRIPTION, reviews: REVIEWS },
  { id: 8, name: 'Oreo Crumble Donut', price: 200, category: 'Donuts', size: 'sm', image: donutOreo, description: DESCRIPTION, reviews: REVIEWS },

  { id: 9, name: 'Iced Caramel Macchiato', price: 200, category: 'Coolers', size: 'lg', image: coolerIcedMacchiato, description: DESCRIPTION, reviews: REVIEWS },
  { id: 10, name: 'Iced Latte', price: 200, category: 'Coolers', size: 'sm', image: coolerIcedLatte, description: DESCRIPTION, reviews: REVIEWS },

  { id: 11, name: 'Grilled Chicken Sandwich', price: 200, category: 'Sandwiches', size: 'wide', image: sandwichGrilled, description: DESCRIPTION, reviews: REVIEWS },
]
