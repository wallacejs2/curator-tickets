import React from 'react';

const InsightCard: React.FC<{ label: string; value: string | number; description: string; }> = ({ label, value, description }) => (
  <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

interface TaskInsightsProps {
  totalTasks: number;
  toDoTasks: number;
  inProgressTasks: number;
}

const TaskInsights: React.FC<TaskInsightsProps> = ({ totalTasks, toDoTasks, inProgressTasks }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Task Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InsightCard
          label="Total Active Tasks"
          value={totalTasks}
          description="All tasks excluding 'Done'."
        />
        <InsightCard
          label="To Do"
          value={toDoTasks}
          description="Tasks that have not been started."
        />
        <InsightCard
          label="In Progress"
          value={inProgressTasks}
          description="Tasks that are currently being worked on."
        />
      </div>
    </div>
  );
};

export default TaskInsights;