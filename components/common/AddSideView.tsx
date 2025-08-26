
import React, { useState, useEffect } from 'react';
import { XIcon } from '../icons/XIcon.tsx';
import { IssueTicket, FeatureRequestTicket, Project, Dealership, FeatureAnnouncement, Meeting } from '../../types.ts';
import TicketForm from '../TicketForm.tsx';
import ProjectForm from '../ProjectForm.tsx';
import DealershipForm from '../DealershipForm.tsx';
import FeatureForm from '../FeatureForm.tsx';
import MeetingForm from '../MeetingForm.tsx';

// Define the submission function types
type TicketSubmit = (ticket: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => void;
type ProjectSubmit = (project: Omit<Project, 'id' | 'creationDate' | 'tasks' | 'ticketIds'>) => void;
type DealershipSubmit = (dealership: Omit<Dealership, 'id'>) => void;
type FeatureSubmit = (feature: Omit<FeatureAnnouncement, 'id'>) => void;
type MeetingSubmit = (meeting: Omit<Meeting, 'id'>) => void;

interface AddSideViewProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onTicketSubmit: TicketSubmit;
  onProjectSubmit: ProjectSubmit;
  onDealershipSubmit: DealershipSubmit;
  onFeatureSubmit: FeatureSubmit;
  onMeetingSubmit: MeetingSubmit;
}

type ActiveForm = 'ticket' | 'project' | 'dealership' | 'feature' | 'meeting';

const formTabs: { id: ActiveForm; label: string }[] = [
    { id: 'ticket', label: 'New Ticket' },
    { id: 'project', label: 'New Project' },
    { id: 'dealership', label: 'New Account' },
    { id: 'feature', label: 'New Feature' },
    { id: 'meeting', label: 'New Meeting' },
];

const AddSideView: React.FC<AddSideViewProps> = ({
  isOpen,
  onClose,
  projects,
  onTicketSubmit,
  onProjectSubmit,
  onDealershipSubmit,
  onFeatureSubmit,
  onMeetingSubmit,
}) => {
  const [activeForm, setActiveForm] = useState<ActiveForm>('ticket');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const renderForm = () => {
    switch (activeForm) {
      case 'ticket':
        return <TicketForm onSubmit={(data) => { onTicketSubmit(data); onClose(); }} projects={projects} />;
      case 'project':
        return <ProjectForm onSubmit={(data) => { onProjectSubmit(data); onClose(); }} />;
      case 'dealership':
        return <DealershipForm onSubmit={onDealershipSubmit} onUpdate={() => {}} onClose={onClose} />;
      case 'feature':
        return <FeatureForm onSubmit={onFeatureSubmit} onUpdate={() => {}} onClose={onClose} />;
      case 'meeting':
        return <MeetingForm onSubmit={onMeetingSubmit} onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true"></div>
      <div className={`fixed top-0 left-0 h-full w-full max-w-3xl bg-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Add New Item</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 focus:outline-none p-1" aria-label="Close panel">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex border-b border-gray-200 bg-white">
            {formTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveForm(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeForm === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 flex-grow overflow-y-auto bg-white">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSideView;
