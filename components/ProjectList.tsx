
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, TaskStatus, Ticket, Task } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import GanttChartView from './GanttChartView.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { AccountBalanceIcon } from './icons/AccountBalanceIcon.tsx';


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
    const linkedTickets = tickets.filter(t => (t.projectIds || []).includes(project.id));
    const mostRecentUpdate = project.updates && project.updates.length > 0
        ? [...project.updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
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
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{new Date(mostRecentUpdate.date).toLocaleDateString()} - {mostRecentUpdate.author}:<br/>{mostRecentUpdate.comment}</p>
                ) : <p className="text-sm text-gray-500 italic">No updates posted.</p>}
            </div>
        </div>
    );
};


const ProjectCard: React.FC<{ project: Project; onClick: () => void; tickets: Ticket[] }> = ({ project, onClick, tickets }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { completedTasks, totalTasks } = useMemo(() => {
    const countTasksRecursively = (tasks: Task[]): { completed: number; total: number } => {
        let completed = 0;
        let total = 0;
        for (const task of tasks) {
            total++;
            if (task.status === TaskStatus.Done) {
                completed++;
            }
            if (task.subTasks && task.subTasks.length > 0) {
                const subCounts = countTasksRecursively(task.subTasks);
                completed += subCounts.completed;
                total += subCounts.total;
            }
        }
        return { completed, total };
    };
    const counts = countTasksRecursively(project.tasks || []);
    return { completedTasks: counts.completed, totalTasks: counts.total };
  }, [project.tasks]);

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const statusColor = statusColors[project.status];
  const linkedProjectsCount = (project.linkedProjectIds || []).filter(id => id !== project.id).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 flex flex-col">
      <div onClick={onClick} className="p-5 cursor-pointer hover:bg-gray-50/50">
        <div className="flex justify-between items-start gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColor.bg} ${statusColor.text}`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description || 'No description provided.'}</p>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
            {linkedProjectsCount > 0 && <span title={`${linkedProjectsCount} linked project(s)`} className="flex items-center gap-1 text-red-600"><WorkspaceIcon className="w-4 h-4" /><span className="text-xs font-medium">{linkedProjectsCount}</span></span>}
            {(project.ticketIds?.length || 0) > 0 && <span title={`${project.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1 text-yellow-600"><ReceiptLongIcon className="w-4 h-4" /><span className="text-xs font-medium">{project.ticketIds?.length}</span></span>}
            {(project.taskIds?.length || 0) > 0 && <span title={`${project.taskIds?.length} linked task(s)`} className="flex items-center gap-1 text-green-600"><ChecklistIcon className="w-4 h-4" /><span className="text-xs font-medium">{project.taskIds?.length}</span></span>}
            {(project.meetingIds?.length || 0) > 0 && <span title={`${project.meetingIds?.length} linked meeting(s)`} className="flex items-center gap-1 text-blue-600"><DocumentTextIcon className="w-4 h-4" /><span className="text-xs font-medium">{project.meetingIds?.length}</span></span>}
            {(project.dealershipIds?.length || 0) > 0 && <span title={`${project.dealershipIds?.length} linked dealership(s)`} className="flex items-center gap-1 text-gray-600"><AccountBalanceIcon className="w-4 h-4" /><span className="text-xs font-medium">{project.dealershipIds?.length}</span></span>}
            {(project.featureIds?.length || 0) > 0 && <span title={`${project.featureIds?.length} linked feature(s)`} className="flex items-center gap-1 text-pink-600"><SparklesIcon className="w-4 h-4" /><span className="text-xs font-medium">{project.featureIds?.length}</span></span>}
        </div>
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
  const [projectView, setProjectView] = useState<'active' | 'completed'>('active');
  const [listOrGantt, setListOrGantt] = useState<'list' | 'gantt'>('list');

  const { activeProjects, completedProjects } = useMemo(() => {
    return projects.reduce<{ activeProjects: Project[]; completedProjects: Project[] }>(
      (acc, project) => {
        if (project.status === ProjectStatus.Completed) {
          acc.completedProjects.push(project);
        } else {
          acc.activeProjects.push(project);
        }
        return acc;
      },
      { activeProjects: [], completedProjects: [] }
    );
  }, [projects]);
  
  const projectsToShow = projectView === 'active' ? activeProjects : completedProjects;

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No projects found</h3>
        <p className="text-gray-500 mt-2">Click the '+' button to create a new project.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex border-b border-gray-200 justify-between">
        <div className="flex">
            <button
            onClick={() => setProjectView('active')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
                projectView === 'active'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-pressed={projectView === 'active'}
            >
            Active ({activeProjects.length})
            </button>
            <button
            onClick={() => setProjectView('completed')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
                projectView === 'completed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-pressed={projectView === 'completed'}
            >
            Completed ({completedProjects.length})
            </button>
        </div>
        <div className="flex items-center">
             <div className="bg-gray-200 p-0.5 rounded-md flex">
                <button onClick={() => setListOrGantt('list')} className={`px-3 py-1 text-sm rounded ${listOrGantt === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}>List</button>
                <button onClick={() => setListOrGantt('gantt')} className={`px-3 py-1 text-sm rounded ${listOrGantt === 'gantt' ? 'bg-white shadow' : 'text-gray-600'}`}>Gantt</button>
            </div>
        </div>
      </div>
      
      {listOrGantt === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projectsToShow.map(project => (
            <ProjectCard key={project.id} project={project} onClick={() => onProjectClick(project)} tickets={tickets} />
          ))}
        </div>
      ) : (
         <GanttChartView projects={projectsToShow} onProjectClick={onProjectClick} />
      )}
    </div>
  );
};

export default ProjectList;