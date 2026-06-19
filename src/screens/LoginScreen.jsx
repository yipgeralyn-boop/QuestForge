import { useState } from 'react';
import { signIn, signUp } from '../auth.js';

export default function LoginScreen({ onBack, onLoggedIn }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false); // email confirmation sent

  const isSignUp = mode === 'signup';

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        setDone(true);
      } else {
        await signIn(email.trim(), password);
        onLoggedIn?.();
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: '1.5px solid var(--qf-border, #E8E4EE)',
    background: 'var(--qf-surface)', color: 'var(--qf-ink)',
    fontSize: 16, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  if (done) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--qf-bg)', padding: 24 }}>
        <button onClick={onBack} style={{ alignSelf: 'flex-start', width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--qf-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="var(--qf-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>📬</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--qf-ink)' }}>Check your email</div>
          <div style={{ fontSize: 15, color: 'var(--qf-ink-soft)', maxWidth: 280, lineHeight: 1.5 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </div>
          <button onClick={() => setMode('signin')} style={{ marginTop: 8, padding: '14px 32px', borderRadius: 16, border: 'none', background: '#F97316', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', touchAction: 'manipulation' }}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--qf-bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'var(--qf-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="var(--qf-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#F97316', textTransform: 'uppercase' }}>Builder</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--qf-ink)', lineHeight: 1.2 }}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 32px' }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, #FF8642, #E8401C)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px #F9731640' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" />
              <circle cx="12" cy="9" r="2.5" fill="#F97316" />
            </svg>
          </div>
          <div style={{ marginTop: 12, fontSize: 15, color: 'var(--qf-ink-soft)' }}>
            {isSignUp ? 'Create an account to start building quests' : 'Sign in to access Quest Builder'}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error ? (
          <div style={{ marginTop: 10, fontSize: 13, color: '#E03E3E', textAlign: 'center' }}>{error}</div>
        ) : null}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', marginTop: 20, padding: '16px 0', borderRadius: 16,
            border: 'none', background: loading ? '#CCC' : '#F97316',
            color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation',
            boxShadow: loading ? 'none' : '0 6px 20px #F9731650',
          }}
        >
          {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        {/* Toggle */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--qf-ink-soft)' }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#F97316', fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0, touchAction: 'manipulation' }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
