import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, User, Calendar } from 'lucide-react';

interface Member {
  id: string;
  email: string;
  displayName: string;
  houseId: string | null;
}

interface Completion {
  id: string;
  choreId: string;
  completedById: string;
  note: string | null;
  completedAt: string;
  completedBy: Member | null;
}

interface Chore {
  id: string;
  title: string;
  frequency: string;
  houseId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: Member | null;
  completions: Completion[];
}

const frequencyOptions = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const Chores = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('WEEKLY');
  const [assignedToId, setAssignedToId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [choresRes, membersRes] = await Promise.all([
        client.get('/chores'),
        client.get('/houses/members'),
      ]);
      setChores(choresRes.data);
      setMembers(membersRes.data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await client.post('/chores', {
        title,
        frequency,
        assignedToId: assignedToId || null,
      });
      setChores((prev) => [{ ...res.data, completions: [] }, ...prev]);
      setTitle('');
      setFrequency('WEEKLY');
      setAssignedToId('');
    } catch {
      alert('Failed to create chore');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async (choreId: string, newAssigneeId: string) => {
    try {
      const res = await client.patch(`/chores/${choreId}/reassign`, {
        assignedToId: newAssigneeId || null,
      });
      setChores((prev) =>
        prev.map((c) =>
          c.id === choreId ? { ...c, ...res.data, completions: c.completions } : c
        )
      );
    } catch {
      alert('Failed to reassign chore');
    }
  };

  const handleComplete = async (choreId: string) => {
    try {
      const res = await client.post(`/chores/${choreId}/completions`, {});
      const completion = res.data;
      setChores((prev) =>
        prev.map((c) => {
          if (c.id !== choreId) return c;
          return { ...c, completions: [completion, ...c.completions] };
        })
      );
    } catch {
      alert('Failed to complete chore');
    }
  };

  const getLastCompleted = (chore: Chore) => {
    if (chore.completions.length === 0) return null;
    return chore.completions[0].completedAt;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chores</h1>

      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Create New Chore
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean kitchen"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Chore'}
        </button>
      </form>

      <div className="space-y-4">
        {chores.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No chores yet. Create one above!
          </p>
        ) : (
          chores.map((chore) => (
            <div
              key={chore.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chore.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {chore.frequency.charAt(0) + chore.frequency.slice(1).toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {chore.assignedTo?.displayName || 'Unassigned'}
                  </span>
                  {getLastCompleted(chore) && (
                    <span className="text-xs text-gray-400">
                      Last done:{' '}
                      {new Date(getLastCompleted(chore)!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={chore.assignedToId || ''}
                  onChange={(e) => handleReassign(chore.id, e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Reassign...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleComplete(chore.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Chores;
