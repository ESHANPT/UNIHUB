import Brand from './Brand';
import ThemeToggle from '../ui/ThemeToggle';

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Brand compact />
      <ThemeToggle />
    </header>
  );
}
