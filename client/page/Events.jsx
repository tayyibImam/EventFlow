import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { useEventFlow } from '../context/EventFlowContext';
import EventCard from '../component/EventCard';
import StatusBadge from '../component/StatusBadge';
import Button from '../component/Button';
import SearchBar from '../component/SearchBar';
import FilterDropdown from '../component/FilterDropdown';

export default function Events() {
  const { events } = useEventFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Extract unique categories for filter
  const categoryOptions = ['All', 'Conference', 'Cultural', 'Wedding', 'Corporate', 'Workshop', 'Seminar'];
  const statusOptions = ['All', 'Planned', 'Ongoing', 'Completed', 'Cancelled'];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || evt.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A5C]">
            My Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage conferences, banquets, and summits with unified operational oversight
          </p>
        </div>

        <Link to="/events/create">
          <Button
            id="btn-events-create-new"
            variant="gold"
            icon={Plus}
          >
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events by title, venue..."
            id="events-search-bar"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <FilterDropdown
            label="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            id="filter-category"
          />

          <FilterDropdown
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            id="filter-status"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#1B3A5C] shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#1B3A5C] shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No events matched</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new event.
          </p>
          <div className="mt-4">
            <Link to="/events/create">
              <Button size="sm" variant="primary" icon={Plus}>
                Create New Event
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Event Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEvents.map((evt) => {
                  const progressVal = typeof evt.progress === 'number' ? evt.progress : (evt.progress?.overall || 0);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-[#1B3A5C]">
                        {evt.title}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 truncate max-w-[160px]">
                        {evt.venue || "Unassigned"}
                      </td>
                      <td className="py-4 px-4 text-xs whitespace-nowrap text-slate-600">
                        {formatDate(evt.startDate)}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-800">
                        {evt.expectedGuests}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={evt.status} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 bg-[#1B3A5C] rounded-full"
                              style={{ width: `${progressVal}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{progressVal}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/events/${evt.id}`}
                          className="inline-flex items-center text-xs font-semibold text-[#1B3A5C] hover:text-[#D4A537]"
                        >
                          View Event <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
