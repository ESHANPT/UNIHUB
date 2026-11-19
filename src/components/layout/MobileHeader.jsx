import Brand from './Brand';
import ThemeToggle from '../ui/ThemeToggle';

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-hairline bg-bg/80 px-4 py-3 backdrop-blur-md lg:hidden">
      <Brand compact />
      <ThemeToggle variant="segmented" />
    </header>
  );
}
