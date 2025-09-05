import React from 'react';
import TicketDetailView from './TicketDetailView.tsx';
import ProjectDetailView from './ProjectDetailView.tsx';
import DealershipDetailView from './DealershipDetailView.tsx';
import MeetingDetailView from './MeetingDetailView.tsx';
import FeatureDetailView from './FeatureDetailView.tsx';
import { Ticket, Project, Dealership, Meeting, FeatureAnnouncement, Task, DealershipGroup } from '../types.ts';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface PublicViewProps {
  item: any;
  type: EntityType;
  allData: {
    allTickets: Ticket[];
    allProjects: Project[];
    allTasks: (Task & { projectName?: string; projectId: string | null; })[];
    allMeetings: Meeting[];
    allDealerships: Dealership[];
    allFeatures: FeatureAnnouncement[];
    allGroups: DealershipGroup[];
  };
}

const PublicView: React.FC<PublicViewProps> = ({ item, type, allData }) => {
  const renderDetailView = () => {
    const doNothing = () => {};
    const commonProps = {
      ...allData,
      isReadOnly: true,
      onUpdate: doNothing,
      onDelete: doNothing,
      onExport: doNothing,
      onEmail: doNothing,
      onAddUpdate: doNothing,
      onEditUpdate: doNothing,
      onDeleteUpdate: doNothing,
      onLink: doNothing,
      onUnlink: doNothing,
      onSwitchView: doNothing,
      // FIX: Added missing showToast prop for TicketDetailView and ProjectDetailView
      showToast: doNothing,
    };

    switch (type) {
      case 'ticket':
        return <TicketDetailView ticket={item} {...commonProps} />;
      case 'project':
        return <ProjectDetailView project={item} {...commonProps} />;
      case 'dealership':
        return <DealershipDetailView dealership={item} {...commonProps} />;
      case 'meeting':
        return <MeetingDetailView meeting={item} {...commonProps} />;
      case 'feature':
        return <FeatureDetailView feature={item} {...commonProps} />;
      default:
        return <p>Unsupported item type.</p>;
    }
  };

  const getItemName = (item: any): string => item.name || item.title || `Item ${item.id}`;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white p-5 rounded-t-lg border-b border-gray-200 shadow-sm">
            <h1 className="text-xl font-bold text-gray-800 tracking-wide">Curator</h1>
            <p className="text-sm text-gray-500 mt-1">Viewing a shared item</p>
        </header>
        <main className="bg-white p-6 rounded-b-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                {getItemName(item)}
            </h2>
            {renderDetailView()}
        </main>
      </div>
    </div>
  );
};

export default PublicView;
