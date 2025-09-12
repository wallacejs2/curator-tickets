import React, { useState, useEffect } from 'react';
import { STATUS_OPTIONS, ISSUE_PRIORITY_OPTIONS, FEATURE_REQUEST_PRIORITY_OPTIONS } from '../constants.ts';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus, TaskPriority, Shopper } from '../types.ts';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import Modal from './common/Modal.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { LinkIcon } from './icons/LinkIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';

// Define EntityType for linking
type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'shopper';


const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || 'N/A'}</p>
  </div>
);

const formElementClasses = "mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
const labelClasses = "block text-sm font-medium text-gray-700";

const FormSection: React.FC<{ title: string; children: React.ReactNode, gridCols?: number, className?: string }> = ({ title, children, gridCols = 2, className }) => (
  <fieldset className={`mb-6 ${className}`}>
    <legend className="text-md font-semibold text-gray-800 pb-2 mb-5 border-b border-gray-200 w-full">
      {title}
    </legend>
    <div className={`grid grid-cols-1 sm:grid-cols-${gridCols} gap-x-6 gap-y-5`}>
      {children}
    </div>
  </fieldset>
);

const tagColorStyles: Record<string, string> = {
  // Priority
  [Priority.P1]: 'bg-red-200 text-red-800',
  [Priority.P2]: 'bg-orange-200 text-orange-800',
  [Priority.P3]: 'bg-amber-200 text-amber-800',
  [Priority.P4]: 'bg-yellow-200 text-yellow-800',
  [Priority.P5]: 'bg-green-200 text-green-800',
  [Priority.P8]: 'bg-blue-200 text-blue-800',
  // Status
  [Status.NotStarted]: 'bg-gray-300 text-gray-800',
  [Status.InProgress]: 'bg-blue-300 text-blue-900',
  [Status.OnHold]: 'bg-[#ffcd85] text-stone-800',
  [Status.InReview]: 'bg-[#fff494] text-stone-800',
  [Status.DevReview]: 'bg-[#fff494] text-stone-800',
  [Status.PmdReview]: 'bg-[#fff494] text-stone-800',
  [Status.Testing]: 'bg-orange-300 text-orange-900',
  [Status.Completed]: 'bg-[#44C064] text-white',
  // TicketType
  [TicketType.Issue]: 'bg-rose-200 text-rose-800',
  [TicketType.FeatureRequest]: 'bg-teal-200 text-teal-800',
  // ProductArea
  [ProductArea.Reynolds]: 'bg-[#10437C] text-white',
  [ProductArea.Fullpath]: 'bg-[#EADEFF] text-[#242424]',
  // Platform
  [Platform.Curator]: 'bg-pink-600 text-white',
  [Platform.UCP]: 'bg-sky-600 text-white',
  [Platform.FOCUS]: 'bg-orange-500 text-white',
};

const DetailTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[value] || 'bg-gray-200 text-gray-800'}`}>
      {value}
    </span>
  </div>
);

interface TicketDetailViewProps { 
    ticket: Ticket, 
    onUpdate: (ticket: Ticket) => void, 
    onAddUpdate: (comment: string, author: string, date: string) => void, 
    onEditUpdate: (updatedUpdate: Update) => void;
    onDeleteUpdate: (updateId: string) => void;
    onExport: () => void, 
    onEmail: () => void, 
    onDelete: (ticketId: string) => void, 
    isReadOnly?: boolean;
    showToast: (message: string, type: 'success' | 'error') => void;
    
    // All entities for linking
    allTickets: Ticket[];
    allProjects: Project[];
    allTasks: (Task & { projectName?: string; projectId: string | null; })[];
    allMeetings: Meeting[];
    allDealerships: Dealership[];
    allFeatures: FeatureAnnouncement[];
    allShoppers: Shopper[];

    // Linking handlers
    onLink: (toType: EntityType, toId: string) => void;
    onUnlink: (toType: EntityType, toId: string) => void;
    onSwitchView: (type: EntityType, id: string) => void;
}

const TicketDetailView = ({ 
    ticket, onUpdate, onAddUpdate, onEditUpdate, onDeleteUpdate, onExport, onEmail, onDelete, isReadOnly = false,
    showToast,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures, allShoppers,
    onLink, onUnlink, onSwitchView
 }: TicketDetailViewProps) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTicket, setEditableTicket] = useState<Ticket>(ticket);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState('');
  
  // State for new task form
  const [newDescription, setNewDescription] = useState('');
  const [newAssignedUser, setNewAssignedUser] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.P3);
  const [newType, setNewType] = useState('');
  const [newNotify, setNewNotify] = useState('');

  // Drag-and-drop state for tasks
  const dragItem = React.useRef<string | null>(null);
  const dragOverItem = React.useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const MAX_COMMENT_LENGTH = 2000;

  useEffect(() => {
    setEditableTicket(ticket);
    if (isEditing && ticket.id !== editableTicket.id) {
        setIsEditing(false);
    }
  }, [ticket]);

  const ticketTasks = ticket.tasks || [];

  // Linked items
  const linkedTickets = allTickets.filter(item => item.id !== ticket.id && (ticket.linkedTicketIds || []).includes(item.id));
  const linkedProjects = allProjects.filter(item => (ticket.projectIds || []).includes(item.id));
  const linkedTasks = allTasks.filter(item => (ticket.taskIds || []).includes(item.id));
  const linkedMeetings = allMeetings.filter(item => (ticket.meetingIds || []).includes(item.id));
  const linkedDealerships = allDealerships.filter(item => (ticket.dealershipIds || []).includes(item.id));
  const linkedFeatures = allFeatures.filter(item => (ticket.featureIds || []).includes(item.id));
  const linkedShoppers = allShoppers.filter(item => (ticket.shopperIds || []).includes(item.id));

  // Available items for linking (filter out completed items)
  const availableTickets = allTickets.filter(item => item.status !== Status.Completed && item.id !== ticket.id && !(ticket.linkedTicketIds || []).includes(item.id));
  const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(ticket.projectIds || []).includes(item.id));
  const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !(ticket.taskIds || []).includes(item.id));
  const availableMeetings = allMeetings.filter(item => !(ticket.meetingIds || []).includes(item.id));
  const availableDealerships = allDealerships.filter(item => !(ticket.dealershipIds || []).includes(item.id));
  const availableFeatures = allFeatures.filter(item => !(ticket.featureIds || []).includes(item.id));
  const availableShoppers = allShoppers.filter(item => !(ticket.shopperIds || []).includes(item.id));


  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim() && updateDate) {
      // Convert newlines to <br> tags for HTML rendering
      const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
      onAddUpdate(commentAsHtml, authorName, updateDate);
      setNewUpdate('');
    }
  };
  
  const handleSave = () => {
      const ticketToSave: Ticket = { ...editableTicket };

      const reviewStatuses = [Status.InReview, Status.DevReview, Status.PmdReview];
      if (ticketToSave.status !== Status.OnHold && ![...reviewStatuses, Status.Testing].includes(ticketToSave.status)) {
          delete ticketToSave.onHoldReason;
      }
      if (ticketToSave.status !== Status.Completed) {
          delete ticketToSave.completionNotes;
      }

      onUpdate(ticketToSave);
      setIsEditing(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'type') {
            newState.priority = value === TicketType.Issue ? Priority.P3 : Priority.P3;
        }
        return newState;
    });
  };

  const handleCopyInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    let content = `TICKET DETAILS: ${ticket.title}\n`;
    content += `==================================================\n`;

    const appendField = (label: string, value: any) => {
        if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            content += `${label}: ${value}\n`;
        }
    };
    const appendDateField = (label: string, value: any) => {
        if (value) {
            content += `${label}: ${new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' })}\n`;
        }
    };
    const appendSection = (title: string) => {
        content += `\n--- ${title.toUpperCase()} ---\n`;
    };
    const appendTextArea = (label: string, value: any) => {
         if (value) {
            content += `${label}:\n${value}\n`;
        }
    };
   
    appendField('Product Area', ticket.productArea);
    appendField('Platform', ticket.platform);
    appendField('Location', ticket.location);
    appendField('Type', ticket.type);
    appendField('Status', ticket.status);
    appendField('Priority', ticket.priority);
    appendDateField('Start Date', ticket.startDate);
    appendField('On Hold Reason', ticket.onHoldReason);
    appendDateField('Completion Date', ticket.completionDate);
    appendTextArea('Completion Notes', ticket.completionNotes);
    
    appendSection('Tracking & Ownership');
    appendField('Submitter', ticket.submitterName);
    appendField('Client', ticket.client);
    appendField('PMR Number', ticket.pmrNumber);
    appendField('PMR Link', ticket.pmrLink);
    appendField('FP Ticket Number', ticket.fpTicketNumber);
    appendField('Ticket Thread ID', ticket.ticketThreadId);

    if (ticket.type === TicketType.Issue) {
        const issue = ticket as IssueTicket;
        appendSection('Issue Details');
        appendTextArea('Problem', issue.problem);
        appendTextArea('Duplication Steps', issue.duplicationSteps);
        appendTextArea('Workaround', issue.workaround);
        appendTextArea('Frequency', issue.frequency);
    } else {
        const feature = ticket as FeatureRequestTicket;
        appendSection('Feature Request Details');
        appendTextArea('Improvement', feature.improvement);
        appendTextArea('Current Functionality', feature.currentFunctionality);
        appendTextArea('Suggested Solution', feature.suggestedSolution);
        appendTextArea('Benefits', feature.benefits);
    }

    if (ticket.updates && ticket.updates.length > 0) {
        appendSection(`Updates (${ticket.updates.length})`);
        ticket.updates.forEach(update => {
            const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n').trim();
            content += `[${new Date(update.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
        });
        content = content.trimEnd() + '\n';
    }

    appendSection('Linked Item IDs');
    const linkedItemsContent = [
        { label: 'Project IDs', ids: ticket.projectIds },
        { label: 'Linked Ticket IDs', ids: ticket.linkedTicketIds },
        { label: 'Meeting IDs', ids: ticket.meetingIds },
        { label: 'Task IDs', ids: ticket.taskIds },
        { label: 'Dealership IDs', ids: ticket.dealershipIds },
        { label: 'Feature IDs', ids: ticket.featureIds },
        { label: 'Shopper IDs', ids: ticket.shopperIds },
    ]
    .map(({ label, ids }) => {
        if (ids && ids.length > 0) {
            return `${label}: ${(ids || []).join(', ')}`;
        }
        return null;
    })
    .filter(Boolean)
    .join('\n');
    
    if(linkedItemsContent) {
        content += linkedItemsContent;
    }
    
    navigator.clipboard.writeText(content.trim());
    showToast('Ticket info copied!', 'success');
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => {
      // submissionDate is a required field, prevent it from being cleared by reverting to previous state if empty.
      if (name === 'submissionDate') {
        return { ...prev, submissionDate: value ? new Date(`${value}T00:00:00`).toISOString() : prev.submissionDate }
      }
      return {
        ...prev,
        [name]: value ? new Date(`${value}T00:00:00`).toISOString() : undefined,
      };
    });
  };

  const handleNewTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDescription.trim()) {
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
            ticketIds: [ticket.id],
        };
        const updatedTicket = { ...ticket, tasks: [...ticketTasks, newTask] };
        onUpdate(updatedTicket);
        // Reset form
        setNewDescription('');
        setNewAssignedUser('');
        setNewDueDate('');
        setNewPriority(TaskPriority.P3);
        setNewType('');
        setNewNotify('');
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
    const updatedTasks = toggleRecursively(ticketTasks);
    onUpdate({ ...ticket, tasks: updatedTasks });
  };

  const handleTaskDelete = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        const deleteRecursively = (tasks: Task[]): Task[] => {
            return tasks.filter(task => {
                if (task.id === taskId) return false;
                if (task.subTasks) {
                    task.subTasks = deleteRecursively(task.subTasks);
                }
                return true;
            });
        };
        const updatedTasks = deleteRecursively(ticketTasks);
        onUpdate({ ...ticket, tasks: updatedTasks });
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

      const tasksCopy = [...ticketTasks];
      const dragItemIndex = tasksCopy.findIndex(task => task.id === dragItem.current);
      const dragOverItemIndex = tasksCopy.findIndex(task => task.id === dragOverItem.current);

      const [reorderedItem] = tasksCopy.splice(dragItemIndex, 1);
      tasksCopy.splice(dragOverItemIndex, 0, reorderedItem);

      onUpdate({ ...ticket, tasks: tasksCopy });
      handleDragEnd();
  };

  const renderViewMode = () => {
    const reviewStatuses = [Status.InReview, Status.DevReview, Status.PmdReview];
    let reasonText: string | undefined;
    let reasonLabel: string | undefined;
    let reasonContainerStyle: string | undefined;

    if (ticket.status === Status.Completed) {
        reasonText = ticket.completionNotes;
        reasonLabel = "Completion Notes";
        reasonContainerStyle = "bg-green-50 border-green-200 text-green-800";
    } else if (ticket.status === Status.OnHold) {
        reasonText = ticket.onHoldReason;
        reasonLabel = "Reason for 'On Hold'";
        reasonContainerStyle = "bg-yellow-50 border-yellow-200 text-yellow-800";
    } else if ([...reviewStatuses, Status.Testing].includes(ticket.status)) {
        reasonText = ticket.onHoldReason;
        reasonLabel = `Reason for '${ticket.status}'`;
        reasonContainerStyle = "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
    
    return (
    <>
      <FormSection title="Core Information" gridCols={3}>
        <DetailTag label="Type" value={ticket.type} />
        <DetailTag label="Status" value={ticket.status} />
        <DetailTag label="Priority" value={ticket.priority} />
        <DetailTag label="Product Area" value={ticket.productArea} />
        <DetailTag label="Platform" value={ticket.platform} />
        <DetailField label="Location" value={ticket.location} />
        {reasonText && reasonLabel && (
          <div className="col-span-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{reasonLabel}</h4>
              <p className={`mt-1 p-3 rounded-md text-sm border ${reasonContainerStyle}`}>{reasonText}</p>
          </div>
        )}
      </FormSection>

      <FormSection title="Dates" gridCols={3}>
        <DetailField label="Submission Date" value={new Date(ticket.submissionDate).toLocaleDateString(undefined, { timeZone: 'UTC' })} />
        <DetailField label="Start Date" value={ticket.startDate ? new Date(ticket.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'} />
        <DetailField label="Est. Completion Date" value={ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'} />
        {ticket.status === Status.Completed && <DetailField label="Completion Date" value={ticket.completionDate ? new Date(ticket.completionDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'} />}
      </FormSection>
      
      <FormSection title="Tracking & Ownership">
        <DetailField label="Submitter" value={ticket.submitterName} />
        <DetailField label="Client" value={ticket.client} />
        <DetailField label="PMR Number" value={
            <>
              {ticket.pmrNumber || 'N/A'}
              {ticket.pmrLink && (
                  <a href={ticket.pmrLink} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold text-blue-600 hover:underline">
                      Visit PMR
                  </a>
              )}
            </>
        } />
        <DetailField label="FP Ticket Number" value={ticket.fpTicketNumber} />
        <div className="col-span-2"><DetailField label="Ticket Thread ID" value={ticket.ticketThreadId} /></div>
      </FormSection>

      {ticket.type === TicketType.Issue && (
        <FormSection title="Issue Information">
            <div className="col-span-2"><DetailField label="Problem" value={(ticket as IssueTicket).problem} /></div>
            <div className="col-span-2"><DetailField label="Duplication Steps" value={(ticket as IssueTicket).duplicationSteps} /></div>
            <div className="col-span-2"><DetailField label="Workaround" value={(ticket as IssueTicket).workaround} /></div>
            <div className="col-span-2"><DetailField label="Frequency" value={(ticket as IssueTicket).frequency} /></div>
        </FormSection>
      )}
      {ticket.type === TicketType.FeatureRequest && (
        <FormSection title="Feature Request Information">
            <div className="col-span-2"><DetailField label="Improvement" value={(ticket as FeatureRequestTicket).improvement} /></div>
            <div className="col-span-2"><DetailField label="Current Functionality" value={(ticket as FeatureRequestTicket).currentFunctionality} /></div>
            <div className="col-span-2"><DetailField label="Suggested Solution" value={(ticket as FeatureRequestTicket).suggestedSolution} /></div>
            <div className="col-span-2"><DetailField label="Benefits" value={(ticket as FeatureRequestTicket).benefits} /></div>
        </FormSection>
      )}
    </>
  )};

  const renderEditMode = () => {
    const reviewStatuses = [Status.InReview, Status.DevReview, Status.PmdReview];
    const statusesWithReason = [Status.OnHold, Status.Completed, Status.Testing, ...reviewStatuses];
    const currentStatusHasReason = statusesWithReason.includes(editableTicket.status);
    const reasonField = editableTicket.status === Status.Completed ? 'completionNotes' : 'onHoldReason';
    const reasonValue = editableTicket.status === Status.Completed ? (editableTicket as FeatureRequestTicket).completionNotes : editableTicket.onHoldReason;

    const getReasonLabel = (status: Status) => {
        if (status === Status.Completed) return 'Reason for Completion';
        return `Reason for ${status}`;
    };

    return (
     <>
        <FormSection title="Core Information" gridCols={3}>
            <div className="col-span-3">
              <label className={labelClasses}>Title</label>
              <input type="text" name="title" value={editableTicket.title} onChange={handleFormChange} required className={formElementClasses} />
            </div>
            <div><label className={labelClasses}>Type</label><select name="type" value={editableTicket.type} onChange={handleFormChange} className={formElementClasses}>{Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className={labelClasses}>Status</label><select name="status" value={editableTicket.status} onChange={handleFormChange} className={formElementClasses}>{STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
            <div><label className={labelClasses}>Priority</label><select name="priority" value={editableTicket.priority} onChange={handleFormChange} className={formElementClasses}>{(editableTicket.type === TicketType.Issue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS).map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
            <div><label className={labelClasses}>Product Area</label><select name="productArea" value={editableTicket.productArea} onChange={handleFormChange} className={formElementClasses}>{Object.values(ProductArea).map(pa => <option key={pa} value={pa}>{pa}</option>)}</select></div>
            <div><label className={labelClasses}>Platform</label><select name="platform" value={editableTicket.platform} onChange={handleFormChange} className={formElementClasses}>{Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="col-span-3"><label className={labelClasses}>Location</label><input type="text" name="location" value={editableTicket.location} onChange={handleFormChange} required className={formElementClasses}/></div>
            {currentStatusHasReason && (
              <div className="col-span-3">
                <label className={labelClasses}>{getReasonLabel(editableTicket.status)}</label>
                <textarea name={reasonField} value={reasonValue || ''} onChange={handleFormChange} rows={2} required className={formElementClasses} placeholder={`Explain why this ticket is ${editableTicket.status}...`}/>
              </div>
            )}
        </FormSection>
        
        <FormSection title="Dates" gridCols={3}>
            <div><label className={labelClasses}>Submission Date</label><input type="date" name="submissionDate" value={editableTicket.submissionDate.split('T')[0] || ''} onChange={handleDateChange} required className={formElementClasses} /></div>
            <div><label className={labelClasses}>Start Date</label><input type="date" name="startDate" value={editableTicket.startDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} /></div>
            <div><label className={labelClasses}>Est. Completion Date</label><input type="date" name="estimatedCompletionDate" value={editableTicket.estimatedCompletionDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} /></div>
            {editableTicket.status === Status.Completed && (<div><label className={labelClasses}>Completion Date</label><input type="date" name="completionDate" value={editableTicket.completionDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} /></div>)}
        </FormSection>
        
        <FormSection title="Tracking & Ownership">
            <div><label className={labelClasses}>Submitter</label><input type="text" name="submitterName" value={editableTicket.submitterName} onChange={handleFormChange} required className={formElementClasses}/></div>
            <div><label className={labelClasses}>Client</label><input type="text" name="client" value={editableTicket.client || ''} onChange={handleFormChange} className={formElementClasses}/></div>
            <div>
                <label className={labelClasses}>PMR Number</label>
                <input type="text" name="pmrNumber" value={editableTicket.pmrNumber || ''} onChange={handleFormChange} className={formElementClasses}/>
            </div>
            <div>
                <label className={labelClasses}>PMR Link</label>
                <input type="url" name="pmrLink" value={editableTicket.pmrLink || ''} onChange={handleFormChange} placeholder="https://..." className={formElementClasses}/>
            </div>
            <div>
                <label className={labelClasses}>FP Ticket Number</label>
                <input type="text" name="fpTicketNumber" value={editableTicket.fpTicketNumber || ''} onChange={handleFormChange} className={formElementClasses}/>
            </div>
            <div />
            <div className="col-span-2"><label className={labelClasses}>Ticket Thread ID</label><input type="text" name="ticketThreadId" value={editableTicket.ticketThreadId || ''} onChange={handleFormChange} className={formElementClasses}/></div>
        </FormSection>

        {editableTicket.type === TicketType.Issue && (
          <FormSection title="Issue Details">
              <div className="col-span-2"><label className={labelClasses}>Problem</label><textarea name="problem" value={(editableTicket as IssueTicket).problem} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
              <div className="col-span-2"><label className={labelClasses}>Duplication Steps</label><textarea name="duplicationSteps" value={(editableTicket as IssueTicket).duplicationSteps} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
              <div className="col-span-2"><label className={labelClasses}>Workaround</label><textarea name="workaround" value={(editableTicket as IssueTicket).workaround} onChange={handleFormChange} rows={2} className={formElementClasses}></textarea></div>
              <div className="col-span-2"><label className={labelClasses}>Frequency</label><textarea name="frequency" value={(editableTicket as IssueTicket).frequency} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
          </FormSection>
        )}
        {editableTicket.type === TicketType.FeatureRequest && (
          <FormSection title="Feature Request Details">
              <div className="col-span-2"><label className={labelClasses}>Improvement</label><textarea name="improvement" value={(editableTicket as FeatureRequestTicket).improvement} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
              <div className="col-span-2"><label className={labelClasses}>Current Functionality</label><textarea name="currentFunctionality" value={(editableTicket as FeatureRequestTicket).currentFunctionality} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
              <div className="col-span-2"><label className={labelClasses}>Suggested Solution</label><textarea name="suggestedSolution" value={(editableTicket as FeatureRequestTicket).suggestedSolution} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
              <div className="col-span-2"><label className={labelClasses}>Benefits</label><textarea name="benefits" value={(editableTicket as FeatureRequestTicket).benefits} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
          </FormSection>
        )}
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={handleSave} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
        </div>
     </>
  )};

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
                    {task.assignedUser && <span>To: <span className="font-medium">{task.assignedUser}</span></span>}
                    {task.dueDate && <span>Due: <span className="font-medium">{new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span></span>}
                    {task.type && <span>Type: <span className="font-medium">{task.type}</span></span>}
                    <span>Priority: <span className="font-medium">{task.priority}</span></span>
                    {task.notifyOnCompletion && <span>Notify: <span className="font-medium">{task.notifyOnCompletion}</span></span>}
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
            <p className="text-gray-700">Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button onClick={() => onDelete(ticket.id)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Ticket</button>
            </div>
        </Modal>
      )}

      {!isEditing && !isReadOnly && (
        <div className="flex justify-end items-center gap-3 mb-6">
            <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm">
                <ContentCopyIcon className="w-4 h-4"/>
                <span>Copy Info</span>
            </button>
            <button onClick={onEmail} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"><span>Email</span></button>
            <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm">
                <DownloadIcon className="w-4 h-4"/>
                <span>Export</span>
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
            <button onClick={() => { setEditableTicket(ticket); setIsEditing(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
        </div>
      )}
      
      <div className="space-y-6">
        {isEditing ? renderEditMode() : renderViewMode()}
      </div>
      
      {!isReadOnly && (
        <>
            <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Ticket Tasks ({ticketTasks.length})</h3>
                
                <div className="space-y-2">
                    {ticketTasks.length > 0 ? ticketTasks.map(task => (
                        <TaskItem key={task.id} task={task} level={0} />
                    )) : (
                        <p className="text-sm text-gray-500 italic">No tasks have been added to this ticket yet.</p>
                    )}
                </div>

                <form onSubmit={handleNewTaskSubmit} className="space-y-3 mt-4 p-3 bg-gray-50 rounded-md border">
                    <input type="text" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="New task description..." required className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" value={newAssignedUser} onChange={e => setNewAssignedUser(e.target.value)} placeholder="Assignee..." className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                        <input type="text" value={newNotify} onChange={e => setNewNotify(e.target.value)} placeholder="Notify on completion..." className="w-full text-sm p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,auto,auto] gap-3 items-center">
                        <input type="text" value={newType} onChange={e => setNewType(e.target.value)} placeholder="Type (e.g., Dev)" className="text-sm p-2 border border-gray-300 rounded-md"/>
                        <select value={newPriority} onChange={e => setNewPriority(e.target.value as TaskPriority)} className="text-sm p-2 border border-gray-300 rounded-md bg-white h-full">
                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="text-sm p-2 border border-gray-300 rounded-md"/>
                        <button type="submit" aria-label="Add Task" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 ring-blue-500 flex justify-center items-center h-full">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({ticket.updates?.length || 0})</h3>
                    <form onSubmit={handleUpdateSubmit} className="p-4 border border-gray-200 rounded-md mb-6 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                    <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                    <textarea 
                        value={newUpdate} 
                        onChange={e => setNewUpdate(e.target.value)}
                        placeholder="Type your comment here..."
                        required
                        rows={4}
                        className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={MAX_COMMENT_LENGTH}
                    />
                    <div className="flex justify-between items-center">
                        <p id="char-count" className="text-xs text-gray-500">{newUpdate.length} / {MAX_COMMENT_LENGTH}</p>
                        <button 
                            type="submit" 
                            disabled={!newUpdate.trim() || !authorName.trim() || newUpdate.length > MAX_COMMENT_LENGTH} 
                            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm">
                            Add Update
                        </button>
                    </div>
                    </form>
                <div className="space-y-4">
                {[...(ticket.updates || [])].reverse().map((update) => (
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

            <LinkingSection title="Linked Shoppers" itemTypeLabel="shopper" linkedItems={linkedShoppers} availableItems={availableShoppers} onLink={(id) => onLink('shopper', id)} onUnlink={(id) => onUnlink('shopper', id)} onItemClick={(id) => onSwitchView('shopper', id)} />
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

export default TicketDetailView;