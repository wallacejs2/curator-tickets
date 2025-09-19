import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal.tsx';
import { SearchIcon } from '../icons/SearchIcon.tsx';
// FIX: Added ReleaseStatus to make the LinkableItem type compatible with LinkingSection.
import { Status, Priority, ProjectStatus, TaskStatus, DealershipStatus, FeatureStatus, ProductArea, Platform, ReleaseStatus } from '../../types.ts';

// FIX: The `Status`, `ProjectStatus`, `TaskStatus`, and `FeatureStatus` enums share some of the same string values
// (e.g., 'In Progress', 'Testing'), which created duplicate keys in this object literal. The conflicting
// keys have been removed to resolve the error. Styles have been consolidated for
// consistency across shared status names.
const tagColorStyles: Record<string, string> = {
  // Priority
  [Priority.P1]: 'bg-red-200 text-red-800',
  [Priority.P2]: 'bg-orange-200 text-orange-800',
  [Priority.P3]: 'bg-amber-200 text-amber-800',
  [Priority.P4]: 'bg-yellow-200 text-yellow-800',
  [Priority.P5]: 'bg-green-200 text-green-800',
  [Priority.P8]: 'bg-blue-200 text-blue-800',
  // Statuses from types.ts Status enum
  [Status.NotStarted]: 'bg-gray-300 text-gray-800',
  [Status.InProgress]: 'bg-blue-300 text-blue-900',
  [Status.OnHold]: 'bg-[#ffcd85] text-stone-800',
  [Status.InReview]: 'bg-[#fff494] text-stone-800',
  [Status.DevReview]: 'bg-[#fff494] text-stone-800',
  [Status.PmdReview]: 'bg-[#fff494] text-stone-800',
  [Status.Testing]: 'bg-orange-300 text-orange-900',
  [Status.Completed]: 'bg-[#44C064] text-white',
  // Statuses from types.ts TaskStatus enum
  [TaskStatus.ToDo]: 'bg-gray-200 text-gray-800',
  [TaskStatus.Done]: 'bg-green-200 text-green-800',
  // Statuses from types.ts DealershipStatus enum
  [DealershipStatus.Prospect]: 'bg-indigo-200 text-indigo-800',
  [DealershipStatus.PendingDmt]: 'bg-purple-200 text-purple-800',
  [DealershipStatus.PendingFocus]: 'bg-sky-200 text-sky-800',
  [DealershipStatus.PendingSetup]: 'bg-yellow-200 text-yellow-800',
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
  [DealershipStatus.Enrollment]: 'bg-teal-200 text-teal-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Pilot]: 'bg-pink-200 text-pink-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
  // Statuses from types.ts FeatureStatus enum
  [FeatureStatus.Backlog]: 'bg-gray-200 text-gray-800',
  [FeatureStatus.InDiscovery]: 'bg-purple-200 text-purple-800',
  [FeatureStatus.InDevelopment]: 'bg-blue-200 text-blue-800',
  [FeatureStatus.Upcoming]: 'bg-yellow-200 text-yellow-800',
  [FeatureStatus.Launched]: 'bg-green-200 text-green-800',
};

// A more detailed interface for items that can be linked
interface LinkableItem {
  id: string;
  name?: string;
  title?: string;
  customerName?: string;
  description?: string;
  // FIX: Added ReleaseStatus to the status union type to ensure compatibility with LinkingSection.
  status?: Status | ProjectStatus | TaskStatus | DealershipStatus | FeatureStatus | ReleaseStatus;
  priority?: Priority;
  // Ticket specific
  pmrNumber?: string;
  fpTicketNumber?: string;
  client?: string;
  submitterName?: string;
  submissionDate?: string;
  // Task specific
  assignedUser?: string;
  projectName?: string;
  ticketTitle?: string;
  creationDate?: string;
  dueDate?: string;
  // Dealership specific
  accountNumber?: string;
  // Shopper specific
  curatorId?: string;
}

interface LinkingModalProps<T extends LinkableItem> {
  isOpen: boolean;
  onClose: () => void;
  availableItems: T[];
  onLinkItems: (ids: string[]) => void;
  itemTypeLabel: string;
}

const getItemName = (item: any): string => item.name || item.title || item.customerName || (item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : `Item ${item.id}`);

const LinkingModal = <T extends LinkableItem>({
  isOpen,
  onClose,
  availableItems,
  onLinkItems,
  itemTypeLabel,
}: LinkingModalProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIds([]);
    }
  }, [isOpen]);

  const sortedItems = useMemo(() => {
    return [...availableItems].sort((a, b) => {
        const dateA = a.submissionDate || a.creationDate;
        const dateB = b.submissionDate || b.creationDate;

        if (dateA && dateB) {
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        }
        if (dateA) return -1; // a is more recent, put it first
        if (dateB) return 1; // b is more recent, put it first
        return 0; // no dates, keep original order
    });
  }, [availableItems]);

  const filteredItems = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return sortedItems;
    return sortedItems.filter(item => {
      return (
        getItemName(item).toLowerCase().includes(searchLower) ||
        (item.pmrNumber && item.pmrNumber.toLowerCase().includes(searchLower)) ||
        (item.fpTicketNumber && item.fpTicketNumber.toLowerCase().includes(searchLower)) ||
        (item.client && item.client.toLowerCase().includes(searchLower)) ||
        (item.accountNumber && item.accountNumber.toLowerCase().includes(searchLower))
      );
    });
  }, [sortedItems, searchTerm]);

  const handleToggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleLink = () => {
    onLinkItems(selectedIds);
  };

  if (!isOpen) return null;

  return (
    <Modal title={`Link ${itemTypeLabel}s`} onClose={onClose}>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search available ${itemTypeLabel}s...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-white">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                  selectedIds.includes(item.id) ? 'bg-blue-100 ring-1 ring-blue-300' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleId(item.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
                />
                <div className="flex-grow">
                  <p className="font-medium text-gray-800 text-sm">{getItemName(item)}</p>

                  {/* More details section */}
                  <div className="text-xs text-gray-500 mt-1.5 space-y-1">
                      {/* Ticket Details */}
                      {item.client && <div>Client: <span className="font-medium text-gray-700">{item.client}</span></div>}
                      {item.submitterName && <div>Submitter: <span className="font-medium text-gray-700">{item.submitterName}</span></div>}
                      {(item.pmrNumber || item.fpTicketNumber) && (
                      <div className="flex flex-wrap items-center gap-x-2">
                          {item.pmrNumber && <span>PMR: <span className="font-medium text-gray-700">{item.pmrNumber}</span></span>}
                          {item.pmrNumber && item.fpTicketNumber && <span className="text-gray-300">•</span>}
                          {item.fpTicketNumber && <span>FP#: <span className="font-medium text-gray-700">{item.fpTicketNumber}</span></span>}
                      </div>
                      )}

                      {/* Task Details */}
                      {item.assignedUser && <div>Assigned: <span className="font-medium text-gray-700">{item.assignedUser}</span></div>}
                      {((item.projectName && item.projectName !== 'General') || item.ticketTitle) && (
                      <div>
                          Parent: <span className="font-medium text-gray-700">{(item.projectName && item.projectName !== 'General') ? item.projectName : item.ticketTitle}</span>
                      </div>
                      )}
                      {item.dueDate && <div>Due: <span className="font-medium text-gray-700">{new Date(item.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span></div>}
                      
                      {/* Shopper Details */}
                      {item.curatorId && <div>Curator ID: <span className="font-medium text-gray-700">{item.curatorId}</span></div>}
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.status && <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[item.status] || 'bg-gray-200 text-gray-800'}`}>{item.status}</span>}
                      {item.priority && <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[item.priority]}`}>{item.priority}</span>}
                  </div>
                </div>
              </label>
            ))
          ) : (
            <p className="text-center text-gray-500 p-4">No available {itemTypeLabel}s match your search.</p>
          )}
        </div>
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
          <button
            type="button"
            onClick={handleLink}
            disabled={selectedIds.length === 0}
            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            Link {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LinkingModal;