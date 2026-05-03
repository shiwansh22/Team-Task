export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse"
          style={{ background: 'var(--accent)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: 'var(--text3)' }}>Loading…</p>
      </div>
    </div>
  );
}
