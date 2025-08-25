
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task } from './types.ts';
import TicketList from './components/TicketList.tsx';
import TicketForm from './components/TicketForm.tsx';
import LeftSidebar from './components/FilterBar.tsx';
import SideView from './components/common/SideView.tsx';
import { PencilIcon } from './components/icons/PencilIcon.tsx';
import PerformanceInsights from './components/PerformanceInsights.tsx';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { MenuIcon } from './components/icons/MenuIcon.tsx';
import { STATUS_OPTIONS, ISSUE_PRIORITY_OPTIONS, FEATURE_REQUEST_PRIORITY_OPTIONS } from './constants.ts';
import { TrashIcon } from './components/icons/TrashIcon.tsx';
import Modal from './components/common/Modal.tsx';
import { EmailIcon } from './components/icons/EmailIcon.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { initialTickets, initialProjects, initialDealerships, initialTasks } from './mockData.ts';
import { UploadIcon } from './components/icons/UploadIcon.tsx';
import ProjectList from './components/ProjectList.tsx';
import ProjectDetailView from './components/ProjectDetailView.tsx';
import ProjectForm from './components/ProjectForm.tsx';
import DealershipList from './components/DealershipList.tsx';
import DealershipDetailView from './components/DealershipDetailView.tsx';
import DealershipInsights from './components/DealershipInsights.tsx';
import { useToast } from './hooks/useToast.ts';
import Toast from './components/common/Toast.tsx';
import DealershipForm from './components/DealershipForm.tsx';
import TaskList from './components/TaskList.tsx';


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

const TicketDetailView = ({ ticket, onUpdate, onAddUpdate, onExport, onEmail, onUpdateCompletionNotes, onDelete, projects }: { ticket: Ticket, onUpdate: (ticket: Ticket) => void, onAddUpdate: (comment: string, author: string) => void, onExport: () => void, onEmail: () => void, onUpdateCompletionNotes: (notes: string) => void, onDelete: (ticketId: string) => void, projects: Project[] }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(ticket.completionNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editableTicket, setEditableTicket] = useState<Ticket>(ticket);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setEditableTicket(ticket);
    setIsEditing(false); // Exit edit mode if the selected ticket changes
  }, [ticket]);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim()) {
      onAddUpdate(newUpdate.trim(), authorName.trim());
      setNewUpdate('');
    }
  };
  
  const handleSaveNotes = () => {
    onUpdateCompletionNotes(completionNotes);
    setIsEditingNotes(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => {
        const newState = { ...prev!, [name]: value };
        if (name === 'type') {
          // If the current priority is not valid for the new type, reset it to a default.
          const currentPriority = newState.priority;
          const isIssue = value === TicketType.Issue;
          const validPriorities = isIssue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS;
          if (!validPriorities.includes(currentPriority as Priority)) {
              newState.priority = isIssue ? Priority.P3 : Priority.P5;
          }
        }
        return newState;
    });
  };
  
  const handleSave = () => {
    const toSafeISOString = (dateString: string | undefined) => {
      if (!dateString) return undefined;
      // If it's just a date string (from date input), add time to parse as local date
      if (!dateString.includes('T')) {
        return new Date(`${dateString}T00:00:00`).toISOString();
      }
      // Otherwise, it's likely already an ISO string, just re-parse to be safe
      return new Date(dateString).toISOString();
    };

    let finalTicket = {
      ...editableTicket,
      startDate: toSafeISOString(editableTicket.startDate),
      estimatedCompletionDate: toSafeISOString(editableTicket.estimatedCompletionDate),
    };
    
    if (finalTicket.projectId === '') finalTicket.projectId = undefined;

    onUpdate(finalTicket);
    setIsEditing(false);
  };
  
  const projectName = ticket.projectId ? (projects.find(p => p.id === ticket.projectId)?.name || 'N/A') : 'None';

  if (isEditing) {
    const issueTicket = editableTicket as IssueTicket;
    const featureRequestTicket = editableTicket as FeatureRequestTicket;
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="flex justify-end items-center gap-3 mb-6">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Save Changes</button>
            </div>
             <FormSection title="Core Information">
                <div className="col-span-2">
                    <label className={labelClasses}>Title</label>
                    <input type="text" name="title" value={editableTicket.title} onChange={handleFormChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Submitter Name</label>
                    <input type="text" name="submitterName" value={editableTicket.submitterName} onChange={handleFormChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Client</label>
                    <input type="text" name="client" value={editableTicket.client || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Location of Feature/Issue</label>
                    <input type="text" name="location" value={editableTicket.location} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
             </FormSection>

             <FormSection title="Categorization" gridCols={3}>
                <div>
                    <label className={labelClasses}>Type</label>
                    <select name="type" value={editableTicket.type} onChange={handleFormChange} className={formElementClasses}>
                        {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Product Area</label>
                    <select name="productArea" value={editableTicket.productArea} onChange={handleFormChange} className={formElementClasses}>
                        {Object.values(ProductArea).map(pa => <option key={pa} value={pa}>{pa}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Platform</label>
                    <select name="platform" value={editableTicket.platform} onChange={handleFormChange} className={formElementClasses}>
                        {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
             </FormSection>

             <FormSection title="Tracking & Status">
                 <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" value={editableTicket.status} onChange={handleFormChange} className={formElementClasses}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select name="priority" value={editableTicket.priority} onChange={handleFormChange} className={formElementClasses}>
                        {(editableTicket.type === TicketType.Issue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClasses}>Start Date</label>
                    <input type="date" name="startDate" value={editableTicket.startDate?.split('T')[0] || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                 <div>
                    <label className={labelClasses}>Est. Completion</label>
                    <input type="date" name="estimatedCompletionDate" value={editableTicket.estimatedCompletionDate?.split('T')[0] || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Project</label>
                    <select name="projectId" value={editableTicket.projectId || ''} onChange={handleFormChange} className={formElementClasses}>
                        <option value="">None</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 {editableTicket.status === Status.OnHold && (
                    <div className="col-span-2">
                        <label htmlFor="onHoldReason" className={labelClasses}>Reason for On Hold Status</label>
                        <textarea id="onHoldReason" name="onHoldReason" value={editableTicket.onHoldReason || ''} onChange={handleFormChange} rows={2} required className={formElementClasses} placeholder="Explain why this ticket is on hold..." />
                    </div>
                )}
             </FormSection>

            <FormSection title="External Identifiers" gridCols={2}>
                <div>
                    <label className={labelClasses}>PMR Number</label>
                    <input type="text" name="pmrNumber" value={editableTicket.pmrNumber || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>FP Ticket Number</label>
                    <input type="text" name="fpTicketNumber" value={editableTicket.fpTicketNumber || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Ticket Thread ID</label>
                    <input type="text" name="ticketThreadId" value={editableTicket.ticketThreadId || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
            </FormSection>
            
            <FormSection title={editableTicket.type === TicketType.Issue ? 'Issue Details' : 'Feature Request Details'} gridCols={1}>
                {editableTicket.type === TicketType.Issue ? (
                    <div className="space-y-5">
                        <div><label className={labelClasses}>Problem</label><textarea name="problem" value={issueTicket.problem} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div><label className={labelClasses}>Duplication Steps</label><textarea name="duplicationSteps" value={issueTicket.duplicationSteps} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div><label className={labelClasses}>Workaround</label><textarea name="workaround" value={issueTicket.workaround} onChange={handleFormChange} rows={2} className={formElementClasses}></textarea></div>
                        <div><label className={labelClasses}>Frequency</label><textarea name="frequency" value={issueTicket.frequency} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                    </div>
                ) : (
                    <div className="space-y-5">
                            <div><label className={labelClasses}>Improvement</label><textarea name="improvement" value={featureRequestTicket.improvement} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                            <div><label className={labelClasses}>Current Functionality</label><textarea name="currentFunctionality" value={featureRequestTicket.currentFunctionality} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                            <div><label className={labelClasses}>Suggested Solution</label><textarea name="suggestedSolution" value={featureRequestTicket.suggestedSolution} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                            <div><label className={labelClasses}>Benefits</label><textarea name="benefits" value={featureRequestTicket.benefits} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                    </div>
                )}
            </FormSection>
        </form>
    );
  }

  return (
    <div>
      {isDeleteModalOpen && (
        <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
            <p className="text-gray-700">Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button onClick={() => { onDelete(ticket.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Ticket</button>
            </div>
        </Modal>
      )}

      <div className="flex justify-end items-center gap-3 mb-6">
        <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
        <button onClick={onEmail} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"><EmailIcon className="w-4 h-4"/><span>Email</span></button>
        <button onClick={onExport} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"><DownloadIcon className="w-4 h-4"/><span>Export</span></button>
        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
      </div>
      
      <div className="space-y-8">
        {/* Core Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DetailTag label="Status" value={ticket.status} />
          <DetailTag label="Priority" value={ticket.priority} />
          <DetailTag label="Type" value={ticket.type} />
          <DetailTag label="Product Area" value={ticket.productArea} />
          <DetailTag label="Platform" value={ticket.platform} />
          <DetailField label="Project" value={projectName} />
        </div>

        {/* Detailed Info */}
        <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DetailField label="Submitter" value={ticket.submitterName} />
          <DetailField label="Client" value={ticket.client} />
          <DetailField label="Location" value={ticket.location} />
          <DetailField label="PMR Number" value={ticket.pmrNumber} />
          <DetailField label="FP Ticket #" value={ticket.fpTicketNumber} />
          <DetailField label="Thread ID" value={ticket.ticketThreadId} />
        </div>

        {/* Dates */}
        <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DetailField label="Submitted On" value={new Date(ticket.submissionDate).toLocaleString()} />
            <DetailField label="Start Date" value={ticket.startDate ? new Date(ticket.startDate).toLocaleString() : 'N/A'} />
            <DetailField label="Est. Completion" value={ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleString() : 'N/A'} />
        </div>
        
        {ticket.status === Status.OnHold && ticket.onHoldReason && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">On Hold Reason</h3>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                {ticket.onHoldReason}
            </div>
          </div>
        )}

        {/* Specific Fields */}
        <div className="border-t border-gray-200 pt-6">
          {ticket.type === TicketType.Issue ? (
            <div className="space-y-6">
              <DetailField label="Problem" value={(ticket as IssueTicket).problem} />
              <DetailField label="Duplication Steps" value={(ticket as IssueTicket).duplicationSteps} />
              <DetailField label="Workaround" value={(ticket as IssueTicket).workaround} />
              <DetailField label="Frequency" value={(ticket as IssueTicket).frequency} />
            </div>
          ) : (
            <div className="space-y-6">
              <DetailField label="Improvement" value={(ticket as FeatureRequestTicket).improvement} />
              <DetailField label="Current Functionality" value={(ticket as FeatureRequestTicket).currentFunctionality} />
              <DetailField label="Suggested Solution" value={(ticket as FeatureRequestTicket).suggestedSolution} />
              <DetailField label="Benefits" value={(ticket as FeatureRequestTicket).benefits} />
            </div>
          )}
        </div>

        {/* Updates Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({ticket.updates?.length || 0})</h3>
          
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
            {ticket.updates && ticket.updates.length > 0 ? (
              [...ticket.updates].reverse().map((update, index) => (
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
        
        {/* Completion Notes Section */}
        <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-800">Completion Notes</h3>
                {!isEditingNotes && ticket.status === Status.Completed && (
                    <button onClick={() => setIsEditingNotes(true)} className="text-sm font-semibold text-blue-600 hover:underline">Edit Notes</button>
                )}
            </div>
            {isEditingNotes ? (
                <div>
                    <textarea value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    <div className="flex justify-end gap-2 mt-2">
                         <button onClick={() => setIsEditingNotes(false)} className="text-sm font-semibold text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100">Cancel</button>
                        <button onClick={handleSaveNotes} className="text-sm font-semibold text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.completionNotes || 'No completion notes added.'}</p>
            )}
        </div>

      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', initialProjects);
  const [dealerships, setDealerships] = useLocalStorage<Dealership[]>('dealerships', initialDealerships);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);

  const [ticketFilters, setTicketFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    productArea: 'all',
  });
  
  const [dealershipFilters, setDealershipFilters] = useState<DealershipFilterState>({
    searchTerm: '',
    status: 'all',
  });
  
  const [currentView, setCurrentView] = useState<View>('tickets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isSideViewOpen, setIsSideViewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [isDealershipFormOpen, setIsDealershipFormOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();


  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => {
        const searchTermLower = ticketFilters.searchTerm.toLowerCase();
        const ticketDescription = ticket.type === TicketType.Issue ? (ticket as IssueTicket).problem : (ticket as FeatureRequestTicket).improvement;
        const matchesSearch =
          ticket.title.toLowerCase().includes(searchTermLower) ||
          ticketDescription.toLowerCase().includes(searchTermLower) ||
          ticket.submitterName.toLowerCase().includes(searchTermLower) ||
          (ticket.client && ticket.client.toLowerCase().includes(searchTermLower)) ||
          ticket.id.toLowerCase().includes(searchTermLower) ||
          (ticket.pmrNumber && ticket.pmrNumber.toLowerCase().includes(searchTermLower)) ||
          (ticket.fpTicketNumber && ticket.fpTicketNumber.toLowerCase().includes(searchTermLower));

        const matchesStatus = ticketFilters.status === 'all' || ticket.status === ticketFilters.status;
        const matchesPriority = ticketFilters.priority === 'all' || ticket.priority === ticketFilters.priority;
        const matchesType = ticketFilters.type === 'all' || ticket.type === ticketFilters.type;
        const matchesProductArea = ticketFilters.productArea === 'all' || ticket.productArea === ticketFilters.productArea;

        return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProductArea;
      })
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [tickets, ticketFilters]);
  
  const filteredDealerships = useMemo(() => {
    return dealerships
        .filter(dealership => {
            const searchTermLower = dealershipFilters.searchTerm.toLowerCase();
            const matchesSearch =
                dealership.name.toLowerCase().includes(searchTermLower) ||
                dealership.accountNumber.toLowerCase().includes(searchTermLower) ||
                (dealership.enterprise && dealership.enterprise.toLowerCase().includes(searchTermLower)) ||
                (dealership.assignedSpecialist && dealership.assignedSpecialist.toLowerCase().includes(searchTermLower));

            const matchesStatus = dealershipFilters.status === 'all' || dealership.status === dealershipFilters.status;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [dealerships, dealershipFilters]);
  
  const performanceInsights = useMemo(() => {
    const openTickets = tickets.filter(t => t.status !== Status.Completed).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedLast30Days = tickets.filter(t => 
        t.status === Status.Completed && 
        t.completionDate && 
        new Date(t.completionDate) > thirtyDaysAgo
    ).length;
    
    const completedTicketsWithDates = tickets.filter(t =>
        t.status === Status.Completed && t.startDate && t.completionDate
    );
    
    const avgCompletionDays = completedTicketsWithDates.length > 0
        ? completedTicketsWithDates.reduce((acc, t) => {
            const start = new Date(t.startDate!).getTime();
            const end = new Date(t.completionDate!).getTime();
            const diffDays = (end - start) / (1000 * 3600 * 24);
            return acc + diffDays;
        }, 0) / completedTicketsWithDates.length
        : null;

    return { openTickets, completedLast30Days, avgCompletionDays };
}, [tickets]);

  const dealershipInsights = useMemo(() => {
    const totalDealerships = dealerships.length;
    const liveAccounts = dealerships.filter(d => d.status === DealershipStatus.Live).length;
    const onboardingAccounts = dealerships.filter(d => d.status === DealershipStatus.Onboarding).length;
    return { totalDealerships, liveAccounts, onboardingAccounts };
  }, [dealerships]);


  const closeSideView = () => {
    setIsSideViewOpen(false);
    setSelectedTicket(null);
    setSelectedProject(null);
    setSelectedDealership(null);
  };

  // Click handlers for opening side panel
  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedProject(null);
    setSelectedDealership(null);
    setIsSideViewOpen(true);
  };
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setSelectedTicket(null);
    setSelectedDealership(null);
    setIsSideViewOpen(true);
  };

  const handleDealershipClick = (dealership: Dealership) => {
    setSelectedDealership(dealership);
    setSelectedTicket(null);
    setSelectedProject(null);
    setIsSideViewOpen(true);
  };

  // Ticket CRUD and actions
  const handleAddNewTicket = (newTicketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
      updates: [],
    };
    setTickets(prev => [newTicket as Ticket, ...prev]);
    setIsTicketFormOpen(false);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      closeSideView();
  };
  
  const handleAddUpdate = (comment: string, author: string) => {
    if (!selectedTicket) return;
    const newUpdate: Update = { author, comment, date: new Date().toISOString() };
    const updatedTicket: Ticket = {
      ...selectedTicket,
      updates: [...(selectedTicket.updates || []), newUpdate],
    };
    handleUpdateTicket(updatedTicket);
  };

  const handleUpdateCompletionNotes = (notes: string) => {
    if (!selectedTicket) return;
    const updatedTicket = { ...selectedTicket, completionNotes: notes };
    handleUpdateTicket(updatedTicket);
  };

  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      const updatedTicket: Ticket = { ...ticket, status: newStatus };
      if (newStatus === Status.Completed) {
        updatedTicket.completionDate = new Date().toISOString();
      } else {
        updatedTicket.completionDate = undefined;
      }
      if (newStatus === Status.OnHold) {
          updatedTicket.onHoldReason = onHoldReason;
      }
      handleUpdateTicket(updatedTicket);
    }
  };

  // Project CRUD
  const handleAddNewProject = (newProjectData: Omit<Project, 'id' | 'creationDate' | 'tasks' | 'ticketIds'>) => {
    const newProject: Project = {
        ...newProjectData,
        id: crypto.randomUUID(),
        creationDate: new Date().toISOString(),
        tasks: [],
        ticketIds: [],
        updates: [],
    };
    setProjects(prev => [newProject, ...prev]);
    setIsProjectFormOpen(false);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject && selectedProject.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
  };

  const handleAddProjectUpdate = (projectId: string, comment: string, author: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newUpdate: Update = { author, comment, date: new Date().toISOString() };
    const updatedProject: Project = {
      ...project,
      updates: [...(project.updates || []), newUpdate],
    };
    handleUpdateProject(updatedProject);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    // Also unlink any tickets associated with this project
    setTickets(prevTickets => prevTickets.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t));
    closeSideView();
  };

  // Dealership CRUD
  const handleAddNewDealership = (newDealershipData: Omit<Dealership, 'id'>) => {
    const newDealership: Dealership = {
        ...newDealershipData,
        id: crypto.randomUUID(),
    };
    setDealerships(prev => [newDealership, ...prev]);
    setIsDealershipFormOpen(false);
  };

  const handleUpdateDealership = (updatedDealership: Dealership) => {
    setDealerships(prev => prev.map(d => d.id === updatedDealership.id ? updatedDealership : d));
     if (selectedDealership && selectedDealership.id === updatedDealership.id) {
        setSelectedDealership(updatedDealership);
    }
  };

  const handleDeleteDealership = (dealershipId: string) => {
    setDealerships(prev => prev.filter(d => d.id !== dealershipId));
    closeSideView();
  };

  // Export and Import
  const handleExport = () => {
    const convertToCsv = (data: Record<string, any>[]) => {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        for (const row of data) {
            const values = headers.map(header => {
                let cell = row[header];
                if (cell === null || cell === undefined) {
                    cell = '';
                }
                const stringCell = String(cell);
                const escapedCell = stringCell.replace(/"/g, '""');
                if (stringCell.includes(',') || stringCell.includes('\n') || stringCell.includes('"')) {
                    return `"${escapedCell}"`;
                }
                return escapedCell;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };

    let dataToExport: any[] = [];
    let filename: string = '';

    switch (currentView) {
      case 'tickets':
        filename = 'tickets.csv';
        const ticketKeys = [
            'id', 'title', 'type', 'productArea', 'platform', 'status', 'priority', 'submitterName', 'client', 'location', 'submissionDate', 'startDate', 'estimatedCompletionDate', 'completionDate',
            'pmrNumber', 'fpTicketNumber', 'ticketThreadId', 'projectId', 'onHoldReason', 'completionNotes',
            'problem', 'duplicationSteps', 'workaround', 'frequency',
            'improvement', 'currentFunctionality', 'suggestedSolution', 'benefits',
            'updates'
        ];
        dataToExport = tickets.map(ticket => {
            const row: Record<string, any> = {};
            const enrichedTicket = { ...ticket, updates: JSON.stringify(ticket.updates || []) };
            for (const key of ticketKeys) {
                row[key] = (enrichedTicket as any)[key] ?? '';
            }
            return row;
        });
        break;
      case 'projects':
        filename = 'projects.csv';
        dataToExport = projects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            status: p.status,
            creationDate: p.creationDate,
            ticketIds: p.ticketIds.join(';'),
            tasks: JSON.stringify(p.tasks),
            updates: JSON.stringify(p.updates || []),
        }));
        break;
      case 'dealerships':
        filename = 'dealerships.csv';
        dataToExport = dealerships;
        break;
    }

    if (dataToExport.length === 0) {
      showToast(`No ${currentView} to export.`, 'error');
      return;
    }

    const csvContent = convertToCsv(dataToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
    const formatTicketAsText = (ticket: Ticket): string => {
        const issueTicket = ticket as IssueTicket;
        const featureRequestTicket = ticket as FeatureRequestTicket;
        
        const fields = [
          { label: 'Title', value: ticket.title },
          { label: 'ID', value: ticket.id },
          { label: 'Type', value: ticket.type },
          { label: 'Status', value: ticket.status },
          { label: 'Priority', value: ticket.priority },
          { label: 'Product Area', value: ticket.productArea },
          { label: 'Platform', value: ticket.platform },
          { label: 'Submitter', value: ticket.submitterName },
          { label: 'Client', value: ticket.client },
          { label: 'Submission Date', value: new Date(ticket.submissionDate).toLocaleString() },
          { label: 'Location', value: ticket.location },
          { label: 'PMR Number', value: ticket.pmrNumber },
          { label: 'FP Ticket #', value: ticket.fpTicketNumber },
          { label: 'Thread ID', value: ticket.ticketThreadId },
          { label: 'Start Date', value: ticket.startDate ? new Date(ticket.startDate).toLocaleString() : undefined },
          { label: 'Est. Completion', value: ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleString() : undefined },
          { label: 'Completion Date', value: ticket.completionDate ? new Date(ticket.completionDate).toLocaleString() : undefined },
        ];

        let text = 'Ticket Details\n==================================\n';
        fields.forEach(field => {
            if (field.value) {
                text += `${field.label}: ${field.value}\n`;
            }
        });
        
        if (ticket.status === Status.OnHold && ticket.onHoldReason) {
          text += `\n--- On Hold Reason ---\n${ticket.onHoldReason}\n`;
        }

        text += '\n--- Details ---\n';
        if (ticket.type === TicketType.Issue) {
            text += `Problem: ${issueTicket.problem}\n`;
            text += `Duplication Steps: ${issueTicket.duplicationSteps}\n`;
            text += `Workaround: ${issueTicket.workaround}\n`;
            text += `Frequency: ${issueTicket.frequency}\n`;
        } else {
            text += `Improvement: ${featureRequestTicket.improvement}\n`;
            text += `Current Functionality: ${featureRequestTicket.currentFunctionality}\n`;
            text += `Suggested Solution: ${featureRequestTicket.suggestedSolution}\n`;
            text += `Benefits: ${featureRequestTicket.benefits}\n`;
        }
        
        if (ticket.completionNotes) {
          text += `\n--- Completion Notes ---\n${ticket.completionNotes}\n`;
        }

        text += '\n--- Updates ---\n';
        if (ticket.updates && ticket.updates.length > 0) {
          [...ticket.updates].reverse().forEach(update => {
            text += `[${new Date(update.date).toLocaleString()}] ${update.author}:\n${update.comment}\n\n`;
          });
        } else {
          text += 'No updates.\n';
        }

        return text;
    };


  const handleExportTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    const data = formatTicketAsText(ticket);
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.id.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleEmailTicket = (ticketId: string) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const subject = `Ticket Details: ${ticket.title} (#${ticket.id})`;
      let body = `Ticket Details:\n`;
      body += `------------------\n`;
      body += `Title: ${ticket.title}\n`;
      body += `ID: ${ticket.id}\n`;
      body += `Status: ${ticket.status}\n`;
      body += `Priority: ${ticket.priority}\n`;
      body += `Submitter: ${ticket.submitterName}\n`;
      body += `Submitted On: ${new Date(ticket.submissionDate).toLocaleString()}\n`;
      body += `Link: ${window.location.href}\n\n`;
      body += `Description:\n`;
      const description = ticket.type === TicketType.Issue ? (ticket as IssueTicket).problem : (ticket as FeatureRequestTicket).improvement;
      body += `${description}\n`;

      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        const parseCsvRow = (row: string): string[] => {
            const result: string[] = [];
            let currentField = '';
            let inQuotes = false;
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                if (char === '"') {
                    if (inQuotes && row[i + 1] === '"') {
                        currentField += '"';
                        i++; 
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(currentField);
                    currentField = '';
                } else {
                    currentField += char;
                }
            }
            result.push(currentField);
            return result;
        };

        const lines = content.trim().replace(/\r\n/g, '\n').split('\n');
        if (lines.length < 2) {
            showToast("CSV file is empty or has only headers.", 'error');
            return;
        }

        const headers = parseCsvRow(lines[0]);
        const data: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvRow(lines[i]);
            if (values.length === headers.length) {
                const obj: Record<string, string> = {};
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = values[j];
                }
                data.push(obj);
            }
        }

        const isTickets = ['id', 'title', 'type', 'status', 'priority'].every(h => headers.includes(h));
        const isProjects = ['id', 'name', 'status', 'creationDate'].every(h => headers.includes(h));
        const isDealerships = ['id', 'name', 'accountNumber', 'status'].every(h => headers.includes(h));
        
        if (isTickets) {
            const newTickets = data.map(row => {
                const ticket: any = {};
                for (const key in row) {
                    if (row[key] !== '') ticket[key] = row[key];
                }
                if (ticket.updates) ticket.updates = JSON.parse(ticket.updates);
                return ticket as Ticket;
            });
            setTickets(newTickets);
            showToast(`Successfully imported ${newTickets.length} tickets.`, 'success');
        } else if (isProjects) {
            const newProjects = data.map(row => {
                const project: any = {};
                 for (const key in row) {
                    if (row[key] !== '') project[key] = row[key];
                }
                if (project.ticketIds) project.ticketIds = project.ticketIds.split(';');
                if (project.tasks) project.tasks = JSON.parse(project.tasks);
                if (project.updates) project.updates = JSON.parse(project.updates);
                return project as Project;
            });
            setProjects(newProjects);
            showToast(`Successfully imported ${newProjects.length} projects.`, 'success');
        } else if (isDealerships) {
            const newDealerships = data.map(row => {
                 const dealership: any = {};
                 for (const key in row) {
                    if (row[key] !== '') dealership[key] = row[key];
                }
                return dealership as Dealership;
            });
            setDealerships(newDealerships);
            showToast(`Successfully imported ${newDealerships.length} dealerships.`, 'success');
        } else {
            showToast("Could not determine data type. Please check CSV headers.", 'error');
        }
      } catch (error) {
        console.error("Error parsing CSV file:", error);
        showToast("Failed to import data. Please check file format.", 'error');
      }
    };
    reader.readAsText(file);
    if (event.target) {
        event.target.value = '';
    }
  };

  // UI Helpers
  const getNewItemButtonText = () => {
    switch (currentView) {
        case 'tickets': return 'New Ticket';
        case 'projects': return 'New Project';
        case 'tasks': return 'Add New Task';
        case 'dealerships': return 'New Account';
        default: return 'New Item';
    }
  };
  
  const getSideViewTitle = () => {
    if (selectedTicket) return `Ticket: ${selectedTicket.title}`;
    if (selectedProject) return `Project: ${selectedProject.name}`;
    if (selectedDealership) return `Account: ${selectedDealership.name}`;
    return 'Details';
  };

  const openFormModal = () => {
    switch (currentView) {
        case 'tickets': setIsTicketFormOpen(true); break;
        case 'projects': setIsProjectFormOpen(true); break;
        case 'tasks': 
          document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'dealerships': setIsDealershipFormOpen(true); break;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
        <Toast 
            message={toast.message} 
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={hideToast}
        />
        <LeftSidebar 
            ticketFilters={ticketFilters} 
            setTicketFilters={setTicketFilters}
            dealershipFilters={dealershipFilters}
            setDealershipFilters={setDealershipFilters}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentView={currentView}
            onViewChange={view => {
                setCurrentView(view);
                closeSideView();
                setIsSidebarOpen(false); // Also close sidebar on mobile
            }}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 text-gray-500 hover:text-gray-800 rounded-md focus:outline-none focus:ring-2 ring-blue-500">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 capitalize">{currentView}</h1>
                <div className="flex items-center gap-3">
                    <button onClick={handleUploadClick} className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                        <UploadIcon className="w-4 h-4" />
                        <span>Import</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} />
                    <button onClick={handleExport} className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                        <DownloadIcon className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
                {currentView === 'tickets' && (
                    <>
                        <PerformanceInsights {...performanceInsights} />
                        <TicketList tickets={filteredTickets} onRowClick={handleTicketClick} onStatusChange={handleStatusChange} />
                    </>
                )}
                {currentView === 'projects' && <ProjectList projects={projects} onProjectClick={handleProjectClick} tickets={tickets} />}
                {currentView === 'tasks' && <TaskList 
                    projects={projects} 
                    onUpdateProject={handleUpdateProject}
                    tasks={tasks}
                    setTasks={setTasks}
                />}
                {currentView === 'dealerships' && (
                  <>
                    <DealershipInsights {...dealershipInsights} />
                    <DealershipList dealerships={filteredDealerships} onDealershipClick={handleDealershipClick} />
                  </>
                )}
            </div>
        </main>
        
        <button
            onClick={openFormModal}
            className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-105"
            aria-label={getNewItemButtonText()}
            title={getNewItemButtonText()}
        >
            <PlusIcon className="w-7 h-7" />
        </button>

        {isTicketFormOpen && (
            <Modal title="Create New Ticket" onClose={() => setIsTicketFormOpen(false)}>
                <TicketForm onSubmit={handleAddNewTicket} projects={projects}/>
            </Modal>
        )}
        {isProjectFormOpen && (
            <Modal title="Create New Project" onClose={() => setIsProjectFormOpen(false)}>
                <ProjectForm onSubmit={handleAddNewProject} />
            </Modal>
        )}
        {isDealershipFormOpen && (
            <Modal title="Create New Account" onClose={() => setIsDealershipFormOpen(false)}>
                 <DealershipForm 
                    onSubmit={handleAddNewDealership} 
                    onUpdate={handleUpdateDealership}
                    onClose={() => setIsDealershipFormOpen(false)}
                />
            </Modal>
        )}
        
        <SideView 
            title={getSideViewTitle()}
            isOpen={isSideViewOpen} 
            onClose={closeSideView}
        >
            {selectedTicket && (
                <TicketDetailView 
                    ticket={selectedTicket} 
                    onUpdate={handleUpdateTicket}
                    onAddUpdate={handleAddUpdate}
                    onExport={() => handleExportTicket(selectedTicket.id)}
                    onEmail={() => handleEmailTicket(selectedTicket.id)}
                    onUpdateCompletionNotes={handleUpdateCompletionNotes}
                    onDelete={handleDeleteTicket}
                    projects={projects}
                />
            )}
            {selectedProject && (
                <ProjectDetailView 
                    project={selectedProject} 
                    onUpdate={handleUpdateProject}
                    onDelete={handleDeleteProject}
                    tickets={tickets}
                    onUpdateTicket={handleUpdateTicket}
                    onAddUpdate={handleAddProjectUpdate}
                />
            )}
             {selectedDealership && (
                <DealershipDetailView
                    dealership={selectedDealership}
                    onUpdate={handleUpdateDealership}
                    onDelete={handleDeleteDealership}
                />
            )}
        </SideView>
    </div>
  );
};

export default App;
