
import React, { useState, useRef, useEffect } from 'react';
import { Meeting, Project, Ticket } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';

interface MeetingDetailViewProps {
    meeting: Meeting;
    onUpdate: (meeting: Meeting) => void;
    onDelete: (meetingId: string) => void;
    projects: Project[];
    tickets: Ticket[];
    onUpdateProject: (project: Project) => void;
    onUpdateTicket: (ticket: Ticket) => void;
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
    projects, 
    tickets,
    onUpdateProject,
    onUpdateTicket 
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableMeeting, setEditableMeeting] = useState(meeting);
    const [projectToLink, setProjectToLink] = useState('');
    const [ticketToLink, setTicketToLink] = useState('');
    const notesEditorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && notesEditorRef.current) {
            notesEditorRef.current.innerHTML = editableMeeting.notes;
        }
    }, [isEditing]);

    const linkedProjects = projects.filter(p => (meeting.projectIds || []).includes(p.id));
    const unlinkedProjects = projects.filter(p => !(meeting.projectIds || []).includes(p.id));
    
    const linkedTickets = tickets.filter(t => (meeting.ticketIds || []).includes(t.id));
    const unlinkedTickets = tickets.filter(t => !(meeting.ticketIds || []).includes(t.id));

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

    const handleLinkProject = () => {
        if (!projectToLink) return;
        const updatedMeeting = { ...meeting, projectIds: [...(meeting.projectIds || []), projectToLink] };
        onUpdate(updatedMeeting);
        
        // also update the project
        const project = projects.find(p => p.id === projectToLink);
        if (project) {
            const updatedProject = { ...project, meetingIds: [...(project.meetingIds || []), meeting.id] };
            onUpdateProject(updatedProject);
        }
        setProjectToLink('');
    };

    const handleUnlinkProject = (projectId: string) => {
        const updatedMeeting = { ...meeting, projectIds: (meeting.projectIds || []).filter(id => id !== projectId) };
        onUpdate(updatedMeeting);
        
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const updatedProject = { ...project, meetingIds: (project.meetingIds || []).filter(id => id !== meeting.id) };
            onUpdateProject(updatedProject);
        }
    };
    
    const handleLinkTicket = () => {
        if (!ticketToLink) return;
        const updatedMeeting = { ...meeting, ticketIds: [...(meeting.ticketIds || []), ticketToLink] };
        onUpdate(updatedMeeting);
        setTicketToLink('');
    };

    const handleUnlinkTicket = (ticketId: string) => {
        const updatedMeeting = { ...meeting, ticketIds: (meeting.ticketIds || []).filter(id => id !== ticketId) };
        onUpdate(updatedMeeting);
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

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Linked Projects</h3>
                     <div className="flex items-center gap-2 mb-4">
                        <select value={projectToLink} onChange={e => setProjectToLink(e.target.value)} className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2">
                            <option value="">Select a project to link...</option>
                            {unlinkedProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={handleLinkProject} disabled={!projectToLink} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300">Link</button>
                    </div>
                    <div className="space-y-2">
                        {linkedProjects.length > 0 ? linkedProjects.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                                <span className="text-sm">{p.name}</span>
                                <button onClick={() => handleUnlinkProject(p.id)} className="text-xs text-red-600 hover:underline">Unlink</button>
                            </div>
                        )) : <p className="text-sm text-gray-500 italic">No projects linked.</p>}
                    </div>
                </div>

                 <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Linked Tickets</h3>
                     <div className="flex items-center gap-2 mb-4">
                        <select value={ticketToLink} onChange={e => setTicketToLink(e.target.value)} className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2">
                            <option value="">Select a ticket to link...</option>
                            {unlinkedTickets.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                        </select>
                        <button onClick={handleLinkTicket} disabled={!ticketToLink} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300">Link</button>
                    </div>
                    <div className="space-y-2">
                        {linkedTickets.length > 0 ? linkedTickets.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                                <span className="text-sm">{t.title}</span>
                                <button onClick={() => handleUnlinkTicket(t.id)} className="text-xs text-red-600 hover:underline">Unlink</button>
                            </div>
                        )) : <p className="text-sm text-gray-500 italic">No tickets linked.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingDetailView;
