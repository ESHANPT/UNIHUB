import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  announcementPayload,
  classPayload,
  deadlinePayload,
  mapAnnouncement,
  mapClass,
  mapDeadline,
  mapReminder,
  reminderPayload,
} from '../lib/mappers';

const ClassDataContext = createContext(null);
const TABLES = ['deadlines', 'timetable', 'reminders', 'announcements'];
const EMPTY = { deadlines: [], classes: [], reminders: [], announcements: [] };

export function ClassDataProvider({ children }) {
  const { session } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const refreshTimer = useRef(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setRefreshing(true);

    try {
      const [deadlineResult, timetableResult, reminderResult, announcementResult] = await Promise.all([
        supabase.from('deadlines').select('*'),
        supabase.from('timetable').select('*'),
        supabase.from('reminders').select('*'),
        supabase.from('announcements').select('*'),
      ]);

      const failure = [deadlineResult, timetableResult, reminderResult, announcementResult].find(
        (result) => result.error,
      );
      if (failure) throw new Error(failure.error.message);

      setData({
        deadlines: (deadlineResult.data || []).map(mapDeadline),
        classes: (timetableResult.data || []).map(mapClass),
        reminders: (reminderResult.data || []).map(mapReminder),
        announcements: (announcementResult.data || []).map(mapAnnouncement),
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load class data from Supabase.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, session?.user?.id]);

  // One Realtime channel for all four tables; debounce a refetch on any change.
  useEffect(() => {
    if (!supabase) return undefined;

    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => load({ silent: true }), 250);
    };

    const channel = supabase.channel('unihub-class-data');
    TABLES.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh);
    });

    channel.subscribe((status, channelError) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setError(channelError?.message || 'Live updates are unavailable. Refresh to see the latest data.');
      }
    });

    return () => {
      window.clearTimeout(refreshTimer.current);
      supabase.removeChannel(channel);
    };
  }, [load, session?.access_token]);

  const run = useCallback(
    async (operation) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error: mutationError } = await operation();
      if (mutationError) throw new Error(mutationError.message);
      await load({ silent: true });
    },
    [load],
  );

  const actions = useMemo(
    () => ({
      saveDeadline: (values, id) =>
        run(() =>
          id
            ? supabase.from('deadlines').update(deadlinePayload(values)).eq('id', id)
            : supabase.from('deadlines').insert(deadlinePayload(values)),
        ),
      setDeadlineStatus: (id, status) =>
        run(() => supabase.from('deadlines').update({ status }).eq('id', id)),
      deleteDeadline: (id) => run(() => supabase.from('deadlines').delete().eq('id', id)),

      saveClass: (values, id) =>
        run(() =>
          id
            ? supabase.from('timetable').update(classPayload(values)).eq('id', id)
            : supabase.from('timetable').insert(classPayload(values)),
        ),
      deleteClass: (id) => run(() => supabase.from('timetable').delete().eq('id', id)),

      saveReminder: (values, id) =>
        run(() =>
          id
            ? supabase.from('reminders').update(reminderPayload(values)).eq('id', id)
            : supabase.from('reminders').insert(reminderPayload(values)),
        ),
      deleteReminder: (id) => run(() => supabase.from('reminders').delete().eq('id', id)),

      saveAnnouncement: (values, id) =>
        run(() =>
          id
            ? supabase.from('announcements').update(announcementPayload(values)).eq('id', id)
            : supabase.from('announcements').insert(announcementPayload(values)),
        ),
      setAnnouncementPublished: (id, published) =>
        run(() =>
          supabase
            .from('announcements')
            .update(
              published
                ? { is_published: true, published_at: new Date().toISOString() }
                : { is_published: false },
            )
            .eq('id', id),
        ),
      deleteAnnouncement: (id) => run(() => supabase.from('announcements').delete().eq('id', id)),
    }),
    [run],
  );

  const value = useMemo(
    () => ({
      data,
      loading,
      refreshing,
      error,
      refresh: () => load({ silent: true }),
      actions,
    }),
    [data, loading, refreshing, error, load, actions],
  );

  return <ClassDataContext.Provider value={value}>{children}</ClassDataContext.Provider>;
}

export function useClassData() {
  const context = useContext(ClassDataContext);
  if (!context) throw new Error('useClassData must be used inside a ClassDataProvider');
  return context;
}
