import { useParams } from 'react-router-dom';
import { AuthView } from '@neondatabase/auth-ui';

export function AuthPage() {
  const { view } = useParams();

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <AuthView path={view ?? 'sign-in'} />
    </div>
  );
}
