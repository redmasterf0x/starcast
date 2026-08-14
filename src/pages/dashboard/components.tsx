import { StatCardProps } from './types';

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div style={{ padding: '1rem 1.1rem', borderRadius: 12, background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: `inset 0 0 0 1px ${accent}33` }}>
      <div style={{ color: accent, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ marginTop: '0.5rem', fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
