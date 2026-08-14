import { useEffect, useState } from 'react';
import { UserRowTable } from './components';
import { UserRow } from './types';

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
        <UserRowTable users={users} loading={loading} savingId={savingId} error={error} onRoleChange={updateRole} />
      </div>
    </div>
  );
}
