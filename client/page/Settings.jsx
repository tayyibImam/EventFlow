import React, { useState } from 'react';
import { User, Bell, Shield, Save, CheckCircle2, AlertCircle, LogOut, Laptop } from 'lucide-react';
import Button from '../component/Button';
import FormInput from '../component/FormInput';
import LogoutModal from '../component/LogoutModal';
import { useEventFlow } from '../context/EventFlowContext';

const ROLE_CONFIG = {
  organizer: {
    heading: 'Account & Platform Settings',
    subheading: 'Manage your organizer identity, operational timezone, and notification channels',
    profileLabel: 'Lead Organizer Profile',
    showOrgFields: true,
    notifications: [
      { key: 'emailRSVP', label: 'Guest RSVP Confirmations', desc: 'Receive instant notifications whenever a delegate accepts or declines an invitation.', defaultOn: true },
      { key: 'taskAssignments', label: 'Field Staff Task Updates', desc: 'Get notified when assigned staff marks a staging or AV task as "In Progress" or "Done".', defaultOn: true },
      { key: 'vendorAlerts', label: 'Vendor Booking Status Changes', desc: 'Alerts when catering, staging, or sound partners confirm service availability.', defaultOn: true },
      { key: 'scheduleChanges', label: 'Schedule Revision Broadcasts', desc: 'Notify stage crew immediately if keynote or lunch slots shift timing.', defaultOn: false }
    ]
  },
  admin: {
    heading: 'Administrator Settings',
    subheading: 'Manage your platform administrator profile and system-wide alert preferences',
    profileLabel: 'Platform Administrator Profile',
    showOrgFields: false,
    notifications: [
      { key: 'newRegistrations', label: 'New Organizer Registrations', desc: 'Get notified whenever a new organizer account signs up on the platform.', defaultOn: true },
      { key: 'systemAlerts', label: 'System & Security Alerts', desc: 'Receive alerts for failed logins and other platform-wide security events.', defaultOn: true },
      { key: 'directoryChanges', label: 'Venue & Vendor Directory Changes', desc: 'Notify me when venues, vendors, or event categories are added or removed.', defaultOn: true },
      { key: 'weeklyDigest', label: 'Weekly Platform Digest', desc: 'A weekly summary of new events, users, and bookings across EventFlow.', defaultOn: false }
    ]
  },
  staff: {
    heading: 'Staff Settings',
    subheading: 'Manage your field operations profile and task notification preferences',
    profileLabel: 'Operations Staff Profile',
    showOrgFields: false,
    notifications: [
      { key: 'taskAssigned', label: 'New Task Assignments', desc: 'Get notified immediately when an organizer assigns you a new task.', defaultOn: true },
      { key: 'deadlineReminders', label: 'Task Deadline Reminders', desc: 'Receive a reminder shortly before a task’s due date.', defaultOn: true },
      { key: 'scheduleChanges', label: 'Schedule Revision Broadcasts', desc: 'Notify me if the timing or venue changes for an event I’m assigned to.', defaultOn: true },
      { key: 'eventCancellations', label: 'Event Cancellations', desc: 'Alert me right away if an event I’m staffed on is cancelled.', defaultOn: false }
    ]
  },
  guest: {
    heading: 'Guest Settings',
    subheading: 'Manage your invitation profile and RSVP notification preferences',
    profileLabel: 'Guest Profile',
    showOrgFields: false,
    notifications: [
      { key: 'rsvpReminders', label: 'RSVP Reminders', desc: 'Remind me to respond to pending event invitations before they close.', defaultOn: true },
      { key: 'eventUpdates', label: 'Event Detail Changes', desc: 'Notify me if the time, venue, or agenda changes for an event I’m attending.', defaultOn: true },
      { key: 'feedbackRequests', label: 'Post-Event Feedback Requests', desc: 'Notify me when an organizer requests feedback after an event.', defaultOn: false }
    ]
  }
};

export default function Settings() {
  const { currentRole, currentProfile, updateProfile } = useEventFlow();
  const config = ROLE_CONFIG[currentRole] || ROLE_CONFIG.organizer;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    name: currentProfile.name,
    email: currentProfile.email,
    phone: '',
    organization: 'EventFlow Global Operations Ltd.',
    timezone: 'Asia/Dhaka (GMT+6)'
  });

  const [notifications, setNotifications] = useState(
    config.notifications.reduce((acc, { key, defaultOn }) => {
      acc[key] = defaultOn;
      return acc;
    }, {})
  );

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
          {config.heading}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          {config.subheading}
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Your profile settings have been successfully synchronized.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#1B3A5C] pb-4 border-b border-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-[#1B3A5C]" />
          {config.profileLabel}
        </h3>

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-[#1B3A5C] text-[#D4A537] font-extrabold text-xl flex items-center justify-center shadow-xs">
              {currentProfile.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1B3A5C]">{currentProfile.name}</p>
              <p className="text-xs text-slate-400">{currentProfile.title}</p>
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
              label="Email Address"
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
              placeholder="+880 1XXX-XXXXXX"
            />
            {config.showOrgFields && (
              <FormInput
                label="Organization / Agency"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
              />
            )}
          </div>

          {config.showOrgFields && (
            <FormInput
              label="Default Operational Timezone"
              value={profile.timezone}
              onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
            />
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              disabled={saving}
              id="btn-save-settings"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Notifications Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-[#1B3A5C] pb-4 border-b border-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1B3A5C]" />
          Notification Preferences
        </h3>

        <div className="mt-5 space-y-4">
          {config.notifications.map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="pr-4">
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
              </div>
              <input
                type="checkbox"
                checked={!!notifications[key]}
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
                  Chrome / Web Client &bull; Signed in as {currentProfile.role}
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
