import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, FileJson, Info, RefreshCw, Upload } from 'lucide-react';
import { useClassData } from '../../store/ClassDataContext';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Confirm';
import { supabase } from '../../lib/supabase';
import { readLegacyState } from '../../lib/storage';
import {
  legacyAnnouncementPayload,
  legacyDeadlinePayload,
  legacyReminderPayload,
  legacyTimetablePayload,
} from '../../lib/mappers';
import { downloadJson, toDateInput } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/DataStatus';

const TABLE_LABELS = {
  deadlines: 'Deadlines',
  timetable: 'Timetable classes',
  reminders: 'Reminders',
  announcements: 'Announcements',
};

export default function AdminData() {
  const { data, error: loadError, refresh } = useClassData();
  const notify = useToast();
  const confirm = useConfirm();
  const [legacy, setLegacy] = useState(() => readLegacyState());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setLegacy(readLegacyState());
  }, []);

  const legacyCounts = useMemo(() => {
    if (!legacy.state) return null;
    return {
      deadlines: legacy.state.deadlines.length,
      timetable: legacy.state.classes.length,
      reminders: legacy.state.reminders.filter((reminder) => !reminder.completed).length,
      announcements: legacy.state.announcements.length,
    };
  }, [legacy]);

  const skippedCompletedReminders = legacy.state
    ? legacy.state.reminders.filter((reminder) => reminder.completed).length
    : 0;

  const totalLegacy = legacyCounts
    ? legacyCounts.deadlines + legacyCounts.timetable + legacyCounts.reminders + legacyCounts.announcements
    : 0;

  const handleReRead = () => {
    setLegacy(readLegacyState());
    setResult(null);
    notify('Re-read the prototype data in this browser.', 'info');
  };

  const handleImport = async () => {
    if (!legacy.state) return;

    const payload = {
      deadlines: legacy.state.deadlines.map(legacyDeadlinePayload),
      timetable: legacy.state.classes.map(legacyTimetablePayload),
      reminders: legacy.state.reminders
        .filter((reminder) => !reminder.completed)
        .map(legacyReminderPayload),
      announcements: legacy.state.announcements.map(legacyAnnouncementPayload),
    };

    const confirmed = await confirm({
      title: 'Import prototype data?',
      description: `This adds up to ${totalLegacy} records to the shared database. Existing records are never overwritten or deleted; duplicates are skipped automatically. Your browser data stays untouched.`,
      confirmLabel: 'Import data',
      tone: 'danger',
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const { data: summary, error } = await supabase.rpc('import_legacy_data', { payload });
      if (error) throw new Error(error.message);
      setResult(summary);
      await refresh();
      notify('Prototype data imported.', 'success');
    } catch (err) {
      notify(err.message || 'The import failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    downloadJson(
      `unihub-supabase-backup-${toDateInput(new Date())}.json`,
      JSON.stringify(
        {
          app: 'UniHub',
          source: 'supabase',
          exportedAt: new Date().toISOString(),
          deadlines: data.deadlines,
          classes: data.classes,
          reminders: data.reminders,
          announcements: data.announcements,
        },
        null,
        2,
      ),
    );
    notify('Database backup downloaded.', 'success');
  };

  return (
    <div className="animate-rise">
      <PageHeader
        title="Data & migration"
        subtitle="Move the original prototype records into the shared database safely."
        actions={
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export database
          </Button>
        }
      />

      <ErrorBanner message={loadError} onRetry={refresh} />

      <section className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileJson className="h-4 w-4 text-brand" aria-hidden="true" />
              Browser prototype data
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
              UniHub reads the old <code className="rounded bg-soft px-1">unihub:data</code> localStorage record
              without changing it. Records are validated in the browser and again by the database function.
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleReRead}>
            Re-read
          </Button>
        </div>

        {!legacy.found ? (
          <p className="mt-4 rounded-xl border border-line bg-soft px-3 py-2.5 text-xs leading-relaxed text-muted">
            No prototype data was found in this browser. You can still add records from the admin pages, or import on
            the browser that holds the original prototype.
          </p>
        ) : null}

        {legacy.found && legacy.issue ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {legacy.issue}
          </p>
        ) : null}

        {legacyCounts ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(TABLE_LABELS).map(([key, label]) => (
                <div key={key} className="rounded-xl border border-line bg-soft px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-0.5 text-lg font-bold leading-tight">{legacyCounts[key]}</p>
                </div>
              ))}
            </div>

            {skippedCompletedReminders > 0 ? (
              <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {skippedCompletedReminders} completed personal reminder
                {skippedCompletedReminders === 1 ? '' : 's'} will be skipped. Shared class reminders have no personal
                completion state.
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button icon={Upload} onClick={handleImport} disabled={busy || totalLegacy === 0}>
                {busy ? 'Importing…' : `Import ${totalLegacy} records`}
              </Button>
              <p className="text-[11px] text-muted">Duplicates skipped · existing records never overwritten</p>
            </div>
          </>
        ) : null}
      </section>

      {result ? (
        <section className="card mt-5 p-5">
          <h2 className="text-sm font-semibold">Import result</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {Object.entries(result).map(([table, counts]) => (
              <div key={table} className="rounded-xl border border-line bg-soft px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {TABLE_LABELS[table] ?? table}
                </p>
                <p className="mt-1 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{counts.inserted} added</span>
                  <span className="text-muted"> · {counts.skipped} skipped</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Your original browser data is still present. Remove it separately only after confirming the new data looks
            correct.
          </p>
        </section>
      ) : null}

      <section className="card mt-5 p-5">
        <h2 className="text-sm font-semibold">How the migration works</h2>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
          <li>• The browser validates records with the existing schema before uploading anything.</li>
          <li>• The database function re-checks administrator membership, row limits and constraints.</li>
          <li>• Natural keys prevent duplicates; no UPDATE or DELETE is ever performed by the import.</li>
          <li>• Completed local reminders are skipped because reminders are class-wide and read-only.</li>
          <li>• Legacy announcements are imported as published, preserving their original date.</li>
        </ul>
      </section>
    </div>
  );
}
