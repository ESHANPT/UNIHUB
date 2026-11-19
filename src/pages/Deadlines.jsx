import { useMemo, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import useNow from '../hooks/useNow';
import { splitDeadlinesByDate } from '../lib/selectors';
import { DEADLINE_CATEGORIES, PRIORITY_ORDER, parseDateTime } from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import Segmented from '../components/ui/Segmented';
import EmptyState from '../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';
import DeadlineCard from '../components/deadlines/DeadlineCard';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

const SORT_OPTIONS = [
  { value: 'due-asc', label: 'Due soonest' },
  { value: 'due-desc', label: 'Due latest' },
  { value: 'priority', label: 'Highest priority' },
  { value: 'created', label: 'Recently added' },
];

const dueValue = (item) => parseDateTime(item.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;

export default function Deadlines() {
  const { data, loading, error, refresh } = useClassData();
  const now = useNow(30000);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('due-asc');

  const { upcoming, past } = useMemo(() => splitDeadlinesByDate(data.deadlines, now), [data.deadlines, now]);

  const search = query.trim().toLowerCase();
  const matches = (item) => {
    const haystack = `${item.title} ${item.description} ${item.subject} ${item.category}`.toLowerCase();
    return (!search || haystack.includes(search)) && (category === 'all' || item.category === category);
  };

  const sorters = {
    'due-asc': (a, b) => dueValue(a) - dueValue(b),
    'due-desc': (a, b) => dueValue(b) - dueValue(a),
    priority: (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3) || dueValue(a) - dueValue(b),
    created: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
  };

  const groups = useMemo(() => {
    const sorter = sorters[sort] ?? sorters['due-asc'];
    return {
      upcoming: upcoming.filter(matches).sort(sorter),
      past: past.filter(matches).sort(sorter),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcoming, past, search, category, sort]);

  const visibleCount = groups.upcoming.length + groups.past.length;
  const noData = data.deadlines.length === 0;

  const sections = [
    { key: 'upcoming', title: 'Upcoming deadlines', dot: 'bg-accent', items: groups.upcoming },
    { key: 'past', title: 'Past deadlines', dot: 'bg-text-3', items: groups.past },
  ].filter((section) => status === 'all' || status === section.key);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStatus('all');
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Deadlines" subtitle="Coursework, assignments, and exam schedules." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deadlines"
        subtitle="Shared class deadlines, updated live by your administrator."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-lg shadow-elev-1 border border-hairline p-4 space-y-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search deadlines, subjects…"
            className="sm:max-w-xs"
          />

          <Segmented
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            ariaLabel="Filter by status"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-hairline/60">
          <Segmented
            size="sm"
            options={[
              { value: 'all', label: 'All categories' },
              ...DEADLINE_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
            ]}
            value={category}
            onChange={setCategory}
            ariaLabel="Filter by category"
          />

          <div className="flex items-center gap-2 text-xs text-text-3">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-surface-inset shadow-inset-1 rounded-md px-2.5 py-1 text-xs text-text border border-hairline/60 focus:outline-none focus:border-accent-line"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {noData ? (
        <EmptyState
          icon={CalendarClock}
          title="No deadlines published"
          description="Your administrator has not added any deadlines yet."
        />
      ) : visibleCount === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No matching deadlines"
          description="Try adjusting your search query or active filters."
          action={
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.key} className="space-y-3.5">
              <div className="flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${section.dot}`} aria-hidden="true" />
                <h2 className="text-sm font-semibold text-text">{section.title}</h2>
                <span className="text-xs text-text-3 tabular-nums font-medium">({section.items.length})</span>
              </div>

              {section.items.length === 0 ? (
                <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 text-center text-xs text-text-3">
                  No {section.title.toLowerCase()} in this view.
                </div>
              ) : (
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((deadline) => (
                    <DeadlineCard key={deadline.id} deadline={deadline} now={now} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
