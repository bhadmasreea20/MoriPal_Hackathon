import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Activity, LoaderCircle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmbientBackground } from '@/components/moripal/ambient-background';
import { LoginMascot, type MascotMood } from '@/components/moripal/login-mascot';
import { sendPasswordReset, signIn, signUp } from '@/lib/auth';
import { pageHead } from '@/lib/finance';
import { toggleTheme, useTheme } from '@/lib/theme';

export const Route = createFileRoute('/login')({
  head: () => pageHead('Sign in', 'Sign in to the MoriPal demo workspace for NovaCare Clinics.'),
  component: LoginPage,
});

type Mode = 'sign-in' | 'sign-up';

function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mood, setMood] = useState<MascotMood>('idle');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
        setMood('success');
        await navigate({ to: '/' });
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setMessage({ kind: 'info', text: 'Account created. Check your email to confirm your address, then sign in.' });
          setMode('sign-in');
        } else {
          setMood('success');
          await navigate({ to: '/' });
        }
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) {
      setMessage({ kind: 'info', text: 'Enter your email address first, then choose “Forgot password”.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await sendPasswordReset(email.trim());
      setMessage({ kind: 'info', text: 'If an account exists for that email, a reset link is on its way.' });
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Could not send the reset email.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <AmbientBackground />
      <Button variant="ghost" size="icon" className="login-theme" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
        {theme === 'dark' ? <Sun /> : <Moon />}
      </Button>
      <div className="login-card">
        <div className="login-side">
          <LoginMascot mood={mood} />
          <p className="login-side-title">Meet Mori</p>
          <p className="login-side-text">Your capital pulse-keeper. Mori watches the numbers so you can watch the business.</p>
        </div>
        <div className="login-main">
          <span className="brand login-brand"><span className="brand-symbol"><Activity size={25} strokeWidth={2.5} /></span><span>Mori<span className="text-primary">Pal</span><small>Smarter Capital. Better Healthcare Businesses.</small></span></span>
          <h1>{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="login-sub">Sign in to the NovaCare Clinics demo workspace. All data is fictional.</p>
          <form onSubmit={submit} className="login-form">
            <label htmlFor="login-email">Email</label>
            <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setMood('email')} onBlur={() => setMood('idle')} placeholder="you@example.com" />
            <label htmlFor="login-password">Password</label>
            <Input id="login-password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setMood('password')} onBlur={() => setMood('idle')} placeholder={mode === 'sign-up' ? 'At least 6 characters' : 'Your password'} />
            {message && <p className={`login-message ${message.kind === 'error' ? 'login-message-error' : 'login-message-info'}`} role={message.kind === 'error' ? 'alert' : 'status'}>{message.text}</p>}
            <Button type="submit" disabled={busy} className="login-submit">
              {busy && <LoaderCircle className="animate-spin" size={16} />}
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <div className="login-links">
            <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(null); }}>
              {mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </button>
            <button type="button" onClick={() => void reset()} disabled={busy}>Forgot password</button>
          </div>
        </div>
      </div>
      <p className="login-foot">Demo workspace · Fictional data only · All amounts in USD</p>
    </div>
  );
}
