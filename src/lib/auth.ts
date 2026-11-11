import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SessionState = 'loading' | 'authenticated' | 'anonymous';

/** Tracks the signed-in state. Starts as 'loading' on server and client so SSR output matches. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>('loading');
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState(data.session ? 'authenticated' : 'anonymous');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState(session ? 'authenticated' : 'anonymous');
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return state;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : error.message);
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return { needsConfirmation: !data.session };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
  if (error) throw new Error(error.message);
}
