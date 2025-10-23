import React, { useState, useMemo } from 'react';
import { Shopper, Ticket, Dealership, RecentActivity, Status, Task, TaskStatus, Update, AssociatedCdpId, CustomerType } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import ShopperForm from './ShopperForm.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';

type EntityType = 'ticket' | 'dealership' | 'task';

interface ShopperDetailViewProps {
  shopper: Shopper;
  onUpdate: (shopper: Shopper) => void;
  onDelete: (shopperId: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  isReadOnly?: boolean;
  onAddUpdate: (shopperId: string, comment: string, author: string, date: string) => void;
  onEditUpdate: (updatedUpdate: Update) => void;
  onDeleteUpdate: (updateId: string) => void;
  allTickets: Ticket[];
  allDealerships: Dealership[];
  allTasks: (Task & { projectName?: string; projectId: string | null; })[];
  onLink: (toType: EntityType, toId:string) => void;
  onUnlink: (toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">{value || 'N/A'}</p>
  </div>
);

const ShopperDetailView: React.FC<ShopperDetailViewProps> = ({
  shopper, onUpdate, onDelete, showToast, isReadOnly = false,
  onAddUpdate, onEditUpdate, onDeleteUpdate,
  allTickets, allDealerships, allTasks, onLink, onUnlink, onSwitchView
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
      activity: '',
  });
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editedActivity, setEditedActivity] = useState<RecentActivity | null>(null);

  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState('');

  const [newAssociatedCdpId, setNewAssociatedCdpId] = useState({
    customerType: CustomerType.ReynoldsClient,
    cdpId: ''
  });

  const MAX_COMMENT_LENGTH = 2000;

  const associatedDealership = useMemo(() => {
    if (shopper.dealershipIds && shopper.dealershipIds.length > 0) {
        return allDealerships.find(d => d.id === shopper.dealershipIds[0]);
    }
    return undefined;
  }, [shopper.dealershipIds, allDealerships]);

  const linkedTickets = allTickets.filter(item => (shopper.ticketIds || []).includes(item.id));
  const linkedDealerships = allDealerships.filter(item => (shopper.dealershipIds || []).includes(item.id));
  const linkedTasks = allTasks.filter(item => (shopper.taskIds || []).includes(item.id));
  
  const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(shopper.ticketIds || []).includes(item.id));
  const availableDealerships = allDealerships.filter(item => !(shopper.dealershipIds || []).includes(item.id));
  const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !(shopper.taskIds || []).includes(item.id));

  const handleCopyInfo = () => {
    let content = `SHOPPER DETAILS\n`;
    content += `================================\n`;
    
    const appendField = (label: string, value: any) => {
        if (value) {
            content += `${label}: ${value}\n`;
        }
    };

    if (associatedDealership) {
        appendField('Dealership Name', associatedDealership.name);
        appendField('Enterprise (Group)', associatedDealership.enterprise);
        appendField('PPSysID', associatedDealership.ppSysId);
        appendField('Store Number', associatedDealership.storeNumber);
        appendField('Branch Number', associatedDealership.branchNumber);
        content += '\n';
    }

    appendField('Customer Name', shopper.customerName);
    appendField('Email', shopper.email);
    appendField('Phone', shopper.phone);
    appendField('Curator ID', shopper.curatorId);
    appendField('Curator Link', shopper.curatorLink);
    
    content += '\n'; // Blank line

    // Section 2
    appendField('CDP-ID', shopper.cdpId);
    appendField('DMS-ID', shopper.dmsId);

    if (shopper.associatedCdpIds && shopper.associatedCdpIds.length > 0) {
        content += `\n\n--- ASSOCIATED CDP-IDS (${shopper.associatedCdpIds.length}) ---\n`;
        shopper.associatedCdpIds.forEach(cdp => {
            const customerTypeLabel = cdp.customerType === CustomerType.ReynoldsClient ? 'Reynolds Client' : 'FullPath Known Shopper';
            content += `${customerTypeLabel}: ${cdp.cdpId}\n`;
        });
    }

    content += `\n\nUNIQUE ISSUE:\n${shopper.uniqueIssue}\n`;

    if (shopper.recentActivity && shopper.recentActivity.length > 0) {
        content += `\n\n--- RECENT ACTIVITY (${shopper.recentActivity.length}) ---\n`;
        shopper.recentActivity.forEach((act, index) => {
            const activityDate = new Date(act.date).toLocaleDateString('en-US', { timeZone: 'UTC' });
            content += `[${activityDate}] ${act.time}: ${act.activity}\n`;
            if (index < shopper.recentActivity.length - 1) {
                content += '\n';
            }
        });
    }

    navigator.clipboard.writeText(content.trim());
    showToast('Shopper info copied!', 'success');
  };
  
  const handleNewActivityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewActivity(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddActivity = () => {
    if (!newActivity.activity.trim() || !newActivity.date || !newActivity.time) {
        showToast('Date, time, and activity fields are required.', 'error');
        return;
    }
    const activityToAdd: RecentActivity = { id: crypto.randomUUID(), ...newActivity };
    const updatedShopper: Shopper = {
        ...shopper,
        recentActivity: [activityToAdd, ...(shopper.recentActivity || [])]
    };
    onUpdate(updatedShopper);
    setNewActivity({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        activity: '',
    });
    showToast('Activity logged successfully!', 'success');
  };

  const handleDeleteActivity = (activityId: string) => {
    if(window.confirm('Are you sure you want to delete this activity?')) {
        const updatedActivities = (shopper.recentActivity || []).filter(act => act.id !== activityId);
        onUpdate({ ...shopper, recentActivity: updatedActivities });
        showToast('Activity deleted.', 'success');
    }
  };
  
  const handleStartEdit = (activity: RecentActivity) => {
    setEditingActivityId(activity.id);
    setEditedActivity({ ...activity });
  };
  
  const handleCancelEdit = () => {
    setEditingActivityId(null);
    setEditedActivity(null);
  };
  
  const handleSaveEdit = () => {
    if (!editedActivity) return;
     if (!editedActivity.activity.trim() || !editedActivity.date || !editedActivity.time) {
        showToast('Date, time, and activity fields are required.', 'error');
        return;
    }
    const updatedActivities = (shopper.recentActivity || []).map(act => act.id === editingActivityId ? editedActivity : act);
    onUpdate({ ...shopper, recentActivity: updatedActivities });
    handleCancelEdit();
    showToast('Activity updated!', 'success');
  };
  
  const handleEditedActivityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedActivity) return;
    const { name, value } = e.target;
    setEditedActivity(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim() && updateDate) {
      const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
      onAddUpdate(shopper.id, commentAsHtml, authorName.trim(), updateDate);
      setNewUpdate('');
      setAuthorName('');
    }
  };
  
  const handleNewAssociatedCdpIdChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAssociatedCdpId(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAssociatedCdpId = () => {
    if (!newAssociatedCdpId.cdpId.trim()) {
        showToast('CDP-ID is required.', 'error');
        return;
    }
    const cdpIdToAdd: AssociatedCdpId = {
        id: crypto.randomUUID(),
        customerType: newAssociatedCdpId.customerType,
        cdpId: newAssociatedCdpId.cdpId.trim()
    };
    const updatedShopper: Shopper = {
        ...shopper,
        associatedCdpIds: [...(shopper.associatedCdpIds || []), cdpIdToAdd]
    };
    onUpdate(updatedShopper);
    setNewAssociatedCdpId({
        customerType: CustomerType.ReynoldsClient,
        cdpId: ''
    });
    showToast('Associated CDP-ID added!', 'success');
  };

  const handleDeleteAssociatedCdpId = (id: string) => {
    if(window.confirm('Are you sure you want to delete this associated CDP-ID?')) {
        const updatedCdpIds = (shopper.associatedCdpIds || []).filter(cdp => cdp.id !== id);
        onUpdate({ ...shopper, associatedCdpIds: updatedCdpIds });
        showToast('Associated CDP-ID deleted.', 'success');
    }
  };

  const activityFormClasses = "w-full text-sm p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

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
                    onSave={onUpdate}
                    shopperToEdit={shopper}
                    onClose={() => setIsEditingModalOpen(false)}
                    allDealerships={allDealerships}
                />
            </Modal>
        )}
      
        <div className="flex justify-end items-center gap-3 mb-6">
            <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 text-sm"><ContentCopyIcon className="w-4 h-4"/><span>Copy Info</span></button>
            {!isReadOnly && (
                <>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                    <button onClick={() => setIsEditingModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
                </>
            )}
        </div>

        <div className="space-y-8">
            {/* Shopper Information */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Shopper Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <DetailField label="Customer Name" value={shopper.customerName} />
                    <DetailField label="Email" value={shopper.email} />
                    <DetailField label="Phone" value={shopper.phone} />
                </div>
            </div>

            {associatedDealership && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Associated Dealership</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DetailField label="Name" value={<a href="#" onClick={(e) => { e.preventDefault(); onSwitchView('dealership', associatedDealership.id); }} className="text-blue-600 hover:underline">{associatedDealership.name}</a>} />
                        <DetailField label="Enterprise (Group)" value={associatedDealership.enterprise} />
                        <DetailField label="PPSysID" value={associatedDealership.ppSysId} />
                        <DetailField label="Store Number" value={associatedDealership.storeNumber} />
                        <DetailField label="Branch Number" value={associatedDealership.branchNumber} />
                    </div>
                </div>
            )}
            
            {/* Identifications */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Identifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailField label="Curator ID" value={shopper.curatorId} />
                    <DetailField label="Curator Link" value={shopper.curatorLink ? <a href={shopper.curatorLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{shopper.curatorLink}</a> : 'N/A'} />
                    <DetailField label="CDP-ID" value={shopper.cdpId} />
                    <DetailField label="DMS-ID" value={shopper.dmsId} />
                </div>
            </div>

            {/* Associated CDP-ID's Found */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Associated CDP-ID's Found</h3>
                {!isReadOnly && (
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-3 items-end">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Customer Type</label>
                            <select
                                name="customerType"
                                value={newAssociatedCdpId.customerType}
                                onChange={handleNewAssociatedCdpIdChange}
                                className="w-full text-sm p-2 mt-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={CustomerType.ReynoldsClient}>Reynolds Client</option>
                                <option value={CustomerType.FullPathKnownShopper}>FullPath Known Shopper</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">CDP-ID</label>
                            <input
                                type="text"
                                name="cdpId"
                                value={newAssociatedCdpId.cdpId}
                                onChange={handleNewAssociatedCdpIdChange}
                                placeholder="CDP-ID"
                                required
                                className="w-full text-sm p-2 mt-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddAssociatedCdpId}
                            aria-label="Add Associated CDP-ID"
                            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 ring-blue-500 flex justify-center items-center h-[42px] w-[42px]"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                )}

                <div className="space-y-3">
                    {(shopper.associatedCdpIds && shopper.associatedCdpIds.length > 0) ? (
                        shopper.associatedCdpIds.map(cdp => (
                            <div key={cdp.id} className="p-4 bg-white rounded-lg border border-gray-200 group flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{cdp.cdpId}</p>
                                    <p className="text-xs text-gray-500 mt-1">{cdp.customerType === CustomerType.ReynoldsClient ? 'Reynolds Client' : 'FullPath Known Shopper'}</p>
                                </div>
                                {!isReadOnly && (
                                    <button onClick={() => handleDeleteAssociatedCdpId(cdp.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete associated CDP-ID">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                )}
                            </div>
                        ))
                    ) : <p className="text-sm text-gray-500 italic text-center py-4">No associated CDP-IDs found.</p>}
                </div>
            </div>

            {/* Unique Issue */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Unique Issue</h3>
                <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{shopper.uniqueIssue || 'N/A'}</p>
            </div>
            
            {/* Recent Activity */}
            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                {!isReadOnly && (
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="date"
                                name="date"
                                value={newActivity.date}
                                onChange={handleNewActivityChange}
                                className={activityFormClasses}
                                aria-label="Activity date"
                                required
                            />
                            <input
                                type="time"
                                name="time"
                                value={newActivity.time}
                                onChange={handleNewActivityChange}
                                className={activityFormClasses}
                                aria-label="Activity time"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3 items-center">
                           <input
                                type="text"
                                name="activity"
                                value={newActivity.activity}
                                onChange={handleNewActivityChange}
                                placeholder="Activity Type (e.g., Visited VDP)"
                                required
                                className={activityFormClasses}
                            />
                            <button
                                type="button"
                                onClick={handleAddActivity}
                                aria-label="Add Activity"
                                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 ring-blue-500 flex justify-center items-center h-full"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                )}

                <div className="space-y-3">
                    {(shopper.recentActivity && shopper.recentActivity.length > 0) ? (
                        shopper.recentActivity.map(act => (
                          <div key={act.id}>
                            {editingActivityId === act.id && !isReadOnly ? (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input type="date" name="date" value={editedActivity?.date || ''} onChange={handleEditedActivityChange} className={activityFormClasses} required/>
                                        <input type="time" name="time" value={editedActivity?.time || ''} onChange={handleEditedActivityChange} className={activityFormClasses} required/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                                        <input type="text" name="activity" placeholder="Activity Type" value={editedActivity?.activity || ''} onChange={handleEditedActivityChange} className={activityFormClasses} required/>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleCancelEdit} className="text-sm font-semibold text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200">Cancel</button>
                                        <button onClick={handleSaveEdit} className="text-sm font-semibold text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-white rounded-lg border border-gray-200 group">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                            <span className="font-medium text-gray-600">{new Date(act.date).toLocaleDateString(undefined, { timeZone: 'UTC' })} @ {act.time}</span>
                                            <span className="mx-2 text-gray-300">|</span>
                                            <span>{act.activity}</span>
                                        </p>
                                        {!isReadOnly && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleStartEdit(act)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full" aria-label="Edit activity"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteActivity(act.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full" aria-label="Delete activity"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            )}
                          </div>
                        ))
                    ) : <p className="text-sm text-gray-500 italic text-center py-4">No recent activity logged.</p>}
                </div>
            </div>
            
            {!isReadOnly && (
             <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({shopper.updates?.length || 0})</h3>
                <form onSubmit={handleUpdateSubmit} className="p-4 border border-gray-200 rounded-md mb-6 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                    <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                    <textarea 
                        value={newUpdate} 
                        onChange={e => setNewUpdate(e.target.value)}
                        placeholder="Type your comment here..."
                        required
                        rows={4}
                        className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={MAX_COMMENT_LENGTH}
                    />
                    <div className="flex justify-between items-center">
                        <p id="char-count" className="text-xs text-gray-500">{newUpdate.length} / {MAX_COMMENT_LENGTH}</p>
                        <button 
                            type="submit" 
                            disabled={!newUpdate.trim() || !authorName.trim() || newUpdate.length > MAX_COMMENT_LENGTH} 
                            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm">
                            Add Update
                        </button>
                    </div>
                </form>
                <div className="space-y-4">
                    {[...(shopper.updates || [])].reverse().map((update) => (
                        <div key={update.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                            {editingUpdateId === update.id && !isReadOnly ? (
                                <div>
                                    <textarea
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                    rows={4}
                                    className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setEditingUpdateId(null)} className="bg-white text-gray-700 font-semibold px-3 py-1 rounded-md border border-gray-300 text-sm">Cancel</button>
                                        <button
                                            onClick={() => {
                                                const commentAsHtml = editedComment.replace(/\n/g, '<br />');
                                                onEditUpdate({ ...update, comment: commentAsHtml });
                                                setEditingUpdateId(null);
                                            }}
                                            className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="group">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs text-gray-500 font-medium">
                                            <span className="font-semibold text-gray-700">{update.author}</span>
                                            <span className="mx-1.5">•</span>
                                            <span>{new Date(update.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                                        </p>
                                        {!isReadOnly && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingUpdateId(update.id);
                                                    const commentForEditing = update.comment.replace(/<br\s*\/?>/gi, '\n');
                                                    setEditedComment(commentForEditing);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                                aria-label="Edit update"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this update?')) {
                                                    onDeleteUpdate(update.id);
                                                    }
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                aria-label="Delete update"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-800 rich-text-content" dangerouslySetInnerHTML={{ __html: update.comment }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            )}
            
            {!isReadOnly && (
                <>
                <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
                <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} onItemClick={(id) => onSwitchView('task', id)} />
                <div className="border-t border-gray-200 pt-6">
                    <LinkingSection title="Associated Dealership" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} onItemClick={(id) => onSwitchView('dealership', id)} />
                </div>
                </>
            )}
        </div>
    </div>
  );
};

export default ShopperDetailView;
