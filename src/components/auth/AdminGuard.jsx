import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Brand from '../layout/Brand';
import { ContentLoader } from '../ui/Loader';
import { useAuth } from '../../store/AuthContext';

export function FullScreenLoader({ label = 'Verifying permissions…' }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <Brand />
      <ContentLoader label={label} />
    </div>
  );
}

export default function AdminGuard() {
  const { configured, loading, adminLoading, session, isAdmin } = useAuth();
  const location = useLocation();

  if (!configured) return <Navigate to="/admin/login?error=config" replace />;
  if (loading) return <FullScreenLoader />;
  if (session && adminLoading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <Navigate to="/admin/login?error=not_admin" replace />;

  return <Outlet />;
}
