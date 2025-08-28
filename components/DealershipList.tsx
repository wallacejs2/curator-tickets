import React, { useState } from 'react';
import { Dealership, DealershipStatus } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { TicketIcon } from './icons/TicketIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon.tsx';

interface DealershipListProps {
  dealerships: Dealership[];
  onDealershipClick: (dealership: Dealership) => void;
}

const statusColors: Record<DealershipStatus, string> = {
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Pilot]: 'bg-pink-200 text-pink-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const ExpandedDealershipContent: React.FC<{ dealership: Dealership }> = ({ dealership }) => {
    const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
      <div>
        <span className="text-gray-500">{label}: </span>
        <span className="font-medium text-gray-800">{value || 'N/A'}</span>
      </div>
    );
  
    return (
      <div className="px-5 py-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailItem label="Order #" value={dealership.orderNumber} />
              <DetailItem label="Go-Live" value={dealership.goLiveDate ? new Date(dealership.goLiveDate).toLocaleDateString() : 'TBD'} />
              <DetailItem label="Store/Branch" value={`${dealership.storeNumber || 'N/A'} / ${dealership.branchNumber || 'N/A'}`} />
              <DetailItem label="ERA ID" value={dealership.eraSystemId} />
              <DetailItem label="PPSysID" value={dealership.ppSysId} />
              <DetailItem label="BU-ID" value={dealership.buId} />
          </div>
      </div>
    );
};

const DealershipCard: React.FC<{ dealership: Dealership; onClick: () => void; }> = ({ dealership, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200 flex flex-col">
      <div onClick={onClick} className="p-5 cursor-pointer hover:bg-gray-50/50 rounded-t-lg">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-xl font-semibold text-gray-900 flex-1">{dealership.name}</h3>
          <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[dealership.status] || 'bg-gray-200 text-gray-800'}`}>
            {dealership.status}
          </span>
        </div>
        <p className="text-md text-gray-500 mt-1">
          {dealership.enterprise || 'No group assigned'}
        </p>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>CIF: <span className="font-medium text-gray-800">{dealership.accountNumber}</span></p>
            <p>Specialist: <span className="font-medium text-gray-800">{dealership.assignedSpecialist || 'N/A'}</span></p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-gray-500 flex-wrap">
            {(dealership.linkedDealershipIds?.length || 0) > 0 && <span title={`${dealership.linkedDealershipIds?.length} linked dealership(s)`} className="flex items-center gap-1"><BuildingStorefrontIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.linkedDealershipIds?.length}</span></span>}
            {(dealership.ticketIds?.length || 0) > 0 && <span title={`${dealership.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1"><TicketIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.ticketIds?.length}</span></span>}
            {(dealership.projectIds?.length || 0) > 0 && <span title={`${dealership.projectIds?.length} linked project(s)`} className="flex items-center gap-1"><ClipboardListIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.projectIds?.length}</span></span>}
            {(dealership.taskIds?.length || 0) > 0 && <span title={`${dealership.taskIds?.length} linked task(s)`} className="flex items-center gap-1"><ChecklistIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.taskIds?.length}</span></span>}
            {(dealership.meetingIds?.length || 0) > 0 && <span title={`${dealership.meetingIds?.length} linked meeting(s)`} className="flex items-center gap-1"><DocumentTextIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.meetingIds?.length}</span></span>}
            {(dealership.featureIds?.length || 0) > 0 && <span title={`${dealership.featureIds?.length} linked feature(s)`} className="flex items-center gap-1"><SparklesIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.featureIds?.length}</span></span>}
        </div>
      </div>

      {/* Expander */}
      <div className="border-t border-gray-200">
          <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex justify-between items-center p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none rounded-b-lg"
              aria-expanded={isExpanded}
              aria-controls={`dealership-details-${dealership.id}`}
          >
              <span>View Details</span>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded && (
              <div id={`dealership-details-${dealership.id}`}>
                <ExpandedDealershipContent dealership={dealership} />
              </div>
          )}
      </div>
    </div>
  );
};


const DealershipList: React.FC<DealershipListProps> = ({ dealerships, onDealershipClick }) => {
  if (dealerships.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No Dealerships Found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters or click the 'New Account' button to add a new dealership.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dealerships.map(dealership => (
        <DealershipCard key={dealership.id} dealership={dealership} onClick={() => onDealershipClick(dealership)} />
      ))}
    </div>
  );
};

export default DealershipList;