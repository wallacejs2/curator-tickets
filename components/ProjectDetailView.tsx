import React, { useState, useRef } from 'react';
import { Project, SubTask, SubTaskStatus, ProjectStatus, Ticket, SubTaskPriority } from '../types.ts';
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

const priorityColors: Record<SubTaskPriority, string> = {
  [SubTaskPriority.P1]: 'bg-red-200 text-red-800',
  [SubTaskPriority.P2]: 'bg-orange-200 text-orange-800',
  [SubTaskPriority.P3]: 'bg-amber-200 text-amber-800',
  [SubTaskPriority.P4]: 'bg-yellow-200 text-yellow-800',
};

const statusOptions = Object.values(SubTaskStatus);

const DragHandleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
  </svg>
);


const AddSubTaskForm: React.FC<{ onAdd: (task: Omit<SubTask, 'id' | 'status'>) => void }> = ({ onAdd }) => {
    const [description, setDescription] = useState('');
    const [assignedUser, setAssignedUser] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<SubTaskPriority>(SubTaskPriority.P3);
    const [type, setType] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim() && assignedUser.trim() && type.trim()) {
            onAdd({ 
                description: description.trim(), 
                assignedUser: assignedUser.trim(),
                dueDate: dueDate || undefined,
                priority,
                type: type.trim(),
            });
            setDescription('');
            setAssignedUser('');
            setDueDate('');
            setPriority(SubTaskPriority.P3);
            setType('');
        }
    };
    
    const formElementClasses = "w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900";
    const labelClasses = "block text-xs font-medium text-gray-600 mb-1";

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-lg mt-4 space-y-4 bg-gray-50">
            <h4 className="font-semibold text-sm text-gray-800">Add New Task</h4>
            <div>
                <label className={labelClasses}>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description..." required className={formElementClasses}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Assigned To</label>
                    <input type="text" value={assignedUser} onChange={e => setAssignedUser(e.target.value)} placeholder="User name..." required className={formElementClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={formElementClasses} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as SubTaskPriority)} className={formElementClasses}>
                        {Object.values(SubTaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Type</label>
                    <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Development" required className={formElementClasses}/>
                </div>
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
    
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);
    
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
    
    const handleSubTaskStatusChange = (taskId: string, newStatus: SubTaskStatus) => {
        const updatedSubTasks = project.subTasks.map(task =>
            task.id === taskId
                ? { ...task, status: newStatus }
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
    
    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
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

        const subTasksCopy = [...project.subTasks];
        const dragItemIndex = subTasksCopy.findIndex(task => task.id === dragItem.current);
        const dragOverItemIndex = subTasksCopy.findIndex(task => task.id === dragOverItem.current);

        const [reorderedItem] = subTasksCopy.splice(dragItemIndex, 1);
        subTasksCopy.splice(dragOverItemIndex, 0, reorderedItem);

        onUpdate({ ...project, subTasks: subTasksCopy });
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
                {project.subTasks.length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="w-10"></th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-4 py-3"><span className="sr-only">Delete</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                            {project.subTasks.map(task => (
                                <tr 
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    onDragEnter={() => handleDragEnter(task.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`transition-opacity ${dragging && dragItem.current === task.id ? 'opacity-50 bg-blue-100' : 'opacity-100'} hover:bg-gray-50 cursor-move`}
                                >
                                    <td className="py-4 whitespace-nowrap text-sm text-gray-500 flex justify-center items-center h-full"><DragHandleIcon className="w-5 h-5 text-gray-400"/></td>
                                    <td className="px-4 py-4"><div className={`text-sm font-medium text-gray-900 ${task.status === SubTaskStatus.Done ? 'line-through text-gray-500' : ''}`}>{task.description}</div></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedUser}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{task.type}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <select 
                                            value={task.status} 
                                            onChange={(e) => handleSubTaskStatusChange(task.id, e.target.value as SubTaskStatus)}
                                            className="text-sm p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                            onClick={(e) => e.stopPropagation()} // Prevent drag start on click
                                        >
                                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleSubTaskDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-red-500">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No tasks have been added to this project yet.</p>
                )}
                <AddSubTaskForm onAdd={handleSubTaskAdd} />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Linked Tickets ({linkedTickets.length})</h3>
                
                <div className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Add Existing Ticket</h4>
                    <div className="flex gap-2 items-center">
                        <select 
                            value={ticketToAdd}
                            onChange={(e) => setTicketToAdd(e.target.value)}
                            className="flex-grow w-full text-sm p-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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