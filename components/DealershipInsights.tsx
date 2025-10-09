

import React from 'react';

// Re-use the InsightCard component for a consistent look
const InsightCard: React.FC<{ label: string; value: string | number; description: string; }> = ({ label, value, description }) => (
  <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);


interface DealershipInsightsProps {
  liveAccounts: number;
  pendingAccounts: number;
}

const DealershipInsights: React.FC<DealershipInsightsProps> = ({ liveAccounts, pendingAccounts }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dealership Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InsightCard
          label="Live Accounts"
          value={liveAccounts}
          description="Currently active and live dealerships."
        />
        <InsightCard
          label="Pending Statuses"
          value={pendingAccounts}
          description="Accounts in Pending or Onboarding status."
        />
      </div>
    </div>
  );
};

export default DealershipInsights;