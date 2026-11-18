import { useEffect, useState } from 'react';

/** Returns the current timestamp, refreshed on an interval so countdowns stay live. */
export default function useNow(interval = 30000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [interval]);

  return now;
}
