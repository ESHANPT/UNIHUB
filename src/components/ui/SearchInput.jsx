import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SearchInput({ value, onChange, placeholder = 'Search…', className, label = 'Search' }) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3 stroke-[1.5]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full h-10 pl-9 pr-9 rounded-md bg-surface-inset text-text text-sm placeholder:text-text-3 border border-transparent shadow-inset-1 transition-all duration-base ease-out hover:border-hairline focus:outline-none focus:border-accent-line focus:shadow-inset-2 focus:ring-1 focus:ring-accent-line [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-3 hover:text-text hover:bg-surface transition-colors duration-fast"
        >
          <X className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
