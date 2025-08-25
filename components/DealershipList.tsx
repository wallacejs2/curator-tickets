import React from 'react';
import { Dealership, DealershipStatus } from '../types.ts';

interface DealershipListProps {
  dealerships: Dealership[];
  onDealershipClick: (dealership: Dealership) => void;
}

const statusColors: Record<DealershipStatus, string> = {
  [DealershipStatus.Onboarding]: 'bg-blue-200 text-blue-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Pilot]: 'bg-yellow-200 text-yellow-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const DealershipCard: React.FC<{ dealership: Dealership; onClick: () => void; }> = ({ dealership, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col">
      <div className="p-5">
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
      </div>
      <div className="px-5 py-3 bg-gray-50/70 rounded-b-lg border-t border-gray-200">
        <p className="text-sm text-gray-600">Go-Live: <span className="font-medium">{dealership.goLiveDate ? new Date(dealership.goLiveDate).toLocaleDateString() : 'TBD'}</span></p>
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