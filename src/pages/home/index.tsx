import { NavLink } from 'react-router-dom';

export function HomePage() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Welcome to Starcast</h1>
      <p style={{ margin: 0, color: '#c9d5ea', maxWidth: 700 }}>
        A small Neon-auth example with sign-in, sign-up, and account management UI wired into the same client.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <NavLink to="/auth/sign-in" style={{ padding: '0.8rem 1.2rem', background: '#ff7a18', color: '#0b1020', borderRadius: 10, fontWeight: 700 }}>Sign in</NavLink>
        <NavLink to="/auth/sign-up" style={{ padding: '0.8rem 1.2rem', background: '#111827', color: '#fff', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700 }}>Create account</NavLink>
      </div>
    </div>
  );
}
