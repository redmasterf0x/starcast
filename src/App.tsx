import { useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/home';
import { AuthPage } from './pages/auth';
import { FirstTimeLoginPage } from './pages/first-time-login';
import { VerifyLinkPage } from './pages/verify-link';
import { AccountPage } from './pages/account';
import { CommunityPage } from './pages/community';
import { DashboardPage } from './pages/dashboard';
import { ProfilePage } from './pages/profile';
import { ModPage } from './pages/mod';
import { AdminPage } from './pages/admin';

type Role = 'user' | 'authed_user' | 'mod' | 'admin';

const normalizeRole = (value?: string): Role => {
  const role = String(value || 'user').toLowerCase();
  if (role === 'admin' || role === 'mod' || role === 'authed_user') {
    return role as Role;
  }
  return 'user';
};

export default function App() {
  const [role, setRole] = useState<Role>('user');

  useEffect(() => {
    let active = true;

    const loadRole = async () => {
      try {
        const statusResponse = await fetch('/api/auth/status');
        const status = await statusResponse.json();

        if (!status?.authenticated) {
          if (active) setRole('user');
          return;
        }

        const currentRole = normalizeRole(status?.user?.role);
        if (active) setRole(currentRole);

        try {
          const roleResponse = await fetch('/api/role-check');
          if (roleResponse.ok) {
            const data = await roleResponse.json();
            if (active) setRole(normalizeRole(data?.role || currentRole));
          }
        } catch {
          // ignore; keep the session-derived role
        }
      } catch {
        if (active) setRole('user');
      }
    };

    loadRole();
    return () => {
      active = false;
    };
  }, []);

  const canOpenMod = role === 'mod' || role === 'admin';
  const canOpenAdmin = role === 'admin';

  return (
    <div style={{ minHeight: '100vh', background: '#0b1020', color: '#f5f7ff', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.08em' }}>STARCAST</div>

        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Home</NavLink>
          <NavLink to="/community" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Community</NavLink>
          <NavLink to="/dashboard" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Dashboard</NavLink>
          <NavLink to="/first-time-login" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Sign in</NavLink>
          <NavLink to="/account" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Account</NavLink>
          <NavLink to="/profile" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Profile</NavLink>
          {canOpenMod && (
            <NavLink to="/mod" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Mod</NavLink>
          )}
          {canOpenAdmin && (
            <NavLink to="/admin" style={({ isActive }) => ({ color: isActive ? '#fff' : '#b7c2d7' })}>Admin</NavLink>
          )}
        </nav>

        <div style={{ padding: '0.45rem 0.8rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, fontSize: '0.8rem', color: '#dbeafe' }}>
          Role: {role}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/first-time-login" element={<FirstTimeLoginPage />} />
          <Route path="/auth/verify" element={<VerifyLinkPage />} />
          <Route path="/auth/:view" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {canOpenMod && <Route path="/mod" element={<ModPage />} />}
          {canOpenAdmin && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
