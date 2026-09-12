import React from 'react';

export default function StatusBadge({ status, size = "md" }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let styles = "bg-gray-100 text-gray-700 border-gray-200";

  if (["ongoing", "in progress", "confirmed", "accepted", "active"].includes(normalized)) {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (["planned", "invited", "pending", "selected", "available"].includes(normalized)) {
    styles = "bg-sky-50 text-[#1B3A5C] border-sky-200";
  } else if (["completed", "done"].includes(normalized)) {
    styles = "bg-blue-50 text-blue-800 border-blue-200";
  } else if (["cancelled", "declined", "inactive", "booked"].includes(normalized)) {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (["no response"].includes(normalized)) {
    styles = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (["high"].includes(normalized)) {
    styles = "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
  } else if (["medium"].includes(normalized)) {
    styles = "bg-amber-50 text-amber-800 border-amber-200";
  } else if (["low"].includes(normalized)) {
    styles = "bg-slate-100 text-slate-700 border-slate-200";
  }

  const sizeClasses = size === "sm" 
    ? "px-2 py-0.5 text-xs" 
    : "px-2.5 py-1 text-xs sm:text-sm";

  return (
    <span
      id={`badge-${normalized.replace(/\s+/g, '-')}`}
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${sizeClasses} ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status}
    </span>
  );
}
