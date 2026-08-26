/**
 * Every temporary presentation image, in one place.
 *
 * ALL of these are placeholders. To swap in the real photography of Grouchy's
 * Public House, drop the new file into `src/assets/photography/` and change the
 * import below — nothing else in the codebase references a filename.
 *
 * See handoff → NOTES-temporary-images.md for the crop brief per slot.
 */

import bartender from '@/assets/photography/ph-bartender.jpg';
import beer from '@/assets/photography/ph-beer.jpg';
import boneIn from '@/assets/photography/ph-bone-in.jpg';
import burntEnds from '@/assets/photography/ph-burnt-ends.jpg';
import cocktailCoupe from '@/assets/photography/ph-cocktail-coupe.jpg';
import couple from '@/assets/photography/ph-couple.jpg';
import diningRoom from '@/assets/photography/ph-dining-room.jpg';
import filet from '@/assets/photography/ph-filet.jpg';
import grill from '@/assets/photography/ph-grill.jpg';
import interiorWide from '@/assets/photography/ph-interior-wide.jpg';
import map from '@/assets/photography/ph-map.jpg';
import peel from '@/assets/photography/ph-peel.jpg';
import ribeyeMacro from '@/assets/photography/ph-ribeye-macro.jpg';
import salt from '@/assets/photography/ph-salt.jpg';
import steakPuree from '@/assets/photography/ph-steak-puree.jpg';
import steakSlate from '@/assets/photography/ph-steak-slate.jpg';
import whiskeyFlight from '@/assets/photography/ph-whiskey-flight.jpg';
import whiskeyPour from '@/assets/photography/ph-whiskey-pour.jpg';

import buildingCream from '@/assets/brand/building-cream.png';
import logoCream from '@/assets/brand/logo-cream.png';
import logoGold from '@/assets/brand/logo-gold.png';
import grouchGold from '@/assets/brand/grouch-gold.png';

export const photo = {
  bartender,
  beer,
  boneIn,
  burntEnds,
  cocktailCoupe,
  couple,
  diningRoom,
  filet,
  grill,
  interiorWide,
  map,
  peel,
  ribeyeMacro,
  salt,
  steakPuree,
  steakSlate,
  whiskeyFlight,
  whiskeyPour,
} as const;

export const brand = {
  buildingCream,
  logoCream,
  logoGold,
  grouchGold,
} as const;

/**
 * Alt text for the temporary images. Descriptive of what is actually pictured —
 * these get rewritten alongside the real photography, not invented into dish
 * names. Decorative slots (background textures) pass alt="" instead.
 */
export const alt = {
  bartender: 'A bartender stirring a drink behind the bar',
  beer: 'A glass of beer being poured at the bar',
  boneIn: 'A bone-in chop resting with thyme',
  burntEnds: 'Caramelised beef burnt ends on a dark plate',
  cocktailCoupe: 'A cocktail in a coupe glass finished with citrus peel',
  couple: 'Two guests dining together by candlelight',
  diningRoom: 'The dining room after dark, lamps lit over a set table',
  filet: 'Filet medallions plated on dark ceramic',
  grill: 'Steak cooking over open charcoal flame',
  interiorWide: 'A wide view of the room — booths, brick and pendant light',
  map: 'A dark street map of W Main St, Greenville, with the restaurant marked',
  peel: 'Citrus peel expressed over a rocks glass',
  ribeyeMacro: 'A close crop of a seared cut of beef',
  salt: 'Coarse salt in a bowl beside a pepper mill on dark linen',
  steakPuree: 'A grilled steak plated with celeriac purée',
  steakSlate: 'A strip steak resting on slate beside a whiskey neat',
  whiskeyFlight: 'A three-glass whiskey flight on a wooden board',
  whiskeyPour: 'Whiskey being poured into a cut-crystal glass',
} as const;
