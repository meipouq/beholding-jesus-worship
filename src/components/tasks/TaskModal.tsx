import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { Task } from '../../types';
import { useWorship } from '../../context/WorshipContext';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (t: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const { members, currentUser } = useWorship();

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignedToId, setAssignedToId] = useState(task?.assigned_to_id || currentUser.id);
  const [dueDate, setDueDate] = useState(task?.due_date || new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'Medium');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'Pending');
  const [notes, setNotes] = useState(task?.notes || '');

  const assignee = members.find(m => m.id === assignedToId) || currentUser;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const saved: Task = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      assigned_to_id: assignedToId,
      assigned_to_name: assignee.name,
      due_date: dueDate,
      priority,
      status,
      notes: notes.trim() || undefined,
      created_by: task?.created_by || currentUser.name,
      created_at: task?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1F1F21] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#35312B] animate-slide-up text-[#F5F0E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#35312B]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#D9A441]" />
            <h2 className="text-base font-bold text-[#F5F0E6]">
              {task ? 'Edit Worship Task' : 'Create Worship Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Practice assigned vocal keys for Sunday"
              className="w-full text-xs p-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] focus:outline-none focus:border-[#D9A441] font-semibold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific instructions for this worship assignment..."
              className="w-full text-xs p-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] placeholder:text-[#AAA5A0]/50 focus:outline-none focus:border-[#D9A441]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                Assign To *
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] focus:outline-none focus:border-[#D9A441] font-medium"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#1F1F21] text-[#F5F0E6]">
                    {m.name} ({m.role_title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] focus:outline-none focus:border-[#D9A441] font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5C15D] focus:outline-none focus:border-[#D9A441] font-bold"
              >
                <option value="High" className="bg-[#1F1F21] text-[#E57373]">High Priority</option>
                <option value="Medium" className="bg-[#1F1F21] text-[#F5C15D]">Medium Priority</option>
                <option value="Low" className="bg-[#1F1F21] text-[#AAA5A0]">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#AAA5A0] uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] focus:outline-none focus:border-[#D9A441] font-bold"
              >
                <option value="Pending" className="bg-[#1F1F21] text-[#F5C15D]">Pending</option>
                <option value="In Progress" className="bg-[#1F1F21] text-blue-400">In Progress</option>
                <option value="Completed" className="bg-[#1F1F21] text-[#78B887]">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#35312B] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] transition-colors shadow-sm"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
