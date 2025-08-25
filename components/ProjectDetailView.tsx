import React, { useState, useRef } from 'react';
import { Project, SubTask, SubTaskStatus, ProjectStatus, Ticket, SubTaskPriority, Update } from '../types.ts';
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
  onAddUpdate: (projectId: string, comment: string, author: string) => void;
}

const EditSubTaskForm: React.FC<{ task: SubTask, onSave: (task: SubTask) => void, onClose: () => void }> = ({ task, onSave, onClose }) => {
    const [editedTask, setEditedTask] = useState(task);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTask({ ...editedTask, dueDate: e.target.value || undefined });
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
                        {Object.values(SubTaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select name="priority" value={editedTask.priority} onChange={handleChange} className={formElementClasses}>
                        {Object.values(SubTaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
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


const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, onUpdate, onDelete, tickets, onUpdateTicket, onAddUpdate }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProject, setEditableProject] = useState(project);
    const [ticketToAdd, setTicketToAdd] = useState<string>('');
    const [editingTask, setEditingTask] = useState<SubTask | null>(null);

    // Form state for new sub-task
    const [newDescription, setNewDescription] = useState('');
    const [newAssignedUser, setNewAssignedUser] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState<SubTaskPriority>(SubTaskPriority.P3);
    const [newType, setNewType] = useState('');
    
    // Form state for new update
    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');

    // Drag-and-drop state
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);
    
    const linkedTickets = tickets.filter(t => t.projectId === project.id);
    const unassignedTickets = tickets.filter(t => !t.projectId);

    const handleNewSubTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDescription.trim() && newAssignedUser.trim() && newType.trim()) {
            const newTask: SubTask = {
                id: crypto.randomUUID(),
                status: SubTaskStatus.ToDo,
                description: newDescription.trim(), 
                assignedUser: newAssignedUser.trim(),
                dueDate: newDueDate || undefined,
                priority: newPriority,
                type: newType.trim(),
            };
            const updatedProject = { ...project, subTasks: [...project.subTasks, newTask] };
            onUpdate(updatedProject);
            // Reset form
            setNewDescription('');
            setNewAssignedUser('');
            setNewDueDate('');
            setNewPriority(SubTaskPriority.P3);
            setNewType('');
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUpdate.trim() && authorName.trim()) {
          onAddUpdate(project.id, newUpdate.trim(), authorName.trim());
          setNewUpdate('');
        }
    };
    
    const handleSubTaskToggleStatus = (taskId: string) => {
        const updatedSubTasks = project.subTasks.map(task =>
            task.id === taskId
                ? { ...task, status: task.status === SubTaskStatus.Done ? SubTaskStatus.ToDo : SubTaskStatus.Done }
                : task
        );
        onUpdate({ ...project, subTasks: updatedSubTasks });
    };

    const handleSubTaskUpdate = (updatedTask: SubTask) => {
        const updatedSubTasks = project.subTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
        onUpdate({ ...project, subTasks: updatedSubTasks });
        setEditingTask(null);
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
            
            {editingTask && (
                <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
                    <EditSubTaskForm task={editingTask} onSave={handleSubTaskUpdate} onClose={() => setEditingTask(null)} />
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
                  <div
                      className="space-y-2"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                  >
                      {project.subTasks.map(task => (
                          <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragEnter={() => handleDragEnter(task.id)}
                              onDragEnd={handleDragEnd}
                              className={`bg-white rounded-lg p-3 flex items-center gap-3 transition-all border shadow-sm cursor-grab active:cursor-grabbing ${dragging && dragItem.current === task.id ? 'opacity-30' : ''} ${dragOverItem.current === task.id && dragItem.current !== task.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
                           >
                              <input
                                  type="checkbox"
                                  checked={task.status === SubTaskStatus.Done}
                                  onChange={() => handleSubTaskToggleStatus(task.id)}
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                  aria-label={`Mark task ${task.description} as complete`}
                              />
                              <div className="flex-grow">
                                  <p className={`text-sm font-medium text-gray-800 ${task.status === SubTaskStatus.Done ? 'line-through text-gray-500' : ''}`}>
                                      {task.description}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                      Assigned to: <span className="font-medium">{task.assignedUser}</span>
                                  </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                  <button onClick={() => setEditingTask(task)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-blue-500" aria-label={`Edit task ${task.description}`}>
                                      <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleSubTaskDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-red-500" aria-label={`Delete task ${task.description}`}>
                                      <TrashIcon className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No tasks have been added to this project yet.</p>
                )}
                
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3">Add New Task</h4>
                    <form onSubmit={handleNewSubTaskSubmit} className="space-y-3">
                        <input type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Task description..." required className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" value={newAssignedUser} onChange={e => setNewAssignedUser(e.target.value)} placeholder="Assigned to..." required className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            <input type="text" value={newType} onChange={e => setNewType(e.target.value)} placeholder="Task Type (e.g. Dev, QA)..." required className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <select value={newPriority} onChange={e => setNewPriority(e.target.value as SubTaskPriority)} className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                {Object.values(SubTaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                             <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                        </div>
                        <button type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                            <PlusIcon className="w-5 h-5" />
                            <span>Add Task</span>
                        </button>
                    </form>
                </div>
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

            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({project.updates?.length || 0})</h3>
                <form onSubmit={handleUpdateSubmit} className="p-3 border border-gray-200 rounded-md mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Add a new update</h4>
                    <div className="mb-2">
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Your Name"
                            required
                            className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-2">
                        <textarea
                            value={newUpdate}
                            onChange={(e) => setNewUpdate(e.target.value)}
                            placeholder="Type your comment here..."
                            required
                            rows={3}
                            className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                            Add Update
                        </button>
                    </div>
                </form>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {project.updates && project.updates.length > 0 ? (
                    [...project.updates].reverse().map((update, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-800">{update.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            <span className="font-semibold">{update.author}</span> - {new Date(update.date).toLocaleString()}
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