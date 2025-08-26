


import React, { useState } from 'react';
import { Project, ProjectStatus, TaskStatus, Ticket } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';


interface ProjectListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  tickets: Ticket[];
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; progress: string }> = {
  [ProjectStatus.NotStarted]: { bg: 'bg-gray-200', text: 'text-gray-900', progress: 'bg-gray-400' },
  [ProjectStatus.InProgress]: { bg: 'bg-blue-200', text: 'text-blue-900', progress: 'bg-blue-500' },
  [ProjectStatus.OnHold]: { bg: 'bg-yellow-200', text: 'text-yellow-900', progress: 'bg-yellow-500' },
  [ProjectStatus.Completed]: { bg: 'bg-green-200', text: 'text-green-900', progress: 'bg-green-500' },
};

const ExpandedProjectContent: React.FC<{ project: Project; tickets: Ticket[] }> = ({ project, tickets }) => {
    const linkedTickets = tickets.filter(t => t.projectId === project.id);
    const mostRecentUpdate = project.updates && project.updates.length > 0
        ? [...project.updates].pop()
        : null;
    const projectTasks = project.tasks || [];

    return (
        <div className="p-5 bg-gray-50 space-y-6">
            {/* Tasks */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tasks</h4>
                {projectTasks.length > 0 ? (
                    <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                        {projectTasks.slice(0, 3).map(task => (
                            <li key={task.id} className={task.status === TaskStatus.Done ? 'line-through text-gray-500' : ''}>{task.description}</li>
                        ))}
                        {projectTasks.length > 3 && <li>...and {projectTasks.length - 3} more.</li>}
                    </ul>
                ) : <p className="text-sm text-gray-500 italic">No tasks assigned.</p>}
            </div>
            {/* Linked Tickets */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Linked Tickets</h4>
                {linkedTickets.length > 0 ? (
                     <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                        {linkedTickets.slice(0, 3).map(ticket => (
                            <li key={ticket.id}>{ticket.title}</li>
                        ))}
                        {linkedTickets.length > 3 && <li>...and {linkedTickets.length - 3} more.</li>}
                    </ul>
                ) : <p className="text-sm text-gray-500 italic">No tickets linked.</p>}
            </div>
            {/* Updates */}
            <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Most Recent Update</h4>
                {mostRecentUpdate ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{new Date(mostRecentUpdate.date).toLocaleString()} - {mostRecentUpdate.author}:<br/>{mostRecentUpdate.comment}</p>
                ) : <p className="text-sm text-gray-500 italic">No updates posted.</p>}
            </div>
        </div>
    );
};


const ProjectCard: React.FC<{ project: Project; onClick: () => void; tickets: Ticket[] }> = ({ project, onClick, tickets }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const projectTasks = project.tasks || [];
  const completedTasks = projectTasks.filter(t => t.status === TaskStatus.Done).length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const statusColor = statusColors[project.status];
  const hasLinkedTasks = project.tasks.some(task => task.linkedTaskIds && task.linkedTaskIds.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 flex flex-col">
      <div onClick={onClick} className="p-5 cursor-pointer hover:bg-gray-50/50">
        <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-2">
                 <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                 {/* FIX: Replaced invalid 'title' prop on component with a wrapper span that has a valid title attribute for tooltips. */}
                 {hasLinkedTasks && <span title="This project has linked tasks"><LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" /></span>}
            </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description || 'No description provided.'}</p>
      </div>
      <div className="px-5 py-4 bg-gray-50/70">
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
      
      {/* Expander */}
      <div className="border-t border-gray-200">
          <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex justify-between items-center p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none rounded-b-lg"
              aria-expanded={isExpanded}
          >
              <span>View Summary</span>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded && (
              <ExpandedProjectContent project={project} tickets={tickets} />
          )}
      </div>
    </div>
  );
};


const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick, tickets }) => {
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
        <ProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} tickets={tickets} />
      ))}
    </div>
  );
};

export default ProjectList;