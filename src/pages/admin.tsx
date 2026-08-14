import { useEffect, useState } from 'react';

type UserRow = {
  id: number;
  email: string;
  role: 'user' | 'authed_user' | 'mod' | 'admin';
  created_at: string;
};

const roleOptions: UserRow['role'][] = ['user', 'authed_user', 'mod', 'admin'];

export function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load users.');
      }

      setUsers(data.users || []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const updateRole = async (id: number, nextRole: UserRow['role']) => {
    try {
      setSavingId(id);
      const response = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update role.');
      }

      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, role: data.user.role } : user))
      );
      setError('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update role.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: '1rem' }}>
      <h1 style={{ margin: 0 }}>Admin Dashboard</h1>

      <div style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, background: '#111827' }}>
        <p style={{ margin: 0, color: '#fef3c7' }}>Admins control user roles, site settings, and all system-level actions.</p>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)', color: '#fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0f172a' }}>
          <thead style={{ background: '#111827' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '0.9rem 1rem' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} style={{ padding: '1rem', color: '#cbd5e1' }}>Loading users...</td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '1rem', color: '#cbd5e1' }}>No users found.</td>
              </tr>
            )}

            {!loading && users.map((user) => (
              <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '0.9rem 1rem', color: '#e2e8f0' }}>{user.email}</td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <select
                    value={user.role}
                    onChange={(event) => updateRole(user.id, event.target.value as UserRow['role'])}
                    disabled={savingId === user.id}
                    style={{
                      width: '100%',
                      maxWidth: 180,
                      padding: '0.55rem 0.7rem',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: '#111827',
                      color: '#f8fafc',
                    }}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.9rem 1rem', color: '#cbd5e1' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
