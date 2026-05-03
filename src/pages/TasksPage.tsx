'use client';
import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import toast from 'react-hot-toast';
import type { TaskStatus } from '../types';

const statusColor: Record<string, string> = { TODO: 'var(--text3)', IN_PROGRESS: 'var(--amber)', DONE: 'var(--green)' };
const statusBg: Record<string, string> = { TODO: 'var(--bg4)', IN_PROGRESS: 'var(--amber-bg)', DONE: 'var(--green-bg)' };

export default function TasksPage() {
  const { currentUser } = useAuth();
  const { tasks, projects, users, loadingData, createTask, updateTask, deleteTask } = useData();
  const today = startOfToday();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', projectId: '', assignedTo: '', status: 'TODO' as TaskStatus, deadline: '',
  });

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (statusFilter !== 'ALL') list = list.filter((t) => t.status === statusFilter);
    if (projectFilter !== 'ALL') list = list.filter((t) => t.projectId === projectFilter);
    return list;
  }, [tasks, statusFilter, projectFilter]);

  const selectedProject = projects.find((p) => p.id === form.projectId);
  const assignableUsers = selectedProject
    ? users.filter((u) => selectedProject.members.includes(u.id))
    : users;

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.projectId) { toast.error('Please select a project'); return; }
    if (!form.assignedTo) { toast.error('Please assign to someone'); return; }
    setCreating(true);
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description.trim(),
        projectId: form.projectId,
        assignedTo: form.assignedTo,
        status: form.status,
        deadline: form.deadline,
        createdBy: currentUser!.id,
      });
      toast.success('Task created!');
      setForm({ title: '', description: '', projectId: '', assignedTo: '', status: 'TODO', deadline: '' });
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
      toast.error('Failed to delete');
    }
  };

  if (loadingData) return <div className="text-sm" style={{ color: 'var(--text3)' }}>Loading tasks…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'white' }}>
            + New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="ALL">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{
              background: statusFilter === s ? 'var(--accent-bg)' : 'var(--bg2)',
              color: statusFilter === s ? 'var(--accent)' : 'var(--text2)',
              borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
            }}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Create form */}
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
            <select
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value, assignedTo: '' }))}
            >
              <option value="">Select project *</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
            >
              <option value="">Assign to *</option>
              {assignableUsers.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
            <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              style={{ gridColumn: '1/-1', resize: 'none', background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} disabled={creating} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'white', opacity: creating ? 0.7 : 1 }}>
              {creating ? 'Creating…' : 'Create Task'}
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
          <p>No tasks match your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((t) => {
            const proj = projects.find((p) => p.id === t.projectId);
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
                  borderColor: isOverdue ? 'rgba(248,113,113,0.25)' : 'var(--border)',
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
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {proj && <span className="text-xs" style={{ color: 'var(--text3)' }}>📁 {proj.name}</span>}
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
      )}
    </div>
  );
}
