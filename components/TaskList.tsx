

import React, { useState, useMemo } from 'react';
import { Project, Task, TaskPriority, TaskStatus } from '../types.ts';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { AccountBalanceIcon } from './icons/AccountBalanceIcon.tsx';

// Define EntityType for linking
type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

type EnrichedTask = Task & { 
    projectName?: string; 
    projectId: string | null; 
    ticketId: string | null;
    ticketTitle?: string;
};

interface TaskListProps {
  projects: Project[];
  onAddTask: (task: Task, parent: { type: 'project' | 'standalone', id?: string }) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  allTasks: EnrichedTask[];
  onSwitchView: (type: EntityType, id: string) => void;
}

type TaskView = 'active' | 'completed';

const priorityOrder: Record<TaskPriority, number> = {
    [TaskPriority.P1]: 1,
    [TaskPriority.P2]: 2,
    [TaskPriority.P3]: 3,
    [TaskPriority.P4]: 4,
};

const taskSorter = (a: Task, b: Task) => {
    // 1. Sort by Priority (P1 is highest)
    const priorityA = priorityOrder[a.priority];
    const priorityB = priorityOrder[b.priority];
    if (priorityA < priorityB) return -1;
    if (priorityA > priorityB) return 1;

    // 2. Sort by Creation Date (newest to oldest)
    return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
};

const statusColorStyles: Record<TaskStatus, string> = {
  [TaskStatus.ToDo]: 'bg-gray-200 text-gray-800',
  [TaskStatus.InProgress]: 'bg-blue-200 text-blue-800',
  [TaskStatus.Done]: 'bg-green-200 text-green-800',
};

const TaskList: React.FC<TaskListProps> = ({ 
    projects, onAddTask, onDeleteTask, onUpdateTaskStatus, allTasks,
    onSwitchView
}) => {
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.P3);
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [notify, setNotify] = useState('');
  
  const [taskView, setTaskView] = useState<TaskView>('active');

  const { activeTasks, completedTasks } = useMemo(() => {
    const active: typeof allTasks = [];
    const completed: typeof allTasks = [];

    for (const task of allTasks) {
        if (task.status === TaskStatus.Done) {
            completed.push(task);
        } else {
            active.push(task);
        }
    }

    // Sort active tasks by priority then newest first
    active.sort(taskSorter);
    
    // Sort completed tasks by priority then newest first
    completed.sort(taskSorter);
    
    return { activeTasks: active, completedTasks: completed };
  }, [allTasks]);
  
  const tasksToShow = taskView === 'active' ? activeTasks : completedTasks;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Please provide a task description.");
      return;
    }
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      description: description.trim(),
      assignedUser: assignedTo.trim(),
      status: TaskStatus.ToDo,
      priority,
      type: taskType.trim(),
      creationDate: new Date().toISOString(),
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : undefined,
      notifyOnCompletion: notify.trim() || undefined,
      projectIds: selectedProjectId ? [selectedProjectId] : [],
    };
    
    onAddTask(newTask, { type: selectedProjectId ? 'project' : 'standalone', id: selectedProjectId || undefined });
    
    setDescription('');
    setAssignedTo('');
    setTaskType('');
    setPriority(TaskPriority.P3);
    setDueDate('');
    setSelectedProjectId('');
    setNotify('');
  };
  
  const inputClasses = "w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const selectClasses = `${inputClasses}`;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="space-y-4">
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description..." required className={inputClasses} />
          
          <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className={selectClasses}>
            <option value="">General (No Project)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Assigned to..." className={inputClasses} />
            <input type="text" value={taskType} onChange={e => setTaskType(e.target.value)} placeholder="Task Type (e.g. Dev, QA)..." className={inputClasses} />
            <input type="text" value={notify} onChange={e => setNotify(e.target.value)} placeholder="Notify on completion..." className={inputClasses} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={selectClasses}>
              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} />
          </div>
          
          <button type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
            <PlusIcon className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </form>
      </div>

      <div className="mb-4 flex border-b border-gray-200">
        <button
          onClick={() => setTaskView('active')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskView === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-pressed={taskView === 'active'}
        >
          Active ({activeTasks.length})
        </button>
        <button
          onClick={() => setTaskView('completed')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            taskView === 'completed'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-pressed={taskView === 'completed'}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      <div className="space-y-2">
        {tasksToShow.length > 0 ? tasksToShow.map(task => (
          <div key={task.id} className={`p-3 rounded-md shadow-sm border flex items-start gap-3 transition-colors ${task.status === TaskStatus.Done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <div className="flex-grow">
              <div className="flex justify-between items-start gap-2">
                <p className={`font-medium ${task.status === TaskStatus.Done ? 'text-green-900 line-through' : 'text-gray-800'}`}>
                    {task.description}
                </p>
                <select
                    value={task.status}
                    onChange={(e) => {
                        e.stopPropagation();
                        onUpdateTaskStatus(task.id, e.target.value as TaskStatus);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap border-transparent focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 focus:outline-none appearance-none ${statusColorStyles[task.status]}`}
                    aria-label={`Change status for ${task.description}`}
                >
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                 {task.assignedUser && <span>Assigned to: <span className="font-medium">{task.assignedUser}</span></span>}
                {task.projectName && task.projectName !== 'General' && <span>Project: <span className="font-medium">{task.projectName}</span></span>}
                {task.ticketTitle && <span>Ticket: <span className="font-medium">{task.ticketTitle}</span></span>}
                {task.dueDate && <span>Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span></span>}
                {task.type && <span>Type: <span className="font-medium">{task.type}</span></span>}
                <span>Priority: <span className="font-medium">{task.priority}</span></span>
                {task.notifyOnCompletion && <span>Notify: <span className="font-medium">{task.notifyOnCompletion}</span></span>}
              </div>
               <div className="mt-2 flex items-center gap-3 flex-wrap">
                    {(task.linkedTaskIds?.length || 0) > 0 && <span title={`${task.linkedTaskIds?.length} linked task(s)`} className="flex items-center gap-1 text-green-600"><ChecklistIcon className="w-4 h-4" /><span className="text-xs font-medium">{task.linkedTaskIds?.length}</span></span>}
                    {(task.ticketIds?.length || 0) > 0 && <span title={`${task.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1 text-yellow-600"><ReceiptLongIcon className="w-4 h-4" /><span className="text-xs font-medium">{task.ticketIds?.length}</span></span>}
                    {(task.projectIds?.length || 0) > 0 && <span title={`${task.projectIds?.length} linked project(s)`} className="flex items-center gap-1 text-red-600"><WorkspaceIcon className="w-4 h-4" /><span className="text-xs font-medium">{task.projectIds?.length}</span></span>}
                    {(task.meetingIds?.length || 0) > 0 && <span title={`${task.meetingIds?.length} linked meeting(s)`} className="flex items-center gap-1 text-blue-600"><DocumentTextIcon className="w-4 h-4" /><span className="text-xs font-medium">{task.meetingIds?.length}</span></span>}
                    {(task.dealershipIds?.length || 0) > 0 && <span title={`${task.dealershipIds?.length} linked dealership(s)`} className="flex items-center gap-1 text-gray-600"><AccountBalanceIcon className="w-4 h-4" /><span className="text-xs font-medium">{task.dealershipIds?.length}</span></span>}
                    {(task.featureIds?.length || 0) > 0 && <span title={`${task.featureIds?.length} linked feature(s)`} className="flex items-center gap-1 text-pink-600"><SparklesIcon className="w-4 h-4" /><span className="text-xs font-medium">{task.featureIds?.length}</span></span>}
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onSwitchView('task', task.id)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-blue-500" aria-label={`Edit task ${task.description}`}>
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => onDeleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-red-500" aria-label={`Delete task ${task.description}`}>
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 px-6 bg-white rounded-md shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">No {taskView} tasks found</h3>
            <p className="text-gray-500 mt-2">
                {taskView === 'active' ? 'Add a new task using the form above to get started.' : 'Complete some tasks to see them here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
