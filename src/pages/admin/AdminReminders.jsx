import { useMemo, useState } from 'react';
import { BellRing, Info, Plus, RefreshCw } from 'lucide-react';
import { useClassData } from '../../store/ClassDataContext';
import useNow from '../../hooks/useNow';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Confirm';
import { splitReminders } from '../../lib/selectors';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../../components/ui/DataStatus';
import ReminderForm from '../../components/reminders/ReminderForm';
import ReminderCard from '../../components/reminders/ReminderCard';

const SECTIONS = [
  { key: 'overdue', title: 'Overdue', dot: 'bg-danger', empty: 'Nothing overdue.' },
  { key: 'dueToday', title: 'Due today', dot: 'bg-warning', empty: 'Nothing due today.' },
  { key: 'upcoming', title: 'Upcoming', dot: 'bg-accent', empty: 'No upcoming reminders.' },
];

export default function AdminReminders() {
  const { data, loading, error, refresh, actions } = useClassData();
  const now = useNow(30000);
  const notify = useToast();
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const groups = useMemo(() => splitReminders(data.reminders, new Date(now)), [data.reminders, now]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (reminder) => {
    setEditing(reminder);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    try {
      await actions.saveReminder(values, editing?.id);
      notify(editing ? 'Reminder updated.' : 'Reminder published.', 'success');
      closeForm();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (reminder) => {
    const confirmed = await confirm({
      title: `Delete “${reminder.title}”?`,
      description: 'This removes the shared reminder for the whole class. This cannot be undone.',
      confirmLabel: 'Delete reminder',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await actions.deleteReminder(reminder.id);
      notify('Reminder deleted.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Reminder management" subtitle="Publish class-wide reminders." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Reminder management"
        subtitle="Reminders are shared with the whole class."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
              Refresh
            </Button>
            <Button icon={Plus} onClick={openCreate}>
              New reminder
            </Button>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="mb-5 flex items-start gap-2.5 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 text-xs leading-relaxed text-text-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent stroke-[1.5]" aria-hidden="true" />
        <span>
          There is no per-student completion state in this version. Students see these reminders read-only, and browser
          notifications only fire while their tab is open.
        </span>
      </div>

      {data.reminders.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No reminders yet"
          description="Create a reminder for the whole class — a submission, a call or a library return."
          action={
            <Button icon={Plus} onClick={openCreate}>
              Create reminder
            </Button>
          }
        />
      ) : (
        <div className="space-y-7">
          {SECTIONS.map((section) => (
            <section key={section.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${section.dot}`} aria-hidden="true" />
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <span className="badge tone-slate">{groups[section.key].length}</span>
              </div>

              {groups[section.key].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-soft/50 px-4 py-5 text-xs text-muted">
                  {section.empty}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {groups[section.key].map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      now={now}
                      onEdit={openEdit}
                      onDelete={handleDelete}
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
        title={editing ? 'Edit reminder' : 'New reminder'}
        description={editing ? 'Update this shared reminder.' : 'Publish a reminder for the whole class.'}
      >
        <ReminderForm
          initial={editing}
          onCancel={closeForm}
          onSubmit={handleSubmit}
          submitLabel={editing ? 'Save changes' : 'Publish reminder'}
        />
      </Modal>
    </div>
  );
}
