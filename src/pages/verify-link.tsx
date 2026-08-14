import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function VerifyLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyLink = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        setMessage('Verifying your link...');
        const response = await fetch('/api/auth/verify-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setStatus('error');
          setMessage(data.error || 'Unable to verify link. It may have expired.');
          return;
        }

        const data = await response.json();
        setStatus('success');
        setMessage('You're signed in! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Something went wrong.');
      }
    };

    verifyLink();
  }, [searchParams, navigate]);

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
      {status === 'verifying' && (
        <div>
          <p style={{ margin: 0, color: '#66d9ef', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Verifying</p>
          <h1 style={{ margin: '0.4rem 0 1.5rem', fontSize: '2rem' }}>One moment...</h1>
          <div style={{ padding: '2rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '2px solid rgba(102, 217, 239, 0.3)', borderTop: '2px solid #66d9ef', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
          <p style={{ margin: '1.5rem 0 0', color: '#dbeafe' }}>{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <p style={{ margin: 0, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Success</p>
          <h1 style={{ margin: '0.4rem 0 1.5rem', fontSize: '2rem' }}>Welcome aboard!</h1>
          <div style={{ padding: '1.25rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(167, 243, 208, 0.2)' }}>
            <p style={{ margin: 0, color: '#dbeafe' }}>{message}</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p style={{ margin: 0, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Error</p>
          <h1 style={{ margin: '0.4rem 0 1.5rem', fontSize: '2rem' }}>Link verification failed</h1>
          <div style={{ padding: '1.25rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(252, 165, 165, 0.3)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, color: '#dbeafe' }}>{message}</p>
          </div>
          <a
            href="/first-time-login"
            style={{
              display: 'inline-block',
              background: '#ff7a18',
              color: '#0b1020',
              padding: '0.8rem 1.1rem',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Try again
          </a>
        </div>
      )}
    </div>
  );
}
