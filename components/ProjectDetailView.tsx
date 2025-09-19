import React, { useState, useRef, useEffect } from 'react';
// FIX: Import EntityType from the centralized types file.
import { Project, Task, TaskStatus, ProjectStatus, Ticket, TaskPriority, Update, Meeting, Dealership, FeatureAnnouncement, Status, EntityType } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import { formatDisplayName } from '../utils.ts';

// FIX: Removed local EntityType definition.

interface ProjectDetailViewProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onExport: () => void;
  onAddUpdate: (projectId: string, comment: string, author: string, date: string) => void;
  onEditUpdate: (updatedUpdate: Update) => void;
  onDeleteUpdate: (updateId: string) => void;
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

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ 
    project, onUpdate, onDelete, onExport, onAddUpdate, onEditUpdate, onDeleteUpdate, isReadOnly = false,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink, onSwitchView
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProject, setEditableProject] = useState(project);
    const [involvedPeopleString, setInvolvedPeopleString] = useState('');

    // Form state for new sub-task
    const [newDescription, setNewDescription] = useState('');
    const [newAssignedUser, setNewAssignedUser] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.P3);
    const [newType, setNewType] = useState('');
    const [newNotify, setNewNotify] = useState('');
    
    // Form state for new update
    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);

    // State for editing an update
    const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');

    // Drag-and-drop state
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const projectTasks = (project.tasks || []).filter(task => task && typeof task === 'object');

    // Linked items
    const linkedTickets = allTickets.filter(item => (project.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => item.id !== project.id && (project.linkedProjectIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => (project.meetingIds || []).includes(item.id));
    const linkedDealerships = allDealerships.filter(item => (project.dealershipIds || []).includes(item.id));
    const linkedFeatures = allFeatures.filter(item => (project.featureIds || []).includes(item.id));

    // Enhanced Task Linking Logic: Include tasks from linked tickets
    const directlyLinkedTaskIds = project.taskIds || [];
    const taskIdsFromLinkedTickets = linkedTickets.flatMap(ticket => ticket.tasks?.map(task => task.id) || []);
    const allRelatedLinkedTaskIds = [...new Set([...directlyLinkedTaskIds, ...taskIdsFromLinkedTickets])];
    const linkedTasks = allTasks.filter(item => allRelatedLinkedTaskIds.includes(item.id));

    // Available items for linking (filter out completed and already related items)
    const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(project.ticketIds || []).includes(item.id));
    const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && item.id !== project.id && !(project.linkedProjectIds || []).includes(item.id));
    const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !allRelatedLinkedTaskIds.includes(item.id));
    const availableMeetings = allMeetings.filter(item => !(project.meetingIds || []).includes(item.id));
    const availableDealerships = allDealerships.filter(item => !(project.dealershipIds || []).includes(item.id));
    const availableFeatures = allFeatures.filter(item => !(project.featureIds || []).includes(item.id));

    const handleNewTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDescription.trim() && newAssignedUser.trim() && newType.trim()) {
            const newTask: Task = {
                id: crypto.randomUUID(),
                status: TaskStatus.ToDo,
                description: newDescription.trim(), 
                assignedUser: newAssignedUser.trim(),
                creationDate: new Date().toISOString(),
                dueDate: newDueDate ? new Date(`${newDueDate}T00:00:00`).toISOString() : undefined,
                priority: newPriority,
                type: newType.trim(),
                notifyOnCompletion: newNotify.trim() || undefined,
                projectIds: [project.id],
            };
            const updatedProject = { ...project, tasks: [...projectTasks, newTask] };
            onUpdate(updatedProject);
            // Reset form
            setNewDescription('');
            setNewAssignedUser('');
            setNewDueDate('');
            setNewPriority(TaskPriority.P3);
            setNewType('');
            setNewNotify('');
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUpdate.trim() && authorName.trim() && updateDate) {
          const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
          onAddUpdate(project.id, commentAsHtml, authorName.trim(), updateDate);
          setNewUpdate('');
          setAuthorName('');
        }
    };
    
    const handleTaskToggleStatus = (taskId: string) => {
        const toggleRecursively = (tasks: Task[]): Task[] => {
            return tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, status: task.status === TaskStatus.Done ? TaskStatus.ToDo : TaskStatus.Done };
                }
                if (task.subTasks) {
                    return { ...task, subTasks: toggleRecursively(task.subTasks) };
                }
                return task;
            });
        };
        const updatedTasks = toggleRecursively(projectTasks);
        onUpdate({ ...project, tasks: updatedTasks });
    };

    const handleTaskDelete = (taskId: string) => {
        const deleteRecursively = (tasks: Task[]): Task[] => {
            return tasks.filter(task => {
                if (task.id === taskId) return false;
                if (task.subTasks) {
                    task.subTasks = deleteRecursively(task.subTasks);
                }
                return true;
            });
        };
        const updatedTasks = deleteRecursively(projectTasks);
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

    const handleCopyInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        let content = `PROJECT DETAILS: ${project.name}\n`;
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
        const appendTextArea = (label: string, value: any) => {
             if (value) {
                content += `${label}:\n${value}\n\n`;
            }
        };

        appendField('ID', project.id);
        appendField('Status', project.status);
        appendDateField('Creation Date', project.creationDate);
        appendTextArea('Description', project.description);
        appendField('Involved People', (project.involvedPeople || []).join(', '));

        if (project.tasks && project.tasks.length > 0) {
            appendSection(`Tasks (${project.tasks.length})`);
            project.tasks.forEach(task => {
                content += `- ${task.description}\n`;
                content += `  (Assigned: ${task.assignedUser}, Status: ${task.status}, Priority: ${task.priority}, Type: ${task.type})\n`;
                if(task.dueDate) content += `  (Due: ${new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })})\n`;
            });
            content += '\n';
        }

        if (project.updates && project.updates.length > 0) {
            appendSection(`Updates (${project.updates.length})`);
            [...project.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n');
                content += `[${new Date(update.date).toLocaleString(undefined, { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
            });
        }

        appendSection('Linked Item IDs');
        appendField('Ticket IDs', (project.ticketIds || []).join(', '));
        appendField('Linked Project IDs', (project.linkedProjectIds || []).join(', '));
        appendField('Meeting IDs', (project.meetingIds || []).join(', '));
        appendField('Task IDs', (project.taskIds || []).join(', '));
        appendField('Dealership IDs', (project.dealershipIds || []).join(', '));
        appendField('Feature IDs', (project.featureIds || []).join(', '));
        
        navigator.clipboard.writeText(content);
        // FIX: Removed call to deprecated showToast function.
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
                        {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{formatDisplayName(s)}</option>)}
                    </select>
                </div>
            </div>
        )
    }

    // ENHANCEMENT: Create a recursive TaskItem component to render nested tasks.
    const TaskItem: React.FC<{ task: Task, level: number }> = ({ task, level }) => (
        <div className="space-y-2" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
            <div
                key={task.id}
                draggable={!isReadOnly}
                onDragStart={(e) => !isReadOnly && handleDragStart(e, task.id)}
                onDragEnter={() => !isReadOnly && handleDragEnter(task.id)}
                onDragEnd={!isReadOnly ? handleDragEnd : undefined}
                onDrop={!isReadOnly ? handleDrop : undefined}
                onDragOver={(e) => e.preventDefault()}
                className={`p-3 rounded-md shadow-sm border flex items-start gap-3 transition-all duration-300 ${!isReadOnly && 'cursor-grab'} ${task.status === TaskStatus.Done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} ${dragging && dragItem.current === task.id ? 'opacity-50 scale-105' : ''} ${dragging && dragOverItem.current === task.id ? 'bg-blue-100' : ''}`}
            >
                <input type="checkbox" checked={task.status === TaskStatus.Done} onChange={() => handleTaskToggleStatus(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mt-1 cursor-pointer" disabled={isReadOnly}/>
                <div className="flex-grow">
                    <p className={`font-medium ${task.status === TaskStatus.Done ? 'text-green-900 line-through' : 'text-gray-800'}`}>{task.description}</p>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>To: <span className="font-medium">{task.assignedUser}</span></span>
                        {task.dueDate && <span>Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span></span>}
                        <span>Type: <span className="font-medium">{task.type}</span></span>
                        <span>Priority: <span className="font-medium">{task.priority}</span></span>
                        {task.notifyOnCompletion && <span>Notify: <span className="font-medium">{task.notifyOnCompletion}</span></span>}
                        {task.linkedTaskIds && task.linkedTaskIds.length > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                                <LinkIcon className="w-3 h-3"/>
                                <span>{task.linkedTaskIds.length} Linked</span>
                            </span>
                        )}
                    </div>
                </div>
                {!isReadOnly && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => onSwitchView('task', task.id)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-blue-500"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleTaskDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-red-500"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                )}
            </div>
            {task.subTasks && task.subTasks.map(subTask => (
                <TaskItem key={subTask.id} task={subTask} level={level + 1} />
            ))}
        </div>
    );

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

            {!isReadOnly && (
              <div className="flex justify-end items-center gap-3 mb-6">
                  <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm">
                      <ContentCopyIcon className="w-4 h-4"/>
                      <span>Copy Info</span>
                  </button>
                  <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm">
                      <DownloadIcon className="w-4 h-4"/>
                      <span>Export</span>
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                  <button onClick={() => { 
                      setEditableProject(project); 
                      setInvolvedPeopleString((project.involvedPeople || []).join(', '));
                      setIsEditing(true); 
                  }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
              </div>
            )}
            
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

            <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Project Tasks ({projectTasks.length})</h3>
                <div className="space-y-2">
                    {projectTasks.length > 0 ? projectTasks.map(task => (
                        <TaskItem key={task.id} task={task} level={0} />
                    )) : (
                        <p className="text-sm text-gray-500 italic">No tasks have been added to this project yet.</p>
                    )}
                </div>

                {!isReadOnly && (
                  <form onSubmit={handleNewTaskSubmit} className="space-y-3 mt-4 p-3 bg-gray-50 rounded-md border">
                      <input type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="New task description..." required className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" value={newAssignedUser} onChange={e => setNewAssignedUser(e.target.value)} placeholder="Assignee..." required className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                          <input type="text" value={newNotify} onChange={e => setNewNotify(e.target.value)} placeholder="Notify on completion..." className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto,auto] gap-3 items-center">
                          <input type="text" value={newType} onChange={e => setNewType(e.target.value)} placeholder="Type (e.g., Dev)" required className="text-sm p-2 border border-gray-300 rounded-md"/>
                          <select value={newPriority} onChange={e => setNewPriority(e.target.value as TaskPriority)} className="text-sm p-2 border border-gray-300 rounded-md bg-white h-full">
                              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="text-sm p-2 border border-gray-300 rounded-md"/>
                          <button type="submit" aria-label="Add Task" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 ring-blue-500 flex justify-center items-center h-full">
                              <PlusIcon className="w-5 h-5" />
                          </button>
                      </div>
                  </form>
                )}
            </div>

            {!isReadOnly && (
              <>
                <div className="pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({project.updates?.length || 0})</h3>
                    <form onSubmit={handleUpdateSubmit} className="p-3 border border-gray-200 rounded-md mb-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                            <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                        </div>
                        <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Add a new update..." required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50" rows={3}/>
                        <button type="submit" disabled={!newUpdate.trim() || !authorName.trim()} className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">Add Update</button>
                    </form>
                    <div className="space-y-4">
                        {[...(project.updates || [])].reverse().map((update) => (
                            <div key={update.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                {editingUpdateId === update.id ? (
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
    );
};

export default ProjectDetailView;