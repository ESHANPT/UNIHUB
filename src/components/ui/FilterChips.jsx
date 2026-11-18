import { cn } from '../../lib/utils';

export default function FilterChips({ options, value, onChange, label, className }) {
  return (
    <div className={cn('no-scrollbar flex items-center gap-1.5 overflow-x-auto', className)} role="group" aria-label={label}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn('chip', active && 'chip-active')}
          >
            {option.label}
            {typeof option.count === 'number' ? <span className="chip-count">{option.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
