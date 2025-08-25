
import React, { useState, useMemo } from 'react';
import { Project, Task, TaskPriority, TaskStatus } from '../types.ts';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import Modal from './common/Modal.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';

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

interface TaskListProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

type TaskView = 'active' | 'completed';

const TaskList: React.FC<TaskListProps> = ({ projects, onUpdateProject, tasks, setTasks }) => {
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskType, setTaskType] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.P3);
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const [editingTask, setEditingTask] = useState<(Task & { projectId: string | null }) | null>(null);
  const [taskView, setTaskView] = useState<TaskView>('active');

  const { activeTasks, completedTasks } = useMemo(() => {
    const projectTasks = projects.flatMap(p => 
      p.tasks.map(st => ({
        ...st,
        projectId: p.id,
        projectName: p.name
      }))
    );
    const standaloneTasks = tasks.map(t => ({
        ...t,
        projectId: null,
        projectName: 'General'
    }));
    
    const sortedTasks = [...projectTasks, ...standaloneTasks].sort((a,b) => {
        const aHasDate = !!a.dueDate;
        const bHasDate = !!b.dueDate;
        if (aHasDate && bHasDate) {
            return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
        }
        return aHasDate ? -1 : bHasDate ? 1 : 0;
    });

    return sortedTasks.reduce(
        (acc, task) => {
            if (task.status === TaskStatus.Done) {
                acc.completedTasks.push(task);
            } else {
                acc.activeTasks.push(task);
            }
            return acc;
        },
        { activeTasks: [] as typeof sortedTasks, completedTasks: [] as typeof sortedTasks }
    );
  }, [projects, tasks]);
  
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
      dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : undefined,
    };
    
    if (selectedProjectId) {
      const projectToUpdate = projects.find(p => p.id === selectedProjectId);
      if (projectToUpdate) {
          const updatedProject = {
              ...projectToUpdate,
              tasks: [...projectToUpdate.tasks, newTask]
          };
          onUpdateProject(updatedProject);
      }
    } else {
      setTasks(prev => [...prev, newTask]);
    }
    
    setDescription('');
    setAssignedTo('');
    setTaskType('');
    setPriority(TaskPriority.P3);
    setDueDate('');
    setSelectedProjectId('');
  };

  const handleUpdateTask = (updatedTask: Task) => {
      if (!editingTask) return;

      if (editingTask.projectId) {
          const project = projects.find(p => p.id === editingTask!.projectId);
          if (project) {
              const updatedTasks = project.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
              onUpdateProject({ ...project, tasks: updatedTasks });
          }
      } else {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      }

      setEditingTask(null);
  };
  
  const handleDeleteTask = (taskToDelete: Task & { projectId: string | null }) => {
      if (!window.confirm("Are you sure you want to delete this task?")) return;
      
      if (taskToDelete.projectId) {
          const project = projects.find(p => p.id === taskToDelete.projectId);
          if (project) {
              const updatedTasks = project.tasks.filter(t => t.id !== taskToDelete.id);
              onUpdateProject({ ...project, tasks: updatedTasks });
          }
      } else {
          setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      }
  };
  
  const handleStatusChange = (taskToUpdate: Task & { projectId: string | null }) => {
      if (taskToUpdate.projectId) {
        const project = projects.find(p => p.id === taskToUpdate.projectId);
        if (project) {
          const updatedTasks = project.tasks.map(t =>
            t.id === taskToUpdate.id
                ? { ...t, status: t.status === TaskStatus.Done ? TaskStatus.ToDo : TaskStatus.Done }
                : t
          );
          onUpdateProject({ ...project, tasks: updatedTasks });
        }
      } else {
        setTasks(prevTasks => prevTasks.map(t => 
            t.id === taskToUpdate.id 
                ? { ...t, status: t.status === TaskStatus.Done ? TaskStatus.ToDo : TaskStatus.Done }
                : t
        ));
      }
  };
  
  const inputClasses = "w-full p-2.5 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const selectClasses = `${inputClasses}`;

  return (
    <div>
      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
            <EditTaskForm task={editingTask} onSave={handleUpdateTask} onClose={() => setEditingTask(null)} />
        </Modal>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
        <form onSubmit={handleAddTask} className="space-y-4">
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description..." required className={inputClasses} />
          
          <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className={selectClasses}>
            <option value="">General (No Project)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Assigned to..." className={inputClasses} />
            <input type="text" value={taskType} onChange={e => setTaskType(e.target.value)} placeholder="Task Type (e.g. Dev, QA)..." className={inputClasses} />
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
            <input
              type="checkbox"
              checked={task.status === TaskStatus.Done}
              onChange={() => handleStatusChange(task)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0 mt-1"
              aria-label={`Mark task ${task.description} as complete`}
            />
            <div className="flex-grow">
              <p className={`font-medium ${task.status === TaskStatus.Done ? 'text-green-900' : 'text-gray-800'}`}>
                {task.description}
              </p>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                 {task.assignedUser && <span>Assigned to: <span className="font-medium">{task.assignedUser}</span></span>}
                {task.projectName && <span>Project: <span className="font-medium">{task.projectName}</span></span>}
                {task.dueDate && <span>Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span></span>}
                {task.type && <span>Type: <span className="font-medium">{task.type}</span></span>}
                <span>Priority: <span className="font-medium">{task.priority}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setEditingTask(task)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-blue-500" aria-label={`Edit task ${task.description}`}>
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteTask(task)} className="p-2 text-gray-400 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-red-500" aria-label={`Delete task ${task.description}`}>
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
