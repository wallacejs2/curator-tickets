import React, { useState } from 'react';
import { Project, SubTask, SubTaskStatus, ProjectStatus, Ticket } from '../types.ts';
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
}

const SubTaskItem: React.FC<{
    task: SubTask;
    onToggle: (taskId: string) => void;
    onDelete: (taskId: string) => void;
}> = ({ task, onToggle, onDelete }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-md">
        <input
            type="checkbox"
            checked={task.status === SubTaskStatus.Done}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <div className="flex-grow">
            <p className={`text-sm text-gray-800 ${task.status === SubTaskStatus.Done ? 'line-through text-gray-500' : ''}`}>
                {task.description}
            </p>
            <div className="text-xs text-gray-500 mt-1">
                <span>Assigned to: <span className="font-semibold text-gray-600">{task.assignedTo}</span></span>
                <span className="mx-2">|</span>
                <span>Needs: <span className="font-semibold text-gray-600">{task.needsFrom}</span></span>
            </div>
        </div>
        <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-red-500"
            aria-label={`Delete task: ${task.description}`}
        >
            <TrashIcon className="w-4 h-4" />
        </button>
    </div>
);

const AddSubTaskForm: React.FC<{ onAdd: (task: Omit<SubTask, 'id' | 'status'>) => void }> = ({ onAdd }) => {
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [needsFrom, setNeedsFrom] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() && assignedTo.trim()) {
            onAdd({ description, assignedTo, needsFrom });
            setDescription('');
            setAssignedTo('');
            setNeedsFrom('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-lg mt-4 space-y-3">
            <h4 className="font-semibold text-sm text-gray-800">Add New Task</h4>
            <div>
                 <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description..." required className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
                 <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Assigned to..." required className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                 <input type="text" value={needsFrom} onChange={e => setNeedsFrom(e.target.value)} placeholder="Needs from them..." className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
            </div>
            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                <PlusIcon className="w-4 h-4"/>
                <span>Add Task</span>
            </button>
        </form>
    );
};


const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onUpdate, onDelete, tickets, onUpdateTicket }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProject, setEditableProject] = useState(project);
    const [ticketToAdd, setTicketToAdd] = useState<string>('');
    
    const linkedTickets = tickets.filter(t => t.projectId === project.id);
    const unassignedTickets = tickets.filter(t => !t.projectId);

    const handleSubTaskAdd = (newTaskData: Omit<SubTask, 'id' | 'status'>) => {
        const newTask: SubTask = {
            ...newTaskData,
            id: crypto.randomUUID(),
            status: SubTaskStatus.ToDo,
        };
        const updatedProject = { ...project, subTasks: [...project.subTasks, newTask] };
        onUpdate(updatedProject);
    };

    const handleSubTaskToggle = (taskId: string) => {
        const updatedSubTasks = project.subTasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === SubTaskStatus.Done ? SubTaskStatus.ToDo : SubTaskStatus.Done }
                : task
        );
        onUpdate({ ...project, subTasks: updatedSubTasks });
    };

    const handleSubTaskDelete = (taskId: string) => {
        const updatedSubTasks = project.subTasks.filter(task => task.id !== taskId);
        onUpdate({ ...project, subTasks: updatedSubTasks });
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableProject(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdate(editableProject);
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

            <div className="flex justify-end items-center gap-3 mb-6">
                <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                <button onClick={() => { setEditableProject(project); setIsEditing(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
            </div>
            
            <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-500">Created on {new Date(project.creationDate).toLocaleDateString()}</p>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{project.description}</p>
            </div>

            <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Tasks ({project.subTasks.length})</h3>
                <div className="space-y-2">
                    {project.subTasks.length > 0 ? (
                        project.subTasks.map(task => (
                            <SubTaskItem key={task.id} task={task} onToggle={handleSubTaskToggle} onDelete={handleSubTaskDelete} />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No tasks have been added to this project yet.</p>
                    )}
                </div>
                <AddSubTaskForm onAdd={handleSubTaskAdd} />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Linked Tickets ({linkedTickets.length})</h3>
                
                <div className="p-4 border border-gray-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Add Existing Ticket</h4>
                    <div className="flex gap-2 items-center">
                        <select 
                            value={ticketToAdd}
                            onChange={(e) => setTicketToAdd(e.target.value)}
                            className="flex-grow w-full text-sm p-2 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            disabled={unassignedTickets.length === 0}
                        >
                            <option value="">{unassignedTickets.length > 0 ? 'Select an unassigned ticket...' : 'No unassigned tickets available'}</option>
                            {unassignedTickets.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleLinkTicket} 
                            disabled={!ticketToAdd} 
                            className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                           Link
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    {linkedTickets.length > 0 ? (
                        linkedTickets.map(ticket => (
                            <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                                <div>
                                   <p className="text-sm font-semibold text-gray-800">{ticket.title}</p>
                                   <p className="text-xs text-gray-500">{ticket.status} - {ticket.priority}</p>
                                </div>
                                <button onClick={() => handleUnlinkTicket(ticket.id)} className="text-sm font-semibold text-red-600 hover:text-red-800 focus:outline-none">Unlink</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No tickets have been linked to this project yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;