import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.replace('/');
    }
  }, [loading, user, profile, router]);

  if (loading || !user || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div className="spinner" style={{ borderTopColor: 'var(--color-primary)', borderColor: '#e1e7e2' }} />
        <p>Checking your session…</p>
      </div>
    );
  }

  return children;
}
