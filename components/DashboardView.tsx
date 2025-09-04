import React from 'react';
import { Ticket, Task, Update } from '../types.ts';
import { StarIcon } from './icons/StarIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { ClockIcon } from './icons/ClockIcon.tsx';
import { ArrowPathIcon } from './icons/ArrowPathIcon.tsx';
import PerformanceInsights from './PerformanceInsights.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface PerformanceInsightsProps {
    openTickets: number;
    completedLast30Days: number;
    avgCompletionDays: number | null;
}

interface DashboardViewProps {
    performanceInsights: PerformanceInsightsProps;
    upcomingDeadlines: any[];
    recentlyUpdatedItems: any[];
    onSwitchView: (type: EntityType, id: string) => void;
}

const Widget: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col min-h-[40vh]">
        <div className="flex items-center gap-3 mb-4">
            <div className="text-gray-500">{icon}</div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="flex-grow space-y-3 overflow-y-auto pr-2 -mr-2">{children}</div>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ performanceInsights, upcomingDeadlines, recentlyUpdatedItems, onSwitchView }) => {

    const getItemName = (item: any): string => item.name || item.title || `Item ${item.id}`;

    const daysUntil = (dateString: string) => {
        const diff = new Date(dateString).getTime() - new Date().getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days`;
    };

    return (
        <div>
            <PerformanceInsights {...performanceInsights} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                 <Widget icon={<ClockIcon className="w-6 h-6" />} title="Upcoming Deadlines (Next 7 Days)">
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

                 <Widget icon={<ArrowPathIcon className="w-6 h-6" />} title="Recently Updated">
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