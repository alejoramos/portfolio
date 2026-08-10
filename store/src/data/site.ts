import { asset } from '../lib/utils';
import type { CategoryTheme, Collection } from '../types/product';

export const BRAND = {
  name: 'KINETA',
  tagline: 'Built at speed',
  season: 'SS26',
} as const;

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  tops: {
    key: 'tops',
    label: 'Tops',
    href: '/tops',
    accent: '#c6f24e',
    onAccent: '#0a0a0b',
    tagline: 'Layers that move first',
  },
  footwear: {
    key: 'footwear',
    label: 'Footwear',
    href: '/footwear',
    accent: '#2b5cff',
    onAccent: '#ffffff',
    tagline: 'Where the session is won',
  },
  bottoms: {
    key: 'bottoms',
    label: 'Bottoms',
    href: '/bottoms',
    accent: '#ff4a1c',
    onAccent: '#0a0a0b',
    tagline: 'Denim that trains',
  },
};

export const NAV_LINKS = [
  { label: 'New Drop', href: '/new' },
  { label: 'Tops', href: '/tops' },
  { label: 'Footwear', href: '/footwear' },
  { label: 'Bottoms', href: '/bottoms' },
  { label: 'Shop All', href: '/shop' },
];

/** Hero carousel. Characters chosen for pose variety; each sits on a complementary field. */
export const HERO_SLIDES = [
  {
    id: 'hs-1',
    image: asset('/assets/characters/athlete-01.webp'),
    width: 567,
    height: 868,
    bg: '#2b5cff',
    label: 'Track Suit 02',
    meta: 'Ember / Womens',
    href: '/tops',
  },
  {
    id: 'hs-2',
    image: asset('/assets/characters/athlete-03.webp'),
    width: 453,
    height: 1011,
    bg: '#c6f24e',
    label: 'Train Kit 01',
    meta: 'Void / Mens',
    href: '/shop',
  },
  {
    id: 'hs-3',
    image: asset('/assets/characters/athlete-06.webp'),
    width: 411,
    height: 1018,
    bg: '#ff4a1c',
    label: 'Thermo Mesh',
    meta: 'Deep Teal / Mens',
    href: '/tops',
  },
  {
    id: 'hs-4',
    image: asset('/assets/characters/athlete-07.webp'),
    width: 342,
    height: 952,
    bg: '#5b3df5',
    label: 'Race Layer',
    meta: 'Chalk / Mens',
    href: '/footwear',
  },
] as const;

/** Characters used outside the hero. */
export const CHARACTERS = {
  campaign: asset('/assets/characters/athlete-02.webp'),
  bottoms: asset('/assets/characters/athlete-04.webp'),
  tile: asset('/assets/characters/athlete-05.webp'),
  runway: asset('/assets/characters/athlete-08.webp'),
} as const;

export const COLLECTIONS: Collection[] = [
  {
    id: 'c-1',
    title: 'Race Division',
    kicker: '01 — Competition',
    copy: 'Carbon plates, monofilament mesh, nothing spare. The kit worn on the start line.',
    href: '/footwear',
    accent: '#c81e28',
    productSlug: 'redline-gt-scarlet',
  },
  {
    id: 'c-2',
    title: 'Night Shift',
    kicker: '02 — Cold Start',
    copy: 'Brushed thermal layers and reflective detail for the sessions before sunrise.',
    href: '/tops',
    accent: '#2b5cff',
    productSlug: 'nightshift-half-zip-void',
  },
  {
    id: 'c-3',
    title: 'Denim Programme',
    kicker: '03 — Off Duty',
    copy: 'Eleven ounce stretch denim engineered for a full squat. Street weight, gym range.',
    href: '/bottoms',
    accent: '#ff4a1c',
    productSlug: 'stretch-denim-jogger-indigo',
  },
  {
    id: 'c-4',
    title: 'Volt Series',
    kicker: '04 — Speed',
    copy: 'High-visibility tempo gear. Loud on the road, silent underfoot.',
    href: '/shop',
    accent: '#c6f24e',
    productSlug: 'voltcell-2-volt',
  },
  {
    id: 'c-5',
    title: 'Terrain',
    kicker: '05 — All Condition',
    copy: 'Five millimetre lugs, drainage ports and coated shells. Weather is not a variable.',
    href: '/footwear',
    accent: '#0f5b63',
    productSlug: 'hydra-trail-abyss',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'New Drop', href: '/new' },
      { label: 'Tops', href: '/tops' },
      { label: 'Footwear', href: '/footwear' },
      { label: 'Bottoms', href: '/bottoms' },
      { label: 'Shop All', href: '/shop' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping', href: '/shop' },
      { label: 'Returns', href: '/shop' },
      { label: 'Size Guide', href: '/shop' },
      { label: 'Contact', href: '/shop' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/shop' },
      { label: 'Athletes', href: '/shop' },
      { label: 'Sustainability', href: '/shop' },
      { label: 'Careers', href: '/shop' },
    ],
  },
];
