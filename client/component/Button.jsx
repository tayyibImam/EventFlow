import React from 'react';

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled = false,
  className = "",
  id
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer";

  const variants = {
    primary: "bg-[#1B3A5C] text-white hover:bg-[#152e4a] focus:ring-[#1B3A5C] shadow-sm active:scale-[0.98]",
    gold: "bg-[#D4A537] text-white hover:bg-[#b88c29] focus:ring-[#D4A537] shadow-sm active:scale-[0.98]",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 active:scale-[0.98]",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-[#1B3A5C] shadow-sm",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm active:scale-[0.98]",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300",
    sky: "bg-[#7FB3D5]/20 text-[#1B3A5C] hover:bg-[#7FB3D5]/30 focus:ring-[#7FB3D5]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-medium gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      id={id || `btn-${typeof children === 'string' ? children.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'action'}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
