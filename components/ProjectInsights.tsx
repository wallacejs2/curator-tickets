import React from 'react';

const InsightCard: React.FC<{ label: string; value: string | number; description: string; }> = ({ label, value, description }) => (
  <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

interface ProjectInsightsProps {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({ totalProjects, inProgressProjects, completedProjects }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InsightCard
          label="Total Projects"
          value={totalProjects}
          description="All projects being tracked."
        />
        <InsightCard
          label="In Progress"
          value={inProgressProjects}
          description="Projects currently active."
        />
        <InsightCard
          label="Completed"
          value={completedProjects}
          description="Projects that have been completed."
        />
      </div>
    </div>
  );
};

export default ProjectInsights;
