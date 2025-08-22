import React from 'react';

interface InsightCardProps {
  label: string;
  value: string | number;
  description: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ label, value, description }) => (
  <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);


interface PerformanceInsightsProps {
  openTickets: number;
  completedLast30Days: number;
  avgCompletionDays: number | null;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ openTickets, completedLast30Days, avgCompletionDays }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InsightCard 
          label="Open Tickets"
          value={openTickets}
          description="Currently active and unresolved tickets."
        />
        <InsightCard 
          label="Completed"
          value={completedLast30Days}
          description="Tickets resolved in the last 30 days."
        />
        <InsightCard 
          label="Avg. Completion Time"
          value={avgCompletionDays !== null ? `${avgCompletionDays.toFixed(1)} days` : 'N/A'}
          description="Average time from submission to completion."
        />
      </div>
    </div>
  );
};

export default PerformanceInsights;
