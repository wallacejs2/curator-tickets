import React from 'react';
import { FilterState } from '../types.ts';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS, PRODUCT_AREA_OPTIONS } from '../constants.ts';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';

interface LeftSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  isOpen: boolean;
  onClose: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ filters, setFilters, isOpen, onClose }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      priority: 'all',
      type: 'all',
      productArea: 'all',
    });
  };
  
  const selectClasses = "w-full p-2 border border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-400 mb-1";
  const inputClasses = "w-full pl-3 pr-4 py-2 border border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 text-sm";

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose} 
        aria-hidden="true"
      />

      <aside className={`w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative fixed inset-y-0 left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex flex-col gap-8 h-full overflow-y-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white tracking-wide">Curator Tickets</h1>
            <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white rounded-full focus:outline-none focus:ring-2 ring-white" aria-label="Close sidebar">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-300">Filters</h2>
              <button
                onClick={handleClearFilters}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-500 rounded"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="searchTerm" className={labelClasses}>Search</label>
                <input
                  type="text"
                  id="searchTerm"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleInputChange}
                  placeholder="Search..."
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="type" className={labelClasses}>Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
                  onChange={handleInputChange}
                  className={selectClasses}
                >
                  <option value="all">All Types</option>
                  {TICKET_TYPE_OPTIONS.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="productArea" className={labelClasses}>Product Area</label>
                <select
                  id="productArea"
                  name="productArea"
                  value={filters.productArea}
                  onChange={handleInputChange}
                  className={selectClasses}
                >
                  <option value="all">All Areas</option>
                  {PRODUCT_AREA_OPTIONS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className={labelClasses}>Status</label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleInputChange}
                  className={selectClasses}
                >
                  <option value="all">All Statuses</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className={labelClasses}>Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleInputChange}
                  className={selectClasses}
                >
                  <option value="all">All Priorities</option>
                  {PRIORITY_OPTIONS.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;