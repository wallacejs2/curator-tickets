import React, { useMemo } from 'react';
import { Project, Task, ProjectStatus } from '../types.ts';

interface GanttChartViewProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const statusColors: Record<ProjectStatus, string> = {
    [ProjectStatus.NotStarted]: 'bg-gray-400',
    [ProjectStatus.InProgress]: 'bg-blue-500',
    [ProjectStatus.OnHold]: 'bg-yellow-500',
    [ProjectStatus.Completed]: 'bg-green-500',
};

const getProjectDateRange = (project: Project): { start: Date; end: Date } | null => {
    const dates = (project.tasks || [])
        .filter(Boolean)
        .map(task => [
            task.creationDate ? new Date(task.creationDate) : null,
            task.dueDate ? new Date(task.dueDate) : null
        ])
        .flat()
        .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()));

    if (dates.length === 0) return null;

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    return { start, end };
};

const GanttChartView: React.FC<GanttChartViewProps> = ({ projects, onProjectClick }) => {
    const { chartStartDate, chartEndDate, months, totalDays } = useMemo(() => {
        const projectRanges = projects.filter(Boolean).map(getProjectDateRange).filter((r): r is { start: Date; end: Date } => r !== null);
        if (projectRanges.length === 0) return { chartStartDate: new Date(), chartEndDate: new Date(), months: [], totalDays: 0 };

        const chartStartDate = new Date(Math.min(...projectRanges.map(r => r.start.getTime())));
        chartStartDate.setDate(1); // Start from the beginning of the month

        const chartEndDate = new Date(Math.max(...projectRanges.map(r => r.end.getTime())));
        chartEndDate.setMonth(chartEndDate.getMonth() + 1);
        chartEndDate.setDate(0); // End at the last day of the month

        const months = [];
        let currentMonth = new Date(chartStartDate);
        while (currentMonth <= chartEndDate) {
            months.push(new Date(currentMonth));
            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        const totalDays = (chartEndDate.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24) + 1;

        return { chartStartDate, chartEndDate, months, totalDays };
    }, [projects]);
    
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    if (totalDays === 0) {
        return <div className="text-center text-gray-600 p-8 bg-white rounded-lg shadow-sm">No projects with valid task dates to display in Gantt chart.</div>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex">
                <div className="w-1/4 border-r border-gray-200 font-semibold text-sm text-gray-700">
                    <div className="h-12 flex items-center px-2">Project Name</div>
                    {projects.filter(Boolean).map(p => (
                        <div key={p.id} className="h-16 flex items-center px-2 border-t border-gray-200 truncate">
                            {p.name}
                        </div>
                    ))}
                </div>
                <div className="w-3/4 overflow-x-auto">
                    <div style={{ minWidth: `${totalDays * 20}px` }}>
                        {/* Header */}
                        <div className="flex h-12 sticky top-0 bg-white z-10">
                            {months.map(month => (
                                <div key={month.toISOString()} style={{ width: `${daysInMonth(month) * 20}px` }} className="border-r border-b border-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </div>
                            ))}
                        </div>
                        {/* Rows */}
                        {projects.filter(Boolean).map(project => {
                             const range = getProjectDateRange(project);
                             if (!range) return <div key={project.id} className="h-16 border-t border-gray-200"/>;

                             const offsetDays = (range.start.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24);
                             const durationDays = (range.end.getTime() - range.start.getTime()) / (1000 * 3600 * 24) + 1;
                             
                             return (
                                 <div key={project.id} className="h-16 border-t border-gray-200 relative">
                                     <div 
                                         onClick={() => onProjectClick(project)}
                                         className={`absolute top-2.5 h-6 rounded-md text-white text-xs flex items-center px-2 truncate cursor-pointer hover:opacity-80 transition-opacity ${statusColors[project.status]}`}
                                         style={{ left: `${offsetDays * 20}px`, width: `${durationDays * 20}px` }}
                                         title={project.name}
                                     >
                                         <span className="truncate">{project.name}</span>
                                     </div>
                                     <div className="absolute top-10 w-full h-4">
                                         {(project.tasks || []).filter(Boolean).map(task => {
                                             const taskStart = task.creationDate ? new Date(task.creationDate) : null;
                                             const taskEnd = task.dueDate ? new Date(task.dueDate) : taskStart;
                                             if (!taskStart || !taskEnd) return null;
                                             
                                             const taskOffset = (taskStart.getTime() - chartStartDate.getTime()) / (1000 * 3600 * 24);
                                             const taskDuration = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 3600 * 24) + 1);

                                             return (
                                                 <div key={task.id} 
                                                     className="absolute h-2 bg-blue-300 rounded-full"
                                                     style={{ left: `${taskOffset * 20}px`, width: `${taskDuration * 20}px`}}
                                                     title={`${task.description} (Due: ${taskEnd.toLocaleDateString()})`}
                                                 />
                                             )
                                         })}
                                     </div>
                                 </div>
                             )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChartView;