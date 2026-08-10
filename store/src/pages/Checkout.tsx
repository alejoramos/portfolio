import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, Lock } from 'lucide-react';
import type { CheckoutStep, PaymentDetails, ShippingDetails } from '../types/cart';
import { useCartStore, computeTotals } from '../store/cart.store';
import { formatPrice, cn } from '../lib/utils';
import { SmartImage } from '../components/ui/Primitives';
import { usePrefersReducedMotion } from '../hooks/useEnvironment';

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Checkout.
 *
 * Deliberately the least animated surface on the site — a progress bar and a
 * step slide, nothing more. Motion here would only get between someone and their
 * order. Validation is real so the flow behaves like a store rather than a mock.
 *
 * No payment is processed and no card data leaves the component; the fields
 * exist to complete the concept, not to capture anything.
 */
export default function Checkout() {
  const { lines, clear } = useCartStore();
  const reduced = usePrefersReducedMotion();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [direction, setDirection] = useState(1);
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shipping, setShipping] = useState<ShippingDetails>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    method: 'standard',
  });

  const [payment, setPayment] = useState<PaymentDetails>({
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const totals = useMemo(
    () => computeTotals(lines, shipping.method === 'express'),
    [lines, shipping.method]
  );

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const validateShipping = () => {
    const next: Record<string, string> = {};
    if (!shipping.email.includes('@')) next.email = 'Enter a valid email address';
    if (!shipping.firstName.trim()) next.firstName = 'Required';
    if (!shipping.lastName.trim()) next.lastName = 'Required';
    if (!shipping.address.trim()) next.address = 'Required';
    if (!shipping.city.trim()) next.city = 'Required';
    if (shipping.postcode.trim().length < 4) next.postcode = 'Enter a valid postcode';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePayment = () => {
    const next: Record<string, string> = {};
    const digits = payment.cardNumber.replace(/\s/g, '');
    if (!payment.nameOnCard.trim()) next.nameOnCard = 'Required';
    if (digits.length < 15 || !/^\d+$/.test(digits)) next.cardNumber = 'Enter a 16 digit number';
    if (!/^\d{2}\s?\/\s?\d{2}$/.test(payment.expiry)) next.expiry = 'MM / YY';
    if (payment.cvc.length < 3) next.cvc = '3 digits';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goTo = (next: CheckoutStep) => {
    setDirection(STEPS.findIndex((s) => s.key === next) > stepIndex ? 1 : -1);
    setErrors({});
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const advance = () => {
    if (step === 'shipping' && validateShipping()) goTo('payment');
    else if (step === 'payment' && validatePayment()) goTo('review');
  };

  const placeOrder = () => {
    setPlaced(true);
    clear();
  };

  if (placed) return <OrderConfirmed email={shipping.email} />;

  if (lines.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-bone">
        <div>
          <p className="font-display text-4xl">Your bag is empty</p>
          <Link
            to="/shop"
            className="mt-7 inline-flex h-12 items-center rounded-full bg-bone px-8 text-xs font-semibold uppercase tracking-widest text-ink"
          >
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone">
      <div className="edge pb-28 pt-28 sm:pt-32">
        <div className="mb-10 flex items-center justify-between gap-4">
          <h1 className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-none">Checkout</h1>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] opacity-60 transition-opacity hover:opacity-100"
          >
            <ChevronLeft size={14} /> Back to bag
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  onClick={() => i < stepIndex && goTo(s.key)}
                  disabled={i > stepIndex}
                  className={cn(
                    'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity',
                    i === stepIndex ? 'opacity-100' : 'opacity-45',
                    i < stepIndex && 'hover:opacity-80'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-6 w-6 place-items-center rounded-full text-[10px]',
                      i <= stepIndex ? 'bg-bone text-ink' : 'border border-bone/30'
                    )}
                  >
                    {i < stepIndex ? <Check size={12} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className="h-px flex-1 overflow-hidden bg-bone/15">
                    <motion.span
                      className="block h-full bg-bone"
                      initial={false}
                      animate={{ width: i < stepIndex ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={reduced ? false : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {step === 'shipping' && (
                  <ShippingForm
                    value={shipping}
                    onChange={setShipping}
                    errors={errors}
                    freeShipping={totals.subtotal >= 150}
                  />
                )}
                {step === 'payment' && (
                  <PaymentForm value={payment} onChange={setPayment} errors={errors} />
                )}
                {step === 'review' && (
                  <ReviewStep shipping={shipping} payment={payment} onEdit={goTo} />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center gap-4">
              {step !== 'shipping' && (
                <button
                  type="button"
                  onClick={() => goTo(STEPS[stepIndex - 1].key)}
                  className="h-14 rounded-full border border-bone/25 px-8 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-bone/60"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={step === 'review' ? placeOrder : advance}
                className="h-14 flex-1 rounded-full bg-bone px-8 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform duration-200 hover:scale-[1.02]"
              >
                {step === 'review' ? `Place order — ${formatPrice(totals.total)}` : 'Continue'}
              </button>
            </div>

            <p className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] opacity-40">
              <Lock size={12} />
              Concept store — no payment is processed and no details are stored
            </p>
          </div>

          <OrderSummary lines={lines} totals={totals} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Forms */

function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  placeholder,
  className,
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
  inputMode?: 'text' | 'numeric' | 'email';
  maxLength?: number;
}) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-13 w-full rounded-xl border bg-bone/[0.03] px-4 py-3.5 text-sm outline-none transition-colors placeholder:opacity-30',
          error ? 'border-ember' : 'border-bone/15 focus:border-bone/60'
        )}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[11px] text-ember">
          {error}
        </p>
      )}
    </div>
  );
}

function ShippingForm({
  value,
  onChange,
  errors,
  freeShipping,
}: {
  value: ShippingDetails;
  onChange: (v: ShippingDetails) => void;
  errors: Record<string, string>;
  freeShipping: boolean;
}) {
  const set = <K extends keyof ShippingDetails>(key: K, v: ShippingDetails[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <section>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Shipping details</h2>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="sm:col-span-2"
          value={value.email}
          onChange={(v) => set('email', v)}
          error={errors.email}
        />
        <Field
          label="First name"
          autoComplete="given-name"
          value={value.firstName}
          onChange={(v) => set('firstName', v)}
          error={errors.firstName}
        />
        <Field
          label="Last name"
          autoComplete="family-name"
          value={value.lastName}
          onChange={(v) => set('lastName', v)}
          error={errors.lastName}
        />
        <Field
          label="Address"
          autoComplete="street-address"
          className="sm:col-span-2"
          value={value.address}
          onChange={(v) => set('address', v)}
          error={errors.address}
        />
        <Field
          label="City"
          autoComplete="address-level2"
          value={value.city}
          onChange={(v) => set('city', v)}
          error={errors.city}
        />
        <Field
          label="Postcode"
          autoComplete="postal-code"
          value={value.postcode}
          onChange={(v) => set('postcode', v)}
          error={errors.postcode}
        />
      </div>

      <h3 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.22em]">Method</h3>
      <div className="mt-4 grid gap-3">
        {[
          {
            key: 'standard' as const,
            title: 'Standard',
            detail: '2 to 4 working days',
            price: freeShipping ? 'Free' : '£6',
          },
          { key: 'express' as const, title: 'Express', detail: 'Next working day', price: '+£9' },
        ].map((option) => (
          <label
            key={option.key}
            className={cn(
              'flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-5 transition-colors',
              value.method === option.key ? 'border-bone bg-bone/[0.05]' : 'border-bone/15 hover:border-bone/40'
            )}
          >
            <span className="flex items-center gap-4">
              <input
                type="radio"
                name="shipping-method"
                checked={value.method === option.key}
                onChange={() => set('method', option.key)}
                className="h-4 w-4 accent-bone"
              />
              <span>
                <span className="block text-sm font-semibold">{option.title}</span>
                <span className="block text-xs opacity-55">{option.detail}</span>
              </span>
            </span>
            <span className="text-sm tabular-nums">{option.price}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function PaymentForm({
  value,
  onChange,
  errors,
}: {
  value: PaymentDetails;
  onChange: (v: PaymentDetails) => void;
  errors: Record<string, string>;
}) {
  const set = <K extends keyof PaymentDetails>(key: K, v: PaymentDetails[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <section>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Payment</h2>
      <p className="mt-3 rounded-xl border border-bone/15 bg-bone/[0.03] p-4 text-xs leading-relaxed opacity-70">
        This is a portfolio concept. Nothing is sent anywhere and no payment is taken — use any
        numbers you like.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          label="Name on card"
          autoComplete="cc-name"
          className="sm:col-span-2"
          value={value.nameOnCard}
          onChange={(v) => set('nameOnCard', v)}
          error={errors.nameOnCard}
        />
        <Field
          label="Card number"
          inputMode="numeric"
          maxLength={19}
          placeholder="4242 4242 4242 4242"
          className="sm:col-span-2"
          value={value.cardNumber}
          onChange={(v) =>
            set(
              'cardNumber',
              v
                .replace(/\D/g, '')
                .slice(0, 16)
                .replace(/(.{4})/g, '$1 ')
                .trim()
            )
          }
          error={errors.cardNumber}
        />
        <Field
          label="Expiry"
          inputMode="numeric"
          maxLength={7}
          placeholder="MM / YY"
          value={value.expiry}
          onChange={(v) => {
            const digits = v.replace(/\D/g, '').slice(0, 4);
            set('expiry', digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits);
          }}
          error={errors.expiry}
        />
        <Field
          label="CVC"
          inputMode="numeric"
          maxLength={4}
          placeholder="123"
          value={value.cvc}
          onChange={(v) => set('cvc', v.replace(/\D/g, '').slice(0, 4))}
          error={errors.cvc}
        />
      </div>
    </section>
  );
}

function ReviewStep({
  shipping,
  payment,
  onEdit,
}: {
  shipping: ShippingDetails;
  payment: PaymentDetails;
  onEdit: (step: CheckoutStep) => void;
}) {
  const last4 = payment.cardNumber.replace(/\s/g, '').slice(-4);

  return (
    <section>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Review</h2>

      <div className="mt-7 space-y-4">
        <ReviewBlock title="Ship to" onEdit={() => onEdit('shipping')}>
          <p>
            {shipping.firstName} {shipping.lastName}
          </p>
          <p className="opacity-60">
            {shipping.address}, {shipping.city}, {shipping.postcode}
          </p>
          <p className="opacity-60">{shipping.country}</p>
          <p className="mt-2 opacity-60">{shipping.email}</p>
        </ReviewBlock>

        <ReviewBlock title="Method" onEdit={() => onEdit('shipping')}>
          <p className="capitalize">{shipping.method}</p>
          <p className="opacity-60">
            {shipping.method === 'express' ? 'Next working day' : '2 to 4 working days'}
          </p>
        </ReviewBlock>

        <ReviewBlock title="Payment" onEdit={() => onEdit('payment')}>
          <p>{payment.nameOnCard}</p>
          <p className="tabular-nums opacity-60">•••• •••• •••• {last4}</p>
        </ReviewBlock>
      </div>
    </section>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-bone/15 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-55">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] uppercase tracking-[0.14em] underline underline-offset-4 opacity-60 hover:opacity-100"
        >
          Edit
        </button>
      </div>
      <div className="space-y-0.5 text-sm">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- Summary */

function OrderSummary({
  lines,
  totals,
}: {
  lines: ReturnType<typeof useCartStore.getState>['lines'];
  totals: ReturnType<typeof computeTotals>;
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-3xl border border-bone/10 bg-bone/[0.03] p-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em]">Order</h2>

        <ul className="mt-5 space-y-4">
          {lines.map((line) => (
            <li key={line.key} className="flex items-center gap-4">
              <div className="relative shrink-0 rounded-xl bg-bone/[0.05] p-2">
                <SmartImage src={line.image} alt={line.name} className="h-14 w-14" />
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-bone px-1 text-[10px] font-bold tabular-nums text-ink">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{line.name}</p>
                <p className="text-[11px] opacity-50">
                  {line.colorwayName} · {line.size}
                </p>
              </div>
              <p className="shrink-0 text-xs tabular-nums">
                {formatPrice(line.price * line.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2.5 border-t border-bone/10 pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="opacity-60">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="opacity-60">Shipping</dt>
            <dd className={cn('tabular-nums', totals.shipping === 0 && 'text-volt')}>
              {totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}
            </dd>
          </div>
          <div className="flex justify-between opacity-60">
            <dt>VAT included</dt>
            <dd className="tabular-nums">{formatPrice(totals.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-bone/10 pt-3 text-lg font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(totals.total)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function OrderConfirmed({ email }: { email: string }) {
  const navigate = useNavigate();
  const orderNumber = useMemo(
    () => `KN-${Math.floor(100000 + Math.random() * 899999)}`,
    []
  );

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6 text-bone">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-lg text-center"
      >
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-volt text-ink"
        >
          <Check size={28} strokeWidth={2.5} />
        </motion.span>

        <h1 className="font-display mt-8 text-[clamp(2.5rem,9vw,4.5rem)] leading-[0.9]">
          Order placed
        </h1>
        <p className="mt-4 text-sm opacity-65">
          Confirmation sent to <span className="text-bone">{email}</span>
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] opacity-45">
          Order {orderNumber}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="h-14 rounded-full bg-bone px-9 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-transform hover:scale-105"
          >
            Keep shopping
          </button>
          <Link
            to="/"
            className="grid h-14 place-items-center rounded-full border border-bone/25 px-9 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-bone/60"
          >
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
