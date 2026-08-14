import { FieldProps } from './types';

export function Field({
  label,
  value,
  multiline = false,
  onChange,
}: FieldProps) {
  const inputStyle = {
    width: '100%',
    padding: '0.8rem 0.9rem',
    borderRadius: 10,
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f8fafc',
    resize: 'vertical',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <label style={{ color: '#cbd5e1', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle} />
      )}
    </div>
  );
}
