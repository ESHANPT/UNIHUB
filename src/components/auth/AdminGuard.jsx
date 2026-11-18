import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Brand from '../layout/Brand';
import { useAuth } from '../../store/AuthContext';

export function FullScreenLoader({ label = 'Checking access…' }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <Brand />
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {label}
      </div>
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
