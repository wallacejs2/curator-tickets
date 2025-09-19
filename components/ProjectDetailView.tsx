import React, { useState, useRef, useEffect } from 'react';
import { Project, Task, TaskStatus, ProjectStatus, Ticket, TaskPriority, Update, Meeting, Dealership, FeatureAnnouncement, Status, ProjectSection } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import EditableRichText from './common/inlineEdit/EditableRichText.tsx';
import EditableText from './common/inlineEdit/EditableText.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface ProjectDetailViewProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onExport: () => void;
  onAddUpdate: (projectId: string, comment: string, author: string, date: string) => void;
  onEditUpdate: (updatedUpdate: Update) => void;
  onDeleteUpdate: (updateId: string) => void;
  isReadOnly?: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
  
  allTickets: Ticket[];
  allProjects: Project[];
  allTasks: (Task & { projectName?: string; projectId: string | null; })[];
  allMeetings: Meeting[];
  allDealerships: Dealership[];
  allFeatures: FeatureAnnouncement[];

  onLink: (toType: EntityType, toId: string) => void;
  onUnlink: (toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ 
    project, onUpdate, onDelete, onExport, onAddUpdate, onEditUpdate, onDeleteUpdate, isReadOnly = false, showToast,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink, onSwitchView
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [newDescription, setNewDescription] = useState('');
    const [newAssignedUser, setNewAssignedUser] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.P3);
    const [newType, setNewType] = useState('');
    const [newNotify, setNewNotify] = useState('');
    
    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);

    const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');

    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const projectTasks = project.tasks || [];

    const linkedMeetings = allMeetings.filter(item => (project.meetingIds || []).includes(item.id));
    const availableMeetings = allMeetings.filter(item => !(project.meetingIds || []).includes(item.id));

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
          onAddUpdate(project.id, newUpdate.trim(), authorName.trim(), updateDate);
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

    const handleNameSave = (newName: string) => {
        onUpdate({ ...project, name: newName });
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

    const handleUpdateSections = (newSections: ProjectSection[]) => {
        onUpdate({ ...project, sections: newSections });
    };

    const handleSectionTitleSave = (sectionId: string, newTitle: string) => {
        const newSections = (project.sections || []).map(s =>
            s.id === sectionId ? { ...s, title: newTitle } : s
        );
        handleUpdateSections(newSections);
    };

    const handleSectionContentSave = (sectionId: string, newContent: string) => {
        const newSections = (project.sections || []).map(s =>
            s.id === sectionId ? { ...s, content: newContent } : s
        );
        handleUpdateSections(newSections);
    };

    const handleDeleteSection = (sectionId: string) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            const newSections = (project.sections || []).filter(s => s.id !== sectionId);
            handleUpdateSections(newSections);
        }
    };

    const handleAddSection = () => {
        const newSection: ProjectSection = {
            id: crypto.randomUUID(),
            title: 'New Section',
            content: '<p>Start writing here...</p>',
        };
        const newSections = [...(project.sections || []), newSection];
        handleUpdateSections(newSections);
    };

    const TaskItem: React.FC<{ task: Task, level: number }> = ({ task, level }) => (
        <div style={{ marginLeft: `${level * 20}px` }}>
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
                  <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm">
                      <DownloadIcon className="w-4 h-4"/>
                      <span>Export</span>
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
              </div>
            )}
            
            <div className="text-2xl font-bold text-gray-900 -m-2 mb-6">
                <EditableText 
                    value={project.name} 
                    onSave={handleNameSave} 
                    label="" 
                    placeholder="Project Name" 
                />
            </div>
            
            <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', id)} onUnlink={(id) => onUnlink('meeting', id)} onItemClick={(id) => onSwitchView('meeting', id)} />

            <div className="space-y-8 mt-8">
                {(project.sections || []).map(section => (
                    <div key={section.id} className="pt-6 border-t border-gray-200 group relative">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-lg font-semibold text-gray-800 w-full pr-8">
                                <EditableText 
                                    value={section.title} 
                                    onSave={(newTitle) => handleSectionTitleSave(section.id, newTitle)}
                                    label=""
                                    placeholder="Section Title"
                                />
                            </div>
                            <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="absolute top-6 right-0 p-1 text-gray-400 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Delete section"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-sm">
                            <EditableRichText 
                                value={section.content} 
                                onSave={(newContent) => handleSectionContentSave(section.id, newContent)}
                            />
                        </div>
                    </div>
                ))}
                
                <div className="pt-6 border-t border-gray-200 text-center">
                    <button
                        onClick={handleAddSection}
                        className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-200 border border-gray-300"
                    >
                        <PlusIcon className="w-5 h-5 inline-block mr-2" />
                        Add New Section
                    </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Tasks ({projectTasks.length})</h3>
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

                <div className="pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({project.updates?.length || 0})</h3>
                    {!isReadOnly && (
                    <form onSubmit={handleUpdateSubmit} className="p-3 border border-gray-200 rounded-md mb-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                        <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Add a new update..." required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50" rows={3}/>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                            <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                        </div>
                        <button type="submit" disabled={!newUpdate.trim() || !authorName.trim()} className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">Add Update</button>
                    </form>
                    )}
                    <div className="space-y-4">
                        {[...(project.updates || [])].reverse().map((update) => (
                            <div key={update.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                {editingUpdateId === update.id ? (
                                    <div>
                                        <textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setEditingUpdateId(null)} className="bg-white text-gray-700 font-semibold px-3 py-1 rounded-md border border-gray-300 text-sm">Cancel</button>
                                            <button onClick={() => { onEditUpdate({ ...update, comment: editedComment.trim() }); setEditingUpdateId(null); }} className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm">Save</button>
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
                                                <button onClick={() => { setEditingUpdateId(update.id); setEditedComment(update.comment); }} className="p-1 text-gray-400 hover:text-blue-600" aria-label="Edit update"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => { if (window.confirm('Are you sure you want to delete this update?')) { onDeleteUpdate(update.id); } }} className="p-1 text-gray-400 hover:text-red-600" aria-label="Delete update"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">{update.comment}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailView;