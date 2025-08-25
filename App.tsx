import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus } from './types.ts';
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
import { initialTickets, initialProjects, initialDealerships } from './mockData.ts';
import { UploadIcon } from './components/icons/UploadIcon.tsx';
import ProjectList from './components/ProjectList.tsx';
import ProjectDetailView from './components/ProjectDetailView.tsx';
import ProjectForm from './components/ProjectForm.tsx';
import DealershipList from './components/DealershipList.tsx';
import DealershipDetailView from './components/DealershipDetailView.tsx';
import DealershipForm from './components/DealershipForm.tsx';
import DealershipInsights from './components/DealershipInsights.tsx';


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
    setEditableTicket(prev => ({ ...prev!, [name]: value }));
  };
  
  const handleSave = () => {
    let finalTicket = { ...editableTicket };
    // Handle date conversions
    if (finalTicket.startDate) finalTicket.startDate = new Date(finalTicket.startDate).toISOString();
    if (finalTicket.estimatedCompletionDate) finalTicket.estimatedCompletionDate = new Date(finalTicket.estimatedCompletionDate).toISOString();
    if (finalTicket.projectId === '') finalTicket.projectId = undefined;

    onUpdate(finalTicket);
    setIsEditing(false);
  };
  
  const projectName = ticket.projectId ? (projects.find(p => p.id === ticket.projectId)?.name || 'N/A') : 'None';

  if (isEditing) {
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="flex justify-end items-center gap-3 mb-6">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Save</button>
            </div>
             <FormSection title="Core Information">
                <div className="col-span-2">
                    <label className={labelClasses}>Title</label>
                    <input type="text" name="title" value={(editableTicket as any).title} onChange={handleFormChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Submitter Name</label>
                    <input type="text" name="submitterName" value={editableTicket.submitterName} onChange={handleFormChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Client</label>
                    <input type="text" name="client" value={editableTicket.client || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
             </FormSection>
             <FormSection title="Tracking">
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
        </form>
    )
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
          <form onSubmit={handleUpdateSubmit} className="mt-4 p-3 border border-gray-200 rounded-md">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Add a new update</h4>
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Type your comment here..."
              required
              rows={3}
              className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-4 mt-2">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name"
                required
                className="flex-grow w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                Add Update
              </button>
            </div>
          </form>
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

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    productArea: 'all',
  });
  
  const [currentView, setCurrentView] = useState<View>('tickets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isSideViewOpen, setIsSideViewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDealershipFormOpen, setIsDealershipFormOpen] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const ticketDescription = ticket.type === TicketType.Issue ? (ticket as IssueTicket).problem : (ticket as FeatureRequestTicket).improvement;
        const matchesSearch =
          ticket.title.toLowerCase().includes(searchTermLower) ||
          ticketDescription.toLowerCase().includes(searchTermLower) ||
          ticket.submitterName.toLowerCase().includes(searchTermLower) ||
          (ticket.client && ticket.client.toLowerCase().includes(searchTermLower)) ||
          ticket.id.toLowerCase().includes(searchTermLower) ||
          (ticket.pmrNumber && ticket.pmrNumber.toLowerCase().includes(searchTermLower)) ||
          (ticket.fpTicketNumber && ticket.fpTicketNumber.toLowerCase().includes(searchTermLower));

        const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
        const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
        const matchesType = filters.type === 'all' || ticket.type === filters.type;
        const matchesProductArea = filters.productArea === 'all' || ticket.productArea === filters.productArea;

        return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProductArea;
      })
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [tickets, filters]);
  
  const performanceInsights = useMemo(() => {
    const openTickets = tickets.filter(t => t.status !== Status.Completed).length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const completedLast30Days = tickets.filter(t => 
        t.status === Status.Completed && 
        t.completionDate && 
        new Date(t.completionDate) > thirtyDaysAgo
    ).length;
    
    const completedWithDates = tickets.filter(t => 
        t.status === Status.Completed && 
        t.completionDate && 
        t.startDate
    );

    const totalCompletionDays = completedWithDates.reduce((acc, ticket) => {
        const start = new Date(ticket.startDate!);
        const end = new Date(ticket.completionDate!);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return acc + diff;
    }, 0);

    const avgCompletionDays = completedWithDates.length > 0 ? totalCompletionDays / completedWithDates.length : null;

    return { openTickets, completedLast30Days, avgCompletionDays };
  }, [tickets]);
  
  const dealershipInsights = useMemo(() => {
    const totalDealerships = dealerships.length;
    const liveAccounts = dealerships.filter(d => d.status === DealershipStatus.Live).length;
    const onboardingAccounts = dealerships.filter(d => d.status === DealershipStatus.Onboarding).length;

    return { totalDealerships, liveAccounts, onboardingAccounts };
  }, [dealerships]);

  // Ticket Handlers
  const handleCreateTicket = (ticketData: Omit<IssueTicket, 'id' | 'submissionDate' | 'updates'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate' | 'updates'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `T-${Math.random().toString(36).substr(2, 9)}`,
      submissionDate: new Date().toISOString(),
      updates: [],
    };
    setTickets(prev => [newTicket, ...prev]);
    setIsSideViewOpen(false);
  };
  
  const handleUpdateTicket = (updatedTicket: Ticket) => {
     setTickets(prev => prev.map(t => (t.id === updatedTicket.id ? updatedTicket : t)));
     if (selectedTicket && selectedTicket.id === updatedTicket.id) {
         setSelectedTicket(updatedTicket);
     }
  };

  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
          const updatedTicket: Ticket = {
              ...ticket,
              status: newStatus,
              onHoldReason: newStatus === Status.OnHold ? onHoldReason : undefined,
              completionDate: newStatus === Status.Completed && !ticket.completionDate ? new Date().toISOString() : ticket.completionDate,
          };
          handleUpdateTicket(updatedTicket);
      }
  };
  
  const handleAddUpdateToTicket = (ticketId: string, comment: string, author: string) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
          const newUpdate: Update = {
              author,
              comment,
              date: new Date().toISOString(),
          };
          const updatedTicket = { ...ticket, updates: [...(ticket.updates || []), newUpdate] };
          handleUpdateTicket(updatedTicket);
      }
  };
  
  const handleUpdateCompletionNotes = (ticketId: string, notes: string) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
          const updatedTicket = { ...ticket, completionNotes: notes };
          handleUpdateTicket(updatedTicket);
      }
  };
  
  const handleDeleteTicket = (ticketId: string) => {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setSelectedTicket(null);
  };

  // Project Handlers
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'creationDate' | 'subTasks' | 'ticketIds'>) => {
      const newProject: Project = {
          ...projectData,
          id: `proj-${crypto.randomUUID()}`,
          creationDate: new Date().toISOString(),
          subTasks: [],
          ticketIds: [],
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

  const handleDeleteProject = (projectId: string) => {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      // Unlink tickets from the deleted project
      setTickets(prevTickets => prevTickets.map(t => {
          if (t.projectId === projectId) {
              const { projectId: _, ...rest } = t;
              return rest as Ticket;
          }
          return t;
      }));
      setSelectedProject(null);
  };
  
  // Dealership Handlers
  const handleCreateDealership = (dealershipData: Omit<Dealership, 'id'>) => {
      const newDealership: Dealership = {
          ...dealershipData,
          id: `dealership-${crypto.randomUUID()}`,
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
      setSelectedDealership(null);
  };

  const handleRowClick = (ticket: Ticket) => {
      setSelectedTicket(ticket);
  };

  const handleCloseSideView = () => {
      setSelectedTicket(null);
      setSelectedProject(null);
      setSelectedDealership(null);
  }

  const handleExport = () => {
    const dataStr = JSON.stringify({ tickets, projects, dealerships }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'curator_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const content = e.target?.result;
                  if (typeof content === 'string') {
                      const data = JSON.parse(content);
                      if (data.tickets) setTickets(data.tickets);
                      if (data.projects) setProjects(data.projects);
                      if (data.dealerships) setDealerships(data.dealerships);
                      alert('Data imported successfully!');
                  }
              } catch (error) {
                  console.error("Failed to parse imported file:", error);
                  alert('Error importing data. Please check the file format.');
              }
          };
          reader.readAsText(file);
      }
  };
    
  const renderContent = () => {
      switch (currentView) {
          case 'tickets':
              return (
                  <>
                      <PerformanceInsights {...performanceInsights} />
                      <TicketList tickets={filteredTickets} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />
                  </>
              );
          case 'projects':
              return <ProjectList projects={projects} onProjectClick={setSelectedProject} />;
          case 'dealerships':
              return (
                  <>
                      <DealershipInsights {...dealershipInsights} />
                      <DealershipList dealerships={dealerships} onDealershipClick={setSelectedDealership} />
                  </>
              );
          default:
              return null;
      }
  };
    
  const getSideViewContent = () => {
      if (selectedTicket) {
          return {
              title: selectedTicket.title,
              content: <TicketDetailView 
                  ticket={selectedTicket} 
                  onUpdate={handleUpdateTicket}
                  onAddUpdate={(comment, author) => handleAddUpdateToTicket(selectedTicket.id, comment, author)}
                  onUpdateCompletionNotes={(notes) => handleUpdateCompletionNotes(selectedTicket.id, notes)}
                  onDelete={handleDeleteTicket}
                  projects={projects}
                  onExport={() => { console.log('Exporting', selectedTicket.id)}}
                  onEmail={() => { console.log('Emailing', selectedTicket.id)}}
              />
          }
      }
      if (selectedProject) {
          return {
              title: selectedProject.name,
              content: <ProjectDetailView
                  project={selectedProject}
                  onUpdate={handleUpdateProject}
                  onDelete={handleDeleteProject}
                  tickets={tickets}
                  onUpdateTicket={handleUpdateTicket}
               />
          }
      }
      if (selectedDealership) {
          return {
              title: selectedDealership.name,
              content: <DealershipDetailView
                  dealership={selectedDealership}
                  onUpdate={handleUpdateDealership}
                  onDelete={handleDeleteDealership}
              />
          }
      }
      return null;
  }

  const sideViewData = getSideViewContent();
    
  const getHeaderInfo = () => {
      switch (currentView) {
          case 'tickets':
              return { title: 'Tickets', buttonText: 'New Ticket', action: () => setIsSideViewOpen(true) };
          case 'projects':
              return { title: 'Projects', buttonText: 'New Project', action: () => setIsProjectFormOpen(true) };
          case 'dealerships':
              return { title: 'Dealerships', buttonText: 'New Account', action: () => setIsDealershipFormOpen(true) };
          default:
              return { title: '', buttonText: '', action: () => {} };
      }
  };
  const headerInfo = getHeaderInfo();


  return (
      <div className="flex h-screen bg-gray-100">
          <LeftSidebar filters={filters} setFilters={setFilters} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentView={currentView} setCurrentView={setCurrentView} />
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
              <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-full focus:outline-none focus:ring-2 ring-gray-400">
                          <MenuIcon className="w-6 h-6" />
                      </button>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">{headerInfo.title}</h1>
                  </div>
                   <div className="flex items-center gap-3 self-end sm:self-center">
                      <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".json" />
                      <button onClick={handleImportClick} className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                          <UploadIcon className="w-4 h-4" />
                          <span>Import</span>
                      </button>
                      <button onClick={handleExport} className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                          <DownloadIcon className="w-4 h-4" />
                          <span>Export</span>
                      </button>
                      <button onClick={headerInfo.action} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                          <PlusIcon className="w-4 h-4" />
                          <span>{headerInfo.buttonText}</span>
                      </button>
                  </div>
              </header>
              {renderContent()}
          </main>

          {/* Side View for Details */}
          <SideView isOpen={!!sideViewData} onClose={handleCloseSideView} title={sideViewData?.title || ''}>
              {sideViewData?.content}
          </SideView>
          
           {/* Side View for New Ticket Form */}
          <SideView isOpen={isSideViewOpen} onClose={() => setIsSideViewOpen(false)} title="Create New Ticket">
              <TicketForm onSubmit={handleCreateTicket} projects={projects} />
          </SideView>
          
          {isProjectFormOpen && (
              <Modal title="Create New Project" onClose={() => setIsProjectFormOpen(false)}>
                  <ProjectForm onSubmit={handleCreateProject} />
              </Modal>
          )}

          {isDealershipFormOpen && (
              <Modal title="Create New Dealership Account" onClose={() => setIsDealershipFormOpen(false)}>
                  <DealershipForm
                      onSubmit={handleCreateDealership}
                      onUpdate={handleUpdateDealership}
                      onClose={() => setIsDealershipFormOpen(false)}
                  />
              </Modal>
          )}
      </div>
  );
};

export default App;