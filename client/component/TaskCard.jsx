import React from 'react';
import { Calendar, User, Clock, CheckCircle2, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  readOnly = false
}) {
  const {
    id,
    title,
    description,
    eventTitle,
    assignedTo,
    dueDate,
    priority,
    status
  } = task;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      id={`task-card-${id}`}
      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
    >
      <div>
        {/* Header Badges: Priority & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge status={priority} size="sm" />
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Task Title */}
        <h4 className="text-base font-bold text-[#1B3A5C] leading-snug">
          {title}
        </h4>

        {/* Description */}
        {description && (
          <p className="mt-2 text-xs text-slate-600 line-clamp-2">
            {description}
          </p>
        )}

        {/* Meta info: Event, Staff, Due Date */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          {eventTitle && (
            <div className="font-medium text-[#1B3A5C] bg-sky-50 px-2 py-1 rounded-md">
              Event: {eventTitle}
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned: <strong className="text-slate-800 font-semibold">{assignedTo}</strong></span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-[#D4A537]" />
              <span>{formatDate(dueDate)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Quick status selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Status:</span>
          <select
            id={`task-status-select-${id}`}
            value={status}
            onChange={(e) => onStatusChange && onStatusChange(id, e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:border-[#1B3A5C] cursor-pointer"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Edit / Delete for Organizers */}
        {!readOnly && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 text-slate-400 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-md transition-colors"
                title="Edit Task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
