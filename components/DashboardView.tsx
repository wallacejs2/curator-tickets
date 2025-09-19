

import React from 'react';
import { Ticket, Task, Update, EnrichedTask, KnowledgeArticle } from '../types.ts';
import { StarIcon } from './icons/StarIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { ClockIcon } from './icons/ClockIcon.tsx';
import { ArrowPathIcon } from './icons/ArrowPathIcon.tsx';
import PerformanceInsights from './PerformanceInsights.tsx';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';


type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'knowledge';

interface PerformanceInsightsProps {
    openTickets: number;
    completedLast30Days: number;
    avgCompletionDays: number | null;
}

interface ProjectInsightsProps {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
}

interface DealershipInsightsProps {
  totalDealerships: number;
  liveAccounts: number;
  pendingAccounts: number;
}

interface TaskInsightsProps {
  totalTasks: number;
  toDoTasks: number;
  inProgressTasks: number;
}


interface DashboardViewProps {
    performanceInsights: PerformanceInsightsProps;
    projectInsights: ProjectInsightsProps;
    dealershipInsights: DealershipInsightsProps;
    taskInsights: TaskInsightsProps;
    upcomingDeadlines: any[];
    recentlyUpdatedItems: any[];
    dueToday: (Ticket | EnrichedTask)[];
    myFavorites: (Ticket | KnowledgeArticle)[];
    onSwitchView: (type: EntityType, id: string) => void;
}

const Widget: React.FC<{ icon: React.ReactNode; title: string; count: number; children: React.ReactNode }> = ({ icon, title, count, children }) => (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col min-h-[40vh]">
        <div className="flex items-center gap-3 mb-4">
            <div className="text-gray-500">{icon}</div>
            <h2 className="text-lg font-semibold text-gray-800">{title} ({count})</h2>
        </div>
        <div className="flex-grow space-y-3 overflow-y-auto pr-2 -mr-2">
            {count > 0 ? children : <p className="text-sm text-gray-500 p-3 text-center h-full flex items-center justify-center">Nothing to show.</p>}
        </div>
    </div>
);

const InsightCard: React.FC<{ label: string; value: string | number; description: string; }> = ({ label, value, description }) => (
  <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ 
    performanceInsights, 
    projectInsights, 
    dealershipInsights, 
    taskInsights, 
    upcomingDeadlines, 
    recentlyUpdatedItems,
    dueToday,
    myFavorites, 
    onSwitchView 
}) => {

    const getItemName = (item: any): string => item.name || item.title || `Item ${item.id}`;

    const daysUntil = (dateString: string) => {
        const diff = new Date(dateString).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days`;
    };

    const dueTodayStatus = (dateString: string) => {
        const diff = new Date(dateString).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days < 0) return 'Overdue';
        return 'Today';
    };

    return (
        <div className="space-y-8">
            <PerformanceInsights {...performanceInsights} />
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InsightCard
                  label="In Progress Projects"
                  value={projectInsights.inProgressProjects}
                  description={`out of ${projectInsights.totalProjects} total projects.`}
                />
                <InsightCard
                  label="Live Dealerships"
                  value={dealershipInsights.liveAccounts}
                  description={`out of ${dealershipInsights.totalDealerships} active accounts.`}
                />
                <InsightCard
                  label="Active Tasks"
                  value={taskInsights.totalTasks}
                  description={`${taskInsights.inProgressTasks} in progress.`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Widget icon={<ClockIcon className="w-6 h-6" />} title="Due Today" count={dueToday.length}>
                    {dueToday.map(item => (
                        <div key={`${'title' in item ? 'ticket' : 'task'}-${item.id}`} onClick={() => onSwitchView('title' in item ? 'ticket' : 'task', item.id)} className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm text-gray-800">{'title' in item ? item.title : item.description}</p>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">{'title' in item ? 'Ticket' : 'Task'}</p>
                                </div>
                                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{dueTodayStatus('title' in item ? item.estimatedCompletionDate! : item.dueDate!)}</span>
                            </div>
                        </div>
                    ))}
                </Widget>
                <Widget icon={<StarIcon filled={true} className="w-6 h-6 text-yellow-500" />} title="Favorites" count={myFavorites.length}>
                    {myFavorites.map(item => (
                        <div key={`${'content' in item ? 'knowledge' : 'ticket'}-${item.id}`} onClick={() => onSwitchView('content' in item ? 'knowledge' : 'ticket', item.id)} className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 border border-gray-200 flex items-center gap-3">
                           {'content' in item ? <BrainCircuitIcon className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ReceiptLongIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                           <p className="font-medium text-sm text-gray-800 truncate">{item.title}</p>
                        </div>
                    ))}
                </Widget>
                 <Widget icon={<ClockIcon className="w-6 h-6" />} title="Upcoming Deadlines" count={upcomingDeadlines.length}>
                    {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(item => (
                        <div key={`${item.type}-${item.id}`} onClick={() => onSwitchView(item.type, item.id)} className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-sm text-gray-800">{item.title || item.description}</p>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">{item.type} - Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{daysUntil(item.dueDate)}</span>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 p-3 text-center">No approaching deadlines.</p>}
                </Widget>
                 <Widget icon={<ArrowPathIcon className="w-6 h-6" />} title="Recently Updated" count={recentlyUpdatedItems.length}>
                    {recentlyUpdatedItems.length > 0 ? recentlyUpdatedItems.map(item => (
                        <div key={`${item.itemType}-${item.id}`} onClick={() => onSwitchView(item.itemType, item.id)} className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 border border-gray-200">
                             <p className="font-medium text-sm text-gray-800">{getItemName(item)}</p>
                             <p className="text-xs text-gray-500 mt-1">
                                Last update by <span className="font-medium">{item.lastUpdate.author}</span> on {new Date(item.lastUpdate.date).toLocaleDateString()}
                            </p>
                             <p className="text-xs text-gray-600 mt-1 truncate italic">"{item.lastUpdate.comment.replace(/<br\s*\/?>/gi, ' ')}"</p>
                        </div>
                    )) : <p className="text-sm text-gray-500 p-3 text-center">No recent updates.</p>}
                </Widget>
            </div>
        </div>
    );
};

export default DashboardView;