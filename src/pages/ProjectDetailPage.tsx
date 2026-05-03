'use client';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import toast from 'react-hot-toast';
import type { TaskStatus } from '../types';

const statusColor: Record<string, string> = { TODO: 'var(--text3)', IN_PROGRESS: 'var(--amber)', DONE: 'var(--green)' };
const statusBg: Record<string, string> = { TODO: 'var(--bg4)', IN_PROGRESS: 'var(--amber-bg)', DONE: 'var(--green-bg)' };

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentUser } = useAuth();
  const { projects, tasks, users, createTask, updateTask, deleteTask } = useData();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const projectMembers = users.filter((u) => project?.members.includes(u.id));
  const today = startOfToday();

  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', status: 'TODO' as TaskStatus, deadline: '' });

  if (!project) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text3)' }}>Project not found.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-sm" style={{ color: 'var(--accent)' }}>
          ← Back to Projects
        </button>
      </div>
    );
  }

  const handleCreateTask = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.assignedTo) { toast.error('Please assign the task to someone'); return; }
    setCreating(true);
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        projectId: project.id,
        assignedTo: form.assignedTo,
        status: form.status,
        deadline: form.deadline,
        createdBy: currentUser!.id,
      });
      toast.success('Task created!');
      setForm({ title: '', description: '', assignedTo: '', status: 'TODO', deadline: '' });
      setShowNew(false);
    } catch {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateTask(id, { status });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const done = projectTasks.filter((t) => t.status === 'DONE').length;
  const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <button onClick={() => navigate('/projects')} className="text-sm mb-5 flex items-center gap-1" style={{ color: 'var(--text2)' }}>
        ← Back to Projects
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{project.description}</p>}
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            + Add Task
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="rounded-xl p-4 mb-6 flex items-center gap-6" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text2)' }}>
            <span>Progress</span><span className="font-semibold text-white">{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--green))' }} />
          </div>
        </div>
        <div className="text-sm" style={{ color: 'var(--text2)' }}>
          <span className="font-semibold text-white">{done}</span>/{projectTasks.length} tasks
        </div>
        <div className="flex">
          {projectMembers.slice(0, 5).map((u, i) => (
            <div
              key={u.id}
              title={u.name}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent)', border: '2px solid var(--bg2)', marginLeft: i ? -8 : 0, color: 'white', fontSize: 10 }}
            >
              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* New Task Form */}
      {showNew && currentUser?.role === 'admin' && (
        <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bg2)', border: '1px solid var(--accent)' }}>
          <h3 className="text-sm font-semibold mb-4">New Task</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Task title *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={{ gridColumn: '1/-1' }}
            />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              style={{ gridColumn: '1/-1', resize: 'none', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
            <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Assign to…</option>
              {projectMembers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreateTask} disabled={creating} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'white', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Creating…' : 'Create Task'}
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="flex flex-col gap-2">
        {projectTasks.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text3)' }}>
            <p>No tasks in this project yet</p>
          </div>
        ) : projectTasks.map((t) => {
          const assignee = users.find((u) => u.id === t.assignedTo);
          const isOverdue = t.status !== 'DONE' && t.deadline && isAfter(today, parseISO(t.deadline));
          const canUpdate = currentUser?.role === 'admin' || t.assignedTo === currentUser?.id;

          return (
            <div
              key={t.id}
              className="flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{
                background: 'var(--bg2)',
                border: '1px solid',
                borderColor: isOverdue ? 'rgba(248,113,113,0.3)' : 'var(--border)',
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: statusColor[t.status] }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  {t.title}
                  {isOverdue && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>Overdue</span>
                  )}
                </div>
                {t.description && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text3)' }}>{t.description}</p>}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {assignee && <span className="text-xs" style={{ color: 'var(--text3)' }}>👤 {assignee.name}</span>}
                  {t.deadline && <span className="text-xs" style={{ color: isOverdue ? 'var(--red)' : 'var(--text3)' }}>📅 {t.deadline}</span>}
                </div>
              </div>
              {canUpdate && (
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                  style={{ width: 'auto', fontSize: 12, padding: '4px 8px', background: statusBg[t.status], color: statusColor[t.status], border: '1px solid var(--border2)', fontWeight: 500 }}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              )}
              {currentUser?.role === 'admin' && (
                <button onClick={() => handleDelete(t.id)} className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>×</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
