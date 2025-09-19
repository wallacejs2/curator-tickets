import React, { useState } from 'react';
import { FilterState, View, DealershipFilterState, ShopperFilterState } from '../types.ts';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS, PRODUCT_AREA_OPTIONS, DEALERSHIP_STATUS_OPTIONS } from '../constants.ts';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { XIcon } from './icons/XIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import Modal from './common/Modal.tsx';
import { ArrowPathIcon } from './icons/ArrowPathIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { DashboardIcon } from './icons/DashboardIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { AccountBalanceIcon } from './icons/AccountBalanceIcon.tsx';
import { AccountCircleIcon } from './icons/AccountCircleIcon.tsx';
import { SunIcon } from './icons/SunIcon.tsx';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon.tsx';
import { PersonIcon } from './icons/PersonIcon.tsx';
import { CalendarIcon } from './icons/CalendarIcon.tsx';

interface LeftSidebarProps {
  ticketFilters: FilterState;
  setTicketFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  dealershipFilters: DealershipFilterState;
  setDealershipFilters: React.Dispatch<React.SetStateAction<DealershipFilterState>>;
  shopperFilters: ShopperFilterState;
  setShopperFilters: React.Dispatch<React.SetStateAction<ShopperFilterState>>;
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  onViewChange: (view: View) => void;
  onExportClick: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-700 text-white'
        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  ticketFilters, 
  setTicketFilters, 
  dealershipFilters,
  setDealershipFilters,
  shopperFilters,
  setShopperFilters,
  isOpen, 
  onClose, 
  currentView, 
  onViewChange,
  onExportClick,
}) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (currentView === 'tickets') {
      setTicketFilters(prev => ({ ...prev, [name]: value }));
    } else if (currentView === 'dealerships') {
      setDealershipFilters(prev => ({ ...prev, [name]: value }));
    } else if (currentView === 'shoppers') {
      setShopperFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClearFilters = () => {
    if (currentView === 'tickets') {
      setTicketFilters({
        searchTerm: '',
        status: 'all',
        priority: 'all',
        type: 'all',
        productArea: 'all',
      });
    } else if (currentView === 'dealerships') {
      setDealershipFilters({
        searchTerm: '',
        status: 'all',
      });
    } else if (currentView === 'shoppers') {
        setShopperFilters({ searchTerm: '' });
    }
  };

  const handleResetData = () => {
    window.localStorage.clear();
    window.location.reload();
  };
  
  const selectClasses = "w-full p-2 border border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-400 mb-1";
  const inputClasses = "w-full pl-3 pr-4 py-2 border border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 text-sm";

  return (
    <>
      {isResetModalOpen && (
        <Modal title="Confirm Data Reset" onClose={() => setIsResetModalOpen(false)}>
            <p className="text-gray-700">Are you sure you want to reset all data? This will clear all your tickets, projects, tasks, dealerships, and other data, restoring the initial demo set. This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsResetModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button onClick={handleResetData} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Reset Data</button>
            </div>
        </Modal>
      )}

      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose} 
        aria-hidden="true"
      />

      <aside className={`w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 fixed inset-y-0 left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-white tracking-wide">Curator</h1>
            <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white rounded-full focus:outline-none focus:ring-2 ring-white" aria-label="Close sidebar">
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <nav className="mb-8">
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Navigation</h2>
            <div className="space-y-1">
              <NavItem icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => onViewChange('dashboard')} />
              <NavItem icon={<CalendarIcon className="w-5 h-5" />} label="Quarters" isActive={currentView === 'quarters'} onClick={() => onViewChange('quarters')} />
              <NavItem icon={<BrainCircuitIcon className="w-5 h-5" />} label="Knowledge Base" isActive={currentView === 'knowledge'} onClick={() => onViewChange('knowledge')} />
              <NavItem icon={<BrainCircuitIcon className="w-5 h-5" />} label="Curator Docs" isActive={currentView === 'curator'} onClick={() => onViewChange('curator')} />
              <div className="pt-2 mt-2 border-t border-gray-700/50">
                <NavItem icon={<ReceiptLongIcon className="w-5 h-5" />} label="Tickets" isActive={currentView === 'tickets'} onClick={() => onViewChange('tickets')} />
                <NavItem icon={<WorkspaceIcon className="w-5 h-5" />} label="Projects" isActive={currentView === 'projects'} onClick={() => onViewChange('projects')} />
                <NavItem icon={<PersonIcon className="w-6 h-6"/>} label="Shoppers" isActive={currentView === 'shoppers'} onClick={() => onViewChange('shoppers')} />
                <NavItem icon={<ChecklistIcon className="w-6 h-6"/>} label="Tasks" isActive={currentView === 'tasks'} onClick={() => onViewChange('tasks')} />
                <NavItem icon={<DocumentTextIcon className="w-6 h-6"/>} label="Meeting Notes" isActive={currentView === 'meetings'} onClick={() => onViewChange('meetings')} />
                <NavItem icon={<AccountBalanceIcon className="w-6 h-6"/>} label="Dealerships" isActive={currentView === 'dealerships'} onClick={() => onViewChange('dealerships')} />
                <NavItem icon={<AccountCircleIcon className="w-6 h-6"/>} label="Contacts" isActive={currentView === 'contacts'} onClick={() => onViewChange('contacts')} />
                <NavItem icon={<SparklesIcon className="w-6 h-6"/>} label="New Features" isActive={currentView === 'features'} onClick={() => onViewChange('features')} />
              </div>
            </div>
          </nav>
          
          {(currentView === 'tickets' || currentView === 'dealerships' || currentView === 'shoppers') && (
            <div className="mb-8">
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
                {currentView === 'tickets' && (
                  <>
                    <div>
                      <label htmlFor="searchTerm" className={labelClasses}>Search</label>
                      <input
                        type="text"
                        id="searchTerm"
                        name="searchTerm"
                        value={ticketFilters.searchTerm}
                        onChange={handleInputChange}
                        placeholder="Search..."
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="type" className={labelClasses}>Type</label>
                      <select id="type" name="type" value={ticketFilters.type} onChange={handleInputChange} className={selectClasses}>
                        <option value="all">All Types</option>
                        {TICKET_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="productArea" className={labelClasses}>Product Area</label>
                      <select id="productArea" name="productArea" value={ticketFilters.productArea} onChange={handleInputChange} className={selectClasses}>
                        <option value="all">All Areas</option>
                        {PRODUCT_AREA_OPTIONS.map(area => <option key={area} value={area}>{area}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className={labelClasses}>Status</label>
                      <select id="status" name="status" value={ticketFilters.status} onChange={handleInputChange} className={selectClasses}>
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="priority" className={labelClasses}>Priority</label>
                      <select id="priority" name="priority" value={ticketFilters.priority} onChange={handleInputChange} className={selectClasses}>
                        <option value="all">All Priorities</option>
                        {PRIORITY_OPTIONS.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {currentView === 'dealerships' && (
                  <>
                    <div>
                      <label htmlFor="searchTerm" className={labelClasses}>Search</label>
                      <input
                        type="text"
                        id="searchTerm"
                        name="searchTerm"
                        value={dealershipFilters.searchTerm}
                        onChange={handleInputChange}
                        placeholder="Search accounts..."
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className={labelClasses}>Status</label>
                      <select id="status" name="status" value={dealershipFilters.status} onChange={handleInputChange} className={selectClasses}>
                        <option value="all">All Statuses</option>
                        {DEALERSHIP_STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {currentView === 'shoppers' && (
                  <>
                    <div>
                      <label htmlFor="searchTerm" className={labelClasses}>Search</label>
                      <input
                        type="text"
                        id="searchTerm"
                        name="searchTerm"
                        value={shopperFilters.searchTerm}
                        onChange={handleInputChange}
                        placeholder="Search shoppers..."
                        className={inputClasses}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
            <button
                onClick={onExportClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
                <DownloadIcon className="w-5 h-5" />
                <span>Export Data</span>
            </button>
            <button
                onClick={() => setIsResetModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-gray-300 hover:bg-red-800/50 hover:text-white"
            >
                <ArrowPathIcon className="w-5 h-5" />
                <span>Reset Data</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;