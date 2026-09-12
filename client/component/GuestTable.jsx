import React from 'react';
import { Mail, Phone, CheckCircle, XCircle, Clock, Send, MoreVertical } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function GuestTable({
  guests = [],
  onRSVPChange,
  id = "guest-management-table"
}) {
  return (
    <div id={id} className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Guest</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Invitation</th>
              <th className="py-3.5 px-4">RSVP Status</th>
              <th className="py-3.5 px-4 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No guest records found matching criteria.
                </td>
              </tr>
            ) : (
              guests.map((guest) => {
                const {
                  id: gId,
                  name,
                  email,
                  phone,
                  invitationStatus,
                  rsvpStatus,
                  organization,
                  role
                } = guest;

                return (
                  <tr
                    key={gId}
                    id={`guest-row-${gId}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Guest Name & Org */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C] flex items-center justify-center font-bold text-xs shrink-0">
                          {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{name}</p>
                          <p className="text-xs text-slate-400 font-normal">
                            {role ? `${role} • ` : ''}{organization || 'Individual Delegate'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{phone}</span>
                      </div>
                    </td>

                    {/* Invitation */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        <Send className="w-3 h-3 text-slate-500 mr-1" />
                        {invitationStatus || "Sent"}
                      </span>
                    </td>

                    {/* RSVP */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={rsvpStatus} size="sm" />
                    </td>

                    {/* Action Selector */}
                    <td className="py-3.5 px-4 text-right">
                      <select
                        id={`select-rsvp-${gId}`}
                        value={rsvpStatus}
                        onChange={(e) => onRSVPChange && onRSVPChange(gId, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-[#1B3A5C] cursor-pointer"
                        title="Update guest RSVP status"
                      >
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                        <option value="No Response">No Response</option>
                        <option value="Invited">Invited</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
