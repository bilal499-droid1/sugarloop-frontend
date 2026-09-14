import LegalPage from '../components/LegalPage'

const CONTACT_EMAIL = 'sugarlooppk@gmail.com'
const CONTACT_PHONE = '+92 370 4193372'

// Kept honest against the code: the cart and chosen branch live in localStorage
// (CartContext / BranchContext), and a typed address is turned into coordinates by
// OpenStreetMap's Nominatim (src/lib/geocode.js). Change those and change this.
const SECTIONS = [
  {
    id: 'scope',
    heading: 'What this covers',
    paragraphs: [
      `This policy explains what Sugar Loop does with your information when you browse this site or place an order. We are the ones responsible for it, and you can reach us at ${CONTACT_EMAIL} or ${CONTACT_PHONE}.`,
    ],
  },
  {
    id: 'collected',
    heading: 'What we collect',
    list: [
      `What you type at checkout: your name, phone number, email address, delivery address and any note you leave for the rider.`,
      `Your order: the items, the branch, the total, and whether it was delivered or collected.`,
      `Your location, but only if you press the "use my location" button and your browser asks you to allow it. You can decline and type the address instead — the site works either way.`,
      `Basic technical information your browser sends to any website it visits, such as the page requested and rough time of the request.`,
    ],
  },
  {
    id: 'use',
    heading: 'What we use it for',
    list: [
      `Taking, preparing and delivering your order, and reaching you if something about it needs a call.`,
      `Sending you an order confirmation and updates about that order, by phone, SMS or WhatsApp.`,
      `Working out which branch is nearest and whether your address is in range.`,
      `Keeping our own records, and understanding which items sell, so we bake the right amounts.`,
    ],
    paragraphs: [
      `We do not sell your information, and we do not send you marketing messages you did not ask for.`,
    ],
  },
  {
    id: 'location',
    heading: 'Addresses and location',
    paragraphs: [
      `To check whether an address is within delivery range, the address you type is sent to OpenStreetMap's Nominatim service, which turns it into map coordinates. Only the address text goes across — your name, phone and order do not.`,
      `If you use the location button instead, your browser's coordinates are used for the same check. Either way the result is kept with your order so the rider can find you.`,
    ],
  },
  {
    id: 'sharing',
    heading: 'Who else sees it',
    list: [
      `Our branch staff and riders, who need your name, phone and address to get the order to you.`,
      `Delivery platforms such as foodpanda, where an order is placed through them rather than here — their own privacy policy governs that order.`,
      `Our hosting and infrastructure providers, who hold the data on our behalf.`,
      `Anyone we are legally required to disclose to.`,
    ],
  },
  {
    id: 'storage',
    heading: 'What your browser stores',
    paragraphs: [
      `Your cart and the branch you picked are saved in your own browser, so a refresh does not empty them. That stays on your device, is not sent to us until you place an order, and clearing your browser data clears it.`,
      `We do not use advertising or cross-site tracking cookies.`,
    ],
  },
  {
    id: 'retention',
    heading: 'How long we keep it',
    paragraphs: [
      `We keep order records for as long as we need them for our accounts and for any dispute about an order. Contact details tied to an order are kept for the same period, then removed or anonymised.`,
    ],
  },
  {
    id: 'rights',
    heading: 'Your choices',
    paragraphs: [
      `Write to us at ${CONTACT_EMAIL} and we will tell you what we hold about you, correct anything wrong, or delete it where we are not required to keep it. We may ask you to confirm your identity first, so that we are not handing someone else's order history to a stranger.`,
      `You can refuse the location permission, and you can ask us to stop contacting you about anything other than an order in progress.`,
    ],
  },
  {
    id: 'children',
    heading: 'Children',
    paragraphs: [
      `This site is not aimed at children, and we do not knowingly collect information from a child. If you believe a child has given us their details, tell us and we will remove them.`,
    ],
  },
  {
    id: 'updates',
    heading: 'Changes to this policy',
    paragraphs: [
      `We will update this page when what we do changes, and the date at the top will tell you when it last happened.`,
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="14 September 2026"
      intro="What we collect when you order from Sugar Loop, why we need it, and who else ever sees it. Short version: your details are used to get your order to you, and nothing else."
      sections={SECTIONS}
    />
  )
}
