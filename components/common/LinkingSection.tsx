import React, { useState } from 'react';
// FIX: Import DealershipStatus and FeatureStatus to support linking these entities.
import { Status, ProjectStatus, TaskStatus, DealershipStatus, FeatureStatus } from '../../types.ts';

// A helper to get the display name from an item which could have 'name' or 'title'
const getItemName = (item: any): string => item.name || item.title || (item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : `Item ${item.id}`);


// Using a generic type T that must have an id and either a name or title
interface LinkableItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  // FIX: Add DealershipStatus and FeatureStatus to the status union type to allow linking.
  status?: Status | ProjectStatus | TaskStatus | DealershipStatus | FeatureStatus;
  // For tickets, we might want to show PMR/FP numbers
  pmrNumber?: string;
  fpTicketNumber?: string;
}

interface LinkingSectionProps<T extends LinkableItem> {
  title: string;
  linkedItems: T[];
  availableItems: T[];
  onLink: (id: string) => void;
  onUnlink: (id: string) => void;
  itemTypeLabel: string; // e.g., 'ticket', 'project'
}

const formElementClasses = "mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";

const isItemCompleted = (item: LinkableItem): boolean => {
    // FIX: Update the completion check to include statuses for Features and Dealerships.
    // 'Launched' features and 'Cancelled' dealerships are considered complete states where unlinking should be disabled.
    return (
        item.status === Status.Completed ||
        item.status === ProjectStatus.Completed ||
        item.status === TaskStatus.Done ||
        item.status === FeatureStatus.Launched ||
        item.status === DealershipStatus.Cancelled
    );
};

const LinkingSection = <T extends LinkableItem>({
  title,
  linkedItems,
  availableItems,
  onLink,
  onUnlink,
  itemTypeLabel,
}: LinkingSectionProps<T>) => {
  const [itemToLink, setItemToLink] = useState('');

  const handleLinkClick = () => {
    if (itemToLink) {
      onLink(itemToLink);
      setItemToLink('');
    }
  };

  return (
    <div className="pt-6 mt-6 border-t border-gray-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4">{title} ({linkedItems.length})</h3>
      <div className="flex items-center gap-2">
        <select
          value={itemToLink}
          onChange={e => setItemToLink(e.target.value)}
          className={`flex-grow ${formElementClasses} mt-0`}
          aria-label={`Select a ${itemTypeLabel} to link`}
        >
          <option value="">Select a {itemTypeLabel} to link...</option>
          {availableItems.map(item => (
            <option key={item.id} value={item.id}>{getItemName(item)}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleLinkClick}
          disabled={!itemToLink}
          className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300 hover:bg-blue-600 h-full"
        >
          Link
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {linkedItems.length > 0 ? linkedItems.map(linked => {
          const isCompleted = isItemCompleted(linked);
          return (
          <div key={linked.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3">
            <div className="flex-grow">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-800">{getItemName(linked)}</p>
                {isCompleted && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-200 text-green-800">
                        Completed
                    </span>
                )}
              </div>
              {(linked.pmrNumber || linked.fpTicketNumber) && (
                  <div className="text-xs text-gray-500 mt-1">
                      {linked.pmrNumber && <span>PMR: <span className="font-medium text-gray-700">{linked.pmrNumber}</span></span>}
                      {linked.pmrNumber && linked.fpTicketNumber && <span className="mx-1.5">•</span>}
                      {linked.fpTicketNumber && <span>FP#: <span className="font-medium text-gray-700">{linked.fpTicketNumber}</span></span>}
                  </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onUnlink(linked.id)}
              className="text-red-600 hover:text-red-800 font-semibold text-xs disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed flex-shrink-0 ml-4"
              aria-label={`Unlink ${itemTypeLabel} ${getItemName(linked)}`}
              disabled={isCompleted}
            >
              Unlink
            </button>
          </div>
        )}) : <p className="text-sm text-gray-500 italic mt-2">No {itemTypeLabel}s linked.</p>}
      </div>
    </div>
  );
};

export default LinkingSection;