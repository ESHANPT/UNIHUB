import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function readOAuthError() {
  if (typeof window === 'undefined') return '';
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const raw =
    search.get('error_description') ||
    hash.get('error_description') ||
    search.get('error') ||
    hash.get('error') ||
    '';
  return raw ? decodeURIComponent(raw.replace(/\+/g, ' ')) : '';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [error, setError] = useState('');

  const checkAdmin = useCallback(async (nextSession) => {
    if (!supabase || !nextSession) {
      setIsAdmin(false);
      return false;
    }
    setAdminLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('am_i_admin');
      if (rpcError) throw new Error(rpcError.message);
      const admin = Boolean(data);
      setIsAdmin(admin);
      return admin;
    } catch (err) {
      setIsAdmin(false);
      setError(err.message || 'Could not verify administrator access.');
      return false;
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.',
      );
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const oauthError = readOAuthError();
    if (oauthError) setError(oauthError);

    const initialise = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        if (cancelled) return;

        setSession(initialSession);
        if (initialSession) {
          await checkAdmin(initialSession);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not restore your session.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initialise();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;
      // Defer Supabase requests out of the auth callback to avoid deadlocks.
      window.setTimeout(async () => {
        if (cancelled) return;
        setSession(nextSession);
        if (!nextSession) {
          setIsAdmin(false);
          setAdminLoading(false);
          return;
        }
        setError('');
        await checkAdmin(nextSession);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = useCallback(async (returnPath = '/admin') => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    setError('');
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${returnPath}`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (signInError) setError(signInError.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }, []);

  const value = {
    configured: isSupabaseConfigured,
    session,
    user: session?.user ?? null,
    isAdmin,
    loading,
    adminLoading,
    error,
    setError,
    signIn,
    signOut,
    refreshAdmin: () => checkAdmin(session),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
