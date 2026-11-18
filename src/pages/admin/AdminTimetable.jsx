import { useMemo, useState } from 'react';
import { CalendarDays, Clock, Plus, RefreshCw, Zap } from 'lucide-react';
import { useClassData } from '../../store/ClassDataContext';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Confirm';
import { classesForDay } from '../../lib/selectors';
import {
  DAYS,
  DAYS_SHORT,
  cn,
  formatHours,
  formatTimeRange,
  minutesFromTime,
  todayName,
} from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import Button, { IconButton } from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../../components/ui/DataStatus';
import ClassForm from '../../components/timetable/ClassForm';
import ClassCard from '../../components/timetable/ClassCard';

export default function AdminTimetable() {
  const { data, loading, error, refresh, actions } = useClassData();
  const notify = useToast();
  const confirm = useConfirm();
  const today = todayName();

  const [selectedDay, setSelectedDay] = useState(today);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [prefillDay, setPrefillDay] = useState(null);

  const totalMinutes = useMemo(
    () =>
      data.classes.reduce(
        (sum, entry) =>
          sum + Math.max(0, (minutesFromTime(entry.endTime) ?? 0) - (minutesFromTime(entry.startTime) ?? 0)),
        0,
      ),
    [data.classes],
  );

  const busiest = useMemo(() => {
    const counts = DAYS.map((day) => ({ day, count: data.classes.filter((entry) => entry.day === day).length }));
    return counts.reduce((best, item) => (item.count > best.count ? item : best), { day: '—', count: 0 });
  }, [data.classes]);

  const selectedClasses = classesForDay(data.classes, selectedDay);

  const openCreate = (day = null) => {
    setEditing(null);
    setPrefillDay(day);
    setFormOpen(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setPrefillDay(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setPrefillDay(null);
  };

  const handleSubmit = async (values) => {
    try {
      await actions.saveClass(values, editing?.id);
      notify(editing ? 'Class updated.' : 'Class added to the timetable.', 'success');
      closeForm();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (entry) => {
    const confirmed = await confirm({
      title: `Remove ${entry.subject}?`,
      description: `${entry.day} at ${formatTimeRange(entry.startTime, entry.endTime)} will be removed from the shared timetable.`,
      confirmLabel: 'Remove class',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await actions.deleteClass(entry.id);
      notify('Class removed.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const formInitial = editing ?? (prefillDay ? { day: prefillDay } : undefined);

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Timetable management" subtitle="Build the shared weekly timetable." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Timetable management"
        subtitle="Changes appear on the student portal immediately."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => openCreate(selectedDay)}>
              Add class
            </Button>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Classes this week" value={data.classes.length} icon={CalendarDays} tone="brand" hint="Across all days" />
        <StatCard label="Weekly contact hours" value={formatHours(totalMinutes)} icon={Clock} tone="sky" hint="Scheduled class time" />
        <StatCard
          label="Busiest day"
          value={busiest.count > 0 ? busiest.day.slice(0, 3) : '—'}
          icon={Zap}
          tone="amber"
          hint={busiest.count > 0 ? `${busiest.count} classes` : 'No classes scheduled'}
        />
      </div>

      {data.classes.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Your timetable is empty"
          description="Add the first class. Students will see the weekly grid as soon as it is saved."
          action={
            <Button icon={Plus} onClick={() => openCreate()}>
              Add class
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  aria-pressed={selectedDay === day}
                  className={cn(
                    'chip shrink-0 flex-col items-center gap-0.5 px-3.5 py-2',
                    selectedDay === day && 'chip-active',
                  )}
                >
                  <span>{DAYS_SHORT[index]}</span>
                  <span
                    className={cn(
                      'text-[10px] font-bold',
                      selectedDay === day ? 'text-white/80' : day === today ? 'text-brand' : 'text-muted',
                    )}
                  >
                    {classesForDay(data.classes, day).length}
                  </span>
                </button>
              ))}
            </div>

            <section className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{selectedDay}</h2>
                  <p className="text-[11px] text-muted">
                    {selectedClasses.length === 0
                      ? 'No classes'
                      : `${selectedClasses.length} class${selectedClasses.length === 1 ? '' : 'es'}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDay === today ? <span className="badge tone-brand">Today</span> : null}
                  <IconButton
                    icon={Plus}
                    label={`Add class on ${selectedDay}`}
                    onClick={() => openCreate(selectedDay)}
                    variant="secondary"
                  />
                </div>
              </div>

              {selectedClasses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-soft/50 px-4 py-6 text-center text-xs text-muted">
                  A free day — nothing scheduled.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedClasses.map((entry) => (
                    <ClassCard key={entry.id} entry={entry} comfortable onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="card hidden p-3 md:block">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-muted">Week overview</p>
              <p className="text-[11px] text-muted">
                Today: <span className="font-semibold text-ink">{today}</span>
              </p>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="grid min-w-[860px] grid-cols-7 gap-2">
                {DAYS.map((day, index) => {
                  const entries = classesForDay(data.classes, day);
                  const isToday = day === today;
                  return (
                    <div
                      key={day}
                      className={cn(
                        'flex min-h-[15rem] flex-col gap-2 rounded-2xl border p-2',
                        isToday ? 'border-brand/40 bg-brand-soft/50' : 'border-line/70 bg-soft/40',
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 px-1">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              'text-[11px] font-bold uppercase tracking-wide',
                              isToday ? 'text-brand-ink' : 'text-muted',
                            )}
                          >
                            {DAYS_SHORT[index]}
                          </span>
                          {isToday ? <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-label="Today" /> : null}
                        </div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-[10px] font-semibold text-muted">{entries.length}</span>
                          <button
                            type="button"
                            onClick={() => openCreate(day)}
                            aria-label={`Add class on ${day}`}
                            className="rounded-md p-0.5 text-muted transition hover:bg-surface hover:text-brand"
                          >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {entries.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-line px-2 py-4 text-center text-[10px] text-muted">
                            Free day
                          </p>
                        ) : (
                          entries.map((entry) => (
                            <ClassCard key={entry.id} entry={entry} onEdit={openEdit} onDelete={handleDelete} />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit class' : 'Add class'}
        description={editing ? 'Update this weekly timetable entry.' : 'Add a recurring class to the shared week.'}
        size="lg"
      >
        <ClassForm
          initial={formInitial}
          onCancel={closeForm}
          onSubmit={handleSubmit}
          submitLabel={editing ? 'Save changes' : 'Add class'}
        />
      </Modal>
    </div>
  );
}
