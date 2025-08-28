

import React from 'react';
import { FeatureAnnouncement, FeatureStatus, Platform } from '../types.ts';
import { TicketIcon } from './icons/TicketIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';

interface FeatureListProps {
  features: FeatureAnnouncement[];
  onDelete: (featureId: string) => void;
  onFeatureClick: (feature: FeatureAnnouncement) => void;
}

const statusColors: Record<FeatureStatus, string> = {
  [FeatureStatus.Launched]: 'bg-green-200 text-green-800',
  [FeatureStatus.Upcoming]: 'bg-blue-200 text-blue-800',
};

const platformColors: Record<Platform, string> = {
    [Platform.Curator]: 'bg-pink-600 text-white',
    [Platform.UCP]: 'bg-sky-600 text-white',
    [Platform.FOCUS]: 'bg-orange-500 text-white',
};

const FeatureCard: React.FC<{ feature: FeatureAnnouncement, onClick: () => void }> = ({ feature, onClick }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-300 transition-all" onClick={onClick}>
            <div className="p-5">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[feature.status]}`}>
                            {feature.status}
                        </span>
                        {feature.version && (
                             <span className="px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap bg-gray-200 text-gray-800">
                                {feature.version}
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                     <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${platformColors[feature.platform]}`}>
                        {feature.platform}
                    </span>
                    <p className="text-sm text-gray-500">{feature.location}</p>
                </div>
                <p className="text-gray-700 mt-4 whitespace-pre-wrap line-clamp-3">{feature.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-gray-500 flex-wrap">
                    {(feature.linkedFeatureIds?.length || 0) > 0 && <span title={`${feature.linkedFeatureIds?.length} linked feature(s)`} className="flex items-center gap-1"><SparklesIcon className="w-4 h-4" /><span className="text-xs font-medium">{feature.linkedFeatureIds?.length}</span></span>}
                    {(feature.ticketIds?.length || 0) > 0 && <span title={`${feature.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1"><TicketIcon className="w-4 h-4" /><span className="text-xs font-medium">{feature.ticketIds?.length}</span></span>}
                    {(feature.projectIds?.length || 0) > 0 && <span title={`${feature.projectIds?.length} linked project(s)`} className="flex items-center gap-1"><ClipboardListIcon className="w-4 h-4" /><span className="text-xs font-medium">{feature.projectIds?.length}</span></span>}
                    {(feature.taskIds?.length || 0) > 0 && <span title={`${feature.taskIds?.length} linked task(s)`} className="flex items-center gap-1"><ChecklistIcon className="w-4 h-4" /><span className="text-xs font-medium">{feature.taskIds?.length}</span></span>}
                    {(feature.meetingIds?.length || 0) > 0 && <span title={`${feature.meetingIds?.length} linked meeting(s)`} className="flex items-center gap-1"><DocumentTextIcon className="w-4 h-4" /><span className="text-xs font-medium">{feature.meetingIds?.length}</span></span>}
                    {(feature.dealershipIds?.length || 0) > 0 && <span title={`${feature.dealershipIds?.length} linked dealership(s)`} className="flex items-center gap-1"><BuildingStorefrontIcon className="w-4 h-4" /><span className="text-xs font-medium">{feature.dealershipIds?.length}</span></span>}
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
                <div>
                     <p className="text-sm font-semibold text-gray-800">
                        {feature.status === FeatureStatus.Launched ? 'Launched On:' : 'Expected Launch:'}
                    </p>
                    <p className="text-sm text-gray-600">{new Date(feature.launchDate).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

const FeatureList: React.FC<FeatureListProps> = ({ features, onDelete, onFeatureClick }) => {
  if (features.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No New Features</h3>
        <p className="text-gray-500 mt-2">Check back later for updates on new features and improvements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {features.map(feature => (
        <FeatureCard key={feature.id} feature={feature} onClick={() => onFeatureClick(feature)} />
      ))}
    </div>
  );
};

export default FeatureList;