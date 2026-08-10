import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useMagnetic } from '../../hooks/useInteractions';

type Variant = 'solid' | 'outline' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-bone text-ink hover:bg-chalk',
  outline: 'border border-current text-current hover:bg-current/10',
  ghost: 'text-current hover:bg-current/10',
  accent: 'text-ink',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-5 text-[11px]',
  md: 'h-12 px-7 text-xs',
  lg: 'h-14 px-9 text-sm',
};

const BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.16em] transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none select-none';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  accent?: string;
  className?: string;
  children: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'solid', size = 'md', accent, className, children, style, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      style={variant === 'accent' && accent ? { backgroundColor: accent, ...style } : style}
      {...rest}
    >
      {children}
    </button>
  );
});

interface LinkButtonProps extends CommonProps {
  to: string;
  onClick?: () => void;
  'aria-label'?: string;
}

export function LinkButton({
  to,
  variant = 'solid',
  size = 'md',
  accent,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      style={variant === 'accent' && accent ? { backgroundColor: accent } : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}

/**
 * Button whose inner label drifts toward the pointer. The wrapper keeps its own
 * hit area static so the magnetism never makes the control hard to click.
 */
export function MagneticButton({
  children,
  className,
  onClick,
  accent,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: string;
  ariaLabel?: string;
}) {
  const ref = useMagnetic<HTMLSpanElement>(0.4, 70);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn('group relative inline-flex items-center justify-center p-2', className)}
    >
      <span
        ref={ref}
        className="inline-flex h-14 items-center justify-center rounded-full px-9 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors duration-200 will-change-transform"
        style={{ backgroundColor: accent ?? 'var(--color-bone)' }}
      >
        {children}
      </span>
    </button>
  );
}
