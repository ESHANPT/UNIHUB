import { useMemo, useState } from 'react';
import { CalendarClock, RefreshCw, Search } from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import useNow from '../hooks/useNow';
import { splitDeadlinesByDate } from '../lib/selectors';
import { DEADLINE_CATEGORIES, PRIORITY_ORDER, parseDateTime } from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import FilterChips from '../components/ui/FilterChips';
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
    { key: 'upcoming', title: 'Upcoming', dot: 'bg-violet-500' },
    { key: 'past', title: 'Past deadlines', dot: 'bg-slate-400' },
  ].filter((section) => status === 'all' || status === section.key);

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStatus('all');
  };

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Deadlines" subtitle="Every assignment, quiz and exam in one calm place." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Deadlines"
        subtitle="Shared class deadlines, updated live by your class admin."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="card mb-5 space-y-3 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search deadlines, subjects…"
            className="sm:max-w-xs"
          />
          <div className="flex gap-2 sm:ml-auto">
            <select
              className="input select w-auto flex-1 sm:flex-none"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {DEADLINE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="input select w-auto flex-1 sm:flex-none"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort deadlines"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterChips
            label="Filter deadlines by section"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS.map((option) => ({
              ...option,
              count:
                option.value === 'all'
                  ? data.deadlines.length
                  : option.value === 'upcoming'
                    ? upcoming.length
                    : past.length,
            }))}
          />
          <p className="text-xs text-muted">
            {visibleCount} of {data.deadlines.length} shown
          </p>
        </div>
      </div>

      {visibleCount === 0 ? (
        <EmptyState
          icon={noData ? CalendarClock : Search}
          title={noData ? 'No deadlines yet' : 'Nothing matches those filters'}
          description={
            noData
              ? 'Your class admin has not published any deadlines yet. Check back soon.'
              : 'Try a different search term, category or section.'
          }
          action={
            noData ? null : (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-7">
          {sections.map((section) => (
            <section key={section.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${section.dot}`} aria-hidden="true" />
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <span className="badge tone-slate">{groups[section.key].length}</span>
              </div>
              {groups[section.key].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-soft/50 px-4 py-5 text-xs text-muted">
                  {section.key === 'upcoming'
                    ? 'No upcoming deadlines in this view.'
                    : 'No past deadlines in this view.'}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {groups[section.key].map((deadline) => (
                    <DeadlineCard key={deadline.id} deadline={deadline} now={now} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
