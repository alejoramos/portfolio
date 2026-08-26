import type { ImageMetadata } from 'astro';
import { photo, alt } from './images';

export interface GalleryCell {
  image: ImageMetadata;
  alt: string;
  /** Desktop 12-column grid span, from the handoff's gallery table. */
  col: number;
  row: number;
  /** Parallax depth: -1 rises, 0 holds, 1 lags. Three depths, no more. */
  depth: -1 | 0 | 1;
  /** Mobile grid: whether the cell spans two rows in the 2-column layout. */
  tall?: boolean;
}

export const gallery: GalleryCell[] = [
  { image: photo.couple, alt: alt.couple, col: 5, row: 3, depth: -1, tall: true },
  { image: photo.beer, alt: alt.beer, col: 4, row: 2, depth: 0 },
  { image: photo.bartender, alt: alt.bartender, col: 3, row: 4, depth: 1, tall: true },
  { image: photo.boneIn, alt: alt.boneIn, col: 4, row: 2, depth: 0 },
  { image: photo.salt, alt: alt.salt, col: 3, row: 2, depth: -1 },
  { image: photo.grill, alt: alt.grill, col: 6, row: 2, depth: 1 },
  { image: photo.peel, alt: alt.peel, col: 3, row: 2, depth: 0 },
];

/**
 * The mobile frame uses a different, tighter set — six images in two columns.
 * Kept separate rather than reflowing the desktop grid, per the handoff's
 * "recomposed, not shrunk" note.
 */
export const galleryMobile: GalleryCell[] = [
  { image: photo.bartender, alt: alt.bartender, col: 1, row: 2, depth: 0, tall: true },
  { image: photo.ribeyeMacro, alt: alt.ribeyeMacro, col: 1, row: 1, depth: 0 },
  { image: photo.cocktailCoupe, alt: alt.cocktailCoupe, col: 1, row: 1, depth: 0 },
  { image: photo.beer, alt: alt.beer, col: 1, row: 1, depth: 0 },
  { image: photo.whiskeyPour, alt: alt.whiskeyPour, col: 1, row: 2, depth: 0, tall: true },
  { image: photo.peel, alt: alt.peel, col: 1, row: 1, depth: 0 },
];

/** Everything the lightbox can page through, in gallery order. */
export const galleryAll = gallery;
