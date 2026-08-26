import { url } from '@/lib/url';

/**
 * Single source of truth for business information.
 *
 * CONFIRMED values come from the handoff (NOTES-open-questions.md → "Confirmed
 * and safe to use"). Everything marked TODO is still a placeholder and must be
 * supplied by the owner before launch — nothing here is invented.
 */

export const site = {
  name: "Grouchy's Public House",
  shortName: "Grouchy's",
  /** Positioning, not marketing copy. */
  descriptor: 'Steakhouse & grill, whiskey and bourbon, handcrafted cocktails, craft beer.',
  established: '2025',

  /** CONFIRMED */
  address: {
    street: '305 W Main St',
    locality: 'Greenville',
    region: 'Illinois',
    regionCode: 'IL',
    postalCode: '62246',
    country: 'US',
  },

  /** CONFIRMED */
  phone: {
    display: '(618) 699-1978',
    href: 'tel:+16186991978',
  },

  /** TODO — business email not yet supplied by the owner. */
  email: null as string | null,

  /**
   * TODO — final domain not yet chosen. Also set `site` in astro.config.mjs.
   */
  url: 'https://grouchyspublichouse.example',

  /**
   * TODO — social handles not yet confirmed. Leave `href: null` and the footer
   * renders the label without a link rather than pointing somewhere wrong.
   */
  social: [
    { label: 'Instagram', href: null as string | null },
    { label: 'Facebook', href: null as string | null },
  ],

  /**
   * TODO — reservations are a front-end demonstration only. When a provider is
   * chosen (OpenTable / Resy / Tock / SevenRooms / phone), point this at the
   * booking URL and the reservation flow will hand off at the final step.
   */
  reservationProviderUrl: null as string | null,

  /** TODO — parking & accessibility details to confirm with the owner. */
  parkingNote: 'Placeholder — parking & accessibility details to confirm with the owner.',

  /** TODO — map: static image for now. See NOTES-temporary-images.md. */
  directionsUrl: 'https://maps.google.com/?q=305+W+Main+St+Greenville+IL+62246',
} as const;

/** CONFIRMED hours. `null` means closed. */
export const hours = [
  { day: 'Monday', short: 'Mon', service: '11–2 · 4–9' },
  { day: 'Tuesday', short: 'Tue', service: null },
  { day: 'Wednesday', short: 'Wed', service: '11–2 · 4–9' },
  { day: 'Thursday', short: 'Thu', service: '11–2 · 4–9' },
  { day: 'Friday', short: 'Fri', service: '11–2 · 4–9' },
  { day: 'Saturday', short: 'Sat', service: '11–2 · 4–9' },
  { day: 'Sunday', short: 'Sun', service: null },
] as const;

/** Condensed form used in the footer. */
export const hoursSummary = [
  { label: 'Mon', value: '11–2 · 4–9', closed: false },
  { label: 'Wed–Sat', value: '11–2 · 4–9', closed: false },
  { label: 'Tue & Sun', value: 'Closed', closed: true },
] as const;

export const nav = [
  { label: 'Home', href: url('/') },
  { label: 'Menu', href: url('/menu') },
  { label: 'About', href: url('/about') },
  { label: 'Gallery', href: url('/gallery') },
  { label: 'Visit', href: url('/visit') },
] as const;

export const reserveHref = url('/reserve');

/** The three positioning tags along the bottom of the hero. */
export const heroTags = [
  'Steakhouse & Grill',
  'Whiskey & Bourbon',
  'Handcrafted Cocktails',
] as const;

export const formattedAddress = `${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`;

/**
 * Restaurant schema. Built only from confirmed data — no geo coordinates, no
 * price range, no menu URL claims that have not been signed off.
 */
export function restaurantSchema(canonical: string) {
  const openingHoursSpecification = hours
    .filter((h) => h.service !== null)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${h.day}`,
      // Two services a day: 11:00–14:00 and 16:00–21:00.
      opens: '11:00',
      closes: '21:00',
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    description: site.descriptor,
    url: canonical,
    telephone: site.phone.display,
    servesCuisine: ['American', 'Steakhouse'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.regionCode,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    openingHoursSpecification,
    acceptsReservations: 'False', // TODO — set once a booking provider is live.
  };
}
