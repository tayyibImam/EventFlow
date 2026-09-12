import React, { useState } from 'react';
import { Store, Star, Phone, Tag, CheckCircle2, Search, Filter } from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import VendorCard from '../component/VendorCard';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';
import Button from '../component/Button';

export default function Vendors() {
  const { vendors, updateVendorBooking } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

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

  const statusOptions = ['All', 'Confirmed', 'Pending', 'Cancelled'];

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.specialty && v.specialty.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || v.bookingStatus === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            Vendors &amp; Service Partners
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Contracted vendors across catering, AV, staging, transport, and tactical event security
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

          <FilterDropdown
            label="Booking Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            id="filter-vendor-status"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            onStatusChange={updateVendorBooking}
          />
        ))}
      </div>
    </div>
  );
}
