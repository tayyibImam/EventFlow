import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import Button from './Button';

export default function LogoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, currentProfile } = useEventFlow();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout();
    onClose();
    // Redirect to sign in page with notification state
    navigate('/signin', { state: { loggedOut: true } });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="logout-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        id="logout-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1B3A5C]" id="logout-modal-title">
              Sign Out of EventFlow
            </h3>
            <p className="text-xs text-slate-500">
              Confirm ending your active session
            </p>
          </div>
        </div>

        {/* User Card Snapshot */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#1B3A5C] text-[#D4A537] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {currentProfile.avatar || "MR"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentProfile.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {currentProfile.email}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] uppercase tracking-wide">
            {currentProfile.role}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Are you sure you want to log out? You will be signed out from your active workspace and redirected to the login screen.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="btn-cancel-logout"
          >
            Stay Signed In
          </button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirmLogout}
            icon={LogOut}
            className="px-5 py-2.5 text-xs font-bold shadow-xs"
            id="btn-confirm-logout"
          >
            Confirm Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
