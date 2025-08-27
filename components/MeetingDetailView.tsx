import React, { useState, useRef, useEffect } from 'react';
import { Meeting, Project, Ticket, Task, Dealership, FeatureAnnouncement, Status, ProjectStatus, TaskStatus } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface MeetingDetailViewProps {
    meeting: Meeting;
    onUpdate: (meeting: Meeting) => void;
    onDelete: (meetingId: string) => void;
    
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
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableMeeting, setEditableMeeting] = useState(meeting);
    const notesEditorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEditableMeeting(meeting);
        if (isEditing && notesEditorRef.current) {
            notesEditorRef.current.innerHTML = meeting.notes;
        }
    }, [meeting, isEditing]);

    // Linked items
    const linkedTickets = allTickets.filter(item => (meeting.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => (meeting.projectIds || []).includes(item.id));
    const linkedTasks = allTasks.filter(item => (meeting.taskIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => (meeting.linkedMeetingIds || []).includes(item.id));
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
    
    const handleNotesInput = () => {
        if (notesEditorRef.current) {
            setEditableMeeting(prev => ({ ...prev, notes: notesEditorRef.current!.innerHTML }));
        }
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false, undefined);
        notesEditorRef.current?.focus();
        handleNotesInput();
    };

    const handleSave = () => {
        onUpdate(editableMeeting);
        setIsEditing(false);
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
                    <div className="mt-1 relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                        <div className="p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md">
                            <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-sm w-8 h-8 flex items-center justify-center">B</button>
                            <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 italic text-sm w-8 h-8 flex items-center justify-center">I</button>
                            <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                            </button>
                            <button type="button" onClick={() => handleFormat('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Numbered List">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/>
                                    <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/>
                                    <path d="M3.652 7.332v-.474H4c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/>
                                    <path d="M2.24 3.862v.428h.832v-.428h.633V5.1h-.633v.569h-.832v-.569H1.41V3.862z"/>
                                </svg>
                            </button>
                        </div>
                         <div
                            ref={notesEditorRef}
                            contentEditable
                            onInput={handleNotesInput}
                            className="w-full text-sm p-2 min-h-[200px] focus:outline-none rich-text-content text-gray-900"
                        />
                    </div>
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

            <div className="flex justify-end items-center gap-3 mb-6">
                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                <button onClick={() => { setEditableMeeting(meeting); setIsEditing(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailField label="Meeting Date" value={new Date(meeting.meetingDate).toLocaleDateString()} />
                    <DetailField label="Attendees" value={meeting.attendees.join(', ')} />
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Notes</h3>
                    <div className="max-w-none p-4 bg-gray-50 border border-gray-200 rounded-md rich-text-content text-gray-900" dangerouslySetInnerHTML={{ __html: meeting.notes }} />
                </div>
                
                <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} />
                <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink('project', id)} onUnlink={(id) => onUnlink('project', id)} />
                <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} />
                <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', id)} onUnlink={(id) => onUnlink('meeting', id)} />
                <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} />
                <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink('feature', id)} onUnlink={(id) => onUnlink('feature', id)} />
            </div>
        </div>
    );
};

export default MeetingDetailView;