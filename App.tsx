
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState } from './types.ts';
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
import { XIcon } from './components/icons/XIcon.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { initialTickets, initialProjects, initialDealerships, initialTasks, initialFeatures, initialMeetings } from './mockData.ts';
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
import FeatureList from './components/FeatureList.tsx';
import FeatureForm from './components/FeatureForm.tsx';
import MeetingList from './components/MeetingList.tsx';
import MeetingDetailView from './components/MeetingDetailView.tsx';
import MeetingForm from './components/MeetingForm.tsx';
import TicketDetailView from './components/TicketDetailView.tsx';
import FeatureDetailView from './components/FeatureDetailView.tsx';


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

const ImportSection: React.FC<{
    title: string;
    onImport: (file: File, mode: 'append' | 'replace') => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ title, onImport, showToast }) => {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'append' | 'replace'>('append');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleImportClick = () => {
        if (file) {
            onImport(file, mode);
            setFile(null); // Reset after import
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            showToast('Please select a file to import.', 'error');
        }
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr,auto,auto] gap-3 items-center">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    aria-label={`Upload CSV for ${title}`}
                />
                <select value={mode} onChange={e => setMode(e.target.value as 'append' | 'replace')} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 h-full">
                    <option value="append">Append</option>
                    <option value="replace">Replace</option>
                </select>
                <button onClick={handleImportClick} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm h-full flex items-center justify-center gap-2">
                   <UploadIcon className="w-4 h-4" />
                   <span>Import</span>
                </button>
            </div>
        </div>
    );
};

// New Component for Export Field Selection
const ExportSelector: React.FC<{
    title: string;
    data: any[];
    onExport: (data: any[], fileName: string, fields: string[]) => void;
}> = ({ title, data, onExport }) => {
    const allFields = useMemo(() => {
        if (data.length === 0) return [];
        const fieldSet = new Set<string>();
        data.forEach(item => Object.keys(item).forEach(key => fieldSet.add(key)));
        return Array.from(fieldSet);
    }, [data]);

    const [selectedFields, setSelectedFields] = useState<string[]>(allFields);

    useEffect(() => {
        setSelectedFields(allFields);
    }, [allFields]);

    const handleFieldToggle = (field: string) => {
        setSelectedFields(prev =>
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    };

    const handleSelectAll = () => setSelectedFields(allFields);
    const handleDeselectAll = () => setSelectedFields([]);

    const handleExportClick = () => {
        onExport(data, `${title.toLowerCase().replace(/\s+/g, '_')}.csv`, selectedFields);
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold text-gray-800">{title} ({data.length})</h4>
            <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 bg-white rounded-md p-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {allFields.map(field => (
                    <label key={field} className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={selectedFields.includes(field)}
                            onChange={() => handleFieldToggle(field)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{field}</span>
                    </label>
                ))}
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2 items-center">
                 <div className="flex-grow flex gap-2">
                     <button onClick={handleSelectAll} className="text-xs font-semibold text-blue-600 hover:underline">Select All</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={handleDeselectAll} className="text-xs font-semibold text-blue-600 hover:underline">Deselect All</button>
                </div>
                <button onClick={handleExportClick} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                   <DownloadIcon className="w-4 h-4" />
                   <span>Export {title}</span>
                </button>
            </div>
        </div>
    );
};


type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

function App() {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', initialProjects);
  const [dealerships, setDealerships] = useLocalStorage<Dealership[]>('dealerships', initialDealerships);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [features, setFeatures] = useLocalStorage<FeatureAnnouncement[]>('features', initialFeatures);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', initialMeetings);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureAnnouncement | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
  
  const [meetingFilters, setMeetingFilters] = useState<MeetingFilterState>({ searchTerm: '' });
  
  const [currentView, setCurrentView] = useState<View>('tickets');
  const { toast, showToast, hideToast } = useToast();

  // FIX: Add useEffect hooks to synchronize selected items with their master data arrays.
  // This ensures that when an item is updated (e.g., by linking another item to it),
  // the detail view re-renders with the fresh data.
  useEffect(() => {
    if (selectedTicket) {
      const freshTicket = tickets.find(t => t.id === selectedTicket.id);
      setSelectedTicket(freshTicket || null);
    }
  }, [tickets]);

  useEffect(() => {
    if (selectedProject) {
      const freshProject = projects.find(p => p.id === selectedProject.id);
      setSelectedProject(freshProject || null);
    }
  }, [projects]);

  useEffect(() => {
    if (selectedDealership) {
      const freshDealership = dealerships.find(d => d.id === selectedDealership.id);
      setSelectedDealership(freshDealership || null);
    }
  }, [dealerships]);
  
  useEffect(() => {
    if (selectedMeeting) {
      const freshMeeting = meetings.find(m => m.id === selectedMeeting.id);
      setSelectedMeeting(freshMeeting || null);
    }
  }, [meetings]);

  useEffect(() => {
    if (selectedFeature) {
      const freshFeature = features.find(f => f.id === selectedFeature.id);
      setSelectedFeature(freshFeature || null);
    }
  }, [features]);


  const allTasks = useMemo(() => {
    const projectTasks = projects.flatMap(p => 
      (p.tasks || []).map(st => ({
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
    return [...projectTasks, ...standaloneTasks];
  }, [projects, tasks]);
  
  const handleTicketSubmit = (newTicketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
      updates: [],
    } as Ticket;
    
    setTickets(prev => [...prev, newTicket]);
    showToast('Ticket created successfully!', 'success');
    
    if (newTicket.projectIds) {
      setProjects(prevProjects => prevProjects.map(p => 
        newTicket.projectIds!.includes(p.id)
          ? { ...p, ticketIds: [...p.ticketIds, newTicket.id] }
          : p
      ));
    }
  };
  
  const handleProjectSubmit = (newProjectData: Omit<Project, 'id' | 'creationDate' | 'tasks' | 'ticketIds'>) => {
      const newProject: Project = {
          ...newProjectData,
          id: crypto.randomUUID(),
          creationDate: new Date().toISOString(),
          tasks: [],
          ticketIds: [],
          meetingIds: [],
          updates: [],
          involvedPeople: [],
      };
      setProjects(prev => [...prev, newProject]);
      showToast('Project created successfully!', 'success');
  };
  
  const handleDealershipSubmit = (newDealershipData: Omit<Dealership, 'id'>) => {
    const newDealership: Dealership = {
      id: crypto.randomUUID(),
      ...newDealershipData,
    };
    setDealerships(prev => [...prev, newDealership]);
    showToast('Dealership account created successfully!', 'success');
  };
  
  const handleFeatureSubmit = (newFeatureData: Omit<FeatureAnnouncement, 'id'>) => {
      const newFeature: FeatureAnnouncement = {
          id: crypto.randomUUID(),
          ...newFeatureData,
      };
      setFeatures(prev => [...prev, newFeature]);
      showToast('Feature announcement added!', 'success');
  };
  
  const handleMeetingSubmit = (newMeetingData: Omit<Meeting, 'id'>) => {
      const newMeeting: Meeting = {
          id: crypto.randomUUID(),
          ...newMeetingData,
      };
      setMeetings(prev => [...prev, newMeeting]);
      showToast('Meeting note saved!', 'success');
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    showToast('Ticket updated successfully!', 'success');
    if (selectedTicket?.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
    }
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    showToast('Project updated successfully!', 'success');
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };
  
  const handleUpdateDealership = (updatedDealership: Dealership) => {
      setDealerships(prev => prev.map(d => d.id === updatedDealership.id ? updatedDealership : d));
      showToast('Dealership account updated successfully!', 'success');
      if (selectedDealership?.id === updatedDealership.id) {
          setSelectedDealership(updatedDealership);
      }
  };
  
  const handleUpdateFeature = (updatedFeature: FeatureAnnouncement) => {
      setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
      showToast('Feature announcement updated!', 'success');
      if (selectedFeature?.id === updatedFeature.id) {
          setSelectedFeature(updatedFeature);
      }
  };
  
  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
      setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
      showToast('Meeting note updated!', 'success');
      if (selectedMeeting?.id === updatedMeeting.id) {
        setSelectedMeeting(updatedMeeting);
      }
  };

  const handleDeleteTicket = (ticketId: string) => {
    const ticketToDelete = tickets.find(t => t.id === ticketId);
    if (!ticketToDelete) return;

    setTickets(prev => prev.filter(t => t.id !== ticketId));

    if (ticketToDelete.projectIds) {
        setProjects(prev => prev.map(p => {
            if (ticketToDelete.projectIds!.includes(p.id)) {
                return { ...p, ticketIds: p.ticketIds.filter(id => id !== ticketId) };
            }
            return p;
        }));
    }
    showToast('Ticket deleted successfully!', 'success');
    setSelectedTicket(null); 
  };
  
  const handleDeleteProject = (projectId: string) => {
      const projectToDelete = projects.find(p => p.id === projectId);
      if (!projectToDelete) return;
      
      setTickets(prevTickets => prevTickets.map(t => {
          if ((t.projectIds || []).includes(projectId)) {
              return { ...t, projectIds: t.projectIds?.filter(id => id !== projectId) };
          }
          return t;
      }));

      setProjects(prev => prev.filter(p => p.id !== projectId));
      showToast('Project deleted successfully!', 'success');
      setSelectedProject(null);
  };
  
  const handleDeleteDealership = (dealershipId: string) => {
      setDealerships(prev => prev.filter(d => d.id !== dealershipId));
      showToast('Dealership account deleted successfully!', 'success');
      setSelectedDealership(null);
  };
  
  const handleDeleteFeature = (featureId: string) => {
    if (window.confirm('Are you sure you want to delete this feature announcement?')) {
        setFeatures(prev => prev.filter(f => f.id !== featureId));
        showToast('Feature announcement deleted!', 'success');
        setSelectedFeature(null);
    }
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
      setProjects(prevProjects => prevProjects.map(p => ({
          ...p,
          meetingIds: (p.meetingIds || []).filter(id => id !== meetingId)
      })));

      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      showToast('Meeting note deleted successfully!', 'success');
      setSelectedMeeting(null);
  };
  
  const handleAddUpdate = (id: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { author, date: new Date(date).toISOString(), comment };
    
    if (currentView === 'tickets' && selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { ...selectedTicket, updates: [...(selectedTicket.updates || []), newUpdate] };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (currentView === 'projects' && selectedProject && selectedProject.id === id) {
        const updatedProject = { ...selectedProject, updates: [...(selectedProject.updates || []), newUpdate] };
        setSelectedProject(updatedProject);
        // FIX: The variable 't' was used here instead of 'p', causing an error.
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    }
    showToast('Update added!', 'success');
  };
  
  const handleUpdateCompletionNotes = (ticketId: string, notes: string) => {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, completionNotes: notes } : t));
      if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, completionNotes: notes } : null);
      }
      showToast('Completion notes updated!', 'success');
  };
  
  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
      setTickets(prev => prev.map(t => {
          if (t.id === ticketId) {
              const updatedTicket: Ticket = { ...t, status: newStatus };
              if (newStatus === Status.OnHold) {
                  updatedTicket.onHoldReason = onHoldReason;
              } else {
                  delete updatedTicket.onHoldReason;
              }
              if (newStatus === Status.Completed && !t.completionDate) {
                  updatedTicket.completionDate = new Date().toISOString();
              }
              return updatedTicket;
          }
          return t;
      }));
  };

    const handleExportTicket = (ticket: Ticket) => {
        let content = `Title: ${ticket.title}\n`;
        content += `Type: ${ticket.type}\n`;
        content += `Status: ${ticket.status}\n`;
        content += `Priority: ${ticket.priority}\n`;
        content += `Submitter: ${ticket.submitterName}\n`;
        content += `Submission Date: ${new Date(ticket.submissionDate).toLocaleDateString()}\n\n`;

        if (ticket.type === TicketType.Issue) {
            content += `Problem: ${ticket.problem}\n`;
            content += `Duplication Steps: ${ticket.duplicationSteps}\n`;
        } else {
            content += `Improvement: ${ticket.improvement}\n`;
            content += `Current Functionality: ${ticket.currentFunctionality}\n`;
        }
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${ticket.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleEmailTicket = (ticket: Ticket) => {
        const subject = encodeURIComponent(`Ticket Details: ${ticket.title}`);
        let body = `Ticket: ${ticket.title}\n`;
        body += `Status: ${ticket.status}\n`;
        body += `Link: ${window.location.href}\n\n`; // A simple link back, though it won't select the ticket
        body = encodeURIComponent(body);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };
    
    // Linking logic
    const getSetterForType = (type: EntityType) => {
      switch (type) {
          case 'ticket': return setTickets;
          case 'project': return setProjects;
          case 'task': return setTasks;
          case 'meeting': return setMeetings;
          case 'dealership': return setDealerships;
          case 'feature': return setFeatures;
      }
    };
    
    const updateEntity = (type: EntityType, id: string, updateFn: (entity: any) => any) => {
        if (type === 'task') {
            const task = allTasks.find(t => t.id === id);
            if (task?.projectId) {
                setProjects(prev => prev.map(p => 
                    p.id === task.projectId 
                    ? { ...p, tasks: p.tasks.map(t => t.id === id ? updateFn(t) : t) }
                    : p
                ));
            } else {
                setTasks(prev => prev.map(t => t.id === id ? updateFn(t) : t));
            }
        } else {
            const setter = getSetterForType(type);
            setter((prev: any[]) => prev.map(e => e.id === id ? updateFn(e) : e));
        }
    };
    
    // FIX: Refactored linking logic for robustness and clarity.
    const getLinkKeys = (fromType: EntityType, toType: EntityType): { forwardKey: string, reverseKey: string } => {
        const getSelfLinkKey = (type: EntityType) => {
            switch (type) {
                case 'ticket': return 'linkedTicketIds';
                case 'project': return 'linkedProjectIds';
                case 'task': return 'linkedTaskIds';
                case 'meeting': return 'linkedMeetingIds';
                case 'dealership': return 'linkedDealershipIds';
                case 'feature': return 'linkedFeatureIds';
                default: return `${type}Ids`;
            }
        }

        const forwardKey = fromType === toType ? getSelfLinkKey(fromType) : `${toType}Ids`;
        const reverseKey = fromType === toType ? getSelfLinkKey(toType) : `${fromType}Ids`;
        
        return { forwardKey, reverseKey };
    }
    
    const handleLinkItem = (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => {
        const { forwardKey, reverseKey } = getLinkKeys(fromType, toType);

        // Update the 'from' entity
        updateEntity(fromType, fromId, (entity) => ({
            ...entity,
            [forwardKey]: [...new Set([...(entity[forwardKey] || []), toId])]
        }));
        
        // Update the 'to' entity
        updateEntity(toType, toId, (entity) => ({
            ...entity,
            [reverseKey]: [...new Set([...(entity[reverseKey] || []), fromId])]
        }));

        showToast(`${fromType.charAt(0).toUpperCase() + fromType.slice(1)} and ${toType} linked successfully!`, 'success');
    };
    
    const handleUnlinkItem = (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => {
        const { forwardKey, reverseKey } = getLinkKeys(fromType, toType);
        
        // Update the 'from' entity
        updateEntity(fromType, fromId, (entity) => ({
            ...entity,
            [forwardKey]: (entity[forwardKey] || []).filter((id: string) => id !== toId)
        }));
        
        // Update the 'to' entity
        updateEntity(toType, toId, (entity) => ({
            ...entity,
            [reverseKey]: (entity[reverseKey] || []).filter((id: string) => id !== fromId)
        }));
        
        showToast(`${fromType.charAt(0).toUpperCase() + fromType.slice(1)} and ${toType} unlinked successfully!`, 'success');
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
        const searchLower = ticketFilters.searchTerm.toLowerCase();
        return (
            (ticket.title.toLowerCase().includes(searchLower) ||
            ticket.submitterName.toLowerCase().includes(searchLower) ||
            (ticket.client || '').toLowerCase().includes(searchLower) ||
            (ticket.pmrNumber || '').toLowerCase().includes(searchLower) ||
            (ticket.fpTicketNumber || '').toLowerCase().includes(searchLower)) &&
            (ticketFilters.status === 'all' || ticket.status === ticketFilters.status) &&
            (ticketFilters.priority === 'all' || ticket.priority === ticketFilters.priority) &&
            (ticketFilters.type === 'all' || ticket.type === ticketFilters.type) &&
            (ticketFilters.productArea === 'all' || ticket.productArea === ticketFilters.productArea)
        );
        }).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    }, [tickets, ticketFilters]);

    const filteredProjects = useMemo(() => {
        return [...projects].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [projects]);
    
    const filteredDealerships = useMemo(() => {
        return dealerships.filter(d => {
            const searchLower = dealershipFilters.searchTerm.toLowerCase();
            return (
                ((d.name || '').toLowerCase().includes(searchLower) ||
                 (d.accountNumber || '').toLowerCase().includes(searchLower) ||
                 (d.enterprise || '').toLowerCase().includes(searchLower)) &&
                (dealershipFilters.status === 'all' || d.status === dealershipFilters.status)
            );
        }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [dealerships, dealershipFilters]);
    
    const filteredMeetings = useMemo(() => {
      const searchLower = meetingFilters.searchTerm.toLowerCase();
      const filtered = meetings.filter(m => 
          !searchLower ||
          m.name.toLowerCase().includes(searchLower) ||
          m.attendees.some(a => a.toLowerCase().includes(searchLower)) ||
          m.notes.toLowerCase().includes(searchLower) ||
          new Date(m.meetingDate).toLocaleDateString().includes(searchLower)
      );
      return filtered.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }, [meetings, meetingFilters]);

    const filteredFeatures = useMemo(() => {
        return [...features].sort((a, b) => new Date(b.launchDate).getTime() - new Date(a.launchDate).getTime());
    }, [features]);

    const performanceInsights = useMemo(() => {
        const completedLast30Days = tickets.filter(t => {
        if (t.status !== Status.Completed || !t.completionDate) return false;
        const completionDate = new Date(t.completionDate);
        const diffDays = (new Date().getTime() - completionDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
        });

        const completableTickets = tickets.filter(t => t.status === Status.Completed && t.startDate && t.completionDate);
        const totalCompletionDays = completableTickets.reduce((acc, t) => {
        const start = new Date(t.startDate!).getTime();
        const end = new Date(t.completionDate!).getTime();
        return acc + (end - start);
        }, 0);
        
        const avgCompletionMs = totalCompletionDays / (completableTickets.length || 1);
        const avgCompletionDays = completableTickets.length > 0 ? avgCompletionMs / (1000 * 3600 * 24) : null;
        
        return {
        openTickets: tickets.filter(t => t.status !== Status.Completed).length,
        completedLast30Days: completedLast30Days.length,
        avgCompletionDays,
        };
    }, [tickets]);

    const dealershipInsights = useMemo(() => ({
        totalDealerships: dealerships.length,
        liveAccounts: dealerships.filter(d => d.status === DealershipStatus.Live).length,
        onboardingAccounts: dealerships.filter(d => d.status === DealershipStatus.Onboarding).length,
    }), [dealerships]);

    const handleExport = (data: any[], fileName: string, fields: string[]) => {
        if (data.length === 0) {
            showToast('No data to export.', 'error');
            return;
        }
        if (fields.length === 0) {
            showToast('Please select at least one field to export.', 'error');
            return;
        }

        const headers = fields;
        const csvRows = [headers.join(',')];

        const isISODateString = (value: any) => {
            if (typeof value !== 'string') return false;
            return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
        }

        const processedData = data.map(row => {
            const newRow: { [key: string]: any } = {};
            headers.forEach(header => {
                let value = row[header];
                if (isISODateString(value)) {
                    newRow[header] = value.split('T')[0];
                } else {
                    newRow[header] = value;
                }
            });
            return newRow;
        });

        processedData.forEach(row => {
            const values = headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) {
                    return '';
                }
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            });
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`${fileName} exported successfully!`, 'success');
    };


    const handleImport = (file: File, setter: React.Dispatch<React.SetStateAction<any[]>>, mode: 'append' | 'replace') => {
        if (!file) {
            showToast('No file selected.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvString = event.target?.result as string;

                const parseCsvLine = (line: string): string[] => {
                    const result: string[] = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            if (inQuotes && line[i+1] === '"') {
                                current += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            result.push(current);
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current);
                    return result;
                };

                const lines = csvString.trim().split(/\r?\n/);
                if (lines.length < 2) {
                    showToast('CSV file is empty or has no data.', 'error');
                    return;
                }
                const headers = parseCsvLine(lines[0]);
                
                const data = lines.slice(1).map(line => {
                    if (!line.trim()) return null;
                    const values = parseCsvLine(line);
                    const obj: { [key: string]: any } = {};
                    headers.forEach((header, index) => {
                        let value: any = values[index];
                        try {
                           if (typeof value === 'string' && ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']')))) {
                               obj[header] = JSON.parse(value);
                           } else {
                               obj[header] = value === '' ? undefined : value;
                           }
                        } catch (e) {
                           obj[header] = value === '' ? undefined : value;
                        }
                    });
                    return obj;
                }).filter(Boolean);

                if (mode === 'replace') {
                    setter(data as any[]);
                } else { // append
                    const dataWithNewIds = data.map(item => ({ ...item, id: crypto.randomUUID() }));
                    setter((currentData: any[]) => [...currentData, ...dataWithNewIds]);
                }
                showToast(`Data imported from ${file.name} successfully.`, 'success');
                setIsImportModalOpen(false);
            } catch (error) {
                console.error("Error parsing CSV:", error);
                showToast(`Failed to parse ${file.name}. Check console for details.`, 'error');
            }
        };
        reader.onerror = () => {
            showToast(`Error reading file ${file.name}.`, 'error');
        };
        reader.readAsText(file);
    };

    const getFormTitle = () => {
        switch (currentView) {
            case 'tickets': return 'Create New Ticket';
            case 'projects': return 'Create New Project';
            case 'dealerships': return 'Create New Account';
            case 'features': return 'Add Feature Announcement';
            case 'meetings': return 'Add New Meeting Note';
            default: return 'Create New Item';
        }
    }
    
    const renderForm = () => {
        switch (currentView) {
            case 'tickets': return <TicketForm onSubmit={data => { handleTicketSubmit(data); setIsFormOpen(false); }} projects={projects} />;
            case 'projects': return <ProjectForm onSubmit={data => { handleProjectSubmit(data); setIsFormOpen(false); }} />;
            case 'dealerships': return <DealershipForm onSubmit={data => { handleDealershipSubmit(data); setIsFormOpen(false); }} onUpdate={() => {}} onClose={() => setIsFormOpen(false)}/>;
            case 'features': return <FeatureForm onSubmit={data => { handleFeatureSubmit(data); setIsFormOpen(false); }} onUpdate={() => {}} onClose={() => setIsFormOpen(false)} />;
            case 'meetings': return <MeetingForm onSubmit={data => { handleMeetingSubmit(data); setIsFormOpen(false); }} onClose={() => setIsFormOpen(false)} />;
            default: return null;
        }
    }

    const getNewButtonText = () => {
        switch (currentView) {
            case 'tickets': return 'New Ticket';
            case 'projects': return 'New Project';
            case 'dealerships': return 'New Account';
            case 'features': return 'New Feature';
            case 'meetings': return 'New Note';
            case 'tasks': return ''; // No main "new" button for tasks view
            default: return 'New Item';
        }
    }
    
    const handleViewChange = (view: View) => {
        setCurrentView(view);
        setSelectedTicket(null);
        setSelectedProject(null);
        setSelectedDealership(null);
        setSelectedMeeting(null);
        setSelectedFeature(null);
    }
    
    return (
    <div className="flex h-screen bg-gray-100">
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      <LeftSidebar
        ticketFilters={ticketFilters}
        setTicketFilters={setTicketFilters}
        dealershipFilters={dealershipFilters}
        setDealershipFilters={setDealershipFilters}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={handleViewChange}
        onImportClick={() => setIsImportModalOpen(true)}
        onExportClick={() => setIsExportModalOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 text-gray-500 hover:text-gray-800" aria-label="Open sidebar">
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 capitalize">{currentView} Dashboard</h1>
          {getNewButtonText() && (
            <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                <PlusIcon className="w-5 h-5" />
                <span>{getNewButtonText()}</span>
            </button>
          )}
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {currentView === 'tickets' && (
            <>
              <PerformanceInsights {...performanceInsights} />
              <TicketList 
                tickets={filteredTickets} 
                onRowClick={setSelectedTicket} 
                onStatusChange={handleStatusChange}
                projects={projects}
              />
            </>
          )}
          {currentView === 'projects' && <ProjectList projects={filteredProjects} onProjectClick={setSelectedProject} tickets={tickets}/>}
          {currentView === 'dealerships' && (
              <>
                <DealershipInsights {...dealershipInsights} />
                <DealershipList dealerships={filteredDealerships} onDealershipClick={setSelectedDealership} />
              </>
          )}
          {currentView === 'tasks' && <TaskList projects={projects} onUpdateProject={handleUpdateProject} tasks={tasks} setTasks={setTasks} allTasks={allTasks} allTickets={tickets} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLinkItem={handleLinkItem} onUnlinkItem={handleUnlinkItem} />}
          {currentView === 'features' && <FeatureList features={filteredFeatures} onDelete={handleDeleteFeature} onFeatureClick={setSelectedFeature}/>}
          {currentView === 'meetings' && <MeetingList meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} meetingFilters={meetingFilters} setMeetingFilters={setMeetingFilters} />}
        </div>
      </main>
      
      {isFormOpen && (
          <Modal title={getFormTitle()} onClose={() => setIsFormOpen(false)}>
              {renderForm()}
          </Modal>
      )}

      {isExportModalOpen && (
        <Modal title="Export Data" onClose={() => setIsExportModalOpen(false)}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Select which fields you would like to include in your CSV export for each data type.</p>
                <ExportSelector title="Tickets" data={tickets} onExport={handleExport} />
                <ExportSelector title="Projects" data={projects} onExport={handleExport} />
                <ExportSelector title="Dealerships" data={dealerships} onExport={handleExport} />
                <ExportSelector title="Standalone Tasks" data={tasks} onExport={handleExport} />
                <ExportSelector title="Features" data={features} onExport={handleExport} />
                <ExportSelector title="Meetings" data={meetings} onExport={handleExport} />
            </div>
        </Modal>
      )}

       {isImportModalOpen && (
          <Modal title="Import Data" onClose={() => setIsImportModalOpen(false)}>
              <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-700">Import data from CSV files. Please ensure the CSV format matches the export format for best results.</p>
                    <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
                        <p><strong>Append:</strong> Adds new records. New IDs will be generated, which may break relationships (e.g., ticket-to-project links).</p>
                        <p className="mt-1"><strong>Replace:</strong> Deletes all current data and replaces it with the file's content.</p>
                    </div>
                  </div>

                  <ImportSection title="Tickets" onImport={(file, mode) => handleImport(file, setTickets, mode)} showToast={showToast} />
                  <ImportSection title="Projects" onImport={(file, mode) => handleImport(file, setProjects, mode)} showToast={showToast} />
                  <ImportSection title="Dealerships" onImport={(file, mode) => handleImport(file, setDealerships, mode)} showToast={showToast} />
                  <ImportSection title="Standalone Tasks" onImport={(file, mode) => handleImport(file, setTasks, mode)} showToast={showToast} />
                  <ImportSection title="Features" onImport={(file, mode) => handleImport(file, setFeatures, mode)} showToast={showToast} />
                  <ImportSection title="Meetings" onImport={(file, mode) => handleImport(file, setMeetings, mode)} showToast={showToast} />
              </div>
          </Modal>
      )}


      <SideView 
        title={selectedTicket?.title || selectedProject?.name || selectedDealership?.name || selectedMeeting?.name || selectedFeature?.title || ''}
        isOpen={!!(selectedTicket || selectedProject || selectedDealership || selectedMeeting || selectedFeature)}
        onClose={() => {
            setSelectedTicket(null);
            setSelectedProject(null);
            setSelectedDealership(null);
            setSelectedMeeting(null);
            setSelectedFeature(null);
        }}
      >
        {selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            onUpdate={handleUpdateTicket}
            onAddUpdate={(comment, author, date) => handleAddUpdate(selectedTicket.id, comment, author, date)}
            onExport={() => handleExportTicket(selectedTicket)}
            onEmail={() => handleEmailTicket(selectedTicket)}
            onUpdateCompletionNotes={(notes) => handleUpdateCompletionNotes(selectedTicket.id, notes)}
            onDelete={handleDeleteTicket}
            allTickets={tickets}
            allProjects={projects}
            allTasks={allTasks}
            allMeetings={meetings}
            allDealerships={dealerships}
            allFeatures={features}
            onLink={(toType, toId) => handleLinkItem('ticket', selectedTicket.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('ticket', selectedTicket.id, toType, toId)}
          />
        )}
        {selectedProject && <ProjectDetailView project={selectedProject} onUpdate={handleUpdateProject} onDelete={handleDeleteProject} onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)} allTickets={tickets} allProjects={projects} allTasks={allTasks} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLink={(toType, toId) => handleLinkItem('project', selectedProject.id, toType, toId)} onUnlink={(toType, toId) => handleUnlinkItem('project', selectedProject.id, toType, toId)} />}
        {selectedDealership && <DealershipDetailView dealership={selectedDealership} onUpdate={handleUpdateDealership} onDelete={handleDeleteDealership} allTickets={tickets} allProjects={projects} allTasks={allTasks} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLink={(toType, toId) => handleLinkItem('dealership', selectedDealership.id, toType, toId)} onUnlink={(toType, toId) => handleUnlinkItem('dealership', selectedDealership.id, toType, toId)} />}
        {selectedMeeting && <MeetingDetailView meeting={selectedMeeting} onUpdate={handleUpdateMeeting} onDelete={handleDeleteMeeting} allTickets={tickets} allProjects={projects} allTasks={allTasks} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLink={(toType, toId) => handleLinkItem('meeting', selectedMeeting.id, toType, toId)} onUnlink={(toType, toId) => handleUnlinkItem('meeting', selectedMeeting.id, toType, toId)} />}
        {selectedFeature && <FeatureDetailView feature={selectedFeature} onUpdate={handleUpdateFeature} onDelete={handleDeleteFeature} allTickets={tickets} allProjects={projects} allTasks={allTasks} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLink={(toType, toId) => handleLinkItem('feature', selectedFeature.id, toType, toId)} onUnlink={(toType, toId) => handleUnlinkItem('feature', selectedFeature.id, toType, toId)} />}
      </SideView>
    </div>
  );
}

export default App;
