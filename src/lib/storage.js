import { normalizeState } from './validation';

export const STORAGE_KEY = 'unihub:data';

/**
 * Reads the prototype's localStorage data without writing, seeding or
 * repairing anything. Used only by the admin migration tool, which must
 * preserve the original records until the administrator confirms success.
 */
export function readLegacyState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { found: false, state: null, issue: null };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        found: true,
        state: null,
        issue: 'The saved prototype data is not valid JSON.',
      };
    }

    const result = normalizeState(parsed);
    if (!result.ok) {
      return { found: true, state: null, issue: result.error };
    }

    return { found: true, state: result.state, issue: null };
  } catch {
    return {
      found: false,
      state: null,
      issue: 'Local storage is unavailable in this browser.',
    };
  }
}
