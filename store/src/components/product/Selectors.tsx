import { motion } from 'framer-motion';
import type { Colorway, SizeOption } from '../../types/product';
import { cn } from '../../lib/utils';

export function SizeSelector({
  sizes,
  value,
  onChange,
  accent,
  error,
}: {
  sizes: SizeOption[];
  value: string | null;
  onChange: (size: string) => void;
  accent: string;
  error?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Size</span>
        <button type="button" className="text-[11px] uppercase tracking-[0.14em] underline opacity-55 hover:opacity-90">
          Size guide
        </button>
      </div>
      <div role="radiogroup" aria-label="Size" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {sizes.map((size) => {
          const selected = value === size.label;
          return (
            <button
              key={size.label}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!size.inStock}
              onClick={() => onChange(size.label)}
              className={cn(
                'relative h-12 rounded-lg border text-xs font-medium tabular-nums transition-colors duration-200',
                selected ? 'border-transparent text-ink' : 'border-bone/20 hover:border-bone/55',
                !size.inStock &&
                  'cursor-not-allowed border-bone/10 text-bone/25 line-through hover:border-bone/10'
              )}
              style={selected ? { backgroundColor: accent, color: '#0a0a0b' } : undefined}
            >
              {size.label}
            </button>
          );
        })}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-xs text-ember"
          role="alert"
        >
          Choose a size to continue.
        </motion.p>
      )}
    </div>
  );
}

export function ColorwaySelector({
  colorways,
  value,
  onChange,
}: {
  colorways: Colorway[];
  value: string;
  onChange: (id: string) => void;
}) {
  const active = colorways.find((c) => c.id === value) ?? colorways[0];

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Colour</span>
        <span className="text-[11px] opacity-55">{active.name}</span>
      </div>
      <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-2.5">
        {colorways.map((c) => {
          const selected = c.id === value;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              onClick={() => onChange(c.id)}
              className={cn(
                'relative h-10 w-10 rounded-full border-2 transition-all duration-200',
                selected ? 'border-bone' : 'border-transparent hover:border-bone/40'
              )}
            >
              <span
                className="absolute inset-1 rounded-full ring-1 ring-inset ring-black/25"
                style={{ backgroundColor: c.hex }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
