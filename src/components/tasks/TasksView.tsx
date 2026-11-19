import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Edit2,
  Trash2,
  Calendar
} from 'lucide-react';
import { useWorship } from '../../context/WorshipContext';
import { Task } from '../../types';
import { TaskModal } from './TaskModal';

export const TasksView: React.FC = () => {
  const { tasks, saveTask, deleteTask, toggleTaskStatus, members } = useWorship();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = tasks.filter(t => {
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesAssignee = selectedAssignee === 'ALL' || t.assigned_to_id === selectedAssignee;
    return matchesStatus && matchesAssignee;
  });

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'High':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-950/40 text-[#E57373] border border-[#E57373]/30">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/40 text-[#F5C15D] border border-amber-800/40">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#262626] text-[#AAA5A0] border border-[#35312B]">Low</span>;
    }
  };

  const getStatusBadge = (s: Task['status']) => {
    switch (s) {
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 text-[#78B887] border border-[#78B887]/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/40 text-blue-400 border border-blue-800/40">In Progress</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-[#F5C15D] border border-amber-800/40">Pending</span>;
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] shadow-sm">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5F0E6] leading-tight">
              Tasks & Assignments
            </h1>
            <p className="text-xs text-[#AAA5A0] mt-0.5">
              Keep the team organized with setlist preparations, chord charts, instrument check, and rehearsals
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] text-xs font-bold shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Assignee Dropdown */}
      <div className="bg-[#1F1F21] p-4 rounded-3xl border border-[#35312B] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedStatus === status
                  ? 'bg-[#D9A441] text-[#101010] shadow-sm'
                  : 'bg-[#161616] text-[#AAA5A0] border border-[#35312B] hover:bg-[#262626] hover:text-[#F5F0E6]'
              }`}
            >
              {status} {status === 'ALL' ? `(${tasks.length})` : `(${tasks.filter(t => t.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#AAA5A0] shrink-0">Assignee:</span>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-[#35312B] bg-[#161616] text-[#F5F0E6] focus:border-[#D9A441] focus:outline-none"
          >
            <option value="ALL" className="bg-[#1F1F21] text-[#F5F0E6]">All Team Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id} className="bg-[#1F1F21] text-[#F5F0E6]">{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filtered.length === 0 ? (
        <div className="bg-[#1F1F21] rounded-3xl p-10 sm:p-14 text-center border border-[#35312B] shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#35312B] text-[#D9A441] flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-6 h-6 text-[#D9A441]" />
          </div>
          <h3 className="text-base font-bold text-[#F5F0E6]">
            {tasks.length === 0 ? 'No Tasks Assigned Yet' : 'No Tasks Match Filter'}
          </h3>
          <p className="text-xs text-[#AAA5A0] mt-1 max-w-sm mx-auto">
            {tasks.length === 0
              ? 'Your team task board is clear. Create tasks for rehearsal preparations, reviewing song chords, or checking sound equipment.'
              : 'Try clearing your filter or selecting "ALL" status.'}
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 px-4 py-2.5 rounded-2xl bg-[#D9A441] hover:bg-[#F5C15D] text-[#101010] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`bg-[#1F1F21] rounded-3xl p-4 sm:p-5 border transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.status === 'Completed' ? 'opacity-70 border-[#35312B] bg-[#161616]/70' : 'border-[#35312B] hover:border-[#D9A441]/50'
              }`}
            >
              {/* Task Info */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Quick Status Toggle Checkbox */}
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                    task.status === 'Completed'
                      ? 'bg-[#78B887] border-[#78B887] text-[#101010]'
                      : 'border-[#35312B] hover:border-[#D9A441] text-transparent'
                  }`}
                  title="Click to toggle status"
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                    <span className="text-xs text-[#AAA5A0] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#D9A441]" />
                      Due: {task.due_date}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold text-[#F5F0E6] leading-snug ${
                    task.status === 'Completed' ? 'line-through text-[#AAA5A0]' : ''
                  }`}>
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-[#AAA5A0] line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="pt-1 flex items-center gap-2 text-[11px] text-[#AAA5A0]">
                    <span>Assigned to: <strong className="text-[#F5F0E6]">{task.assigned_to_name}</strong></span>
                    <span>•</span>
                    <span>Created by {task.created_by}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-1.5 rounded-xl text-[#AAA5A0] hover:text-[#F5F0E6] hover:bg-[#262626]"
                  title="Edit Task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete task "${task.title}"?`)) {
                      deleteTask(task.id);
                    }
                  }}
                  className="p-1.5 rounded-xl text-[#AAA5A0] hover:text-[#E57373] hover:bg-red-950/30"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingTask) && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsAdding(false);
            setEditingTask(null);
          }}
          onSave={(saved) => {
            saveTask(saved);
            setIsAdding(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};
