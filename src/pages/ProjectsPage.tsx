'use client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { currentUser } = useAuth();
  const { projects, tasks, users, loadingData, createProject, deleteProject } = useData();
  const navigate = useNavigate();

  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] as string[] });

  const memberUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    setCreating(true);
    try {
      await createProject({
        name: form.name.trim(),
        description: form.description.trim(),
        createdBy: currentUser!.id,
        members: [currentUser!.id, ...form.members],
      });
      toast.success('Project created!');
      setForm({ name: '', description: '', members: [] });
      setShowNew(false);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this project? Tasks will remain.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const toggleMember = (uid: string) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(uid) ? f.members.filter((x) => x !== uid) : [...f.members, uid],
    }));
  };

  if (loadingData) return <div className="text-sm" style={{ color: 'var(--text3)' }}>Loading projects…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            + New Project
          </button>
        )}
      </div>

      {/* Create form */}
      {showNew && (
        <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--bg2)', border: '1px solid var(--accent)' }}>
          <h3 className="text-sm font-semibold mb-4">Create Project</h3>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Project name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              style={{ resize: 'none', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', width: '100%' }}
            />
            {memberUsers.length > 0 && (
              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--text2)' }}>Add Members</label>
                <div className="flex flex-wrap gap-2">
                  {memberUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleMember(u.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{
                        background: form.members.includes(u.id) ? 'var(--accent-bg)' : 'var(--bg3)',
                        color: form.members.includes(u.id) ? 'var(--accent)' : 'var(--text2)',
                        borderColor: form.members.includes(u.id) ? 'var(--accent)' : 'var(--border2)',
                      }}
                    >
                      {u.name} ({u.role})
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--accent)', color: 'white', opacity: creating ? 0.7 : 1 }}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg3)', color: 'var(--text2)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
          <p className="text-base">No projects yet</p>
          {currentUser?.role === 'admin' && <p className="text-sm mt-2">Create your first project above</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const ptasks = tasks.filter((t) => t.projectId === p.id);
            const done = ptasks.filter((t) => t.status === 'DONE').length;
            const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0;
            const members = p.members.map((id) => users.find((u) => u.id === id)).filter(Boolean);

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="rounded-xl p-5 cursor-pointer transition-all"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold leading-snug flex-1 pr-2">{p.name}</h3>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="text-xs px-2 py-1 rounded-md flex-shrink-0"
                      style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                {p.description && (
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text2)' }}>{p.description}</p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text2)' }}>
                    <span>{ptasks.length} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                  </div>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {members.slice(0, 5).map((u, i) => (
                      <div
                        key={u!.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: 'var(--accent)',
                          border: '2px solid var(--bg2)',
                          marginLeft: i ? -6 : 0,
                          color: 'white',
                          fontSize: 9,
                        }}
                      >
                        {u!.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {members.length > 5 && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ background: 'var(--bg3)', border: '2px solid var(--bg2)', marginLeft: -6, color: 'var(--text2)', fontSize: 9 }}
                      >
                        +{members.length - 5}
                      </div>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>{p.createdAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
