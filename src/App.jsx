import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminGuard from './components/auth/AdminGuard';
import Dashboard from './pages/Dashboard';
import Deadlines from './pages/Deadlines';
import Timetable from './pages/Timetable';
import Reminders from './pages/Reminders';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminDeadlines from './pages/admin/AdminDeadlines';
import AdminTimetable from './pages/admin/AdminTimetable';
import AdminReminders from './pages/admin/AdminReminders';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminData from './pages/admin/AdminData';
import { useClassData } from './store/ClassDataContext';
import { useReminderNotifications } from './hooks/useNotifications';

function NotificationBridge() {
  const { data } = useClassData();
  useReminderNotifications(data.reminders);
  return null;
}

export default function App() {
  return (
    <>
      <NotificationBridge />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="deadlines" element={<Deadlines />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="deadlines" element={<AdminDeadlines />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="reminders" element={<AdminReminders />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="data" element={<AdminData />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
