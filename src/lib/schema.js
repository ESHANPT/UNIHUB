export const DATA_VERSION = 1;

export const DEFAULT_SETTINGS = {
  theme: 'system',
};

export function createEmptyState() {
  return {
    version: DATA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    deadlines: [],
    classes: [],
    reminders: [],
    announcements: [],
  };
}
