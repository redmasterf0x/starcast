import { UserRow, roleOptions } from './types';

type UserRowTableProps = {
  users: UserRow[];
  loading: boolean;
  savingId: number | null;
  error: string;
  onRoleChange: (id: number, role: UserRow['role']) => void;
};

export function UserRowTable({ users, loading, savingId, error, onRoleChange }: UserRowTableProps) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>Loading users...</div>;
  }

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#cbd5e1' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#cbd5e1' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#cbd5e1' }}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <td style={{ padding: '0.75rem 1rem' }}>{user.email}</td>
              <td style={{ padding: '0.75rem 1rem' }}>
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.id, e.target.value as UserRow['role'])}
                  disabled={savingId === user.id}
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: 6,
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                  }}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
              <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                {new Date(user.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
