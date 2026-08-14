export function ModPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: '1rem' }}>
      <h1 style={{ margin: 0 }}>Moderator Console</h1>
      <div style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, background: '#111827' }}>
        <p style={{ margin: 0, color: '#dbeafe' }}>Moderators can review reports, manage flagged items, and approve content.</p>
      </div>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', display: 'grid', gap: '0.5rem' }}>
        <li>Review reported posts</li>
        <li>Hide or restore articles</li>
        <li>Approve community submissions</li>
      </ul>
    </div>
  );
}
