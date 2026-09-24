import LegalPage from '../components/LegalPage'

const CONTACT_EMAIL = 'sugarlooppk@gmail.com'
const CONTACT_PHONE = '+92 370 4193372'

// The commercial numbers here (Rs 500 minimum, Rs 100 delivery, 2 km radius) are the
// ones the checkout actually enforces — see the header comment in CheckoutPage.jsx.
// If those change, change them here too or the terms stop describing the shop.
const SECTIONS = [
  {
    id: 'about',
    heading: 'Who we are',
    paragraphs: [
      `Sugar Loop is a bakery and dessert business operating branches in Rawalpindi and Islamabad, Pakistan. These terms cover your use of this website and any order you place through it. Placing an order means you accept them.`,
      `You can reach us at ${CONTACT_EMAIL} or on ${CONTACT_PHONE}.`,
    ],
  },
  {
    id: 'orders',
    heading: 'Orders',
    paragraphs: [
      `An order placed on this site is an offer to buy, not a completed sale. The sale is made when we confirm the order — by phone, by message, or on screen. Until then we may decline it.`,
      `We may decline or cancel an order if an item has run out, if the address falls outside the delivery range of every branch, if the branch is closed, or if we cannot reach you on the number you gave us.`,
    ],
  },
  {
    id: 'prices',
    heading: 'Prices and payment',
    paragraphs: [
      `Prices are shown in Pakistani Rupees. The price that counts is the one shown at checkout when you place the order, not one cached earlier by your browser.`,
      `Orders are paid cash on delivery or in cash on collection. The rider carries no change beyond what is reasonable, so please keep the order amount ready.`,
    ],
    list: [
      `Minimum order for delivery: Rs 500, before any discount. Collection has no minimum.`,
      `Delivery fee: Rs 100. Collection from a branch carries no fee.`,
      `Online orders get 15% off the items at checkout. The discount does not apply to the delivery fee.`,
      `We may change prices at any time; a change never affects an order we have already confirmed.`,
    ],
  },
  {
    id: 'delivery',
    heading: 'Delivery and collection',
    paragraphs: [
      `We deliver within roughly 2 km of a branch. If your address falls outside that, checkout will say so rather than take an order we cannot fulfil.`,
      `Delivery times are estimates. Traffic, weather and how busy the kitchen is all move them, and we would rather send your order out right than send it out fast.`,
      `For collection, please bring the order number. We hold a collection order until the branch closes that day.`,
    ],
  },
  {
    id: 'changes',
    heading: 'Changes, cancellations and refunds',
    paragraphs: [
      `Call us as soon as possible if you need to change or cancel. Once the kitchen has started a custom or bulk order we may not be able to cancel it.`,
      `Because everything we sell is freshly made food, we do not accept returns on change of mind. If an order arrives damaged, incorrect or not of the quality we would expect, tell us within 24 hours and we will replace it or refund it.`,
    ],
  },
  {
    id: 'allergens',
    heading: 'Allergens and food safety',
    paragraphs: [
      `Our kitchens handle wheat, dairy, eggs and nuts. We cannot guarantee that any item is free of a given allergen, and we cannot prepare an allergen-free order on request. If you have a serious allergy, please call the branch before ordering.`,
      `Our products are best eaten the day they are made. Once an order has been handed over, how it is stored is out of our hands.`,
    ],
  },
  {
    id: 'bulk',
    heading: 'Bulk and corporate orders',
    paragraphs: [
      `Bulk, event and corporate orders are quoted separately and may need a deposit and a lead time. Anything we agree in writing for such an order — quantities, dates, prices — sits on top of these terms and wins where the two disagree.`,
    ],
  },
  {
    id: 'site-use',
    heading: 'Using this site',
    paragraphs: [
      `Please use the site for ordering and browsing, and not for anything that interferes with it: no scraping at a rate that degrades it for other people, no attempt to reach the staff area without authorisation, no uploading of anything harmful.`,
      `The name, logo, photography, product descriptions and page designs on this site belong to Sugar Loop. Please do not reuse them commercially without our written permission.`,
    ],
  },
  {
    id: 'liability',
    heading: 'Liability',
    paragraphs: [
      `We stand behind the food we sell and we will put right an order we got wrong. Beyond that, our liability for any order is limited to what you paid for it. We are not liable for indirect losses — a delayed delivery that affects an event, for instance.`,
      `Nothing here limits any liability that the law does not allow us to limit.`,
    ],
  },
  {
    id: 'law',
    heading: 'Changes and governing law',
    paragraphs: [
      `We may update these terms. The version that applies to your order is the one published when you placed it.`,
      `These terms are governed by the laws of Pakistan, and the courts of Islamabad and Rawalpindi have jurisdiction over any dispute.`,
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="14 September 2026"
      intro="Plain terms for ordering from Sugar Loop — what happens when you place an order, what it costs, and what we will do if something goes wrong."
      sections={SECTIONS}
    />
  )
}
