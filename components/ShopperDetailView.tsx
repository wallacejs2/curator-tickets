
import React, { useState } from 'react';
import { Shopper, Ticket, Dealership, RecentActivity, Status, Task, TaskStatus } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import ShopperForm from './ShopperForm.tsx';

type EntityType = 'ticket' | 'dealership' | 'task';

interface ShopperDetailViewProps {
  shopper: Shopper;
  onUpdate: (shopper: Shopper) => void;
  onDelete: (shopperId: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  allTickets: Ticket[];
  allDealerships: Dealership[];
  allTasks: (Task & { projectName?: string; projectId: string | null; })[];
  onLink: (toType: EntityType, toId: string) => void;
  onUnlink: (toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="mb-6">
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">{value || 'N/A'}</p>
  </div>
);

const ShopperDetailView: React.FC<ShopperDetailViewProps> = ({
  shopper, onUpdate, onDelete, showToast, allTickets, allDealerships, allTasks, onLink, onUnlink, onSwitchView
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  const linkedTickets = allTickets.filter(item => (shopper.ticketIds || []).includes(item.id));
  const linkedDealerships = allDealerships.filter(item => (shopper.dealershipIds || []).includes(item.id));
  const linkedTasks = allTasks.filter(item => (shopper.taskIds || []).includes(item.id));
  
  const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(shopper.ticketIds || []).includes(item.id));
  const availableDealerships = allDealerships.filter(item => !(shopper.dealershipIds || []).includes(item.id));
  const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !(shopper.taskIds || []).includes(item.id));

  const handleCopyInfo = () => {
    let content = `SHOPPER DETAILS\n================================\n`;
    content += `Dealership: ${linkedDealerships.length > 0 ? linkedDealerships.map(d => d.name).join(', ') : 'N/A'}\n`;
    content += `Customer Name: ${shopper.customerName}\n`;
    if (shopper.email) content += `Email: ${shopper.email}\n`;
    if (shopper.phone) content += `Phone: ${shopper.phone}\n`;
    content += `Curator ID: ${shopper.curatorId}\n`;
    if (shopper.curatorLink) content += `Curator Link: ${shopper.curatorLink}\n`;
    if (shopper.cdpId) content += `CDP-ID: ${shopper.cdpId}\n`;
    if (shopper.dmsId) content += `DMS-ID: ${shopper.dmsId}\n`;
    content += `\nUNIQUE ISSUE:\n${shopper.uniqueIssue}\n`;

    if (shopper.recentActivity && shopper.recentActivity.length > 0) {
      content += `\nRECENT ACTIVITY:\n`;
      shopper.recentActivity.forEach(act => {
        content += `- ${act.date} ${act.time}: ${act.activity} -> ${act.action}\n`;
      });
    }
    
    navigator.clipboard.writeText(content);
    showToast('Shopper info copied!', 'success');
  };
  
  return (
    <div>
        {isDeleteModalOpen && (
            <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                <p className="text-gray-700">Are you sure you want to delete this shopper? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onDelete(shopper.id)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Shopper</button>
                </div>
            </Modal>
        )}

        {isEditingModalOpen && (
            <Modal title="Edit Shopper Information" onClose={() => setIsEditingModalOpen(false)}>
                <ShopperForm
                    onSubmit={() => {}}
                    onUpdate={onUpdate}
                    shopperToEdit={shopper}
                    onClose={() => setIsEditingModalOpen(false)}
                    allDealerships={allDealerships}
                />
            </Modal>
        )}
      
        <div className="flex justify-end items-center gap-3 mb-6">
            <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 text-sm"><ContentCopyIcon className="w-4 h-4"/><span>Copy Info</span></button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
            <button onClick={() => setIsEditingModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
        </div>

        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                    <DetailField label="Customer Name" value={shopper.customerName} />
                    <DetailField label="Email" value={shopper.email} />
                    <DetailField label="CDP-ID" value={shopper.cdpId} />
                </div>
                 <div>
                    <DetailField label="Curator ID" value={shopper.curatorId} />
                    <DetailField label="Phone" value={shopper.phone} />
                    <DetailField label="Curator Link" value={shopper.curatorLink ? <a href={shopper.curatorLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{shopper.curatorLink}</a> : 'N/A'} />
                    <DetailField label="DMS-ID" value={shopper.dmsId} />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <DetailField label="Unique Issue" value={shopper.uniqueIssue} />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                {(shopper.recentActivity && shopper.recentActivity.length > 0) ? (
                  <div className="space-y-3">
                    {shopper.recentActivity.map(act => (
                      <div key={act.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-semibold text-gray-800">{act.date} {act.time}</p>
                          <div className="mt-2 text-sm space-y-1">
                              <p><span className="font-medium text-gray-600">Activity:</span> {act.activity}</p>
                              <p><span className="font-medium text-gray-600">Action:</span> {act.action}</p>
                          </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500 italic">No recent activity logged.</p>}
            </div>
            
            <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} onItemClick={(id) => onSwitchView('dealership', id)} />
            <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
            <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} onItemClick={(id) => onSwitchView('task', id)} />
        </div>
    </div>
  );
};

export default ShopperDetailView;
