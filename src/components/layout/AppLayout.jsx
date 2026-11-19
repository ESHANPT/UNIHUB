import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import OfflineBanner from '../pwa/OfflineBanner';

export default function AppLayout() {
  return (
    <div className="min-h-full">
      {/* Quiet top-left subtle radial lift behind the hero per DESIGN.md §2.4 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-surface/30 blur-[140px]" />
      </div>

      <Sidebar />

      <div className="lg:pl-64 xl:pl-72">
        <MobileHeader />
        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
          <OfflineBanner />
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
