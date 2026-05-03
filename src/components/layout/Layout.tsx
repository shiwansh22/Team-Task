import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/auth');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
        : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'
    }`;

  const initials = currentUser?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '??';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}
        className="w-56 flex flex-col py-5 flex-shrink-0"
      >
        {/* Logo */}
        <div className="px-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              <CheckIcon />
            </div>
            <span className="font-semibold text-base tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 space-y-0.5">
          <NavLink to="/" end className={navLinkClass}>
            <GridIcon /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderIcon /> Projects
          </NavLink>
          <NavLink to="/tasks" className={navLinkClass}>
            <CheckIcon /> Tasks
          </NavLink>
          {currentUser?.role === 'admin' && (
            <NavLink to="/team" className={navLinkClass}>
              <UsersIcon /> Team
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="px-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: currentUser?.role === 'admin' ? 'var(--purple-bg)' : 'var(--accent-bg)',
                  color: currentUser?.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                  border: '1px solid',
                  borderColor: currentUser?.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                <p className="text-xs capitalize" style={{ color: 'var(--text3)' }}>
                  {currentUser?.role}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
            style={{ color: 'var(--red)', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8" style={{ background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
