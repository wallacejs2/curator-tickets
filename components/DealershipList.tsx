
import React, { useState, useMemo } from 'react';
import { Dealership, DealershipStatus, DealershipGroup } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { AccountBalanceIcon } from './icons/AccountBalanceIcon.tsx';
import { DEALERSHIP_STATUS_OPTIONS } from '../constants.ts';

interface DealershipListProps {
  dealerships: Dealership[];
  dealershipGroups: DealershipGroup[];
  onDealershipClick: (dealership: Dealership) => void;
  onStatusChange: (dealershipId: string, newStatus: DealershipStatus) => void;
  onUpdateGroup: (group: DealershipGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  onNewGroupClick: () => void;
  onEditGroupClick: (group: DealershipGroup) => void;
}

const statusColors: Record<DealershipStatus, string> = {
  [DealershipStatus.PendingFocus]: 'bg-sky-200 text-sky-800',
  [DealershipStatus.PendingDmt]: 'bg-purple-200 text-purple-800',
  [DealershipStatus.PendingSetup]: 'bg-yellow-200 text-yellow-800',
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Pilot]: 'bg-pink-200 text-pink-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const DealershipCard: React.FC<{
    dealership: Dealership;
    allGroups: DealershipGroup[];
    onClick: () => void;
    onStatusChange: (dealershipId: string, newStatus: DealershipStatus) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ dealership, allGroups, onClick, onStatusChange, showToast }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const dealershipMemberOfGroups = useMemo(() => allGroups.filter(g => (dealership.groupIds || []).includes(g.id)), [allGroups, dealership.groupIds]);
    const linkedDealershipsCount = (dealership.linkedDealershipIds || []).filter(id => id !== dealership.id).length;

    const handleCopyInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        let content = `DEALERSHIP DETAILS: ${dealership.name}\n`;
        content += `==================================================\n\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };
        const appendSection = (title: string) => {
            content += `\n--- ${title.toUpperCase()} ---\n`;
        };

        appendSection('Account Information');
        appendField('ID', dealership.id);
        appendField('Account Number (CIF)', dealership.accountNumber);
        appendField('Status', dealership.status);
        appendField('Enterprise (Group)', dealership.enterprise);
        appendField('Address', dealership.address);
    
        appendSection('Key Contacts');
        appendField('Assigned Specialist', dealership.assignedSpecialist);
        appendField('Sales', dealership.sales);
        appendField('POC Name', dealership.pocName);
        appendField('POC Email', dealership.pocEmail);
        appendField('POC Phone', dealership.pocPhone);
        appendField('Website Links', (dealership.websiteLinks || []).join(', '));
    
        appendSection('Order & Dates');
        appendField('Order Number', dealership.orderNumber);
        appendDateField('Order Received Date', dealership.orderReceivedDate);
        appendDateField('Go-Live Date', dealership.goLiveDate);
        appendDateField('Term Date', dealership.termDate);
        
        appendSection('Identifiers');
        appendField('Store Number', dealership.storeNumber);
        appendField('Branch Number', dealership.branchNumber);
        appendField('ERA System ID', dealership.eraSystemId);
        appendField('PPSysID', dealership.ppSysId);
        appendField('BU-ID', dealership.buId);
    
        if (dealership.updates && dealership.updates.length > 0) {
            appendSection(`Updates (${dealership.updates.length})`);
            [...dealership.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n');
                content += `[${new Date(update.date).toLocaleString(undefined, { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
            });
        }
        
        appendSection('Linked Item IDs');
        appendField('Ticket IDs', (dealership.ticketIds || []).join(', '));
        appendField('Project IDs', (dealership.projectIds || []).join(', '));
        appendField('Meeting IDs', (dealership.meetingIds || []).join(', '));
        appendField('Task IDs', (dealership.taskIds || []).join(', '));
        appendField('Linked Dealership IDs', (dealership.linkedDealershipIds || []).join(', '));
        appendField('Feature IDs', (dealership.featureIds || []).join(', '));
    
        navigator.clipboard.writeText(content);
        showToast('Dealership info copied!', 'success');
    };

    const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
      <div>
        <span className="text-gray-500">{label}: </span>
        <span className="font-medium text-gray-800">{value || 'N/A'}</span>
      </div>
    );
  
    const ExpandedContent = () => (
      <div className="px-5 py-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <DetailItem label="Order #" value={dealership.orderNumber} />
              <DetailItem label="Go-Live" value={dealership.goLiveDate ? new Date(dealership.goLiveDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'TBD'} />
              <DetailItem label="Store/Branch" value={`${dealership.storeNumber || 'N/A'} / ${dealership.branchNumber || 'N/A'}`} />
              <DetailItem label="ERA ID" value={dealership.eraSystemId} />
              <DetailItem label="PPSysID" value={dealership.ppSysId} />
              <DetailItem label="BU-ID" value={dealership.buId} />
          </div>
      </div>
    );
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-all duration-200 flex flex-col">
          <div className="p-5">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 cursor-pointer" onClick={onClick}>
                <h3 className="text-xl font-semibold text-gray-900">{dealership.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyInfo} className="p-2 text-gray-500 hover:text-blue-600 rounded-full flex-shrink-0" title="Copy Info">
                    <ContentCopyIcon className="w-5 h-5" />
                </button>
                <select
                    value={dealership.status}
                    onChange={(e) => {
                        e.stopPropagation();
                        onStatusChange(dealership.id, e.target.value as DealershipStatus);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap border-2 border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none ${statusColors[dealership.status] || 'bg-gray-200 text-gray-800'}`}
                    aria-label={`Change status for dealership ${dealership.name}`}
                >
                    {DEALERSHIP_STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
              </div>
            </div>
             <div className="cursor-pointer" onClick={onClick}>
                {dealershipMemberOfGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {dealershipMemberOfGroups.map(g => <span key={g.id} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">{g.name}</span>)}
                    </div>
                )}
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                    <p>CIF: <span className="font-medium text-gray-800">{dealership.accountNumber}</span></p>
                    <p>Specialist: <span className="font-medium text-gray-800">{dealership.assignedSpecialist || 'N/A'}</span></p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                    {linkedDealershipsCount > 0 && <span title={`${linkedDealershipsCount} linked dealership(s)`} className="flex items-center gap-1 text-gray-600"><AccountBalanceIcon className="w-4 h-4" /><span className="text-xs font-medium">{linkedDealershipsCount}</span></span>}
                    {(dealership.ticketIds?.length || 0) > 0 && <span title={`${dealership.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1 text-yellow-600"><ReceiptLongIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.ticketIds?.length}</span></span>}
                    {(dealership.projectIds?.length || 0) > 0 && <span title={`${dealership.projectIds?.length} linked project(s)`} className="flex items-center gap-1 text-red-600"><WorkspaceIcon className="w-4 h-4" /><span className="text-xs font-medium">{dealership.projectIds?.length}</span></span>}
                </div>
             </div>
          </div>

          <div className="border-t border-gray-200">
              <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex justify-between items-center p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none rounded-b-lg"
              >
                  <span>View Details</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              {isExpanded && <ExpandedContent />}
          </div>
        </div>
    );
};

const ContactGroupCard: React.FC<{
    group: DealershipGroup;
    allDealerships: Dealership[];
    onGroupEdit: () => void;
    onGroupDelete: () => void;
    onDealershipClick: (dealership: Dealership) => void;
    onStatusChange: (dealershipId: string, newStatus: DealershipStatus) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
    onManageMembers: () => void;
    allGroups: DealershipGroup[];
}> = ({ group, allDealerships, onGroupEdit, onGroupDelete, onDealershipClick, onStatusChange, showToast, onManageMembers, allGroups }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const memberDealerships = useMemo(() => allDealerships.filter(d => group.dealershipIds.includes(d.id)), [allDealerships, group.dealershipIds]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 flex justify-between items-center">
                <div onClick={() => setIsExpanded(!isExpanded)} className="flex-grow cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-800">{group.name} ({memberDealerships.length})</h3>
                    <p className="text-sm text-gray-500">{group.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onManageMembers(); }} className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-100">Manage Members</button>
                    <button onClick={(e) => { e.stopPropagation(); onGroupEdit(); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onGroupDelete(); }} className="p-2 text-gray-400 hover:text-red-600 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400"><ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 space-y-3">
                    {memberDealerships.length > 0 ? memberDealerships.map(dealership => (
                        <DealershipCard 
                            key={dealership.id} 
                            dealership={dealership}
                            allGroups={allGroups}
                            onClick={() => onDealershipClick(dealership)}
                            onStatusChange={onStatusChange}
                            showToast={showToast}
                        />
                    )) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">No dealerships in this group.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const ManageGroupMembersModal: React.FC<{
    group: DealershipGroup;
    allDealerships: Dealership[];
    onSave: (updatedDealershipIds: string[]) => void;
    onClose: () => void;
}> = ({ group, allDealerships, onSave, onClose }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(group.dealershipIds);

    const handleToggleId = (dealershipId: string) => {
        setSelectedIds(prev =>
            prev.includes(dealershipId) ? prev.filter(id => id !== dealershipId) : [...prev, dealershipId]
        );
    };
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Select the dealerships that should be members of this group.</p>
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-white">
          {allDealerships.map(d => (
            <label key={d.id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedIds.includes(d.id) ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                <input type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => handleToggleId(d.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <div className="flex-grow">
                    <p className="font-medium text-gray-800 text-sm">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.accountNumber}</p>
                </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => { onSave(selectedIds); onClose(); }} className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Members</button>
        </div>
      </div>
    );
};

type DealershipView = 'active' | 'cancelled';
type DisplayMode = 'all' | 'groups';

const DealershipList: React.FC<DealershipListProps> = ({ dealerships, dealershipGroups, onDealershipClick, onStatusChange, onUpdateGroup, onDeleteGroup, showToast, onNewGroupClick, onEditGroupClick }) => {
  const [dealershipView, setDealershipView] = useState<DealershipView>('active');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all');
  const [managingGroup, setManagingGroup] = useState<DealershipGroup | null>(null);

  const { activeDealerships, cancelledDealerships } = useMemo(() => {
    return dealerships.reduce<{ activeDealerships: Dealership[]; cancelledDealerships: Dealership[] }>(
      (acc, dealership) => {
        if (dealership.status === DealershipStatus.Cancelled) {
          acc.cancelledDealerships.push(dealership);
        } else {
          acc.activeDealerships.push(dealership);
        }
        return acc;
      },
      { activeDealerships: [], cancelledDealerships: [] }
    );
  }, [dealerships]);

  const dealershipsToShow = dealershipView === 'active' ? activeDealerships : cancelledDealerships;

  const handleUpdateGroupMembers = (updatedDealershipIds: string[]) => {
      if (!managingGroup) return;
      onUpdateGroup({ ...managingGroup, dealershipIds: updatedDealershipIds });
      setManagingGroup(null);
  };

  return (
    <div>
        {managingGroup && (
            <Modal title={`Manage Members for "${managingGroup.name}"`} onClose={() => setManagingGroup(null)}>
                <ManageGroupMembersModal group={managingGroup} allDealerships={dealerships} onSave={handleUpdateGroupMembers} onClose={() => setManagingGroup(null)}/>
            </Modal>
        )}

      <div className="mb-4 flex border-b border-gray-200 justify-between items-end">
        <div>
            <div className="flex">
                <button onClick={() => setDealershipView('active')} className={`px-4 py-2 text-sm font-medium transition-colors ${dealershipView === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Active ({activeDealerships.length})</button>
                <button onClick={() => setDealershipView('cancelled')} className={`px-4 py-2 text-sm font-medium transition-colors ${dealershipView === 'cancelled' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Cancelled ({cancelledDealerships.length})</button>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <div className="bg-gray-200 p-0.5 rounded-md flex">
                <button onClick={() => setDisplayMode('all')} className={`px-3 py-1 text-sm rounded ${displayMode === 'all' ? 'bg-white shadow' : 'text-gray-600'}`}>All Accounts</button>
                <button onClick={() => setDisplayMode('groups')} className={`px-3 py-1 text-sm rounded ${displayMode === 'groups' ? 'bg-white shadow' : 'text-gray-600'}`}>Groups</button>
            </div>
            <button onClick={onNewGroupClick} className="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"><PlusIcon className="w-4 h-4" /> New Group</button>
        </div>
      </div>
      
      {dealershipsToShow.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">No {dealershipView} accounts found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new account.</p>
        </div>
      ) : displayMode === 'all' ? (
        <div className="space-y-4">
          {dealershipsToShow.map(dealership => (
            <DealershipCard key={dealership.id} dealership={dealership} allGroups={dealershipGroups} onClick={() => onDealershipClick(dealership)} onStatusChange={onStatusChange} showToast={showToast} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
            {dealershipGroups.map(group => (
                <ContactGroupCard 
                    key={group.id}
                    group={group}
                    allDealerships={dealershipsToShow}
                    allGroups={dealershipGroups}
                    onGroupEdit={() => onEditGroupClick(group)}
                    onGroupDelete={() => onDeleteGroup(group.id)}
                    onDealershipClick={onDealershipClick}
                    onStatusChange={onStatusChange}
                    showToast={showToast}
                    onManageMembers={() => setManagingGroup(group)}
                />
            ))}
        </div>
      )}
    </div>
  );
};

export default DealershipList;
