import { useMemo, useState } from 'react';
import { CalendarDays, Clock, RefreshCw, Zap } from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import { classesForDay } from '../lib/selectors';
import {
  DAYS,
  DAYS_SHORT,
  cn,
  formatHours,
  minutesFromTime,
  todayName,
} from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';
import ClassCard from '../components/timetable/ClassCard';

export default function Timetable() {
  const { data, loading, error, refresh } = useClassData();
  const today = todayName();
  const [selectedDay, setSelectedDay] = useState(today);

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

  const todayClasses = classesForDay(data.classes, today);
  const selectedClasses = classesForDay(data.classes, selectedDay);

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Weekly timetable" subtitle="Your semester, laid out week by week." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Weekly timetable"
        subtitle="The shared class timetable, updated live."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
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
          title="No timetable published yet"
          description="Your class admin has not added any classes. The weekly grid will appear here automatically once they do."
        />
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
              {DAYS.map((day, index) => {
                const isToday = day === today;
                const count = classesForDay(data.classes, day).length;
                return (
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
                        selectedDay === day ? 'text-white/80' : isToday ? 'text-brand' : 'text-muted',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
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
                {selectedDay === today ? <span className="badge tone-brand">Today</span> : null}
              </div>

              {selectedClasses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-soft/50 px-4 py-6 text-center text-xs text-muted">
                  A free day — nothing scheduled.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedClasses.map((entry) => (
                    <ClassCard key={entry.id} entry={entry} comfortable />
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="card hidden p-3 md:block">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-muted">Week overview</p>
              <p className="text-[11px] text-muted">
                Today: <span className="font-semibold text-ink">{today}</span> · {todayClasses.length} classes
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
                        <span className="text-[10px] font-semibold text-muted">{entries.length}</span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {entries.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-line px-2 py-4 text-center text-[10px] text-muted">
                            Free day
                          </p>
                        ) : (
                          entries.map((entry) => <ClassCard key={entry.id} entry={entry} />)
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
    </div>
  );
}
