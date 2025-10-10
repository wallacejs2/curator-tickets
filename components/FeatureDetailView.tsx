import React, { useState } from 'react';
import { FeatureAnnouncement, FeatureStatus, Platform, Ticket, Project, Task, Meeting, Dealership, Status, ProjectStatus, TaskStatus, Update } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import FeatureForm from './FeatureForm.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface FeatureDetailViewProps {
  feature: FeatureAnnouncement;
  onUpdate: (feature: FeatureAnnouncement) => void;
  onDelete: (featureId: string) => void;
  onAddUpdate: (featureId: string, comment: string, author: string, date: string) => void;
  onEditUpdate: (updatedUpdate: Update) => void;
  onDeleteUpdate: (updateId: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  isReadOnly?: boolean;
  
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

const statusColors: Record<FeatureStatus, string> = {
    [FeatureStatus.Backlog]: 'bg-gray-200 text-gray-800',
    [FeatureStatus.InDiscovery]: 'bg-purple-200 text-purple-800',
    [FeatureStatus.InDevelopment]: 'bg-blue-200 text-blue-800',
    [FeatureStatus.Testing]: 'bg-orange-200 text-orange-800',
    [FeatureStatus.Upcoming]: 'bg-yellow-200 text-yellow-800',
    [FeatureStatus.Launched]: 'bg-green-200 text-green-800',
};

const DetailTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
      <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[value] || 'bg-gray-200 text-gray-800'}`}>
        {value}
      </span>
    </div>
  );

const FeatureDetailView: React.FC<FeatureDetailViewProps> = ({ 
    feature, onUpdate, onDelete, isReadOnly = false,
    onAddUpdate, onEditUpdate, onDeleteUpdate, showToast,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink, onSwitchView
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');

    // Linked items
    const linkedTickets = allTickets.filter(item => (feature.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => (feature.projectIds || []).includes(item.id));
    const linkedTasks = allTasks.filter(item => (feature.taskIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => (feature.meetingIds || []).includes(item.id));
    const linkedDealerships = allDealerships.filter(item => (feature.dealershipIds || []).includes(item.id));
    const linkedFeatures = allFeatures.filter(item => item.id !== feature.id && (feature.linkedFeatureIds || []).includes(item.id));
    
    // Available items for linking (filter out completed items)
    const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(feature.ticketIds || []).includes(item.id));
    const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(feature.projectIds || []).includes(item.id));
    const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !(feature.taskIds || []).includes(item.id));
    const availableMeetings = allMeetings.filter(item => !(feature.meetingIds || []).includes(item.id));
    const availableDealerships = allDealerships.filter(item => !(feature.dealershipIds || []).includes(item.id));
    const availableFeatures = allFeatures.filter(item => item.id !== feature.id && !(feature.linkedFeatureIds || []).includes(item.id));
    
    const handleCopyInfo = () => {
        let content = `NEW FEATURE DETAILS: ${feature.title}\n`;
        content += `==================================================\n`;

        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' })}\n`;
            }
        };

        const date = new Date(feature.launchDate);
        const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
        
        appendField('Status', `${feature.status}${quarter ? ` - Q${quarter}` : ''}`);
        appendField('Platform', feature.platform);
        appendField('Location', feature.location);
        appendDateField('Launch Date', feature.launchDate);
        appendField('Categories', (feature.categories || []).join(', '));
        
        content += `\n--- DETAILS ---\n`;
        appendField('Description', feature.description);
        appendField('Support Material', feature.supportUrl);

        if (linkedTickets && linkedTickets.length > 0) {
            content += `\n--- LINKED TICKETS ---\n`;
            linkedTickets.forEach(ticket => {
                content += `TICKET: ${ticket.title}\n`;
                content += `Type: ${ticket.type}\n`;
                if(ticket.fpTicketNumber) content += `FP Ticket Number: ${ticket.fpTicketNumber}\n`;
                content += `\n`;
            });
            content = content.trimEnd() + '\n';
        }

        if (feature.updates && feature.updates.length > 0) {
            content += `\n--- UPDATES (${feature.updates.length}) ---\n`;
            [...feature.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n').trim();
                content += `[${new Date(update.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}] ${update.author}: ${updateComment}\n`;
            });
        }

        navigator.clipboard.writeText(content.trim());
        showToast('Feature info copied!', 'success');
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUpdate.trim() && authorName.trim() && updateDate) {
          const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
          onAddUpdate(feature.id, commentAsHtml, authorName.trim(), updateDate);
          setNewUpdate('');
          setAuthorName('');
        }
    };
    
    return (
        <div>
            {isDeleteModalOpen && (
                <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                    <p className="text-gray-700">Are you sure you want to delete this feature announcement? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { onDelete(feature.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Feature</button>
                    </div>
                </Modal>
            )}

            {isEditingModalOpen && (
                <Modal title={`Edit ${feature.title}`} onClose={() => setIsEditingModalOpen(false)}>
                    <FeatureForm 
                        onSubmit={() => {}}
                        onUpdate={onUpdate}
                        featureToEdit={feature}
                        onClose={() => setIsEditingModalOpen(false)}
                    />
                </Modal>
            )}

            {!isReadOnly && (
              <div className="flex justify-end items-center gap-3 mb-6">
                  <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 text-sm"><ContentCopyIcon className="w-4 h-4"/><span>Copy Info</span></button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                  <button onClick={() => setIsEditingModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
              </div>
            )}

            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="col-span-2"><DetailField label="Feature Title" value={feature.title} /></div>
                    <DetailTag label="Status" value={feature.status} />
                    <DetailField label="Platform" value={feature.platform} />
                    <DetailField label="Location" value={feature.location} />
                    <DetailField label="Version" value={feature.version} />
                    <DetailField label="Launch Date" value={new Date(feature.launchDate).toLocaleDateString(undefined, { timeZone: 'UTC' })} />
                     <div className="sm:col-span-2">
                        <DetailField label="Support Material" value={
                            feature.supportUrl && (
                                <a
                                    href={feature.supportUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-blue-600 hover:underline"
                                >
                                    View Support Material
                                </a>
                            )
                        } />
                    </div>
                </div>
                 <div className="border-t border-gray-200 pt-6">
                    <DetailField label="Description" value={feature.description} />
                </div>
                <div className="border-t border-gray-200 pt-6">
                     <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                        {(feature.categories || []).length > 0 ? feature.categories!.map(cat => (
                            <span key={cat} className="px-2.5 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-full">{cat}</span>
                        )) : <p className="text-sm text-gray-500 italic">No categories assigned.</p>}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailField label="Target Audience" value={feature.targetAudience} />
                    <DetailField label="Success Metrics" value={feature.successMetrics} />
                </div>
                
                <div className="pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({feature.updates?.length || 0})</h3>
                    {!isReadOnly && (
                      <form onSubmit={handleUpdateSubmit} className="p-3 border border-gray-200 rounded-md mb-4 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                              <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                              <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                          </div>
                          <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Add a new update..." required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50" rows={3}/>
                          <button type="submit" disabled={!newUpdate.trim() || !authorName.trim()} className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">Add Update</button>
                      </form>
                    )}
                    <div className="space-y-4">
                        {[...(feature.updates || [])].reverse().map((update) => (
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

                {!isReadOnly && (
                  <>
                    <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
                    <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink('project', id)} onUnlink={(id) => onUnlink('project', id)} onItemClick={(id) => onSwitchView('project', id)} />
                    <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} onItemClick={(id) => onSwitchView('task', id)} />
                    <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', id)} onUnlink={(id) => onUnlink('meeting', id)} onItemClick={(id) => onSwitchView('meeting', id)} />
                    <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} onItemClick={(id) => onSwitchView('dealership', id)} />
                    <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink('feature', id)} onUnlink={(id) => onUnlink('feature', id)} onItemClick={(id) => onSwitchView('feature', id)} />
                  </>
                )}
            </div>
        </div>
    )
}

export default FeatureDetailView;