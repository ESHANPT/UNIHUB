import { useMemo, useState } from 'react';
import { Megaphone, RefreshCw } from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import { sortAnnouncements } from '../lib/selectors';
import { ANNOUNCEMENT_CATEGORIES } from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import FilterChips from '../components/ui/FilterChips';
import EmptyState from '../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';
import AnnouncementCard from '../components/announcements/AnnouncementCard';

export default function Announcements() {
  const { data, loading, error, refresh } = useClassData();
  const [filter, setFilter] = useState('all');

  const sorted = useMemo(() => sortAnnouncements(data.announcements), [data.announcements]);
  const visible = filter === 'all' ? sorted : sorted.filter((item) => item.category === filter);

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Class announcements" subtitle="The noticeboard for everything your class needs to know." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Class announcements"
        subtitle="Published by your class admin, updated live."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
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
              ? 'No announcements have been published yet. Check back soon.'
              : 'Try another category to see more notices.'
          }
          action={
            data.announcements.length === 0 ? null : (
              <Button variant="secondary" onClick={() => setFilter('all')}>
                Show all notices
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </div>
  );
}
