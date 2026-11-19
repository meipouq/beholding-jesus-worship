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
        className="bg-[#211C17] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#393027] animate-slide-up text-[#FFF5E6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#393027]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#E5AF45]" />
            <h2 className="text-base font-bold text-[#FFF5E6]">
              {task ? 'Edit Worship Task' : 'Create Worship Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Practice assigned vocal keys for Sunday"
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-semibold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific instructions for this worship assignment..."
              className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] placeholder:text-[#B8ADA0]/50 focus:outline-none focus:border-[#E5AF45]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Assign To *
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-medium"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#211C17] text-[#FFF5E6]">
                    {m.name} ({m.role_title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFC85C] focus:outline-none focus:border-[#E5AF45] font-bold"
              >
                <option value="High" className="bg-[#211C17] text-[#E57373]">High Priority</option>
                <option value="Medium" className="bg-[#211C17] text-[#FFC85C]">Medium Priority</option>
                <option value="Low" className="bg-[#211C17] text-[#B8ADA0]">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#B8ADA0] uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-3 rounded-2xl border border-[#393027] bg-[#181510] text-[#FFF5E6] focus:outline-none focus:border-[#E5AF45] font-bold"
              >
                <option value="Pending" className="bg-[#211C17] text-[#FFC85C]">Pending</option>
                <option value="In Progress" className="bg-[#211C17] text-blue-400">In Progress</option>
                <option value="Completed" className="bg-[#211C17] text-[#79BB8B]">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#393027] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#B8ADA0] hover:text-[#FFF5E6] hover:bg-[#29231C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#E5AF45] hover:bg-[#FFC85C] text-[#100E0B] transition-colors shadow-sm"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
