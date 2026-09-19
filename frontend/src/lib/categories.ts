import type { ShopCategory } from '@/types';

/**
 * The stand-in category list.
 *
 * NOT THE LIVE LIST. The live list is the `categories` table, edited from the
 * workroom (Admin → Categories) and read through useCategories(). This is only
 * what a menu shows before that answers, or if it cannot — so the footer and
 * the shelf are never empty and never an error while the server wakes.
 *
 * Before the table was the source, this list was typed out separately in the
 * footer, the shelf, the listing's filters and the admin form, and the copies
 * had already disagreed: the admin form's list left out Half Saree, which the
 * shop sells.
 */
const BUILT_IN: Array<Pick<ShopCategory, 'name' | 'emoji' | 'eyebrow' | 'description'>> = [
  { name: 'Chudithar',   emoji: '👘', eyebrow: 'Every day',    description: 'Cotton and silk, for a working day.' },
  { name: 'Lehenga',     emoji: '👗', eyebrow: 'The occasion', description: 'Weight, drape, and a hem that holds its line.' },
  { name: 'Half Saree',  emoji: '🥻', eyebrow: 'The ceremony', description: 'For the ceremony, and the photographs after it.' },
  { name: 'Party Wears', emoji: '✨', eyebrow: 'For the room', description: 'Colour that survives a camera flash.' },
  { name: 'Tops',        emoji: '👕', eyebrow: 'The everyday', description: 'Worn on their own, or under everything else.' },
  { name: 'Crop Tops',   emoji: '🎽', eyebrow: 'Newer cuts',   description: 'Shorter lines, same cloth as the rest of the shelf.' },
];

export const FALLBACK_CATEGORIES: ShopCategory[] = BUILT_IN.map((c, i) => ({
  id: -(i + 1),                    // negative: never mistaken for a real row
  headline: null,
  is_active: true,
  sort_order: i + 1,
  product_count: 0,
  live_product_count: 0,
  ...c,
}));
