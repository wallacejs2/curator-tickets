import React, { useMemo } from 'react';
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

const statusOrder: DealershipStatus[] = [
  DealershipStatus.Live,
  DealershipStatus.Onboarding,
  DealershipStatus.Pilot,
  DealershipStatus.Cancelled,
];

const DealershipList: React.FC<DealershipListProps> = ({ dealerships, onDealershipClick }) => {
  const groupedDealerships = useMemo(() => {
    const groups: Record<DealershipStatus, Dealership[]> = {
      [DealershipStatus.Live]: [],
      [DealershipStatus.Onboarding]: [],
      [DealershipStatus.Pilot]: [],
      [DealershipStatus.Cancelled]: [],
    };
    
    dealerships.forEach(dealership => {
      if (dealership.status in groups) {
        groups[dealership.status].push(dealership);
      }
    });
    return groups;
  }, [dealerships]);

  if (dealerships.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No Dealerships Found</h3>
        <p className="text-gray-500 mt-2">Click the 'New Account' button to add a new dealership.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {statusOrder.map(status => (
        groupedDealerships[status] && groupedDealerships[status].length > 0 && (
          <div key={status}>
            <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
              {status} 
              <span className="text-base font-normal text-gray-500 ml-2">({groupedDealerships[status].length})</span>
            </h2>
            <div className="space-y-4">
              {groupedDealerships[status].map(dealership => (
                <DealershipCard key={dealership.id} dealership={dealership} onClick={() => onDealershipClick(dealership)} />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default DealershipList;