

import React, { useState } from 'react';
import { Dealership, DealershipStatus, Ticket, Project, Task, Meeting, FeatureAnnouncement, Status, ProjectStatus, TaskStatus } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import DealershipForm from './DealershipForm.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface DealershipDetailViewProps {
  dealership: Dealership;
  onUpdate: (dealership: Dealership) => void;
  onDelete: (dealershipId: string) => void;
  onExport: () => void;
  
  // All entities for linking
  allTickets: Ticket[];
  allProjects: Project[];
  allTasks: (Task & { projectName?: string; projectId: string | null; })[];
  allMeetings: Meeting[];
  allDealerships: Dealership[];
  allFeatures: FeatureAnnouncement[];

  // Linking handlers
  onLink: (toType: EntityType, toId: string) => void;
  onUnlink: (toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || 'N/A'}</p>
  </div>
);

const statusColors: Record<DealershipStatus, string> = {
  [DealershipStatus.PendingFocus]: 'bg-sky-200 text-sky-800',
  [DealershipStatus.PendingDmt]: 'bg-purple-200 text-purple-800',
  [DealershipStatus.PendingSetup]: 'bg-yellow-200 text-yellow-800',
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Pilot]: 'bg-pink-200 text-pink-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const DetailTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[value] || 'bg-gray-200 text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const DealershipDetailView: React.FC<DealershipDetailViewProps> = ({ 
    dealership, onUpdate, onDelete, onExport,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink, onSwitchView
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A';
    
    // Linked items
    const linkedTickets = allTickets.filter(item => (dealership.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => (dealership.projectIds || []).includes(item.id));
    const linkedTasks = allTasks.filter(item => (dealership.taskIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => (dealership.meetingIds || []).includes(item.id));
    const linkedDealerships = allDealerships.filter(item => (dealership.linkedDealershipIds || []).includes(item.id));
    const linkedFeatures = allFeatures.filter(item => (dealership.featureIds || []).includes(item.id));

    // Available items for linking (filter out completed items)
    const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(dealership.ticketIds || []).includes(item.id));
    const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(dealership.projectIds || []).includes(item.id));
    const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !(dealership.taskIds || []).includes(item.id));
    const availableMeetings = allMeetings.filter(item => !(dealership.meetingIds || []).includes(item.id));
    const availableDealerships = allDealerships.filter(item => item.id !== dealership.id && !(dealership.linkedDealershipIds || []).includes(item.id));
    const availableFeatures = allFeatures.filter(item => !(dealership.featureIds || []).includes(item.id));

    return (
        <div>
            {isDeleteModalOpen && (
                <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                    <p className="text-gray-700">Are you sure you want to delete this dealership account? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { onDelete(dealership.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Account</button>
                    </div>
                </Modal>
            )}

            {isEditingModalOpen && (
                <Modal title={`Edit ${dealership.name}`} onClose={() => setIsEditingModalOpen(false)}>
                    <DealershipForm 
                        onSubmit={() => {}}
                        onUpdate={onUpdate}
                        dealershipToEdit={dealership}
                        onClose={() => setIsEditingModalOpen(false)}
                    />
                </Modal>
            )}

            <div className="flex justify-end items-center gap-3 mb-6">
                <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm">
                    <DownloadIcon className="w-4 h-4"/>
                    <span>Export</span>
                </button>
                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                <button onClick={() => setIsEditingModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DetailField label="Account Name" value={dealership.name} />
                    <DetailField label="Account Number (CIF)" value={dealership.accountNumber} />
                    <DetailTag label="Status" value={dealership.status} />
                </div>

                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DetailField label="Assigned Specialist" value={dealership.assignedSpecialist} />
                    <DetailField label="Sales" value={dealership.sales} />
                    <div />
                    <DetailField label="Point of Contact Name" value={dealership.pocName} />
                    <DetailField label="Point of Contact Email" value={dealership.pocEmail} />
                    <DetailField label="Point of Contact Phone" value={dealership.pocPhone} />
                </div>

                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DetailField label="Order Number" value={dealership.orderNumber} />
                    <DetailField label="Order Received Date" value={formatDate(dealership.orderReceivedDate)} />
                    <DetailField label="Go-Live Date" value={formatDate(dealership.goLiveDate)} />
                    <DetailField label="Term Date" value={formatDate(dealership.termDate)} />
                </div>
                
                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DetailField label="Enterprise (Group)" value={dealership.enterprise} />
                    <DetailField label="Store Number" value={dealership.storeNumber} />
                    <DetailField label="Branch Number" value={dealership.branchNumber} />
                    <DetailField label="ERA System ID" value={dealership.eraSystemId} />
                    <DetailField label="PPSysID" value={dealership.ppSysId} />
                    <DetailField label="BU-ID" value={dealership.buId} />
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <DetailField label="Address" value={dealership.address} />
                </div>

                <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
                <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink('project', id)} onUnlink={(id) => onUnlink('project', id)} onItemClick={(id) => onSwitchView('project', id)} />
                <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} onItemClick={(id) => onSwitchView('task', id)} />
                <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', id)} onUnlink={(id) => onUnlink('meeting', id)} onItemClick={(id) => onSwitchView('meeting', id)} />
                <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} onItemClick={(id) => onSwitchView('dealership', id)} />
                <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink('feature', id)} onUnlink={(id) => onUnlink('feature', id)} onItemClick={(id) => onSwitchView('feature', id)} />
            </div>
        </div>
    )
}

export default DealershipDetailView;