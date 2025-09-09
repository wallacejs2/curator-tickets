
import React, { useState } from 'react';
import { Status, ProjectStatus, TaskStatus, DealershipStatus, FeatureStatus } from '../../types.ts';
import LinkingModal from './LinkingModal.tsx';
import { LinkIcon } from '../icons/LinkIcon.tsx';

// A helper to get the display name from an item which could have 'name' or 'title'
const getItemName = (item: any): string => item.name || item.title || (item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description) : `Item ${item.id}`);

const tagColorStyles: Record<string, string> = {
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
  [DealershipStatus.PendingFocus]: 'bg-sky-200 text-sky-800',
  [DealershipStatus.PendingDmt]: 'bg-purple-200 text-purple-800',
  [DealershipStatus.PendingSetup]: 'bg-yellow-200 text-yellow-800',
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
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

// Using a generic type T that must have an id and either a name or title
interface LinkableItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
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
  onItemClick?: (id: string) => void;
}

const isItemCompleted = (item: LinkableItem): boolean => {
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
  onItemClick,
}: LinkingSectionProps<T>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMultiLink = (ids: string[]) => {
    ids.forEach(id => onLink(id));
  };


  return (
    <>
      <LinkingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableItems={availableItems}
        onLinkItems={handleMultiLink}
        itemTypeLabel={itemTypeLabel}
      />
      <div className="pt-6 mt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-800">{title} ({linkedItems.length})</h3>
            <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
            <LinkIcon className="w-4 h-4" />
            <span>Link {itemTypeLabel}</span>
            </button>
        </div>

        <div className="mt-3 space-y-2">
            {linkedItems.length > 0 ? linkedItems.map(linked => {
            const isCompleted = isItemCompleted(linked);
            return (
            <div key={linked.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => onItemClick && onItemClick(linked.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-800 disabled:no-underline disabled:cursor-default text-left"
                        disabled={!onItemClick}
                        aria-label={`View details for ${getItemName(linked)}`}
                    >
                        {getItemName(linked)}
                    </button>
                    {linked.status && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[linked.status] || 'bg-gray-200 text-gray-800'}`}>
                            {linked.status}
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
    </>
  );
};

export default LinkingSection;
