

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus } from './types.ts';
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
import TicketDetailView from './components/TicketDetailView.tsx';
import FeatureDetailView from './components/FeatureDetailView.tsx';
import ExportModal from './components/ExportModal.tsx';
import ProjectInsights from './components/ProjectInsights.tsx';
import TaskInsights from './components/TaskInsights.tsx';
import EditTaskForm from './components/common/EditTaskForm.tsx';
// FIX: Import the 'MeetingForm' component to resolve the "Cannot find name" error.
import MeetingForm from './components/MeetingForm.tsx';


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
    onDownloadTemplate: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ title, onImport, onDownloadTemplate, showToast }) => {
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
        } else {
            showToast('Please select a file to import.', 'error');
        }
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-800">{title}</h4>
              <button
                  type="button"
                  onClick={onDownloadTemplate}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span>Template</span>
              </button>
            </div>
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
  const [editingTask, setEditingTask] = useState<(Task & { projectId: string | null; projectName?: string; ticketId: string | null; ticketTitle?: string; }) | null>(null);

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
      (p.tasks || []).map(task => ({
        ...task,
        projectId: p.id,
        projectName: p.name,
        ticketId: null,
        ticketTitle: null,
      }))
    );
     const ticketTasks = tickets.flatMap(t => 
        (t.tasks || []).map(task => ({
            ...task,
            projectId: null,
            projectName: null,
            ticketId: t.id,
            ticketTitle: t.title,
        }))
    );
    const standaloneTasks = tasks.map(t => ({
        ...t,
        projectId: null,
        projectName: 'General',
        ticketId: null,
        ticketTitle: null,
    }));
    return [...projectTasks, ...ticketTasks, ...standaloneTasks];
  }, [projects, tickets, tasks]);
  
  const handleTicketSubmit = (newTicketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
      updates: [],
      tasks: [],
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

  const handleAddTask = (newTask: Task, parent: { type: 'project' | 'standalone', id?: string }) => {
    if (parent.type === 'project' && parent.id) {
        const project = projects.find(p => p.id === parent.id);
        if (project) {
            handleUpdateProject({ ...project, tasks: [...project.tasks, newTask]});
        }
    } else { // standalone
        setTasks(prev => [...prev, newTask]);
    }
    showToast('Task added!', 'success');
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

    const handleUpdateTask = (updatedTask: Task) => {
        const taskInAll = allTasks.find(t => t.id === updatedTask.id);
        if (!taskInAll) return;

        if (taskInAll.projectId) {
            const project = projects.find(p => p.id === taskInAll.projectId);
            if (project) {
                const updatedTasks = project.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
                handleUpdateProject({ ...project, tasks: updatedTasks });
            }
        } else if (taskInAll.ticketId) {
            const ticket = tickets.find(t => t.id === taskInAll.ticketId);
            if(ticket) {
                const updatedTasks = (ticket.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t);
                handleUpdateTicket({ ...ticket, tasks: updatedTasks });
            }
        } else {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        }
        setEditingTask(null);
        showToast('Task updated!', 'success');
    };

    const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
        const taskInAll = allTasks.find(t => t.id === taskId);
        if (!taskInAll) return;

        const updatedTask = { ...taskInAll, status: newStatus };
        
        if (taskInAll.projectId) {
            const project = projects.find(p => p.id === taskInAll.projectId);
            if (project) {
                const updatedTasks = project.tasks.map(t => t.id === taskId ? updatedTask : t);
                handleUpdateProject({ ...project, tasks: updatedTasks });
            }
        } else if (taskInAll.ticketId) {
            const ticket = tickets.find(t => t.id === taskInAll.ticketId);
            if (ticket) {
                const updatedTasks = (ticket.tasks || []).map(t => t.id === taskId ? updatedTask : t);
                handleUpdateTicket({ ...ticket, tasks: updatedTasks });
            }
        } else {
            setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
        }
        showToast('Task status updated!', 'success');
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
  
    const handleDeleteTask = (taskId: string) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        const taskInAll = allTasks.find(t => t.id === taskId);
        if (!taskInAll) return;

        if (taskInAll.projectId) {
            const project = projects.find(p => p.id === taskInAll.projectId);
            if (project) {
                const updatedTasks = project.tasks.filter(t => t.id !== taskId);
                handleUpdateProject({ ...project, tasks: updatedTasks });
            }
        } else if (taskInAll.ticketId) {
            const ticket = tickets.find(t => t.id === taskInAll.ticketId);
            if (ticket) {
                const updatedTasks = (ticket.tasks || []).filter(t => t.id !== taskId);
                handleUpdateTicket({ ...ticket, tasks: updatedTasks });
            }
        } else {
            setTasks(prev => prev.filter(t => t.id !== taskId));
        }
        showToast('Task deleted!', 'success');
    };

  const handleAddUpdate = (id: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { id: crypto.randomUUID(), author, date: new Date(`${date}T00:00:00`).toISOString(), comment };
    
    if (currentView === 'tickets' && selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { ...selectedTicket, updates: [...(selectedTicket.updates || []), newUpdate] };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (currentView === 'projects' && selectedProject && selectedProject.id === id) {
        const updatedProject = { ...selectedProject, updates: [...(selectedProject.updates || []), newUpdate] };
        setSelectedProject(updatedProject);
        // FIX: The variable 't' was used here instead of 'p', causing an error.
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    } else if (currentView === 'dealerships' && selectedDealership && selectedDealership.id === id) {
        const updatedDealership = { ...selectedDealership, updates: [...(selectedDealership.updates || []), newUpdate] };
        setSelectedDealership(updatedDealership);
        setDealerships(prevDealerships => prevDealerships.map(d => d.id === id ? updatedDealership : d));
    }
    showToast('Update added!', 'success');
  };

  const handleEditUpdate = (id: string, updatedUpdate: Update) => {
    if (currentView === 'tickets' && selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { 
            ...selectedTicket, 
            updates: (selectedTicket.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (currentView === 'projects' && selectedProject && selectedProject.id === id) {
        const updatedProject = { 
            ...selectedProject, 
            updates: (selectedProject.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedProject(updatedProject);
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    } else if (currentView === 'dealerships' && selectedDealership && selectedDealership.id === id) {
        const updatedDealership = { 
            ...selectedDealership, 
            updates: (selectedDealership.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedDealership(updatedDealership);
        setDealerships(prevDealerships => prevDealerships.map(d => d.id === id ? updatedDealership : d));
    }
    showToast('Update modified!', 'success');
  };

  const handleDeleteUpdate = (id: string, updateId: string) => {
    if (currentView === 'tickets' && selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { 
            ...selectedTicket, 
            updates: (selectedTicket.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (currentView === 'projects' && selectedProject && selectedProject.id === id) {
        const updatedProject = { 
            ...selectedProject, 
            updates: (selectedProject.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedProject(updatedProject);
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    } else if (currentView === 'dealerships' && selectedDealership && selectedDealership.id === id) {
        const updatedDealership = { 
            ...selectedDealership, 
            updates: (selectedDealership.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedDealership(updatedDealership);
        setDealerships(prevDealerships => prevDealerships.map(d => d.id === id ? updatedDealership : d));
    }
    showToast('Update deleted!', 'success');
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

    const handleToggleFavoriteTicket = (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, isFavorite: !t.isFavorite } : t
        ));
        if (ticket) {
            showToast(
                !ticket.isFavorite ? 'Ticket added to favorites!' : 'Ticket removed from favorites.',
                'success'
            );
        }
    };
    
    const createTxtFileDownloader = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename.replace(/[\s/\\?%*:|"<>]/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportTicket = (ticket: Ticket) => {
        let content = `Title: ${ticket.title}\n`;
        content += `Type: ${ticket.type}\n`;
        content += `Status: ${ticket.status}\n`;
        content += `Priority: ${ticket.priority}\n`;
        content += `Submitter: ${ticket.submitterName}\n`;
        content += `Submission Date: ${new Date(ticket.submissionDate).toLocaleDateString()}\n\n`;

        if (ticket.type === TicketType.Issue) {
            content += `Problem: ${(ticket as IssueTicket).problem}\n`;
            content += `Duplication Steps: ${(ticket as IssueTicket).duplicationSteps}\n`;
        } else {
            content += `Improvement: ${(ticket as FeatureRequestTicket).improvement}\n`;
            content += `Current Functionality: ${(ticket as FeatureRequestTicket).currentFunctionality}\n`;
        }
        
        createTxtFileDownloader(content, ticket.title);
    };

    const handleExportProject = (project: Project) => {
        let content = `Project Name: ${project.name}\n`;
        content += `Status: ${project.status}\n`;
        content += `Creation Date: ${new Date(project.creationDate).toLocaleDateString()}\n\n`;
        content += `Description:\n${project.description}\n\n`;
        content += `Involved People: ${(project.involvedPeople || []).join(', ')}\n\n`;
        content += `Tasks (${(project.tasks || []).length}):\n`;
        (project.tasks || []).forEach(task => {
            content += `- ${task.description} (Assigned: ${task.assignedUser}, Status: ${task.status})\n`;
        });
        createTxtFileDownloader(content, project.name);
    };

    const handleExportTask = (task: Task) => {
        let content = `Task: ${task.description}\n`;
        content += `Status: ${task.status}\n`;
        content += `Priority: ${task.priority}\n`;
        content += `Assigned to: ${task.assignedUser}\n`;
        content += `Type: ${task.type}\n`;
        content += `Creation Date: ${new Date(task.creationDate).toLocaleDateString()}\n`;
        if (task.dueDate) {
            content += `Due Date: ${new Date(task.dueDate).toLocaleDateString()}\n`;
        }
        if (task.notifyOnCompletion) {
            content += `Notify on Completion: ${task.notifyOnCompletion}\n`;
        }
        createTxtFileDownloader(content, task.description.substring(0, 30));
    };

    const handleExportMeeting = (meeting: Meeting) => {
        let content = `Meeting: ${meeting.name}\n`;
        content += `Date: ${new Date(meeting.meetingDate).toLocaleDateString()}\n`;
        content += `Attendees: ${meeting.attendees.join(', ')}\n\n`;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = meeting.notes;
        const notesText = tempDiv.textContent || tempDiv.innerText || "";
        content += `Notes:\n${notesText}\n`;
        createTxtFileDownloader(content, meeting.name);
    };

    const handleExportDealership = (dealership: Dealership) => {
        let content = `Dealership: ${dealership.name}\n`;
        content += `Account Number (CIF): ${dealership.accountNumber}\n`;
        content += `Status: ${dealership.status}\n`;
        content += `Assigned Specialist: ${dealership.assignedSpecialist || 'N/A'}\n\n`;
        content += `Enterprise: ${dealership.enterprise || 'N/A'}\n`;
        content += `Address: ${dealership.address || 'N/A'}\n\n`;
        content += `Go-Live Date: ${dealership.goLiveDate ? new Date(dealership.goLiveDate).toLocaleDateString() : 'N/A'}\n`;
        createTxtFileDownloader(content, dealership.name);
    };

    const handleExportFeature = (feature: FeatureAnnouncement) => {
        let content = `Feature: ${feature.title}\n`;
        content += `Status: ${feature.status}\n`;
        content += `Platform: ${feature.platform}\n`;
        content += `Launch Date: ${new Date(feature.launchDate).toLocaleDateString()}\n`;
        if (feature.version) {
            content += `Version: ${feature.version}\n`;
        }
        content += `\nDescription:\n${feature.description}\n`;
        createTxtFileDownloader(content, feature.title);
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
            } else if (task?.ticketId) {
                 setTickets(prev => prev.map(t => 
                    t.id === task.ticketId 
                    ? { ...t, tasks: (t.tasks || []).map(subTask => subTask.id === id ? updateFn(subTask) : subTask) }
                    : t
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
        const getLastActivityDate = (ticket: Ticket): number => {
            const submissionTimestamp = new Date(ticket.submissionDate).getTime();
            if (!ticket.updates || ticket.updates.length === 0) {
                return submissionTimestamp;
            }
            const updateTimestamps = ticket.updates.map(u => new Date(u.date).getTime());
            return Math.max(submissionTimestamp, ...updateTimestamps);
        };
        
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
        }).sort((a, b) => getLastActivityDate(b) - getLastActivityDate(a));
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

    const dealershipInsights = useMemo(() => {
        const pendingStatuses = [DealershipStatus.PendingFocus, DealershipStatus.PendingDmt, DealershipStatus.PendingSetup];
        return {
            totalDealerships: dealerships.filter(d => d.status !== DealershipStatus.Cancelled).length,
            liveAccounts: dealerships.filter(d => d.status === DealershipStatus.Live).length,
            pendingAccounts: dealerships.filter(d => pendingStatuses.includes(d.status)).length,
        }
    }, [dealerships]);

    const projectInsights = useMemo(() => ({
        totalProjects: projects.length,
        inProgressProjects: projects.filter(p => p.status === ProjectStatus.InProgress).length,
        completedProjects: projects.filter(p => p.status === ProjectStatus.Completed).length,
    }), [projects]);

    const taskInsights = useMemo(() => {
        const activeTasks = allTasks.filter(t => t.status !== TaskStatus.Done);
        return {
            totalTasks: activeTasks.length,
            toDoTasks: activeTasks.filter(t => t.status === TaskStatus.ToDo).length,
            inProgressTasks: activeTasks.filter(t => t.status === TaskStatus.InProgress).length,
        };
    }, [allTasks]);

    const getTemplateHeaders = (title: string): string[] => {
      switch (title) {
          case 'Tickets':
              return ['id', 'title', 'type', 'productArea', 'platform', 'pmrNumber', 'pmrLink', 'fpTicketNumber', 'ticketThreadId', 'submissionDate', 'startDate', 'estimatedCompletionDate', 'completionDate', 'status', 'priority', 'submitterName', 'client', 'location', 'updates', 'completionNotes', 'onHoldReason', 'projectIds', 'linkedTicketIds', 'meetingIds', 'taskIds', 'dealershipIds', 'featureIds', 'problem', 'duplicationSteps', 'workaround', 'frequency', 'improvement', 'currentFunctionality', 'suggestedSolution', 'benefits'];
          case 'Projects':
              return ['id', 'name', 'description', 'status', 'tasks', 'creationDate', 'updates', 'involvedPeople', 'ticketIds', 'meetingIds', 'linkedProjectIds', 'taskIds', 'dealershipIds', 'featureIds'];
          case 'Dealerships':
              return ['id', 'name', 'accountNumber', 'status', 'orderNumber', 'orderReceivedDate', 'goLiveDate', 'termDate', 'enterprise', 'storeNumber', 'branchNumber', 'eraSystemId', 'ppSysId', 'buId', 'address', 'assignedSpecialist', 'sales', 'pocName', 'pocEmail', 'pocPhone', 'ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'linkedDealershipIds', 'featureIds'];
          case 'Standalone Tasks':
              return ['id', 'description', 'assignedUser', 'status', 'priority', 'type', 'creationDate', 'dueDate', 'notifyOnCompletion', 'linkedTaskIds', 'ticketIds', 'projectIds', 'meetingIds', 'dealershipIds', 'featureIds'];
          case 'Features':
              return ['id', 'title', 'location', 'description', 'launchDate', 'version', 'platform', 'status', 'ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'dealershipIds', 'linkedFeatureIds'];
          case 'Meetings':
              return ['id', 'name', 'meetingDate', 'attendees', 'notes', 'projectIds', 'ticketIds', 'linkedMeetingIds', 'taskIds', 'dealershipIds', 'featureIds'];
          default:
              return [];
      }
    };

    const handleDownloadTemplate = (title: string) => {
        const headers = getTemplateHeaders(title);
        if (headers.length === 0) {
            showToast(`Template for "${title}" is not available.`, 'error');
            return;
        }
        const csvHeader = headers.join(',') + '\n';
        const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/\s+/g, '_')}_template.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const formatImportedRow = (row: any, entityType: string): any => {
        const formattedRow = { ...row };
    
        const dateFields: string[] = [];
        const arrayFields: string[] = [];
        const jsonFields: string[] = ['updates', 'tasks'];
    
        switch (entityType) {
            case 'Tickets':
                dateFields.push('submissionDate', 'startDate', 'estimatedCompletionDate', 'completionDate');
                arrayFields.push('projectIds', 'linkedTicketIds', 'meetingIds', 'taskIds', 'dealershipIds', 'featureIds');
                break;
            case 'Projects':
                dateFields.push('creationDate');
                arrayFields.push('ticketIds', 'meetingIds', 'linkedProjectIds', 'taskIds', 'dealershipIds', 'featureIds', 'involvedPeople');
                break;
            case 'Dealerships':
                dateFields.push('orderReceivedDate', 'goLiveDate', 'termDate');
                arrayFields.push('ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'linkedDealershipIds', 'featureIds');
                break;
            case 'Standalone Tasks':
                dateFields.push('creationDate', 'dueDate');
                arrayFields.push('linkedTaskIds', 'ticketIds', 'projectIds', 'meetingIds', 'dealershipIds', 'featureIds');
                break;
            case 'Features':
                dateFields.push('launchDate');
                arrayFields.push('ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'dealershipIds', 'linkedFeatureIds');
                break;
            case 'Meetings':
                dateFields.push('meetingDate');
                arrayFields.push('attendees', 'projectIds', 'ticketIds', 'linkedMeetingIds', 'taskIds', 'dealershipIds', 'featureIds');
                break;
        }
    
        const toUtcIsoString = (dateString?: string): string | undefined => {
            if (!dateString || typeof dateString !== 'string') return undefined;
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return undefined;
            // Treat date-only strings as UTC to avoid timezone shifts
            if (!dateString.includes('T')) {
                const tzOffset = date.getTimezoneOffset() * 60000;
                return new Date(date.getTime() + tzOffset).toISOString();
            }
            return date.toISOString();
        };
    
        dateFields.forEach(field => {
            if (formattedRow[field]) {
                formattedRow[field] = toUtcIsoString(formattedRow[field]);
            }
        });
    
        arrayFields.forEach(field => {
            const value = formattedRow[field];
            if (value && typeof value === 'string') {
                try {
                    // Try parsing as JSON first, be lenient with quotes
                    const parsed = JSON.parse(value.replace(/'/g, '"'));
                    if (Array.isArray(parsed)) {
                        formattedRow[field] = parsed.map(String).filter(Boolean);
                    } else {
                         formattedRow[field] = value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                    }
                } catch (e) {
                    // If JSON parsing fails, treat as comma/semicolon-separated
                    formattedRow[field] = value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                }
            } else if (!Array.isArray(value)) {
                formattedRow[field] = [];
            }
        });
        
        jsonFields.forEach(field => {
            if (formattedRow[field] && typeof formattedRow[field] === 'string') {
                try {
                    formattedRow[field] = JSON.parse(formattedRow[field]);
                } catch (e) {
                    console.warn(`Could not parse JSON for field '${field}'`, { value: formattedRow[field] });
                    formattedRow[field] = (field === 'tasks') ? [] : undefined;
                }
            }
        });
    
        return formattedRow;
    };

    const handleImport = (file: File, title: string, mode: 'append' | 'replace') => {
        if (!file) {
            showToast('No file selected.', 'error');
            return;
        }
    
        const requiredFieldsMap: Record<string, string[]> = {
            'Tickets': ['title', 'type', 'submitterName'],
            'Projects': ['name'],
            'Dealerships': ['name', 'accountNumber'],
            'Standalone Tasks': ['description'],
            'Features': ['title', 'launchDate', 'status'],
            'Meetings': ['name', 'meetingDate'],
        };

        const settersMap: Record<string, React.Dispatch<React.SetStateAction<any[]>>> = {
            'Tickets': setTickets,
            'Projects': setProjects,
            'Dealerships': setDealerships,
            'Standalone Tasks': setTasks,
            'Features': setFeatures,
            'Meetings': setMeetings,
        };

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
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
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
                        const value = values[index];
                        obj[header] = value === '' || value === undefined ? undefined : value;
                    });
                    return obj;
                }).filter(Boolean);

                const requiredFields = requiredFieldsMap[title] || [];
                const validData: any[] = [];
                let failedRowCount = 0;

                data.forEach((row, index) => {
                    if (!row) return;
                    
                    const formattedRow = formatImportedRow(row, title);

                    const missingFields = requiredFields.filter(field => !formattedRow[field] || String(formattedRow[field]).trim() === '');
                    if (missingFields.length > 0) {
                        console.error(`Import Error in ${file.name} (Row ${index + 2}): Missing required fields - ${missingFields.join(', ')}`, { row: formattedRow });
                        failedRowCount++;
                    } else {
                        validData.push(formattedRow);
                    }
                });

                const successfulRowCount = validData.length;
                const setter = settersMap[title];

                if (!setter) {
                    showToast(`Could not import data for "${title}".`, 'error');
                    return;
                }

                if (mode === 'replace') {
                    setter(validData as any[]);
                } else { // append
                    const dataWithNewIds = validData.map(item => ({ ...item, id: item.id || crypto.randomUUID() }));
                    setter((currentData: any[]) => [...currentData, ...dataWithNewIds]);
                }

                let toastMessage = `Import from ${file.name} complete. `;
                let toastType: 'success' | 'error' = 'success';
                
                if (successfulRowCount > 0) {
                    toastMessage += `${successfulRowCount} row(s) imported. `;
                }
                if (failedRowCount > 0) {
                    toastMessage += `${failedRowCount} row(s) failed. Check console for details.`;
                    if (successfulRowCount === 0) toastType = 'error';
                }
                
                showToast(toastMessage.trim(), toastType);
                
                if (successfulRowCount > 0 && failedRowCount === 0) {
                    setIsImportModalOpen(false);
                }

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
    
    const closeAllSideViews = () => {
        setSelectedTicket(null);
        setSelectedProject(null);
        setSelectedDealership(null);
        setSelectedMeeting(null);
        setSelectedFeature(null);
    };

    const handleSwitchToDetailView = (type: EntityType, id: string) => {
        closeAllSideViews();
        // A small delay allows for a smoother visual transition if a side view is already open.
        setTimeout(() => {
            switch (type) {
                case 'ticket':
                    const ticket = tickets.find(t => t.id === id);
                    if (ticket) setSelectedTicket(ticket);
                    break;
                case 'project':
                    const project = projects.find(p => p.id === id);
                    if (project) setSelectedProject(project);
                    break;
                case 'dealership':
                    const dealership = dealerships.find(d => d.id === id);
                    if (dealership) setSelectedDealership(dealership);
                    break;
                case 'meeting':
                    const meeting = meetings.find(m => m.id === id);
                    if (meeting) setSelectedMeeting(meeting);
                    break;
                case 'feature':
                    const feature = features.find(f => f.id === id);
                    if (feature) setSelectedFeature(feature);
                    break;
                case 'task':
                    const task = allTasks.find(t => t.id === id);
                    if (task) setEditingTask(task);
                    break;
                default:
                    break;
            }
        }, 100);
    };

    const handleSwitchFromTaskModal = (type: EntityType, id: string) => {
        setEditingTask(null);
        handleSwitchToDetailView(type, id);
    };

    const handleViewChange = (view: View) => {
        setCurrentView(view);
        closeAllSideViews();
    }

    const dataSourcesForExport = [
      { title: 'Tickets', data: tickets },
      { title: 'Projects', data: projects },
      { title: 'Dealerships', data: dealerships },
      { title: 'Standalone Tasks', data: tasks },
      { title: 'Features', data: features },
      { title: 'Meetings', data: meetings },
    ];
    
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
                onToggleFavorite={handleToggleFavoriteTicket}
              />
            </>
          )}
          {currentView === 'projects' && (
            <>
              <ProjectInsights {...projectInsights} />
              <ProjectList projects={filteredProjects} onProjectClick={setSelectedProject} tickets={tickets}/>
            </>
          )}
          {currentView === 'dealerships' && (
              <>
                <DealershipInsights {...dealershipInsights} />
                <DealershipList dealerships={filteredDealerships} onDealershipClick={setSelectedDealership} />
              </>
          )}
          {currentView === 'tasks' && (
            <>
              <TaskInsights {...taskInsights} />
              <TaskList 
                projects={projects} 
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                allTasks={allTasks} 
                onSwitchView={handleSwitchToDetailView} 
              />
            </>
          )}
          {currentView === 'features' && <FeatureList features={filteredFeatures} onDelete={handleDeleteFeature} onFeatureClick={setSelectedFeature}/>}
          {currentView === 'meetings' && <MeetingList meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} meetingFilters={meetingFilters} setMeetingFilters={setMeetingFilters} />}
        </div>
      </main>
      
      {isFormOpen && (
          <Modal title={getFormTitle()} onClose={() => setIsFormOpen(false)}>
              {renderForm()}
          </Modal>
      )}

      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)}>
            <EditTaskForm 
                task={editingTask} 
                onSave={handleUpdateTask} 
                onClose={() => setEditingTask(null)}
                onExport={() => handleExportTask(editingTask)}
                allTasks={allTasks}
                allTickets={tickets}
                allProjects={projects}
                allMeetings={meetings}
                allDealerships={dealerships}
                allFeatures={features}
                onLink={(toType, toId) => handleLinkItem('task', editingTask.id, toType as EntityType, toId)}
                onUnlink={(toType, toId) => handleUnlinkItem('task', editingTask.id, toType as EntityType, toId)}
                onSwitchView={handleSwitchFromTaskModal}
            />
        </Modal>
      )}

      {isExportModalOpen && (
        <ExportModal
          onClose={() => setIsExportModalOpen(false)}
          dataSources={dataSourcesForExport}
          showToast={showToast}
        />
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

                  <ImportSection title="Tickets" onImport={(file, mode) => handleImport(file, "Tickets", mode)} onDownloadTemplate={() => handleDownloadTemplate("Tickets")} showToast={showToast} />
                  <ImportSection title="Projects" onImport={(file, mode) => handleImport(file, "Projects", mode)} onDownloadTemplate={() => handleDownloadTemplate("Projects")} showToast={showToast} />
                  <ImportSection title="Dealerships" onImport={(file, mode) => handleImport(file, "Dealerships", mode)} onDownloadTemplate={() => handleDownloadTemplate("Dealerships")} showToast={showToast} />
                  <ImportSection title="Standalone Tasks" onImport={(file, mode) => handleImport(file, "Standalone Tasks", mode)} onDownloadTemplate={() => handleDownloadTemplate("Standalone Tasks")} showToast={showToast} />
                  <ImportSection title="Features" onImport={(file, mode) => handleImport(file, "Features", mode)} onDownloadTemplate={() => handleDownloadTemplate("Features")} showToast={showToast} />
                  <ImportSection title="Meetings" onImport={(file, mode) => handleImport(file, "Meetings", mode)} onDownloadTemplate={() => handleDownloadTemplate("Meetings")} showToast={showToast} />
              </div>
          </Modal>
      )}


      <SideView 
        title={selectedTicket?.title || selectedProject?.name || selectedDealership?.name || selectedMeeting?.name || selectedFeature?.title || ''}
        isOpen={!!(selectedTicket || selectedProject || selectedDealership || selectedMeeting || selectedFeature)}
        onClose={closeAllSideViews}
      >
        {selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            onUpdate={handleUpdateTicket}
            onAddUpdate={(comment, author, date) => handleAddUpdate(selectedTicket.id, comment, author, date)}
            onEditUpdate={(updatedUpdate) => handleEditUpdate(selectedTicket.id, updatedUpdate)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedTicket.id, updateId)}
            onExport={() => handleExportTicket(selectedTicket)}
            onEmail={() => handleEmailTicket(selectedTicket)}
            onDelete={handleDeleteTicket}
            allTickets={tickets}
            allProjects={projects}
            allTasks={allTasks}
            allMeetings={meetings}
            allDealerships={dealerships}
            allFeatures={features}
            onLink={(toType, toId) => handleLinkItem('ticket', selectedTicket.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('ticket', selectedTicket.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
          />
        )}
        {selectedProject && <ProjectDetailView 
            project={selectedProject} 
            onUpdate={handleUpdateProject} 
            onDelete={handleDeleteProject}
            onExport={() => handleExportProject(selectedProject)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)} 
            onEditUpdate={(updatedUpdate) => handleEditUpdate(selectedProject.id, updatedUpdate)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedProject.id, updateId)}
            allTickets={tickets} 
            allProjects={projects} 
            allTasks={allTasks} 
            allMeetings={meetings} 
            allDealerships={dealerships} 
            allFeatures={features} 
            onLink={(toType, toId) => handleLinkItem('project', selectedProject.id, toType, toId)} 
            onUnlink={(toType, toId) => handleUnlinkItem('project', selectedProject.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView} />}
        {selectedDealership && <DealershipDetailView 
            dealership={selectedDealership} 
            onUpdate={handleUpdateDealership} 
            onDelete={handleDeleteDealership} 
            onExport={() => handleExportDealership(selectedDealership)} 
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(updatedUpdate) => handleEditUpdate(selectedDealership.id, updatedUpdate)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedDealership.id, updateId)}
            allTickets={tickets} allProjects={projects} allTasks={allTasks} 
            allMeetings={meetings} allDealerships={dealerships} allFeatures={features} 
            onLink={(toType, toId) => handleLinkItem('dealership', selectedDealership.id, toType, toId)} 
            onUnlink={(toType, toId) => handleUnlinkItem('dealership', selectedDealership.id, toType, toId)} onSwitchView={handleSwitchToDetailView} />}
        {selectedMeeting && <MeetingDetailView meeting={selectedMeeting} onUpdate={handleUpdateMeeting} onDelete={handleDeleteMeeting} onExport={() => handleExportMeeting(selectedMeeting)} allTickets={tickets} allProjects={projects} allTasks={allTasks} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLink={(toType, toId) => handleLinkItem('meeting', selectedMeeting.id, toType, toId)} onUnlink={(toType, toId) => handleUnlinkItem('meeting', selectedMeeting.id, toType, toId)} onSwitchView={handleSwitchToDetailView} />}
        {selectedFeature && <FeatureDetailView feature={selectedFeature} onUpdate={handleUpdateFeature} onDelete={handleDeleteFeature} onExport={() => handleExportFeature(selectedFeature)} allTickets={tickets} allProjects={projects} allTasks={allTasks} allMeetings={meetings} allDealerships={dealerships} allFeatures={features} onLink={(toType, toId) => handleLinkItem('feature', selectedFeature.id, toType, toId)} onUnlink={(toType, toId) => handleUnlinkItem('feature', selectedFeature.id, toType, toId)} onSwitchView={handleSwitchToDetailView} />}
      </SideView>
    </div>
  );
}

export default App;