import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../components/commerce/CartDrawer';
import { Cursor } from '../components/ui/Primitives';
import { ScrollTrigger } from '../lib/gsap';
import { useSmoothScroll } from '../app/providers/SmoothScrollProvider';

export function RootLayout() {
  const { pathname } = useLocation();
  const { lenis } = useSmoothScroll();

  /* Route changes reset scroll and re-measure every trigger, since page height
     changes wholesale between routes. */
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname, lenis]);

  return (
    <>
      <Cursor />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
