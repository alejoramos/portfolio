import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';
import { RootLayout } from '../layout/RootLayout';
import Home from '../pages/Home';

/* Home ships in the initial bundle; everything else is fetched on navigation. */
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetail = lazy(() => import('../pages/Product'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Wishlist = lazy(() => import('../pages/Wishlist'));

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink">
      <span className="font-display animate-pulse text-2xl text-bone/40">KINETA</span>
    </div>
  );
}

/* Where the app is mounted. "/" in development, "/store" once published inside
   the portfolio. Taken from Vite's base so there is only one place to change. */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <SmoothScrollProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Home />} />

              <Route path="shop" element={<Shop />} />

              <Route
                path="new"
                element={
                  <Shop
                    badge="new"
                    kicker="SS26"
                    title="New Drop"
                    intro="The pieces that just landed. Limited runs, restocked rarely."
                  />
                }
              />

              <Route
                path="tops"
                element={
                  <Shop
                    category="tops"
                    kicker="Layers that move first"
                    title="Tops"
                    intro="Race weight, thermal, recovery. Ten layers built for different jobs."
                  />
                }
              />

              <Route
                path="footwear"
                element={
                  <Shop
                    category="footwear"
                    kicker="Where the session is won"
                    title="Footwear"
                    intro="Supercritical foams, carbon plates and outsoles cut for the surface you actually run on."
                  />
                }
              />

              <Route
                path="bottoms"
                element={
                  <Shop
                    category="bottoms"
                    kicker="Denim that trains"
                    title="Bottoms"
                    intro="Stretch denim, ripstop cargos and thermal joggers, engineered for a full squat."
                  />
                }
              />

              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="*" element={<Shop kicker="404" title="Lost" />} />
            </Route>
          </Routes>
        </Suspense>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}
