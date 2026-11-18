import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileNav from './MobileNav';
import OfflineBanner from '../pwa/OfflineBanner';

export default function AppLayout() {
  return (
    <div className="min-h-full">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-brand opacity-[0.14] blur-[110px]" />
        <div className="absolute -right-24 top-1/4 h-[26rem] w-[26rem] rounded-full bg-fuchsia-400 opacity-[0.1] blur-[130px] dark:opacity-[0.12]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-400 opacity-[0.08] blur-[110px]" />
      </div>

      <Sidebar />

      <div className="lg:pl-72">
        <MobileHeader />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
          <OfflineBanner />
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
