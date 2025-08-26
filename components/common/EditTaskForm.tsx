import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types.ts';
import { XIcon } from '../icons/XIcon.tsx';

interface EditTaskFormProps {
  task: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
  allTasks: (Task & { projectName?: string })[];
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSave, onClose, allTasks }) => {
    const [editedTask, setEditedTask] = useState(task);
    const [taskToLink, setTaskToLink] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTask({ ...editedTask, dueDate: e.target.value ? new Date(`${e.target.value}T00:00:00`).toISOString() : undefined });
    };

    const handleLinkTask = () => {
        if (!taskToLink || (editedTask.linkedTaskIds || []).includes(taskToLink)) return;
        setEditedTask(prev => ({ ...prev, linkedTaskIds: [...(prev.linkedTaskIds || []), taskToLink] }));
        setTaskToLink('');
    };
    
    const handleUnlinkTask = (idToUnlink: string) => {
        setEditedTask(prev => ({ ...prev, linkedTaskIds: (prev.linkedTaskIds || []).filter(id => id !== idToUnlink) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedTask);
    };

    const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700";
    
    const potentialLinks = allTasks.filter(t => t.id !== task.id && !(editedTask.linkedTaskIds || []).includes(t.id));

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

            {/* Task Linking Section */}
            <div className="pt-4 border-t border-gray-200">
                <label className={labelClasses}>Linked Tasks</label>
                <div className="flex items-center gap-2 mt-1">
                    <select value={taskToLink} onChange={e => setTaskToLink(e.target.value)} className={`flex-grow ${formElementClasses} mt-0`}>
                        <option value="">Select a task to link...</option>
                        {potentialLinks.map(t => (
                            <option key={t.id} value={t.id}>{t.projectName ? `[${t.projectName}] ` : ''}{t.description}</option>
                        ))}
                    </select>
                    <button type="button" onClick={handleLinkTask} disabled={!taskToLink} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300">Link</button>
                </div>
                 <div className="mt-3 space-y-2">
                    {(editedTask.linkedTaskIds || []).length > 0 ? (editedTask.linkedTaskIds || []).map(linkedId => {
                        const linkedTask = allTasks.find(t => t.id === linkedId);
                        if (!linkedTask) return null;
                        return (
                            <div key={linkedId} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md text-sm">
                                <span className="text-gray-800">{linkedTask.projectName ? `[${linkedTask.projectName}] ` : ''}{linkedTask.description}</span>
                                <button type="button" onClick={() => handleUnlinkTask(linkedId)} className="p-1 text-gray-400 hover:text-red-600 rounded-full" aria-label={`Unlink task ${linkedTask.description}`}>
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    }) : <p className="text-sm text-gray-500 italic mt-2">No tasks are linked yet.</p>}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
            </div>
        </form>
    );
};

export default EditTaskForm;