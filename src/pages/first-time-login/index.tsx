import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function FirstTimeLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to send magic link.');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ margin: 0, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Check your email</p>
          <h1 style={{ margin: '0.4rem 0 0', fontSize: '2rem' }}>Magic link sent</h1>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, color: '#dbeafe' }}>
            We've sent a secure login link to <strong>{email}</strong>. Click the link in your email to sign in.
          </p>
        </div>

        <div style={{ padding: '1rem 1.1rem', borderRadius: 12, background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            Link expires in 24 hours. If you don't see it, check your spam folder.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#f8fafc',
            borderRadius: 10,
            padding: '0.8rem 1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Send another link
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ margin: 0, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Magic link auth</p>
        <h1 style={{ margin: '0.4rem 0 0', fontSize: '2rem' }}>Sign in to Starcast</h1>
      </div>

      <form onSubmit={handleSendMagicLink} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          <label style={{ color: '#cbd5e1', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '0.8rem 0.9rem',
              borderRadius: 10,
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc',
              boxSizing: 'border-box',
            }}
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(252, 165, 165, 0.12)', border: '1px solid rgba(252, 165, 165, 0.28)', color: '#fecaca' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#ff7a18',
            color: '#0b1020',
            border: 0,
            borderRadius: 10,
            padding: '0.8rem 1.1rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>

        <p style={{ margin: '1rem 0 0', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
          We'll send you a secure link. No password needed.
        </p>
      </form>
    </div>
  );
}
