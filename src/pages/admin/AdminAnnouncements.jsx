import { useMemo, useState } from 'react';
import { Megaphone, Plus, RefreshCw } from 'lucide-react';
import { useClassData } from '../../store/ClassDataContext';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Confirm';
import { sortAnnouncements } from '../../lib/selectors';
import { ANNOUNCEMENT_CATEGORIES } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FilterChips from '../../components/ui/FilterChips';
import EmptyState from '../../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../../components/ui/DataStatus';
import AnnouncementForm from '../../components/announcements/AnnouncementForm';
import AnnouncementCard from '../../components/announcements/AnnouncementCard';

export default function AdminAnnouncements() {
  const { data, loading, error, refresh, actions } = useClassData();
  const notify = useToast();
  const confirm = useConfirm();

  const [filter, setFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const sorted = useMemo(() => sortAnnouncements(data.announcements), [data.announcements]);
  const visible = filter === 'all' ? sorted : sorted.filter((item) => item.category === filter);
  const draftCount = data.announcements.filter((item) => !item.isPublished).length;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (announcement) => {
    setEditing(announcement);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values) => {
    try {
      await actions.saveAnnouncement(values, editing?.id);
      notify(editing ? 'Announcement updated.' : 'Announcement saved.', 'success');
      closeForm();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleTogglePublished = async (announcement) => {
    try {
      await actions.setAnnouncementPublished(announcement.id, !announcement.isPublished);
      notify(announcement.isPublished ? 'Announcement moved to drafts.' : 'Announcement published.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleDelete = async (announcement) => {
    const confirmed = await confirm({
      title: `Delete “${announcement.title}”?`,
      description: 'This removes the notice for the whole class. This cannot be undone.',
      confirmLabel: 'Delete announcement',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      await actions.deleteAnnouncement(announcement.id);
      notify('Announcement deleted.', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Announcement management" subtitle="Write, schedule and publish class notices." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Announcement management"
        subtitle={`${data.announcements.length} notices · ${draftCount} draft${draftCount === 1 ? '' : 's'}`}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
              Refresh
            </Button>
            <Button icon={Plus} onClick={openCreate}>
              Post announcement
            </Button>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="mb-5">
        <FilterChips
          label="Filter announcements by category"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All notices', count: data.announcements.length },
            ...ANNOUNCEMENT_CATEGORIES.map((category) => ({
              value: category,
              label: category,
              count: data.announcements.filter((item) => item.category === category).length,
            })),
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={data.announcements.length === 0 ? 'The board is empty' : 'No notices in this category'}
          description={
            data.announcements.length === 0
              ? 'Write the first class announcement. You can save it as a draft and publish it later.'
              : 'Try another category or post a new announcement.'
          }
          action={
            <Button icon={Plus} onClick={openCreate}>
              Post announcement
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={openEdit}
              onDelete={handleDelete}
              onTogglePublished={handleTogglePublished}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit announcement' : 'Post announcement'}
        description={editing ? 'Update this notice or change when it is published.' : 'Write now, publish now or later.'}
        size="lg"
      >
        <AnnouncementForm
          initial={editing}
          onCancel={closeForm}
          onSubmit={handleSubmit}
          submitLabel={editing ? 'Save changes' : 'Save announcement'}
        />
      </Modal>
    </div>
  );
}
