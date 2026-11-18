import { cn } from '../../lib/utils';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  soft: 'btn-soft',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const SIZES = {
  sm: 'btn-sm',
  md: 'btn-md',
  icon: 'btn-icon',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn('btn', VARIANTS[variant] ?? VARIANTS.primary, SIZES[size] ?? SIZES.md, className)}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
      {IconRight ? <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
    </button>
  );
}

export function IconButton({ icon: Icon, label, variant = 'ghost', className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('btn btn-icon', VARIANTS[variant] ?? VARIANTS.ghost, className)}
      {...props}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
