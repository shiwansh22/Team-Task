'use client';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';
import type { UserRole } from '../types';

export default function TeamPage() {
  const { currentUser } = useAuth();
  const { users, tasks, projects, loadingData, updateUserRole, removeUser } = useData();

  const handleRoleChange = async (uid: string, role: UserRole) => {
    if (uid === currentUser?.id) { toast.error("You can't change your own role"); return; }
    try {
      await updateUserRole(uid, role);
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async (uid: string) => {
    if (uid === currentUser?.id) { toast.error("You can't remove yourself"); return; }
    if (!confirm('Remove this user from the system?')) return;
    try {
      await removeUser(uid);
      toast.success('User removed');
    } catch {
      toast.error('Failed to remove user');
    }
  };

  if (loadingData) return <div className="text-sm" style={{ color: 'var(--text3)' }}>Loading team…</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{users.length} member{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col gap-3">
        {users.map((u) => {
          const userTasks = tasks.filter((t) => t.assignedTo === u.id);
          const doneTasks = userTasks.filter((t) => t.status === 'DONE').length;
          const userProjects = projects.filter((p) => p.members.includes(u.id));
          const initials = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

          return (
            <div
              key={u.id}
              className="flex items-center gap-4 px-5 py-4 rounded-xl"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
            >
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: u.role === 'admin' ? 'var(--purple-bg)' : 'var(--accent-bg)',
                  color: u.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                  border: '1px solid',
                  borderColor: u.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                }}
              >
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{u.name}</span>
                  {u.id === currentUser?.id && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>You</span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{u.email}</div>
                <div className="flex gap-4 mt-1.5">
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>{userProjects.length} projects</span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>{userTasks.length} tasks</span>
                  <span className="text-xs" style={{ color: 'var(--green)' }}>{doneTasks} done</span>
                </div>
              </div>

              {/* Role selector */}
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                disabled={u.id === currentUser?.id}
                style={{
                  width: 'auto',
                  fontSize: 12,
                  padding: '5px 10px',
                  background: u.role === 'admin' ? 'var(--purple-bg)' : 'var(--accent-bg)',
                  color: u.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                  borderColor: u.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                  fontWeight: 500,
                  opacity: u.id === currentUser?.id ? 0.6 : 1,
                }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              {/* Remove */}
              {u.id !== currentUser?.id && (
                <button
                  onClick={() => handleRemove(u.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
          <p>No team members yet. Users appear here after signing up.</p>
        </div>
      )}
    </div>
  );
}
