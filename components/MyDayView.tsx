

import React from 'react';
import { Ticket, EnrichedTask, KnowledgeArticle } from '../types.ts';
import { StarIcon } from './icons/StarIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { ClockIcon } from './icons/ClockIcon.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'knowledge';

interface MyDayViewProps {
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
            {count > 0 ? children : <p className="text-sm text-gray-500 p-3 text-center h-full flex items-center justify-center">Nothing here right now. Great job!</p>}
        </div>
    </div>
);

const MyDayView: React.FC<MyDayViewProps> = ({ dueToday, myFavorites, onSwitchView }) => {

    const daysUntil = (dateString: string) => {
        const diff = new Date(dateString).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        if (days < 0) return 'Overdue';
        if (days === 0) return 'Today';
        return 'Today';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Widget icon={<ClockIcon className="w-6 h-6" />} title="Due Today" count={dueToday.length}>
                {dueToday.map(item => (
                    <div key={`${'title' in item ? 'ticket' : 'task'}-${item.id}`} onClick={() => onSwitchView('title' in item ? 'ticket' : 'task', item.id)} className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-blue-50 border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-sm text-gray-800">{'title' in item ? item.title : item.description}</p>
                                <p className="text-xs text-gray-500 mt-1 capitalize">{'title' in item ? 'Ticket' : 'Task'}</p>
                            </div>
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
{/* FIX: Replaced non-existent 'estimatedCompletionDate' with 'completionDate' for Ticket type. */}
                                {daysUntil('title' in item ? item.completionDate! : item.dueDate!)}
                            </span>
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
        </div>
    );
};

export default MyDayView;