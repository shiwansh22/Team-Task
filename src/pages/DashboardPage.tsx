'use client';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import type { DashboardStats } from '../types';

const statusColor: Record<string, string> = {
  TODO: 'var(--text3)',
  IN_PROGRESS: 'var(--amber)',
  DONE: 'var(--green)',
};
const statusBg: Record<string, string> = {
  TODO: 'var(--bg4)',
  IN_PROGRESS: 'var(--amber-bg)',
  DONE: 'var(--green-bg)',
};

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: color + '22', color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-semibold mb-1">{value}</div>
      <div className="text-sm" style={{ color: 'var(--text2)' }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { tasks, projects, users, loadingData } = useData();
  const navigate = useNavigate();

  const today = startOfToday();

  const stats = useMemo<DashboardStats>(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'DONE').length;
    const pending = tasks.filter((t) => t.status !== 'DONE').length;
    const overdue = tasks.filter(
      (t) => t.status !== 'DONE' && t.deadline && isAfter(today, parseISO(t.deadline))
    ).length;
    return { total, completed, pending, overdue };
  }, [tasks, today]);

  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const recentTasks = [...tasks].slice(0, 6);

  if (loadingData) {
    return <div className="text-sm" style={{ color: 'var(--text3)' }}>Loading dashboard…</div>;
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Welcome back, {currentUser?.name.split(' ')[0]}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Tasks" value={stats.total} color="var(--accent)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></svg>}
        />
        <StatCard
          label="Completed" value={stats.completed} color="var(--green)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard
          label="Pending" value={stats.pending} color="var(--amber)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard
          label="Overdue" value={stats.overdue} color="var(--red)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Progress */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-semibold mb-5">Progress Overview</h2>

          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--text2)' }}>Overall completion</span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--green))' }}
              />
            </div>
          </div>

          {projects.slice(0, 5).map((p) => {
            const ptasks = tasks.filter((t) => t.projectId === p.id);
            const pdone = ptasks.filter((t) => t.status === 'DONE').length;
            const ppct = ptasks.length ? Math.round((pdone / ptasks.length) * 100) : 0;
            return (
              <div key={p.id} className="mb-3 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--text)' }}>{p.name}</span>
                  <span style={{ color: 'var(--text2)' }}>{pdone}/{ptasks.length}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                  <div className="h-full rounded-full" style={{ width: `${ppct}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            );
          })}

          {currentUser?.role === 'admin' && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text2)' }}>
                <span>Total Projects</span><span className="font-medium">{projects.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text2)' }}>
                <span>Team Members</span><span className="font-medium">{users.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="rounded-xl p-5" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-semibold mb-5">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text3)' }}>No tasks yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentTasks.map((t) => {
                const proj = projects.find((p) => p.id === t.projectId);
                const isOverdue = t.status !== 'DONE' && t.deadline && isAfter(today, parseISO(t.deadline));
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: 'var(--bg3)' }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: statusColor[t.status] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        {t.title}
                        {isOverdue && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                            Overdue
                          </span>
                        )}
                      </div>
                      {proj && <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{proj.name}</div>}
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                      style={{ background: statusBg[t.status], color: statusColor[t.status] }}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
