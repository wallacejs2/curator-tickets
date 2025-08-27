import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, Ticket, Project, Meeting, Dealership, FeatureAnnouncement, Status, ProjectStatus } from '../../types.ts';
import { XIcon } from '../icons/XIcon.tsx';
import LinkingSection from './LinkingSection.tsx';

interface EditTaskFormProps {
  task: Task & { projectId: string | null };
  onSave: (task: Task) => void;
  onClose: () => void;
  allTasks: (Task & { projectName?: string })[];
  // Add all other entities for linking
  allTickets: Ticket[];
  allProjects: Project[];
  allMeetings: Meeting[];
  allDealerships: Dealership[];
  allFeatures: FeatureAnnouncement[];
  onLink: (toType: string, toId: string) => void;
  onUnlink: (toType: string, toId: string) => void;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ 
    task, 
    onSave, 
    onClose, 
    allTasks,
    allTickets,
    allProjects,
    allMeetings,
    allDealerships,
    allFeatures,
    onLink,
    onUnlink
}) => {
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
    
    // Linked items
    const linkedTickets = allTickets.filter(item => (editedTask.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => (editedTask.projectIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => (editedTask.meetingIds || []).includes(item.id));
    const linkedDealerships = allDealerships.filter(item => (editedTask.dealershipIds || []).includes(item.id));
    const linkedFeatures = allFeatures.filter(item => (editedTask.featureIds || []).includes(item.id));
    const linkedTasks = allTasks.filter(item => (editedTask.linkedTaskIds || []).includes(item.id));
    
    // Available items for linking (filter out completed items)
    const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(editedTask.ticketIds || []).includes(item.id));
    const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(editedTask.projectIds || []).includes(item.id));
    const availableMeetings = allMeetings.filter(item => !(editedTask.meetingIds || []).includes(item.id));
    const availableDealerships = allDealerships.filter(item => !(editedTask.dealershipIds || []).includes(item.id));
    const availableFeatures = allFeatures.filter(item => !(editedTask.featureIds || []).includes(item.id));
    const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && item.id !== task.id && !(editedTask.linkedTaskIds || []).includes(item.id));

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

            <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} />
            <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink('project', id)} onUnlink={(id) => onUnlink('project', id)} />
            <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', id)} onUnlink={(id) => onUnlink('meeting', id)} />
            <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} />
            <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink('feature', id)} onUnlink={(id) => onUnlink('feature', id)} />
            <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
            </div>
        </form>
    );
};

export default EditTaskForm;