import { useMemo, useState } from 'react';
import { CalendarClock, Plus, RefreshCw, Search } from 'lucide-react';
import { useClassData } from '../../store/ClassDataContext';
import useNow from '../../hooks/useNow';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Confirm';
import { splitDeadlinesByDate } from '../../lib/selectors';
import { DEADLINE_CATEGORIES, PRIORITY_ORDER, parseDateTime, subjectList } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import SearchInput from '../../components/ui/SearchInput';
import FilterChips from '../../components/ui/FilterChips';
import EmptyState from '../../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../../components/ui/DataStatus';
import DeadlineForm from '../../components/deadlines/DeadlineForm';
import DeadlineCard from '../../components/deadlines/DeadlineCard';

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

export default function AdminDeadlines() {
  const { data, loading, error, refresh, actions } = useClassData();
  const now = useNow(30000);
  const notify = useToast();
  const confirm = useConfirm();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('due-asc');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const subjects = useMemo(() => subjectList(data.deadlines, data.classes), [data.deadlines, data.classes]);
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
  const sections = [
    { key: 'upcoming', title: 'Upcoming', dot: 'bg-accent' },
    { key: 'past', title: 'Past deadlines', dot: 'bg-text-3' },
  ].filter((section) => status === 'all' || status === section.key);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (deadline) => {
    setEditing(deadline);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    try {
      await actions.saveDeadline(values, editing?.id);
      notify(editing ? 'Deadline updated.' : 'Deadline created.', 'success');
      closeForm();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleToggle = async (deadline) => {
    try {
      await actions.setDeadlineStatus(deadline.id, deadline.completed ? 'pending' : 'completed');
      notify(deadline.completed ? 'Deadline reopened.' : 'Deadline completed.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (deadline) => {
    const confirmed = await confirm({
      title: `Delete “${deadline.title}”?`,
      description: 'This removes the deadline from the shared class database. This cannot be undone.',
      confirmLabel: 'Delete deadline',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await actions.deleteDeadline(deadline.id);
      notify('Deadline deleted.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStatus('all');
  };

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Deadline management" subtitle="Create, edit and complete shared deadlines." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Deadline management"
        subtitle="Past deadlines stay in the database and can still be edited or deleted."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
              Refresh
            </Button>
            <Button icon={Plus} onClick={openCreate}>
              New deadline
            </Button>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="bg-surface rounded-lg shadow-elev-1 border border-hairline mb-5 space-y-3.5 p-4">
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
          icon={data.deadlines.length === 0 ? CalendarClock : Search}
          title={data.deadlines.length === 0 ? 'No deadlines yet' : 'Nothing matches those filters'}
          description={
            data.deadlines.length === 0
              ? 'Create the first deadline. It will appear on the student portal immediately.'
              : 'Try a different search term, category or section.'
          }
          action={
            data.deadlines.length === 0 ? (
              <Button icon={Plus} onClick={openCreate}>
                Add deadline
              </Button>
            ) : (
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
                  {section.key === 'upcoming' ? 'No upcoming deadlines.' : 'No past deadlines.'}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {groups[section.key].map((deadline) => (
                    <DeadlineCard
                      key={deadline.id}
                      deadline={deadline}
                      now={now}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit deadline' : 'New deadline'}
        description={editing ? 'Update the shared deadline.' : 'Publish a deadline for the whole class.'}
        size="lg"
      >
        <DeadlineForm
          initial={editing}
          subjects={subjects}
          onCancel={closeForm}
          onSubmit={handleSubmit}
          submitLabel={editing ? 'Save changes' : 'Add deadline'}
        />
      </Modal>
    </div>
  );
}
