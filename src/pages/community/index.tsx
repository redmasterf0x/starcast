import { Link } from 'react-router-dom';

const articleComments = [
  { id: 1, author: 'Ava', text: 'This is the kind of media ecosystem I want to be part of.' },
  { id: 2, author: 'Darius', text: 'The community feel is exactly what makes these stories stick.' },
  { id: 3, author: 'Mira', text: 'The mix of culture and community is what makes it feel alive.' },
];

export function CommunityPage() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <div>
        <p style={{ margin: 0, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem' }}>Community</p>
        <h1 style={{ margin: '0.4rem 0 0', fontSize: '2.6rem' }}>Join the conversation</h1>
      </div>

      <div style={{ padding: '1.25rem', borderRadius: 14, background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, color: '#dbeafe' }}>
          Guests can browse, but comments are reserved for signed-in members. If you want to join the discussion, create an account first.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/first-time-login" style={{ padding: '0.8rem 1rem', background: '#ff7a18', color: '#0b1020', borderRadius: 10, fontWeight: 700 }}>Create an account</Link>
          <Link to="/first-time-login" style={{ padding: '0.8rem 1rem', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#f8fafc' }}>Sign in</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {articleComments.map((comment) => (
          <div key={comment.id} style={{ padding: '1rem 1.1rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#fff' }}>{comment.author}</strong>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Member</span>
            </div>
            <p style={{ margin: 0, color: '#dbeafe' }}>{comment.text}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem 1.1rem', border: '1px dashed rgba(251,191,36,0.4)', borderRadius: 12, background: 'rgba(251,191,36,0.06)' }}>
        <strong style={{ color: '#fbbf24' }}>Commenting prompt:</strong>
        <p style={{ margin: '0.5rem 0 0', color: '#fef3c7' }}>Not signed up yet? Create your account and join the next conversation.</p>
      </div>
    </div>
  );
}
