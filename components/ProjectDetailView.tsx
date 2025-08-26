


import React, { useState, useRef } from 'react';
import { Project, Task, TaskStatus, ProjectStatus, Ticket, TaskPriority, Update, Meeting } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';

interface ProjectDetailViewProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  tickets: Ticket[];
  onUpdateTicket: (ticket: Ticket) => void;
  onAddUpdate: (projectId: string, comment: string, author: string, date: string) => void;
  meetings: Meeting[];
  onUpdateMeeting: (meeting: Meeting) => void;
}

const EditTaskForm: React.FC<{ task: Task, onSave: (task: Task) => void, onClose: () => void }> = ({ task, onSave, onClose }) => {
    const [editedTask, setEditedTask] = useState(task);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTask({ ...editedTask, dueDate: e.target.value ? new Date(`${e.target.value}T00:00:00`).toISOString() : undefined });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedTask);
    };
    
    const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Description</label>
                <textarea name="description" value={editedTask.description} onChange={handleChange} required rows={3} className={formElementClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Assigned User</label>
                    <input type="text" name="assignedUser" value={editedTask.assignedUser} onChange={handleChange} required className={formElementClasses} />
                </div>
                 <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" value={editedTask.status} onChange={handleChange} className={formElementClasses}>
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select name="priority" value={editedTask.priority} onChange={handleChange} className={formElementClasses}>
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Type</label>
                    <input type="text" name="type" value={editedTask.type} onChange={handleChange} required className={formElementClasses} />
                </div>
            </div>
             <div>
                <label className={labelClasses}>Due Date</label>
                <input type="date" name="dueDate" value={editedTask.dueDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
            </div>
        </form>
    );
};


const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onUpdate, onDelete, tickets, onUpdateTicket, onAddUpdate, meetings, onUpdateMeeting }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProject, setEditableProject] = useState(project);
    const [ticketToAdd, setTicketToAdd] = useState<string>('');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [meetingToLink, setMeetingToLink] = useState('');
    const [involvedPeopleString, setInvolvedPeopleString] = useState('');

    // Form state for new sub-task
    const [newDescription, setNewDescription] = useState('');
    const [newAssignedUser, setNewAssignedUser] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.P3);
    const [newType, setNewType] = useState('');
    
    // Form state for new update
    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);


    // Drag-and-drop state
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const projectTasks = project.tasks || [];
    
    const linkedTickets = tickets.filter(t => t.projectId === project.id);
    const unassignedTickets = tickets.filter(t => !t.projectId);

    const linkedMeetings = meetings.filter(m => (project.meetingIds || []).includes(m.id));
    const unlinkedMeetings = meetings.filter(m => !(project.meetingIds || []).includes(m.id));

    const handleNewTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDescription.trim() && newAssignedUser.trim() && newType.trim()) {
            const newTask: Task = {
                id: crypto.randomUUID(),
                status: TaskStatus.ToDo,
                description: newDescription.trim(), 
                assignedUser: newAssignedUser.trim(),
                dueDate: newDueDate ? new Date(`${newDueDate}T00:00:00`).toISOString() : undefined,
                priority: newPriority,
                type: newType.trim(),
            };
            const updatedProject = { ...project, tasks: [...projectTasks, newTask] };
            onUpdate(updatedProject);
            // Reset form
            setNewDescription('');
            setNewAssignedUser('');
            setNewDueDate('');
            setNewPriority(TaskPriority.P3);
            setNewType('');
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUpdate.trim() && authorName.trim() && updateDate) {
          onAddUpdate(project.id, newUpdate.trim(), authorName.trim(), updateDate);
          setNewUpdate('');
          setAuthorName('');
        }
    };
    
    const handleTaskToggleStatus = (taskId: string) => {
        const updatedTasks = projectTasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === TaskStatus.Done ? TaskStatus.ToDo : TaskStatus.Done }
                : task
        );
        onUpdate({ ...project, tasks: updatedTasks });
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        const updatedTasks = projectTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
        onUpdate({ ...project, tasks: updatedTasks });
        setEditingTask(null);
    };
    
    const handleTaskDelete = (taskId: string) => {
        const updatedTasks = projectTasks.filter(task => task.id !== taskId);
        onUpdate({ ...project, tasks: updatedTasks });
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableProject(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const people = involvedPeopleString.split(',').map(p => p.trim()).filter(Boolean);
        onUpdate({ ...editableProject, involvedPeople: people });
        setIsEditing(false);
    };
    
    const handleLinkTicket = () => {
        if (!ticketToAdd) return;
        const ticket = tickets.find(t => t.id === ticketToAdd);
        if (ticket) {
            onUpdateTicket({ ...ticket, projectId: project.id });
            setTicketToAdd('');
        }
    };

    const handleUnlinkTicket = (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            const { projectId, ...rest } = ticket;
            onUpdateTicket({ ...rest });
        }
    };
    
    const handleLinkMeeting = () => {
        if (!meetingToLink) return;
        const updatedProject = { ...project, meetingIds: [...(project.meetingIds || []), meetingToLink] };
        onUpdate(updatedProject);
        
        const meeting = meetings.find(m => m.id === meetingToLink);
        if (meeting) {
            const updatedMeeting = { ...meeting, projectIds: [...meeting.projectIds, project.id] };
            onUpdateMeeting(updatedMeeting);
        }
        setMeetingToLink('');
    };

    const handleUnlinkMeeting = (meetingId: string) => {
        const updatedProject = { ...project, meetingIds: (project.meetingIds || []).filter(id => id !== meetingId) };
        onUpdate(updatedProject);

        const meeting = meetings.find(m => m.id === meetingId);
        if (meeting) {
            const updatedMeeting = { ...meeting, projectIds: meeting.projectIds.filter(id => id !== project.id) };
            onUpdateMeeting(updatedMeeting);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragItem.current = id;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => setDragging(true), 0);
    };
    
    const handleDragEnter = (id: string) => {
        dragOverItem.current = id;
    };

    const handleDragEnd = () => {
        setDragging(false);
        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    const handleDrop = () => {
        if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) {
            handleDragEnd();
            return;
        }

        const tasksCopy = [...projectTasks];
        const dragItemIndex = tasksCopy.findIndex(task => task.id === dragItem.current);
        const dragOverItemIndex = tasksCopy.findIndex(task => task.id === dragOverItem.current);

        const [reorderedItem] = tasksCopy.splice(dragItemIndex, 1);
        tasksCopy.splice(dragOverItemIndex, 0, reorderedItem);

        onUpdate({ ...project, tasks: tasksCopy });
        handleDragEnd();
    };


    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex justify-end items-center gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Save Changes</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name</label>
                    <input type="text" name="name" value={editableProject.name} onChange={handleFormChange} className="mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Project Description</label>
                    <textarea name="description" value={editableProject.description} onChange={handleFormChange} rows={4} className="mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Who's Involved (comma-separated)</label>
                    <input
                        type="text"
                        name="involvedPeople"
                        value={involvedPeopleString}
                        onChange={(e) => setInvolvedPeopleString(e.target.value)}
                        className="mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={editableProject.status} onChange={handleFormChange} className="mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                        {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        )
    }

    return (
        <div>
            {isDeleteModalOpen && (
                <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                    <p className="text-gray-700">Are you sure you want to delete this project and all its sub-tasks? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { onDelete(project.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Project</button>
                    </div>
                </Modal>
            )}
            
            {editingTask && (
                <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
                    <EditTaskForm task={editingTask} onSave={handleTaskUpdate} onClose={() => setEditingTask(null)} />
                </Modal>
            )}

            <div className="flex justify-end items-center gap-3 mb-6">
                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                <button onClick={() => { 
                    setEditableProject(project); 
                    setInvolvedPeopleString((project.involvedPeople || []).join(', '));
                    setIsEditing(true); 
                }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
            </div>
            
            <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.description}</p>
                 <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Who's Involved</h4>
                    <div className="flex flex-wrap gap-2">
                        {(project.involvedPeople || []).length > 0 ? project.involvedPeople!.map(person => (
                            <span key={person} className="px-2.5 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-full">{person}</span>
                        )) : <p className="text-sm text-gray-500 italic">No one assigned yet.</p>}
                    </div>
                </div>
            </div>

            {/* Sub-Tasks Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Tasks ({projectTasks.length})</h3>
                
                <div className="space-y-2">
                    {projectTasks.length > 0 ? projectTasks.map(task => (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnter={() => handleDragEnter(task.id)}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={`p-3 rounded-md shadow-sm border flex items-start gap-3 transition-all duration-300 cursor-grab ${task.status === TaskStatus.Done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} ${dragging && dragItem.current === task.id ? 'opacity-50 scale-105' : ''} ${dragging && dragOverItem.current === task.id ? 'bg-blue-100' : ''}`}
                        >
                            <input type="checkbox" checked={task.status === TaskStatus.Done} onChange={() => handleTaskToggleStatus(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mt-1 cursor-pointer"/>
                            <div className="flex-grow">
                                <p className={`font-medium ${task.status === TaskStatus.Done ? 'text-green-900 line-through' : 'text-gray-800'}`}>{task.description}</p>
                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span>To: <span className="font-medium">{task.assignedUser}</span></span>
                                    {task.dueDate && <span>Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span></span>}
                                    <span>Type: <span className="font-medium">{task.type}</span></span>
                                    <span>Priority: <span className="font-medium">{task.priority}</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => setEditingTask(task)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-blue-500"><PencilIcon className="w-4 h-4" /></button>
                                <button onClick={() => handleTaskDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-red-500"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 italic">No tasks have been added to this project yet.</p>
                    )}
                </div>

                <form onSubmit={handleNewTaskSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-2 items-center mt-4 p-3 bg-gray-50 rounded-md border">
                    <input type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="New task description..." required className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                    <input type="text" value={newAssignedUser} onChange={e => setNewAssignedUser(e.target.value)} placeholder="Assignee..." required className="w-full sm:w-auto text-sm p-2 border border-gray-300 rounded-md"/>
                     <div className="col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-[auto,auto,auto,1fr] gap-2 items-center mt-2">
                        <input type="text" value={newType} onChange={e => setNewType(e.target.value)} placeholder="Type (e.g., Dev)" required className="text-sm p-2 border border-gray-300 rounded-md"/>
                        <select value={newPriority} onChange={e => setNewPriority(e.target.value as TaskPriority)} className="text-sm p-2 border border-gray-300 rounded-md bg-white">
                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="text-sm p-2 border border-gray-300 rounded-md"/>
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 ring-blue-500 flex justify-center items-center h-full">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

             {/* Linked Meetings Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Linked Meetings</h3>
                <div className="flex items-center gap-2 mb-4">
                    <select value={meetingToLink} onChange={e => setMeetingToLink(e.target.value)} className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2">
                        <option value="">Select a meeting to link...</option>
                        {unlinkedMeetings.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <button onClick={handleLinkMeeting} disabled={!meetingToLink} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300">Link Meeting</button>
                </div>
                <div className="space-y-2">
                    {linkedMeetings.length > 0 ? linkedMeetings.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                            <span className="text-sm">{m.name} ({new Date(m.meetingDate).toLocaleDateString()})</span>
                            <button onClick={() => handleUnlinkMeeting(m.id)} className="text-xs text-red-600 hover:underline">Unlink</button>
                        </div>
                    )) : <p className="text-sm text-gray-500 italic">No meetings have been linked yet.</p>}
                </div>
            </div>

            {/* Linked Tickets Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Linked Tickets</h3>
                <div className="flex items-center gap-2 mb-4">
                    <select value={ticketToAdd} onChange={e => setTicketToAdd(e.target.value)} className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2">
                        <option value="">Select a ticket to link...</option>
                        {unassignedTickets.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                    <button onClick={handleLinkTicket} disabled={!ticketToAdd} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300">Link Ticket</button>
                </div>
                <div className="space-y-2">
                    {linkedTickets.length > 0 ? linkedTickets.map(t => (
                        <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md">
                            <span className="text-sm">{t.title}</span>
                            <button onClick={() => handleUnlinkTicket(t.id)} className="text-xs text-red-600 hover:underline">Unlink</button>
                        </div>
                    )) : <p className="text-sm text-gray-500 italic">No tickets have been linked to this project yet.</p>}
                </div>
            </div>

            {/* Updates Section */}
            <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({project.updates?.length || 0})</h3>
                 <form onSubmit={handleUpdateSubmit} className="p-3 border border-gray-200 rounded-md mb-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                     <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md" />
                     <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md" />
                    <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Type your comment here..." required rows={3} className="w-full text-sm p-2 border border-gray-300 rounded-md" />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Add Update</button>
                    </div>
                 </form>
                <div className="space-y-4">
                    {project.updates && project.updates.length > 0 ? (
                    [...project.updates].reverse().map((update, index) => (
                        <div key={index} className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                            <div dangerouslySetInnerHTML={{ __html: update.comment }} className="text-gray-800 text-sm" />
                            <p className="text-xs text-gray-500 mt-2">
                                {update.author} - {new Date(update.date).toLocaleString()}
                            </p>
                        </div>
                    ))
                    ) : (
                    <p className="text-sm text-gray-500 italic">No updates have been added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;