import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, FileJson, Info, RefreshCw, Upload } from 'lucide-react';
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
import { downloadJson, pluralize, toDateInput } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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
    notify('Prototype data re-read from local storage.', 'info');
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
      description: `This adds up to ${totalLegacy} records to the shared database. Existing records are preserved and duplicates skipped automatically.`,
      confirmLabel: 'Import records',
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
      notify(err.message || 'Import failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    downloadJson(
      `unihub-backup-${toDateInput(new Date())}.json`,
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
        2
      )
    );
    notify('Database backup downloaded.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data & migration"
        subtitle="Import prototype records or export database backups."
        actions={
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
            Export database
          </Button>
        }
      />

      <ErrorBanner message={loadError} onRetry={refresh} />

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
              <FileJson className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
              <span>Browser prototype records</span>
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-text-3">
              UniHub inspects the local storage prototype container without modifying it. Records are verified before importing.
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleReRead}>
            Re-read
          </Button>
        </div>

        {!legacy.found && (
          <p className="mt-4 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 text-xs leading-relaxed text-text-3">
            No local prototype data was found in this browser. You can add records directly or import from a browser holding original prototype data.
          </p>
        )}

        {legacy.found && legacy.issue && (
          <p className="mt-4 flex items-start gap-2 rounded-md border-l-[3px] border-l-danger bg-surface-inset shadow-inset-1 p-3 text-xs leading-relaxed text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.5]" aria-hidden="true" />
            <span>{legacy.issue}</span>
          </p>
        )}

        {legacyCounts && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {Object.entries(TABLE_LABELS).map(([key, label]) => (
                <div key={key} className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3">
                  <p className="text-xs font-medium text-text-3">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-text tabular-nums">{legacyCounts[key]}</p>
                </div>
              ))}
            </div>

            {skippedCompletedReminders > 0 && (
              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-text-3">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent stroke-[1.5]" aria-hidden="true" />
                <span>
                  {pluralize(skippedCompletedReminders, 'completed reminder')} will be skipped because class reminders are read-only.
                </span>
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button icon={Upload} onClick={handleImport} disabled={busy || totalLegacy === 0}>
                {busy ? 'Importing…' : `Import ${totalLegacy} records`}
              </Button>
              <p className="text-xs text-text-3">Duplicates skipped · existing records preserved</p>
            </div>
          </>
        )}
      </Card>

      {result && (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-text">Import result</h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {Object.entries(result).map(([table, counts]) => (
              <div key={table} className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3">
                <p className="text-xs font-medium text-text-3">
                  {TABLE_LABELS[table] ?? table}
                </p>
                <p className="mt-1 text-xs tabular-nums">
                  <span className="font-semibold text-success">{counts.inserted} added</span>
                  <span className="text-text-3"> · {counts.skipped} skipped</span>
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-text">Data integrity notes</h2>
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-text-3">
          <li>• Records are validated client-side against the schema before dispatch.</li>
          <li>• The Supabase stored procedure verifies administrator permissions and table limits.</li>
          <li>• Natural uniqueness keys prevent duplicate row insertion.</li>
          <li>• Legacy announcements import as published and retain original publication timestamps.</li>
        </ul>
      </Card>
    </div>
  );
}
