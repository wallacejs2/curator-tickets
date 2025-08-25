import React from 'react';
import { Project, ProjectStatus, SubTaskStatus } from '../types.ts';

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; progress: string }> = {
  [ProjectStatus.NotStarted]: { bg: 'bg-gray-200', text: 'text-gray-800', progress: 'bg-gray-400' },
  [ProjectStatus.InProgress]: { bg: 'bg-blue-200', text: 'text-blue-800', progress: 'bg-blue-500' },
  [ProjectStatus.OnHold]: { bg: 'bg-yellow-200', text: 'text-yellow-800', progress: 'bg-yellow-500' },
  [ProjectStatus.Completed]: { bg: 'bg-green-200', text: 'text-green-800', progress: 'bg-green-500' },
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void; }> = ({ project, onClick }) => {
  const completedTasks = project.subTasks.filter(t => t.status === SubTaskStatus.Done).length;
  const totalTasks = project.subTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const statusColor = statusColors[project.status];

  return (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description || 'No description provided.'}</p>
      </div>
      <div className="px-5 py-4 bg-gray-50/70 rounded-b-lg">
        <div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{completedTasks} / {totalTasks} Tasks</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${statusColor.progress}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No projects found</h3>
        <p className="text-gray-500 mt-2">Click the '+' button to create a new project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} />
      ))}
    </div>
  );
};

export default ProjectList;