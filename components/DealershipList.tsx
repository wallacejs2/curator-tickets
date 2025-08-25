import React from 'react';
import { Dealership, DealershipStatus } from '../types.ts';

interface DealershipListProps {
  dealerships: Dealership[];
  onDealershipClick: (dealership: Dealership) => void;
}

const statusColors: Record<DealershipStatus, { bg: string; text: string; }> = {
  [DealershipStatus.Onboarding]: { bg: 'bg-blue-200', text: 'text-blue-800' },
  [DealershipStatus.Live]: { bg: 'bg-green-200', text: 'text-green-800' },
  [DealershipStatus.Pilot]: { bg: 'bg-yellow-200', text: 'text-yellow-800' },
  [DealershipStatus.Cancelled]: { bg: 'bg-red-200', text: 'text-red-800' },
};

const DealershipCard: React.FC<{ dealership: Dealership; onClick: () => void; }> = ({ dealership, onClick }) => {
  const statusColor = statusColors[dealership.status];

  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{dealership.name}</h3>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
            {dealership.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {dealership.enterprise || 'No group assigned'}
        </p>
        <div className="mt-4 text-xs text-gray-500">
            <p>CIF: <span className="font-medium text-gray-700">{dealership.accountNumber}</span></p>
            <p>Specialist: <span className="font-medium text-gray-700">{dealership.assignedSpecialist || 'N/A'}</span></p>
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50/70 rounded-b-lg border-t border-gray-100">
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
        <p className="text-gray-500 mt-2">Click the 'New Account' button to add a new dealership.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dealerships.map(dealership => (
        <DealershipCard key={dealership.id} dealership={dealership} onClick={() => onDealershipClick(dealership)} />
      ))}
    </div>
  );
};

export default DealershipList;
