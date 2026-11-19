import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function BootLoader({ visible = true, onExitComplete }) {
  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {visible && (
        <motion.div
          key="boot-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
        >
          {/* 72px soft raised orb with breathing inset ring and faint rotating brass arc */}
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Slowly breathing inset ring */}
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-24 h-24 rounded-full bg-surface-inset shadow-inset-2 border border-hairline"
            />

            {/* Faint brass arc rotating slowly (3s linear) */}
            <motion.svg
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute w-20 h-20"
              viewBox="0 0 80 80"
              fill="none"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="24 180"
                strokeLinecap="round"
                className="opacity-70"
              />
            </motion.svg>

            {/* 72px soft raised orb */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[72px] h-[72px] rounded-full bg-surface shadow-elev-2 flex items-center justify-center border border-hairline/60"
            >
              {/* Inner subtle champagne brass dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-accent/80 shadow-[0_0_8px_var(--accent-line)]" />
            </motion.div>
          </div>

          {/* Wordmark in Instrument Serif beneath fading in at 400ms */}
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-2xl font-serif tracking-tight text-text"
          >
            UniHub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-1 text-xs text-text-3 font-sans"
          >
            Student Dashboard
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ContentLoader({ label = 'Loading...', className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="relative flex items-center justify-center w-12 h-12 mb-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-hairline border-t-accent"
        />
        <div className="w-6 h-6 rounded-full bg-surface shadow-elev-1" />
      </div>
      <p className="text-xs text-text-3">{label}</p>
    </div>
  );
}

export default BootLoader;
