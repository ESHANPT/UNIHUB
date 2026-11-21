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
  pluralize,
  todayName,
} from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';
import ClassCard from '../components/timetable/ClassCard';

export default function Timetable() {
  const { data, loading, error, refresh } = useClassData();
  const today = todayName();
  const [selectedDay, setSelectedDay] = useState(today);

  const allSubjects = useMemo(() => [...new Set(data.classes.map((c) => c.subject))].sort(), [data.classes]);

  const totalMinutes = useMemo(
    () =>
      data.classes.reduce(
        (sum, entry) =>
          sum + Math.max(0, (minutesFromTime(entry.endTime) ?? 0) - (minutesFromTime(entry.startTime) ?? 0)),
        0
      ),
    [data.classes]
  );

  const busiest = useMemo(() => {
    const counts = DAYS.map((day) => ({ day, count: data.classes.filter((entry) => entry.day === day).length }));
    return counts.reduce((best, item) => (item.count > best.count ? item : best), { day: '—', count: 0 });
  }, [data.classes]);

  const todayClasses = classesForDay(data.classes, today);
  const selectedClasses = classesForDay(data.classes, selectedDay);

  if (loading) {
    return (
      <div>
        <PageHeader title="Weekly timetable" subtitle="Your semester classes and lecture hours." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly timetable"
        subtitle="The shared class schedule, updated live by your administrator."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      {/* Summary stats with Obsidian & Brass styling */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Classes this week"
          value={data.classes.length}
          icon={CalendarDays}
          hint="Across all weekdays"
        />
        <StatCard
          label="Weekly lecture hours"
          value={formatHours(totalMinutes)}
          icon={Clock}
          hint="Scheduled contact hours"
        />
        <StatCard
          label="Busiest day"
          value={busiest.count > 0 ? busiest.day : '—'}
          icon={Zap}
          hint={busiest.count > 0 ? `${pluralize(busiest.count, 'class', 'classes')} scheduled` : 'No classes scheduled'}
        />
      </div>

      {data.classes.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No timetable published yet"
          description="Your administrator has not added any classes to the schedule."
        />
      ) : (
        <>
          {/* Mobile Day Selector and Day-by-Day View */}
          <div className="space-y-4 md:hidden">
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
              {DAYS.map((day, index) => {
                const isToday = day === today;
                const isSelected = selectedDay === day;
                const count = classesForDay(data.classes, day).length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-md transition-all duration-fast select-none cursor-pointer shrink-0',
                      isSelected
                        ? 'bg-surface shadow-elev-1 border border-accent-line text-text'
                        : 'bg-surface-inset shadow-inset-1 border border-hairline/60 text-text-3 hover:text-text'
                    )}
                  >
                    <span className="text-xs font-semibold">{DAYS_SHORT[index]}</span>
                    <span
                      className={cn(
                        'text-xs tabular-nums font-medium',
                        isSelected ? 'text-accent' : isToday ? 'text-text font-bold' : 'text-text-3'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <section className="bg-surface rounded-lg shadow-elev-1 border border-hairline p-4">
              <div className="mb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-text">{selectedDay}</h2>
                  <p className="text-xs text-text-3 tabular-nums">
                    {selectedClasses.length === 0
                      ? 'No classes'
                      : pluralize(selectedClasses.length, 'class', 'classes')}
                  </p>
                </div>
                {selectedDay === today && <Badge tone="accent">Today</Badge>}
              </div>

              {selectedClasses.length === 0 ? (
                <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 px-4 py-8 text-center text-xs text-text-3">
                  No classes scheduled for {selectedDay}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedClasses.map((entry) => (
                    <ClassCard key={entry.id} entry={entry} comfortable allSubjects={allSubjects} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Desktop Weekly Grid on an Inset Surface (DESIGN.md §7) */}
          <section className="hidden md:block bg-surface rounded-lg shadow-elev-2 border border-hairline/60 p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs font-medium text-text-2">Weekly grid</p>
              <div className="flex items-center gap-2 text-xs text-text-3">
                <span>Today:</span>
                <span className="font-medium text-text">{today}</span>
                <span className="tabular-nums font-medium">({pluralize(todayClasses.length, 'class', 'classes')})</span>
              </div>
            </div>

            {/* Inset surface container */}
            <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 overflow-x-auto">
              <div className="grid min-w-[820px] grid-cols-7 gap-2.5">
                {DAYS.map((day, index) => {
                  const entries = classesForDay(data.classes, day);
                  const isToday = day === today;

                  return (
                    <div
                      key={day}
                      className={cn(
                        'flex min-h-[16rem] flex-col gap-2 rounded-md p-2 transition-colors relative',
                        isToday
                          ? 'bg-surface/90 shadow-elev-1 border border-accent-line/50'
                          : 'bg-surface/30 border border-hairline/40'
                      )}
                    >
                      {/* Thin brass line for today per DESIGN.md §7 */}
                      {isToday && (
                        <div className="absolute top-0 inset-x-2 h-[2px] rounded-full bg-accent" />
                      )}

                      <div className="flex items-center justify-between gap-1 px-1 pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              isToday ? 'text-accent' : 'text-text-3'
                            )}
                          >
                            {DAYS_SHORT[index]}
                          </span>
                          {isToday && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                        </div>
                        <span className="text-xs tabular-nums text-text-3 font-medium">
                          {entries.length}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        {entries.length === 0 ? (
                          <div className="rounded border border-dashed border-hairline py-5 text-center text-xs text-text-3">
                            Free
                          </div>
                        ) : (
                          entries.map((entry) => (
                            <ClassCard key={entry.id} entry={entry} allSubjects={allSubjects} />
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
    </div>
  );
}
