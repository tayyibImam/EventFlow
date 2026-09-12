import React from 'react';

export default function FormInput({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  options = [],
  rows = 3,
  icon: Icon,
  className = "",
  disabled = false
}) {
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

  const baseInputStyles = "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-[#1B3A5C] focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 disabled:bg-slate-50 disabled:text-slate-500 shadow-xs";

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {type === "textarea" ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            className={`${baseInputStyles} ${Icon ? 'pl-9' : ''} ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
          />
        ) : type === "select" ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${baseInputStyles} ${Icon ? 'pl-9' : ''} ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''} cursor-pointer`}
          >
            {options.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`${baseInputStyles} ${Icon ? 'pl-9' : ''} ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
          />
        )}
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
