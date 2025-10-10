import React, { useState, useRef, useEffect } from 'react';
import { Meeting, Project, Ticket, Task, Dealership, FeatureAnnouncement, Status, ProjectStatus, TaskStatus, Update } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import RichTextEditor from './common/RichTextEditor.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface MeetingDetailViewProps {
    meeting: Meeting;
    onUpdate: (meeting: Meeting) => void;
    onDelete: (meetingId: string) => void;
    onAddUpdate: (meetingId: string, comment: string, author: string, date: string) => void;
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

const MeetingDetailView: React.FC<MeetingDetailViewProps> = ({ 
    meeting, 
    onUpdate, 
    onDelete,
    onAddUpdate,
    onEditUpdate,
    onDeleteUpdate,
    showToast,
    isReadOnly = false,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink, onSwitchView
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableMeeting, setEditableMeeting] = useState(meeting);
    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    
    const MAX_COMMENT_LENGTH = 2000;

    useEffect(() => {
        setEditableMeeting(meeting);
    }, [meeting, isEditing]);

    // Linked items
    const linkedTickets = allTickets.filter(item => (meeting.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => (meeting.projectIds || []).includes(item.id));
    const linkedTasks = allTasks.filter(item => (meeting.taskIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => item.id !== meeting.id && (meeting.linkedMeetingIds || []).includes(item.id));
    const linkedDealerships = allDealerships.filter(item => (meeting.dealershipIds || []).includes(item.id));
    const linkedFeatures = allFeatures.filter(item => (meeting.featureIds || []).includes(item.id));
    
    // Available items for linking (filter out completed items)
    const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(meeting.ticketIds || []).includes(item.id));
    const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(meeting.projectIds || []).includes(item.id));
    const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !(meeting.taskIds || []).includes(item.id));
    const availableMeetings = allMeetings.filter(item => item.id !== meeting.id && !(meeting.linkedMeetingIds || []).includes(item.id));
    const availableDealerships = allDealerships.filter(item => !(meeting.dealershipIds || []).includes(item.id));
    const availableFeatures = allFeatures.filter(item => !(meeting.featureIds || []).includes(item.id));

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableMeeting({ ...editableMeeting, [e.target.name]: e.target.value });
    };

    const handleAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableMeeting({ ...editableMeeting, attendees: e.target.value.split(',').map(a => a.trim()).filter(Boolean) });
    };

    const handleSave = () => {
        onUpdate(editableMeeting);
        setIsEditing(false);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUpdate.trim() && authorName.trim() && updateDate) {
          const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
          onAddUpdate(meeting.id, commentAsHtml, authorName.trim(), updateDate);
          setNewUpdate('');
          setAuthorName('');
        }
    };

    const handleCopyInfo = () => {
        let content = `MEETING DETAILS: ${meeting.name}\n`;
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
        
        appendField('ID', meeting.id);
        appendDateField('Date', meeting.meetingDate);
        appendField('Attendees', meeting.attendees.join(', '));

        appendSection('Notes');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = meeting.notes;
        const notesText = tempDiv.textContent || tempDiv.innerText || "";
        content += `${notesText}\n`;
        
        appendSection('Linked Item IDs');
        appendField('Project IDs', (meeting.projectIds || []).join(', '));
        appendField('Ticket IDs', (meeting.ticketIds || []).join(', '));
        appendField('Linked Meeting IDs', (meeting.linkedMeetingIds || []).join(', '));
        appendField('Task IDs', (meeting.taskIds || []).join(', '));
        appendField('Dealership IDs', (meeting.dealershipIds || []).join(', '));
        appendField('Feature IDs', (meeting.featureIds || []).join(', '));

        navigator.clipboard.writeText(content.trim());
        showToast('Meeting info copied!', 'success');
    };

    const labelClasses = "block text-sm font-medium text-gray-700";
    const formElementClasses = "mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";


    if (isEditing) {
        return (
            <div className="space-y-6">
                 <div className="flex justify-end items-center gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 text-sm">Save Changes</button>
                </div>
                <div>
                    <label className={labelClasses}>Meeting Name</label>
                    <input type="text" name="name" value={editableMeeting.name} onChange={handleFormChange} className={formElementClasses} />
                </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Date of Meeting</label>
                        <input type="date" name="meetingDate" value={new Date(editableMeeting.meetingDate).toISOString().split('T')[0]} onChange={handleFormChange} className={formElementClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>Attendees (comma-separated)</label>
                        <input type="text" value={editableMeeting.attendees.join(', ')} onChange={handleAttendeesChange} className={formElementClasses} />
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Meeting Notes</label>
                     <RichTextEditor
                        value={editableMeeting.notes}
                        onChange={(newNotes) => setEditableMeeting(prev => ({ ...prev, notes: newNotes }))}
                    />
                </div>
            </div>
        );
    }
    
    return (
        <div>
            {isDeleteModalOpen && (
                <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                    <p className="text-gray-700">Are you sure you want to delete this meeting note? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { onDelete(meeting.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Note</button>
                    </div>
                </Modal>
            )}

            {!isReadOnly && (
              <div className="flex justify-end items-center gap-3 mb-6">
                  <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 text-sm">
                      <ContentCopyIcon className="w-4 h-4"/>
                      <span>Copy Info</span>
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                  <button onClick={() => { setEditableMeeting(meeting); setIsEditing(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
              </div>
            )}

            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailField label="Meeting Date" value={new Date(meeting.meetingDate).toLocaleDateString(undefined, { timeZone: 'UTC' })} />
                    <DetailField label="Attendees" value={meeting.attendees.join(', ')} />
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Notes</h3>
                    <div className="max-w-none p-4 bg-gray-50 border border-gray-200 rounded-md rich-text-content text-gray-900" dangerouslySetInnerHTML={{ __html: meeting.notes }} />
                </div>
                
                {!isReadOnly && (
                  <>
                     <div className="pt-6 mt-6 border-t border-gray-200">
                        <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({meeting.updates?.length || 0})</h3>
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
                            {[...(meeting.updates || [])].reverse().map((update) => (
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
    );
};

export default MeetingDetailView;