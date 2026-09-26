import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import VendorCard from '../component/VendorCard';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';
import Modal from '../component/Modal';
import FormInput from '../component/FormInput';

export default function Vendors() {
  const { vendors, events, eventVendorBookings, hireVendorForEvent } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [hireTarget, setHireTarget] = useState(null);
  const [hireForm, setHireForm] = useState({ eventId: '', agreedPrice: '', status: 'Pending' });
  const [hireError, setHireError] = useState('');
  const [hiring, setHiring] = useState(false);

  const categoryOptions = [
    'All',
    'Catering',
    'Decoration',
    'Photography',
    'Videography',
    'Sound & Lighting',
    'Transportation',
    'Security',
    'Other'
  ];

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.specialty && v.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const openHireModal = (vendor) => {
    setHireTarget(vendor);
    setHireForm({ eventId: events[0]?.id || '', agreedPrice: vendor.basePrice || '', status: 'Pending' });
    setHireError('');
  };

  const closeHireModal = () => setHireTarget(null);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setHireError('');

    if (!hireForm.eventId) {
      setHireError('Select an event to hire this vendor for.');
      return;
    }

    const alreadyHired = eventVendorBookings.some(
      (b) => String(b.eventId) === String(hireForm.eventId) && b.vendorId === hireTarget.id
    );
    if (alreadyHired) {
      setHireError('This vendor is already hired for that event.');
      return;
    }

    setHiring(true);
    try {
      await hireVendorForEvent(hireForm.eventId, hireTarget.id, hireForm.agreedPrice, hireForm.status);
      closeHireModal();
    } catch (err) {
      setHireError(err.message || 'Could not hire this vendor. Please try again.');
    } finally {
      setHiring(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Vendors &amp; Service Partners
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse the vendor directory and hire a vendor for one of your events
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search vendor name, contact, specialty..."
            id="vendors-search-bar"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            id="filter-vendor-cat"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onHire={openHireModal}
          />
        ))}
      </div>

      {/* Hire for Event Modal */}
      <Modal
        isOpen={!!hireTarget}
        onClose={closeHireModal}
        title="Hire Vendor for Event"
        subtitle={hireTarget ? `Book "${hireTarget.name}" for one of your events` : ''}
      >
        <form onSubmit={handleHireSubmit} className="space-y-4">
          {hireError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
              {hireError}
            </div>
          )}

          {events.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
              You don't have any events yet. Create one first, then come back to hire vendors for it.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 tracking-wide mb-1.5">
                  Target Event:
                </label>
                <select
                  value={hireForm.eventId}
                  onChange={(e) => setHireForm({ ...hireForm, eventId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#1B3A5C] focus:outline-none"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              <FormInput
                label="Agreed Price (USD)"
                type="number"
                value={hireForm.agreedPrice}
                onChange={(e) => setHireForm({ ...hireForm, agreedPrice: e.target.value })}
                placeholder="e.g. 12500"
                required
              />

              <FormInput
                label="Initial Status"
                type="select"
                value={hireForm.status}
                onChange={(e) => setHireForm({ ...hireForm, status: e.target.value })}
                options={['Pending', 'Confirmed']}
              />
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={closeHireModal} disabled={hiring}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Briefcase} disabled={hiring || events.length === 0}>
              {hiring ? 'Hiring...' : 'Hire Vendor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
