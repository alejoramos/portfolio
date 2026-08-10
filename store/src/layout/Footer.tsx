import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { BRAND, FOOTER_COLUMNS } from '../data/site';

export function Footer() {
  const [email, setEmail] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-ink text-bone">
      <div className="edge pb-10 pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-display text-2xl leading-none">Join the programme</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-60">
              Early access to drops, restocks and athlete stories. No noise.
            </p>

            <form
              className="mt-6 flex max-w-sm items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes('@')) setSignedUp(true);
              }}
            >
              <label htmlFor="newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSignedUp(false);
                }}
                placeholder="you@example.com"
                className="h-12 min-w-0 flex-1 rounded-full border border-bone/20 bg-transparent px-5 text-sm outline-none transition-colors placeholder:opacity-40 focus:border-bone/60"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-bone text-ink transition-transform duration-200 hover:scale-105"
              >
                {signedUp ? <Check size={18} /> : <ArrowRight size={18} />}
              </button>
            </form>
            {signedUp && (
              <p role="status" className="mt-3 text-xs text-volt">
                You are on the list.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] opacity-45">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm opacity-70 transition-opacity hover:opacity-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-bone/10 pt-8 text-[11px] uppercase tracking-[0.18em] opacity-45">
          <p>
            © {new Date().getFullYear()} {BRAND.name} — {BRAND.tagline}
          </p>
          <p>A concept store. Not a real retailer.</p>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the viewport edge. */}
      <p
        aria-hidden
        className="font-display select-none px-[clamp(1rem,4vw,5rem)] pb-2 leading-[0.8] opacity-[0.07]"
        style={{ fontSize: 'clamp(4rem, 21vw, 20rem)' }}
      >
        {BRAND.name}
      </p>
    </footer>
  );
}
