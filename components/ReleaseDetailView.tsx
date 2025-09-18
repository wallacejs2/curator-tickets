import React, { useState } from 'react';
import { Release, FeatureAnnouncement, Ticket, ReleaseStatus, Status, FeatureStatus } from '../types.ts';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import Modal from './common/Modal.tsx';
import ReleaseForm from './ReleaseForm.tsx';

type EntityType = 'ticket' | 'feature';

interface ReleaseDetailViewProps {
  release: Release;
  onUpdate: (release: Release) => void;
  onDelete: (releaseId: string) => void;
  
  allTickets: Ticket[];
  allFeatures: FeatureAnnouncement[];

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

const statusColors: Record<ReleaseStatus, string> = {
  [ReleaseStatus.Planned]: 'bg-gray-200 text-gray-800',
  [ReleaseStatus.InProgress]: 'bg-blue-200 text-blue-800',
  [ReleaseStatus.Released]: 'bg-green-200 text-green-800',
  [ReleaseStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const DetailTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[value] || 'bg-gray-200 text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const ReleaseDetailView: React.FC<ReleaseDetailViewProps> = ({
  release, onUpdate, onDelete, allTickets, allFeatures, onLink, onUnlink, onSwitchView
}) => {

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  const linkedFeatures = allFeatures.filter(item => (release.featureIds || []).includes(item.id));
  const linkedTickets = allTickets.filter(item => (release.ticketIds || []).includes(item.id));

  const availableFeatures = allFeatures.filter(item => item.status !== FeatureStatus.Launched && !(release.featureIds || []).includes(item.id));
  const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(release.ticketIds || []).includes(item.id));

  return (
    <div>
        {isDeleteModalOpen && (
            <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                <p className="text-gray-700">Are you sure you want to delete this release? This will not delete the associated features or tickets. This action cannot be undone.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onDelete(release.id)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Release</button>
                </div>
            </Modal>
        )}
        {isEditingModalOpen && (
            <Modal title="Edit Release" onClose={() => setIsEditingModalOpen(false)}>
                <ReleaseForm onSave={onUpdate} releaseToEdit={release} onClose={() => setIsEditingModalOpen(false)} />
            </Modal>
        )}

      <div className="flex justify-end items-center gap-3 mb-6">
        <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
        <button onClick={() => setIsEditingModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DetailField label="Version" value={release.version} />
            <DetailTag label="Status" value={release.status} />
            <DetailField label="Target Release Date" value={new Date(release.releaseDate).toLocaleDateString()} />
        </div>

        {release.description && (
            <div className="border-t border-gray-200 pt-6">
                <DetailField label="Description" value={release.description} />
            </div>
        )}

        <LinkingSection
          title="Features in this Release"
          itemTypeLabel="feature"
          linkedItems={linkedFeatures}
          availableItems={availableFeatures}
          onLink={(id) => onLink('feature', id)}
          onUnlink={(id) => onUnlink('feature', id)}
          onItemClick={(id) => onSwitchView('feature', id)}
        />
        <LinkingSection
          title="Tickets in this Release"
          itemTypeLabel="ticket"
          linkedItems={linkedTickets}
          availableItems={availableTickets}
          onLink={(id) => onLink('ticket', id)}
          onUnlink={(id) => onUnlink('ticket', id)}
          onItemClick={(id) => onSwitchView('ticket', id)}
        />
      </div>
    </div>
  );
};

export default ReleaseDetailView;
