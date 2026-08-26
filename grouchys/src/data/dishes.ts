import type { ImageMetadata } from 'astro';
import { photo, alt } from './images';

export interface Dish {
  n: string;
  name: string;
  /** A real menu category, not a decorative label. */
  tag: string;
  desc: string;
  image: ImageMetadata | null;
  alt: string;
  /** Shot brief for the photographer, from NOTES-temporary-images.md. */
  brief: string;
}

/**
 * Copy is verbatim from the handoff. Dishes 05 and 06 have no photography yet —
 * they render an empty frame rather than borrowing another dish's picture.
 */
export const dishes: Dish[] = [
  {
    n: '01',
    name: 'Wagyu Beef Burnt Ends',
    tag: 'Limited Dinner Feature',
    desc: 'Slow-smoked until the edges caramelize, finished on the grill and glazed to order.',
    image: photo.burntEnds,
    alt: alt.burntEnds,
    brief: 'Wagyu beef burnt ends — glossy caramelized cubes on a dark plate, warm side light, steam',
  },
  {
    n: '02',
    name: 'Filet Medallions',
    tag: 'Steaks & Entrées',
    desc: 'Tender medallions over charcoal, rested and finished with butter and coarse salt.',
    image: photo.filet,
    alt: alt.filet,
    brief: 'Filet medallions on dark plate, seared crust, warm rim light, deep shadow',
  },
  {
    n: '03',
    name: 'Culotte Steak',
    tag: 'Steaks & Entrées',
    desc: 'Top sirloin cap, scored fat, open flame — the cut the grill was built for.',
    image: photo.ribeyeMacro,
    alt: alt.ribeyeMacro,
    brief: 'Culotte steak sliced against the grain, grill marks, board, warm side light',
  },
  {
    n: '04',
    name: 'Grilled Pork Chop',
    tag: 'Steaks & Entrées',
    desc: 'Thick cut, charred edge, warm spice and a long rest.',
    image: photo.boneIn,
    alt: alt.boneIn,
    brief: 'Thick grilled pork chop, charred edge, dark plate, amber light',
  },
  {
    n: '05',
    name: 'Garlic Shrimp',
    tag: 'Seafood',
    desc: 'Butter, garlic and char straight off the grill.',
    image: null,
    alt: '',
    brief: 'Garlic shrimp in a cast iron pan, butter sauce, parsley, warm light on black',
  },
  {
    n: '06',
    name: 'Premium Beef Burger',
    tag: 'Burgers',
    desc: 'A proper burger — griddled crust, soft bun, nothing unnecessary.',
    image: null,
    alt: '',
    brief: 'Premium beef burger, glossy bun, melted cheese, dark background, warm side light',
  },
];
