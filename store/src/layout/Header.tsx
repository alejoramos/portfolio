import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, ShoppingBag, X } from 'lucide-react';
import { BRAND, NAV_LINKS } from '../data/site';
import { cn } from '../lib/utils';
import { useCartStore } from '../store/cart.store';
import { useUIStore, useWishlistStore } from '../store/ui.store';
import { useScrollLock, useEscape } from '../hooks/useInteractions';
import { usePrefersReducedMotion } from '../hooks/useEnvironment';

/**
 * Site header.
 *
 * Transparent over the hero and solid everywhere else, so the intro keeps its
 * full-bleed composition without the nav ever becoming unreadable.
 */
export function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const reduced = usePrefersReducedMotion();

  const lines = useCartStore((s) => s.lines);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const wishlistCount = useWishlistStore((s) => s.ids.length);

  const { menuOpen, toggleMenu, openCart } = useUIStore();
  const onHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    toggleMenu(false);
  }, [location.pathname, toggleMenu]);

  useScrollLock(menuOpen);
  useEscape(menuOpen, () => toggleMenu(false));

  const solid = scrolled || !onHome;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-bone focus:px-5 focus:py-3 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-widest focus:text-ink"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-500',
          solid
            ? 'border-b border-bone/10 bg-ink/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="edge flex h-16 items-center justify-between gap-4 sm:h-[72px]">
          {/* On the home page the hero renders its own wordmark, so the header
              mark only appears once the hero is behind you. */}
          <Link
            to="/"
            className={cn(
              'font-display text-xl leading-none transition-opacity duration-500 sm:text-2xl',
              onHome && !scrolled ? 'pointer-events-none opacity-0' : 'opacity-100'
            )}
          >
            {BRAND.name}
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <NavLink
                    to={link.href}
                    className={({ isActive }) =>
                      cn(
                        'relative text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-200',
                        isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-underline"
                            className="absolute -bottom-1.5 left-0 h-px w-full bg-current"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-bone/10"
            >
              <Heart size={18} strokeWidth={1.9} />
              {wishlistCount > 0 && <Dot>{wishlistCount}</Dot>}
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart, ${count} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-bone/10"
            >
              <ShoppingBag size={18} strokeWidth={1.9} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-volt px-1 text-[10px] font-bold tabular-nums text-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => toggleMenu()}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-bone/10 lg:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[99] bg-ink lg:hidden"
          >
            <nav aria-label="Mobile" className="edge flex h-full flex-col justify-center gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={reduced ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={link.href}
                    className="font-display block py-2 text-[clamp(2.5rem,12vw,4.5rem)] leading-[0.95]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-bone px-1 text-[10px] font-bold tabular-nums text-ink">
      {children}
    </span>
  );
}
