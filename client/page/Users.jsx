import React, { useState } from 'react';
import { Users, Plus, Shield, UserCheck, Mail, Phone, Pencil, Trash2, Search } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import ConfirmModal from '../component/ConfirmModal';
import FormInput from '../component/FormInput';
import StatusBadge from '../component/StatusBadge';

export default function UsersPage() {
  const { users, realUser, addUser, updateUser, updateUserRole, deleteUser } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    status: 'Active',
    assignedEvents: 'Tech Conference 2026'
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: 'Staff' });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const roleOptions = ['All', 'Admin', 'Organizer', 'Staff'];

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All' || u.role.toLowerCase() === selectedRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    addUser(form);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'Staff',
      status: 'Active',
      assignedEvents: 'Tech Conference 2026'
    });
    setIsAddModalOpen(false);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role });
    setEditError('');
    setEditSubmitting(false);
  };

  const closeEdit = () => setEditingUser(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.name || !editForm.email) {
      setEditError('Name and email are required.');
      return;
    }

    setEditSubmitting(true);
    try {
      await updateUser(editingUser.id, editForm);
      closeEdit();
    } catch (err) {
      setEditError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            User &amp; Role Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Control platform permissions across Admins, Organizers, Operations Staff, and Guests
          </p>
        </div>

        <Button
          id="btn-add-user"
          variant="gold"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add User
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email..."
            id="users-search-bar"
          />
        </div>

        <FilterDropdown
          label="Filter by Role"
          value={selectedRoleFilter}
          onChange={setSelectedRoleFilter}
          options={roleOptions}
          id="filter-users-role"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">User Profile</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Events</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1B3A5C] text-[#D4A537] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-[#1B3A5C] text-sm leading-tight">
                          {user.name}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          ID: {user.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs">
                    <p className="font-medium text-slate-800">{user.email}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{user.phone}</p>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'Organizer' ? 'bg-blue-100 text-[#1B3A5C]' :
                      user.role === 'Staff' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs text-slate-600 max-w-[200px] truncate">
                    {user.assignedEvents || "Platform-wide"}
                  </td>

                  <td className="py-4 px-4">
                    <StatusBadge status={user.status} size="sm" />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {user.role === 'Admin' ? (
                        <span
                          className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-slate-400 cursor-not-allowed"
                          title="Admin accounts are provisioned directly in the database and can't be changed here"
                        >
                          Admin (fixed)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none focus:border-[#1B3A5C] cursor-pointer"
                          title="Quick role change"
                        >
                          <option value="Organizer">Organizer</option>
                          <option value="Staff">Staff</option>
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="p-2 text-slate-500 hover:text-[#1B3A5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDeleteTarget(user); setDeleteError(''); }}
                        disabled={realUser?.user_id === user.id}
                        title={realUser?.user_id === user.id ? "You can't delete your own account" : undefined}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-500"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Platform User"
        subtitle="Invite team members, assign operational role and designate events"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Asif Mahmud"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. asif.mahmud@eventflow.io"
              required
            />

            <FormInput
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +880 1711-234567"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="System Role"
              type="select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={["Organizer", "Staff"]}
              helperText="Admin accounts are provisioned directly in the database, not created here."
            />

            <FormInput
              label="Status"
              type="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={["Active", "Pending"]}
            />
          </div>

          <FormInput
            label="Assigned Events / Responsibilities"
            value={form.assignedEvents}
            onChange={(e) => setForm({ ...form, assignedEvents: e.target.value })}
            placeholder="e.g. Tech Conference 2026, Annual Cultural Night"
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={closeEdit}
        title="Edit User"
        subtitle="Changes are saved directly to the platform database"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {editError}
            </div>
          )}

          <FormInput
            label="Full Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />

            <FormInput
              label="Phone Number"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>

          <FormInput
            label="System Role"
            type="select"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            options={editForm.role === 'Admin' ? ['Admin'] : ['Organizer', 'Staff']}
            disabled={editForm.role === 'Admin'}
            helperText={editForm.role === 'Admin' ? "Admin accounts are provisioned directly in the database and can't be reassigned here." : undefined}
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={closeEdit} disabled={editSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={editSubmitting}>
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        busy={deleting}
        title="Delete this user?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the platform. This cannot be undone.` : ''}
        error={deleteError}
      />
    </div>
  );
}
