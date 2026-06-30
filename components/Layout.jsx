import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/records', label: 'Cereal Records', icon: '🌾' },
  { href: '/expenses', label: 'Expenses', icon: '💵' },
  { href: '/reports', label: 'Reports & PDF', icon: '📄' },
  { href: '/admins', label: 'Admins', icon: '👥' },
];

export default function Layout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { profile, signOut } = useAuth();

  function go(href) {
    setSidebarOpen(false);
    router.push(href);
  }

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <button
            className="hamburger"
            aria-label="Toggle menu"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            <span />
          </button>
          <div className="app-header-brand">
            <img src="/logo.png" alt="logo" />
            <span>W&amp;P GRAINS TRADERS</span>
          </div>
        </div>
        <div className="app-header-right">
          {profile && <span className="user-pill">{profile.full_name}</span>}
          <button className="btn btn-accent btn-sm" onClick={handleSignOut}>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-section-label">Menu</div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.href}
            className={`sidebar-nav-link ${router.pathname === item.href ? 'active' : ''}`}
            onClick={() => go(item.href)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

        <div className="sidebar-footer">
          <div className="text-muted" style={{ marginBottom: 10 }}>
            Logged in as
            <br />
            <strong style={{ color: 'var(--color-primary-dark)' }}>
              {profile?.full_name || '...'}
            </strong>
          </div>
          <button className="btn btn-outline btn-block btn-sm" onClick={handleSignOut}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="app-main">
        {title && <h1 className="page-title">{title}</h1>}
        {subtitle && <p className="page-sub">{subtitle}</p>}
        {children}
      </main>
    </div>
  );
}
