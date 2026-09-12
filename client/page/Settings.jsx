import React, { useState } from 'react';
import { User, Bell, Shield, Save, CheckCircle2, Sliders, Building, Mail, LogOut, Laptop, Key } from 'lucide-react';
import Button from '../component/Button';
import FormInput from '../component/FormInput';
import LogoutModal from '../component/LogoutModal';

export default function Settings() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Meyadur Rahman',
    email: 'meyadur.rahman@eventflow.io',
    phone: '+880 1711-000111',
    organization: 'EventFlow Global Operations Ltd.',
    timezone: 'Asia/Dhaka (GMT+6)'
  });

  const [notifications, setNotifications] = useState({
    emailRSVP: true,
    taskAssignments: true,
    vendorAlerts: true,
    scheduleChanges: false
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
          Account &amp; Platform Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your organizer identity, operational timezone, and notification channels
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Your operational profile settings have been successfully synchronized.</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#1B3A5C] pb-4 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-[#1B3A5C]" />
          Lead Organizer Profile
        </h3>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-[#1B3A5C] text-[#D4A537] font-extrabold text-xl flex items-center justify-center shadow-xs">
              MR
            </div>
            <div>
              <p className="text-sm font-bold text-[#1B3A5C]">Meyadur Rahman</p>
              <p className="text-xs text-slate-400">Chief Executive Event Planner</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                Active License
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
            <FormInput
              label="Work Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Direct Mobile Line"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <FormInput
              label="Organization / Agency"
              value={profile.organization}
              onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
            />
          </div>

          <FormInput
            label="Default Operational Timezone"
            value={profile.timezone}
            onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              id="btn-save-settings"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Notifications Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#1B3A5C] pb-4 border-b border-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1B3A5C]" />
          Automated Notification Preferences
        </h3>

        <div className="mt-5 space-y-4">
          {[
            { key: 'emailRSVP', label: 'Guest RSVP Confirmations', desc: 'Receive instant notifications whenever a delegate accepts or declines an invitation.' },
            { key: 'taskAssignments', label: 'Field Staff Task Updates', desc: 'Get notified when assigned staff marks a staging or AV task as "In Progress" or "Done".' },
            { key: 'vendorAlerts', label: 'Vendor Booking Status Changes', desc: 'Alerts when catering, staging, or sound partners confirm service availability.' },
            { key: 'scheduleChanges', label: 'Schedule Revision Broadcasts', desc: 'Notify stage crew immediately if keynote or lunch slots shift timing.' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                className="mt-1 w-4 h-4 text-[#1B3A5C] rounded border-slate-300 focus:ring-[#1B3A5C] cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Active Session & Security */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#1B3A5C] pb-4 border-b border-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1B3A5C]" />
          Active Session &amp; Authentication
        </h3>

        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Current Browser Session</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Active Now
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chrome / Web Client &bull; Signed in as Lead Organizer
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              icon={LogOut}
              onClick={() => setShowLogoutModal(true)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 shrink-0"
              id="btn-settings-logout"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
