/**
 * The board. Copied verbatim from the design prototype's MENU object.
 *
 * TODO — every price renders as the placeholder `$ ——`. Real prices, and
 * confirmation of the seven categories and their contents, are still pending
 * with the owner (NOTES-open-questions.md → Menu & pricing). `price` stays
 * `null` until then; the row renders the placeholder automatically.
 */

export interface MenuItem {
  name: string;
  desc: string;
  price: string | null;
}

export interface MenuCategory {
  key: string;
  label: string;
  items: MenuItem[];
}

const row = (name: string, desc: string): MenuItem => ({ name, desc, price: null });

export const menu: MenuCategory[] = [
  {
    key: 'steaks',
    label: 'Steaks',
    items: [
      row('Culotte Steak', 'Top sirloin cap, coarse salt, open flame.'),
      row('Filet Medallions', 'Charcoal-grilled, finished with butter.'),
      row('Beef Medallions', 'Premium beef, grilled to temperature.'),
      row('Wagyu Beef Burnt Ends', 'Slow-smoked, caramelized, house glaze.'),
      row('Grilled Pork Chop', 'Thick cut, charred edge, warm spice.'),
      row('Grilled Chicken', 'Simple, smoky, off the grill.'),
    ],
  },
  {
    key: 'burgers',
    label: 'Burgers',
    items: [
      row('Premium Beef Burger', 'Griddled crust, soft bun, nothing unnecessary.'),
      row('Chef’s Seasonal Burger', 'Rotating feature — ask your server.'),
    ],
  },
  {
    key: 'seafood',
    label: 'Seafood',
    items: [
      row('Garlic Shrimp', 'Butter, garlic, char from the grill.'),
      row('Fish & Chips', 'A public-house classic, done properly.'),
      row('Chef’s Seasonal Special', 'Contemporary seafood, changes weekly.'),
    ],
  },
  {
    key: 'salads',
    label: 'Salads',
    items: [
      row('Chopped Salad', 'Crisp, cold, generously dressed.'),
      row('Waldorf Salad', 'The classic, brought forward.'),
      row('Brisket Steak Salad', 'Smoked brisket over greens.'),
      row('Culotte Steak Salad', 'Grilled culotte, sliced warm.'),
    ],
  },
  {
    key: 'cocktails',
    label: 'Cocktails',
    items: [
      row('Classic Cocktails', 'Made the slow way, presented modern.'),
      row('Seasonal Cocktail', 'Rotating feature from behind the bar.'),
      row('Handcrafted Selection', 'Ask the bar what they are pouring.'),
    ],
  },
  {
    key: 'whiskey',
    label: 'Whiskey',
    items: [
      row('Jack Daniel’s Flight', 'A guided pour through the family.'),
      row('Curated Bourbon Flight', 'Three pours, chosen one bottle at a time.'),
      row('Whiskey & Bourbon', 'The full back bar, by the glass.'),
    ],
  },
  {
    key: 'beer',
    label: 'Beer',
    items: [
      row('Featured Draft', 'What is fresh on the line tonight.'),
      row('Craft Beer Selection', 'Local and regional, rotating.'),
    ],
  },
];

/** Rendered wherever a price is not yet confirmed. */
export const PRICE_PLACEHOLDER = '$ ——';
export const PRICE_NOTE = 'Prices are placeholders pending the real menu';

/** The three bar rows called out beside "Poured with character." */
export const barHighlights: MenuItem[] = [
  row('Jack Daniel’s Flight', ''),
  row('Curated Bourbon Flight', ''),
  row('Seasonal Cocktail', ''),
];
