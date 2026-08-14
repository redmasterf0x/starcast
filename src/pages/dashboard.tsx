export function DashboardPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: '1rem' }}>
      <div>
        <p style={{ margin: 0, color: '#66d9ef', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Dashboard</p>
        <h1 style={{ margin: '0.4rem 0 0', fontSize: '2.6rem' }}>Member overview</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard label="Profile" value="Complete" accent="#7dd3fc" />
        <StatCard label="Community" value="12 posts" accent="#a7f3d0" />
        <StatCard label="Saved" value="7 items" accent="#f9a8d4" />
        <StatCard label="Access" value="Member" accent="#fbbf24" />
      </div>

      <div style={{ padding: '1.25rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h2 style={{ marginTop: 0 }}>Welcome back</h2>
        <p style={{ margin: 0, color: '#dbeafe' }}>
          This is the main member dashboard for your community. It can grow into saved content, notifications, and trending updates.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ padding: '1rem 1.1rem', borderRadius: 12, background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: `inset 0 0 0 1px ${accent}33` }}>
      <div style={{ color: accent, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ marginTop: '0.5rem', fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
