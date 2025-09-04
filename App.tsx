

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus, FeatureStatus, TaskPriority, FeatureAnnouncementFilterState, SavedTicketView, Contact, ContactGroup, ContactFilterState, DealershipGroup } from './types.ts';
import TicketList from './components/TicketList.tsx';
import TicketForm from './components/TicketForm.tsx';
import LeftSidebar from './components/FilterBar.tsx';
import SideView from './components/common/SideView.tsx';
import { PencilIcon } from './components/icons/PencilIcon.tsx';
import PerformanceInsights from './components/PerformanceInsights.tsx';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { MenuIcon } from './components/icons/MenuIcon.tsx';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, TICKET_TYPE_OPTIONS, PRODUCT_AREA_OPTIONS, PLATFORM_OPTIONS, DEALERSHIP_STATUS_OPTIONS } from './constants.ts';
import { TrashIcon } from './components/icons/TrashIcon.tsx';
import Modal from './components/common/Modal.tsx';
import { EmailIcon } from './components/icons/EmailIcon.tsx';
import { XIcon } from './components/icons/XIcon.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { initialTickets, initialProjects, initialDealerships, initialTasks, initialFeatures, initialMeetings, initialContacts, initialContactGroups, initialDealershipGroups } from './mockData.ts';
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
import MeetingForm from './components/MeetingForm.tsx';
import DashboardView from './components/DashboardView.tsx';
import BulkActionBar from './components/common/BulkActionBar.tsx';
import SavedViewsBar from './components/SavedViewsBar.tsx';
import { TicketIcon } from './components/icons/TicketIcon.tsx';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon.tsx';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon.tsx';
import { BuildingStorefrontIcon } from './components/icons/BuildingStorefrontIcon.tsx';
import { SparklesIcon } from './components/icons/SparklesIcon.tsx';
import { UsersIcon } from './components/icons/UsersIcon.tsx';
import ContactsView from './components/ContactsView.tsx';
import ContactForm from './components/ContactForm.tsx';
import ContactGroupForm from './components/ContactGroupForm.tsx';
import DealershipGroupForm from './components/DealershipGroupForm.tsx';


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
                    <option value="replace">Update &amp; Replace</option>
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

const normalizeEnumValue = <T extends string>(value: any, validEnumValues: readonly T[]): T | undefined => {
    if (typeof value !== 'string' || !value) return undefined;
    const normalizedValue = value.toLowerCase().replace(/[\s_-]/g, '');
    for (const enumValue of validEnumValues) {
        const normalizedEnumValue = String(enumValue).toLowerCase().replace(/[\s_-]/g, '');
        if (normalizedValue === normalizedEnumValue) {
            return enumValue;
        }
    }
    // Special case for priorities like P1, p2, etc.
    if (validEnumValues.some(v => v.startsWith('P'))) {
        const priorityMatch = value.match(/^[pP]?(\d+)$/);
        if (priorityMatch) {
            const target = `P${priorityMatch[1]}` as T;
            if (validEnumValues.includes(target)) {
                return target;
            }
        }
    }
    return undefined;
};

const normalizeBooleanValue = (value: any): boolean | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    const lowerValue = String(value).toLowerCase().trim();
    if (['true', '1', 'yes', 'y'].includes(lowerValue)) {
        return true;
    }
    if (['false', '0', 'no', 'n', ''].includes(lowerValue)) {
        return false;
    }
    return undefined;
};

// Hardcoded current user for dashboard widgets
const CURRENT_USER = 'John Doe';

function App() {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', initialProjects);
  const [dealerships, setDealerships] = useLocalStorage<Dealership[]>('dealerships', initialDealerships);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [features, setFeatures] = useLocalStorage<FeatureAnnouncement[]>('features', initialFeatures);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', initialMeetings);
  const [contacts, setContacts] = useLocalStorage<Contact[]>('contacts', initialContacts);
  const [contactGroups, setContactGroups] = useLocalStorage<ContactGroup[]>('contactGroups', initialContactGroups);
  const [dealershipGroups, setDealershipGroups] = useLocalStorage<DealershipGroup[]>('dealershipGroups', initialDealershipGroups);
  const [savedTicketViews, setSavedTicketViews] = useLocalStorage<SavedTicketView[]>('savedTicketViews', []);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureAnnouncement | null>(null);
  const [editingTask, setEditingTask] = useState<(Task & { projectId: string | null; projectName?: string; ticketId: string | null; ticketTitle?: string; }) | null>(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);

  const [isDealershipGroupFormOpen, setIsDealershipGroupFormOpen] = useState(false);
  const [editingDealershipGroup, setEditingDealershipGroup] = useState<DealershipGroup | null>(null);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateChoiceModalOpen, setIsCreateChoiceModalOpen] = useState(false);
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

  const [featureFilters, setFeatureFilters] = useState<FeatureAnnouncementFilterState>({
    searchTerm: '',
    platform: 'all',
    category: 'all',
  });
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { toast, showToast, hideToast } = useToast();

  const dataMap = useMemo(() => ({
    tickets, projects, dealerships, tasks, features, meetings
  }), [tickets, projects, dealerships, tasks, features, meetings]);


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

  // When changing views, clear selections
  useEffect(() => {
    setSelectedTicketIds([]);
  }, [currentView]);


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

  const handleSaveContact = (contactData: Omit<Contact, 'id'> | Contact) => {
    let updatedContact: Contact;
    const oldContact = 'id' in contactData ? contacts.find(c => c.id === contactData.id) : undefined;

    if ('id' in contactData) {
        updatedContact = contactData;
        setContacts(prev => prev.map(c => c.id === contactData.id ? contactData : c));
        showToast('Contact updated!', 'success');
    } else {
        updatedContact = { ...contactData, id: crypto.randomUUID() };
        setContacts(prev => [...prev, updatedContact]);
        showToast('Contact created!', 'success');
    }

    const oldGroupIds = new Set(oldContact?.groupIds || []);
    const newGroupIds = new Set(updatedContact.groupIds || []);

    setContactGroups(prevGroups => 
        prevGroups.map(group => {
            const contactShouldBeInGroup = newGroupIds.has(group.id);
            const contactWasInGroup = oldGroupIds.has(group.id);

            if (contactShouldBeInGroup && !contactWasInGroup) {
                return { ...group, contactIds: [...group.contactIds, updatedContact.id] };
            }
            if (!contactShouldBeInGroup && contactWasInGroup) {
                return { ...group, contactIds: group.contactIds.filter(id => id !== updatedContact.id) };
            }
            return group;
        })
    );
    
    setIsContactFormOpen(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
        setContacts(prev => prev.filter(c => c.id !== contactId));
        setContactGroups(prev => prev.map(g => ({
            ...g,
            contactIds: g.contactIds.filter(id => id !== contactId)
        })));
        showToast('Contact deleted!', 'success');
    }
  };
  
  const handleSaveGroup = (groupData: Omit<ContactGroup, 'id' | 'contactIds'> | ContactGroup) => {
      if ('id' in groupData) {
          setContactGroups(prev => prev.map(g => g.id === groupData.id ? groupData : g));
          showToast('Group updated!', 'success');
      } else {
          const newGroup = { ...groupData, id: crypto.randomUUID(), contactIds: [] };
          setContactGroups(prev => [...prev, newGroup]);
          showToast('Group created!', 'success');
      }
      setIsGroupFormOpen(false);
      setEditingGroup(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? Contacts will not be deleted.')) {
        setContacts(prev => prev.map(c => ({
            ...c,
            groupIds: (c.groupIds || []).filter(id => id !== groupId)
        })));
        setContactGroups(prev => prev.filter(g => g.id !== groupId));
        showToast('Group deleted!', 'success');
    }
  };

  const handleUpdateContactGroup = (updatedGroup: ContactGroup) => {
    const oldGroup = contactGroups.find(g => g.id === updatedGroup.id);
    if (!oldGroup) return;

    const oldContactIds = new Set(oldGroup.contactIds);
    const newContactIds = new Set(updatedGroup.contactIds);

    setContacts(prevContacts => {
        return prevContacts.map(contact => {
            const wasMember = oldContactIds.has(contact.id);
            const isMember = newContactIds.has(contact.id);
            const groupIds = new Set(contact.groupIds || []);

            if (isMember && !wasMember) {
                groupIds.add(updatedGroup.id);
            } else if (!isMember && wasMember) {
                groupIds.delete(updatedGroup.id);
            } else {
                return contact;
            }
            return { ...contact, groupIds: Array.from(groupIds) };
        });
    });

    setContactGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    showToast('Group members updated!', 'success');
  };

  // FIX: New robust save handler for dealerships to ensure bidirectional linking.
  const handleSaveDealership = (dealershipData: Omit<Dealership, 'id'> | Dealership) => {
    let updatedDealership: Dealership;
    const oldDealership = 'id' in dealershipData ? dealerships.find(d => d.id === dealershipData.id) : undefined;

    if ('id' in dealershipData) {
        updatedDealership = dealershipData;
        setDealerships(prev => prev.map(d => d.id === dealershipData.id ? dealershipData : d));
        showToast('Dealership updated!', 'success');
    } else {
        updatedDealership = { ...dealershipData, id: crypto.randomUUID() };
        setDealerships(prev => [...prev, updatedDealership]);
        showToast('Dealership created!', 'success');
    }

    const oldGroupIds = new Set(oldDealership?.groupIds || []);
    const newGroupIds = new Set(updatedDealership.groupIds || []);

    setDealershipGroups(prevGroups => 
        prevGroups.map(group => {
            const dealershipShouldBeInGroup = newGroupIds.has(group.id);
            const dealershipWasInGroup = oldGroupIds.has(group.id);

            if (dealershipShouldBeInGroup && !dealershipWasInGroup) {
                return { ...group, dealershipIds: [...group.dealershipIds, updatedDealership.id] };
            }
            if (!dealershipShouldBeInGroup && dealershipWasInGroup) {
                return { ...group, dealershipIds: group.dealershipIds.filter(id => id !== updatedDealership.id) };
            }
            return group;
        })
    );
    
    if (selectedDealership?.id === updatedDealership.id) {
        setSelectedDealership(updatedDealership);
    }
  };

  const handleDealershipSubmit = (newDealershipData: Omit<Dealership, 'id'>) => {
    handleSaveDealership(newDealershipData);
  };
  
  const handleUpdateDealership = (updatedDealership: Dealership) => {
    handleSaveDealership(updatedDealership);
  };
  
  const handleDeleteDealership = (dealershipId: string) => {
    if (window.confirm('Are you sure you want to delete this dealership account?')) {
      setDealerships(prev => prev.filter(d => d.id !== dealershipId));
      // FIX: Ensure the deleted dealership is removed from its groups.
      setDealershipGroups(prev => prev.map(g => ({
          ...g,
          dealershipIds: g.dealershipIds.filter(id => id !== dealershipId)
      })));
      showToast('Dealership account deleted successfully!', 'success');
      setSelectedDealership(null);
    }
  };
  
  const handleSaveDealershipGroup = (groupData: Omit<DealershipGroup, 'id' | 'dealershipIds'> | DealershipGroup) => {
      if ('id' in groupData) {
          setDealershipGroups(prev => prev.map(g => g.id === groupData.id ? groupData : g));
          showToast('Group updated!', 'success');
      } else {
          const newGroup = { ...groupData, id: crypto.randomUUID(), dealershipIds: [] };
          setDealershipGroups(prev => [...prev, newGroup]);
          showToast('Group created!', 'success');
      }
      setIsDealershipGroupFormOpen(false);
      setEditingDealershipGroup(null);
  };

  const handleDeleteDealershipGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? Dealerships will not be deleted.')) {
        setDealerships(prev => prev.map(d => ({
            ...d,
            groupIds: (d.groupIds || []).filter(id => id !== groupId)
        })));
        setDealershipGroups(prev => prev.filter(g => g.id !== groupId));
        showToast('Group deleted!', 'success');
    }
  };

  const handleUpdateDealershipGroup = (updatedGroup: DealershipGroup) => {
    const oldGroup = dealershipGroups.find(g => g.id === updatedGroup.id);
    if (!oldGroup) return;

    const oldDealershipIds = new Set(oldGroup.dealershipIds);
    const newDealershipIds = new Set(updatedGroup.dealershipIds);

    setDealerships(prevDealerships => {
        return prevDealerships.map(dealership => {
            const wasMember = oldDealershipIds.has(dealership.id);
            const isMember = newDealershipIds.has(dealership.id);
            const groupIds = new Set(dealership.groupIds || []);

            if (isMember && !wasMember) {
                groupIds.add(updatedGroup.id);
            } else if (!isMember && wasMember) {
                groupIds.delete(updatedGroup.id);
            } else {
                return dealership;
            }
            return { ...dealership, groupIds: Array.from(groupIds) };
        });
    });

    setDealershipGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    showToast('Group members updated!', 'success');
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
            setTasks(prev => prev.filter(t => t.id === taskId));
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
        let content = `TICKET DETAILS: ${ticket.title}\n`;
        content += `==================================================\n\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };
        const appendSection = (title: string) => {
            content += `\n--- ${title.toUpperCase()} ---\n`;
        };
        const appendTextArea = (label: string, value: any) => {
             if (value) {
                content += `${label}:\n${value}\n\n`;
            }
        };

        appendField('ID', ticket.id);
        appendField('Type', ticket.type);
        appendField('Status', ticket.status);
        appendField('Priority', ticket.priority);

        appendSection('Core Information');
        appendField('Product Area', ticket.productArea);
        appendField('Platform', ticket.platform);
        appendField('Location', ticket.location);
        appendTextArea('On Hold Reason', ticket.onHoldReason);
        appendTextArea('Completion Notes', ticket.completionNotes);
        
        appendSection('Tracking & Ownership');
        appendField('Submitter', ticket.submitterName);
        appendField('Client', ticket.client);
        appendField('PMR Number', ticket.pmrNumber);
        appendField('PMR Link', ticket.pmrLink);
        appendField('FP Ticket Number', ticket.fpTicketNumber);
        appendField('Ticket Thread ID', ticket.ticketThreadId);

        appendSection('Dates');
        appendDateField('Submission Date', ticket.submissionDate);
        appendDateField('Start Date', ticket.startDate);
        appendDateField('Est. Completion Date', ticket.estimatedCompletionDate);
        appendDateField('Completion Date', ticket.completionDate);

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
        
        if (ticket.tasks && ticket.tasks.length > 0) {
            appendSection(`Tasks (${ticket.tasks.length})`);
            ticket.tasks.forEach(task => {
                content += `- ${task.description} (Assigned: ${task.assignedUser}, Status: ${task.status}, Priority: ${task.priority})\n`;
            });
            content += '\n';
        }

        if (ticket.updates && ticket.updates.length > 0) {
            appendSection(`Updates (${ticket.updates.length})`);
            [...ticket.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n');
                content += `[${new Date(update.date).toLocaleString(undefined, { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
            });
        }

        appendSection('Linked Item IDs');
        appendField('Project IDs', (ticket.projectIds || []).join(', '));
        appendField('Linked Ticket IDs', (ticket.linkedTicketIds || []).join(', '));
        appendField('Meeting IDs', (ticket.meetingIds || []).join(', '));
        appendField('Task IDs', (ticket.taskIds || []).join(', '));
        appendField('Dealership IDs', (ticket.dealershipIds || []).join(', '));
        appendField('Feature IDs', (ticket.featureIds || []).join(', '));
        
        createTxtFileDownloader(content, `Ticket_${ticket.id}_${ticket.title}`);
    };

    const handleExportProject = (project: Project) => {
        let content = `PROJECT DETAILS: ${project.name}\n`;
        content += `==================================================\n\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };
        const appendSection = (title: string) => {
            content += `\n--- ${title.toUpperCase()} ---\n`;
        };
        const appendTextArea = (label: string, value: any) => {
             if (value) {
                content += `${label}:\n${value}\n\n`;
            }
        };

        appendField('ID', project.id);
        appendField('Status', project.status);
        appendDateField('Creation Date', project.creationDate);
        appendTextArea('Description', project.description);
        appendField('Involved People', (project.involvedPeople || []).join(', '));

        if (project.tasks && project.tasks.length > 0) {
            appendSection(`Tasks (${project.tasks.length})`);
            project.tasks.forEach(task => {
                content += `- ${task.description}\n`;
                content += `  (Assigned: ${task.assignedUser}, Status: ${task.status}, Priority: ${task.priority}, Type: ${task.type})\n`;
                if(task.dueDate) content += `  (Due: ${new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })})\n`;
            });
            content += '\n';
        }

        if (project.updates && project.updates.length > 0) {
            appendSection(`Updates (${project.updates.length})`);
            [...project.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n');
                content += `[${new Date(update.date).toLocaleString(undefined, { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
            });
        }

        appendSection('Linked Item IDs');
        appendField('Ticket IDs', (project.ticketIds || []).join(', '));
        appendField('Linked Project IDs', (project.linkedProjectIds || []).join(', '));
        appendField('Meeting IDs', (project.meetingIds || []).join(', '));
        appendField('Task IDs', (project.taskIds || []).join(', '));
        appendField('Dealership IDs', (project.dealershipIds || []).join(', '));
        appendField('Feature IDs', (project.featureIds || []).join(', '));

        createTxtFileDownloader(content, `Project_${project.id}_${project.name}`);
    };

    const handleExportTask = (task: Task) => {
        let content = `TASK DETAILS: ${task.description.substring(0, 50)}...\n`;
        content += `==================================================\n\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };

        appendField('ID', task.id);
        appendField('Description', task.description);
        appendField('Assigned To', task.assignedUser);
        appendField('Status', task.status);
        appendField('Priority', task.priority);
        appendField('Type', task.type);
        appendDateField('Creation Date', task.creationDate);
        appendDateField('Due Date', task.dueDate);
        appendField('Notify on Completion', task.notifyOnCompletion);

        content += `\n--- LINKED ITEM IDS ---\n`;
        appendField('Project IDs', (task.projectIds || []).join(', '));
        appendField('Ticket IDs', (task.ticketIds || []).join(', '));
        appendField('Linked Task IDs', (task.linkedTaskIds || []).join(', '));
        appendField('Meeting IDs', (task.meetingIds || []).join(', '));
        appendField('Dealership IDs', (task.dealershipIds || []).join(', '));
        appendField('Feature IDs', (task.featureIds || []).join(', '));

        createTxtFileDownloader(content, `Task_${task.id}`);
    };
    
    const handleExportMeeting = (meeting: Meeting) => {
        let content = `MEETING DETAILS: ${meeting.name}\n`;
        content += `==================================================\n\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };

        appendField('ID', meeting.id);
        appendDateField('Meeting Date', meeting.meetingDate);
        appendField('Attendees', (meeting.attendees || []).join(', '));

        content += '\n--- NOTES ---\n';
        const notesText = (meeting.notes || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
        content += `${notesText}\n\n`;

        content += `\n--- LINKED ITEM IDS ---\n`;
        appendField('Project IDs', (meeting.projectIds || []).join(', '));
        appendField('Ticket IDs', (meeting.ticketIds || []).join(', '));
        appendField('Linked Meeting IDs', (meeting.linkedMeetingIds || []).join(', '));
        appendField('Task IDs', (meeting.taskIds || []).join(', '));
        appendField('Dealership IDs', (meeting.dealershipIds || []).join(', '));
        appendField('Feature IDs', (meeting.featureIds || []).join(', '));

        createTxtFileDownloader(content, `Meeting_${meeting.id}_${meeting.name}`);
    };

    const handleExportDealership = (dealership: Dealership) => {
        let content = `DEALERSHIP DETAILS: ${dealership.name}\n`;
        content += `==================================================\n\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '') {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };
        
        appendField('Name', dealership.name);
        appendField('Account Number (CIF)', dealership.accountNumber);
        appendField('Status', dealership.status);
        appendField('Order Number', dealership.orderNumber);
        appendDateField('Order Received Date', dealership.orderReceivedDate);
        appendDateField('Go-Live Date', dealership.goLiveDate);
        appendDateField('Term Date', dealership.termDate);
        appendField('Store Number', dealership.storeNumber);
        appendField('Branch Number', dealership.branchNumber);
        appendField('ERA System ID', dealership.eraSystemId);
        appendField('PPSysID', dealership.ppSysId);
        appendField('BU-ID', dealership.buId);
        appendField('Address', dealership.address);
        appendField('Assigned Specialist', dealership.assignedSpecialist);
        appendField('Sales', dealership.sales);
        appendField('POC Name', dealership.pocName);
        appendField('POC Email', dealership.pocEmail);
        appendField('POC Phone', dealership.pocPhone);

        if (dealership.updates && dealership.updates.length > 0) {
            content += `\n--- UPDATES ---\n`;
            [...dealership.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n');
                content += `[${new Date(update.date).toLocaleString(undefined, { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
            });
        }

        createTxtFileDownloader(content, `Dealership_${dealership.accountNumber}_${dealership.name}`);
    };
    
    const handleExportFeature = (feature: FeatureAnnouncement) => {
        let content = `FEATURE DETAILS: ${feature.title}\n`;
        content += `==================================================\n\n`;

        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' })}\n`;
            }
        };
        
        appendField('Title', feature.title);
        appendField('Status', feature.status);
        appendField('Platform', feature.platform);
        appendDateField('Launch Date', feature.launchDate);
        appendField('Version', feature.version);
        appendField('Location', feature.location);
        appendField('Description', feature.description);
        appendField('Categories', (feature.categories || []).join(', '));
        appendField('Target Audience', feature.targetAudience);
        appendField('Success Metrics', feature.successMetrics);
        
        createTxtFileDownloader(content, `Feature_${feature.id}_${feature.title}`);
    };

    const [allLinkableItems, setAllLinkableItems] = useState({});

    const handleLinkItem = (selfType: EntityType, selfId: string, toType: EntityType, toId: string) => {
        // FIX: The type `keyof (Ticket | ...)` creates an intersection of keys, which is too restrictive.
        // Changed to `any` to resolve type errors for this unused constant.
        const linkFieldMap: Record<EntityType, any> = {
            'ticket': 'linkedTicketIds',
            'project': 'linkedProjectIds',
            'task': 'taskIds',
            'meeting': 'meetingIds',
            'dealership': 'dealershipIds',
            'feature': 'featureIds',
        };
        // FIX: The type `keyof (Ticket | ...)` creates an intersection of keys, which is too restrictive.
        // Changed to `any` to resolve type errors for this unused constant.
        const reverseLinkFieldMap: Record<EntityType, any> = {
            'ticket': 'ticketIds',
            'project': 'projectIds',
            'task': 'taskIds',
            'meeting': 'meetingIds',
            'dealership': 'dealershipIds',
            'feature': 'featureIds',
        };

        const updateEntity = (entities: any[], id: string, field: keyof any, value: string) => {
            return entities.map(e => e.id === id ? { ...e, [field]: [...(e[field] || []), value] } : e);
        };

        const selfLinkField = selfType === toType ? `linked${toType.charAt(0).toUpperCase() + toType.slice(1)}Ids` as any : `${toType}Ids` as any;
        const toLinkField = selfType === toType ? `linked${selfType.charAt(0).toUpperCase() + selfType.slice(1)}Ids` as any : `${selfType}Ids` as any;
        
        const dataSetters: Record<EntityType, React.Dispatch<React.SetStateAction<any[]>>> = {
            'ticket': setTickets, 'project': setProjects, 'task': setTasks, 'meeting': setMeetings, 'dealership': setDealerships, 'feature': setFeatures,
        };
        const dataStores: Record<EntityType, any[]> = {
            'ticket': tickets, 'project': projects, 'task': allTasks, 'meeting': meetings, 'dealership': dealerships, 'feature': features,
        };

        // Update self
        const selfStore = dataStores[selfType];
        const updatedSelfStore = selfStore.map(item => {
            if (item.id === selfId) {
                return { ...item, [selfLinkField]: [...(item[selfLinkField] || []), toId] };
            }
            return item;
        });
        
        // Update other entity
        const toStore = dataStores[toType];
        const updatedToStore = toStore.map(item => {
            if (item.id === toId) {
                return { ...item, [toLinkField]: [...(item[toLinkField] || []), selfId] };
            }
            return item;
        });

        // Now, we must separate updates based on where the items are stored (top-level vs nested in projects)
        const updateTopLevelState = (entityType: EntityType, updatedStore: any[]) => {
            if (entityType === 'task') {
                const standalone = updatedStore.filter(t => !t.projectId && !t.ticketId);
                setTasks(standalone);

                const projectTasksMap = new Map<string, Task[]>();
                updatedStore.filter(t => t.projectId).forEach(t => {
                    if (!projectTasksMap.has(t.projectId)) projectTasksMap.set(t.projectId, []);
                    projectTasksMap.get(t.projectId)!.push(t);
                });

                const ticketTasksMap = new Map<string, Task[]>();
                updatedStore.filter(t => t.ticketId).forEach(t => {
                    if (!ticketTasksMap.has(t.ticketId)) ticketTasksMap.set(t.ticketId, []);
                    ticketTasksMap.get(t.ticketId)!.push(t);
                });

                setProjects(prev => prev.map(p => ({ ...p, tasks: projectTasksMap.get(p.id) || p.tasks })));
                setTickets(prev => prev.map(t => ({ ...t, tasks: ticketTasksMap.get(t.id) || t.tasks })));

            } else {
                dataSetters[entityType](updatedStore);
            }
        }
        
        updateTopLevelState(selfType, updatedSelfStore);
        updateTopLevelState(toType, updatedToStore);

        showToast(`${toType.charAt(0).toUpperCase() + toType.slice(1)} linked successfully!`, 'success');
    };

    const handleUnlinkItem = (selfType: EntityType, selfId: string, toType: EntityType, toId: string) => {
        const selfLinkField = selfType === toType ? `linked${toType.charAt(0).toUpperCase() + toType.slice(1)}Ids` as any : `${toType}Ids` as any;
        const toLinkField = selfType === toType ? `linked${selfType.charAt(0).toUpperCase() + selfType.slice(1)}Ids` as any : `${selfType}Ids` as any;
        
        const dataSetters: Record<EntityType, React.Dispatch<React.SetStateAction<any[]>>> = {
            'ticket': setTickets, 'project': setProjects, 'task': setTasks, 'meeting': setMeetings, 'dealership': setDealerships, 'feature': setFeatures,
        };
        const dataStores: Record<EntityType, any[]> = {
            'ticket': tickets, 'project': projects, 'task': allTasks, 'meeting': meetings, 'dealership': dealerships, 'feature': features,
        };

        // Update self
        const selfStore = dataStores[selfType];
        const updatedSelfStore = selfStore.map(item => {
            if (item.id === selfId) {
                return { ...item, [selfLinkField]: (item[selfLinkField] || []).filter((id: string) => id !== toId) };
            }
            return item;
        });

        // Update other entity
        const toStore = dataStores[toType];
        const updatedToStore = toStore.map(item => {
            if (item.id === toId) {
                return { ...item, [toLinkField]: (item[toLinkField] || []).filter((id: string) => id !== selfId) };
            }
            return item;
        });

        const updateTopLevelState = (entityType: EntityType, updatedStore: any[]) => {
            if (entityType === 'task') {
                const standalone = updatedStore.filter(t => !t.projectId && !t.ticketId);
                setTasks(standalone);

                const projectTasksMap = new Map<string, Task[]>();
                updatedStore.filter(t => t.projectId).forEach(t => {
                    if (!projectTasksMap.has(t.projectId)) projectTasksMap.set(t.projectId, []);
                    projectTasksMap.get(t.projectId)!.push(t);
                });
                
                const ticketTasksMap = new Map<string, Task[]>();
                updatedStore.filter(t => t.ticketId).forEach(t => {
                    if (!ticketTasksMap.has(t.ticketId)) ticketTasksMap.set(t.ticketId, []);
                    ticketTasksMap.get(t.ticketId)!.push(t);
                });

                setProjects(prev => prev.map(p => ({ ...p, tasks: projectTasksMap.get(p.id) || p.tasks })));
                setTickets(prev => prev.map(t => ({...t, tasks: ticketTasksMap.get(t.id) || t.tasks })));
            } else {
                dataSetters[entityType](updatedStore);
            }
        }
        
        updateTopLevelState(selfType, updatedSelfStore);
        updateTopLevelState(toType, updatedToStore);

        showToast(`${toType.charAt(0).toUpperCase() + toType.slice(1)} unlinked successfully!`, 'success');
    };
    
    const handleSwitchToItem = (type: EntityType, id: string) => {
        const findAndSet = (items: any[], setter: React.Dispatch<React.SetStateAction<any | null>>) => {
            const item = items.find(i => i.id === id);
            if (item) {
                // Close current side view before switching
                setSelectedTicket(null);
                setSelectedProject(null);
                setSelectedDealership(null);
                setSelectedMeeting(null);
                setSelectedFeature(null);
                setEditingTask(null);

                // Need a slight delay to allow the current modal to close
                setTimeout(() => {
                    setCurrentView(type === 'feature' ? 'features' : (type + 's') as View);
                    setter(item);
                }, 50);
            } else {
                 showToast('Item not found.', 'error');
            }
        };

        switch (type) {
            case 'ticket': findAndSet(tickets, setSelectedTicket); break;
            case 'project': findAndSet(projects, setSelectedProject); break;
            case 'dealership': findAndSet(dealerships, setSelectedDealership); break;
            case 'meeting': findAndSet(meetings, setSelectedMeeting); break;
            case 'feature': findAndSet(features, setSelectedFeature); break;
            case 'task': 
                const task = allTasks.find(t => t.id === id);
                if (task) {
                    setSelectedTicket(null);
                    setSelectedProject(null);
                    setSelectedDealership(null);
                    setSelectedMeeting(null);
                    setSelectedFeature(null);
                    setTimeout(() => {
                       setCurrentView('tasks');
                       setEditingTask(task);
                    }, 50);
                } else {
                    showToast('Task not found.', 'error');
                }
                break;
        }
    };

    
    const allDataForLinking = {
        allTickets: tickets,
        allProjects: projects,
        allTasks: allTasks,
        allMeetings: meetings,
        allDealerships: dealerships,
        allFeatures: features,
        allGroups: dealershipGroups,
    };
    
    const commonLinkingHandlers = (selfType: EntityType, selfId: string) => ({
        onLink: (toType: EntityType, toId: string) => handleLinkItem(selfType, selfId, toType, toId),
        onUnlink: (toType: EntityType, toId: string) => handleUnlinkItem(selfType, selfId, toType, toId),
        onSwitchView: handleSwitchToItem,
    });
    
    // ...
    
    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                const performanceInsightsData = {
                    openTickets: tickets.filter(t => t.status !== Status.Completed).length,
                    completedLast30Days: tickets.filter(t => t.completionDate && new Date(t.completionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                    avgCompletionDays: (() => {
                        const completedWithDates = tickets.filter(t => t.status === Status.Completed && t.startDate && t.completionDate);
                        if (completedWithDates.length === 0) return null;
                        const totalDays = completedWithDates.reduce((sum, t) => {
                            const start = new Date(t.startDate!).getTime();
                            const end = new Date(t.completionDate!).getTime();
                            return sum + (end - start) / (1000 * 3600 * 24);
                        }, 0);
                        return totalDays / completedWithDates.length;
                    })()
                };
                
                const deadlines = allTasks
                    .filter(t => t.dueDate && new Date(t.dueDate) >= new Date() && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                    .map(t => ({
                        id: t.id,
                        type: 'task' as const,
                        title: t.description,
                        description: t.description,
                        dueDate: t.dueDate!,
                    }))
                    .concat(
                        tickets.filter(t => t.estimatedCompletionDate && new Date(t.estimatedCompletionDate) >= new Date() && new Date(t.estimatedCompletionDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
                        .map(t => ({
                            id: t.id,
                            type: 'ticket' as const,
                            title: t.title,
                            description: '', // Tickets have a title, so description is not strictly needed for the view
                            dueDate: t.estimatedCompletionDate!
                        }))
                    )
                    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                    
                const recentlyUpdatedItems = [
                    ...tickets.map(t => ({...t, itemType: 'ticket'})),
                    ...projects.map(p => ({...p, itemType: 'project'})),
                    ...dealerships.map(d => ({...d, itemType: 'dealership'})),
                ]
                .filter(item => item.updates && item.updates.length > 0)
                .map(item => {
                    const lastUpdate = [...item.updates!].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                    return { ...item, lastUpdate };
                })
                .sort((a, b) => new Date(b.lastUpdate.date).getTime() - new Date(a.lastUpdate.date).getTime())
                .slice(0, 10);

                return <DashboardView 
                    performanceInsights={performanceInsightsData}
                    upcomingDeadlines={deadlines}
                    recentlyUpdatedItems={recentlyUpdatedItems}
                    onSwitchView={handleSwitchToItem}
                />;
            case 'tickets':
                return <TicketList 
                    tickets={filteredTickets} 
                    onRowClick={setSelectedTicket}
                    onStatusChange={handleStatusChange}
                    projects={projects}
                    onToggleFavorite={handleToggleFavoriteTicket}
                    selectedTicketIds={selectedTicketIds}
                    onToggleSelection={handleToggleTicketSelection}
                />;
            case 'projects':
                 return <ProjectList 
                    projects={projects} 
                    onProjectClick={setSelectedProject}
                    tickets={tickets}
                 />;
            case 'dealerships':
                return <DealershipList 
                    dealerships={filteredDealerships} 
                    dealershipGroups={dealershipGroups}
                    onDealershipClick={setSelectedDealership} 
                    showToast={showToast}
                    onUpdateGroup={handleUpdateDealershipGroup}
                    onDeleteGroup={handleDeleteDealershipGroup}
                    onNewGroupClick={() => { setEditingDealershipGroup(null); setIsDealershipGroupFormOpen(true); }}
                    onEditGroupClick={(group) => { setEditingDealershipGroup(group); setIsDealershipGroupFormOpen(true); }}
                 />;
            case 'tasks':
                return <TaskList 
                    projects={projects}
                    onAddTask={handleAddTask}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    allTasks={allTasks}
                    onSwitchView={handleSwitchToItem}
                />;
            case 'features':
                const allCategories = useMemo(() => {
                    const catSet = new Set<string>();
                    features.forEach(f => (f.categories || []).forEach(cat => catSet.add(cat)));
                    return Array.from(catSet).sort();
                }, [features]);

                const filteredFeatures = useMemo(() => {
                    return features.filter(f => {
                         const searchLower = featureFilters.searchTerm.toLowerCase();
                         const matchesSearch = !searchLower ||
                             f.title.toLowerCase().includes(searchLower) ||
                             f.description.toLowerCase().includes(searchLower) ||
                             (f.location || '').toLowerCase().includes(searchLower);

                         const matchesPlatform = featureFilters.platform === 'all' || f.platform === featureFilters.platform;
                         const matchesCategory = featureFilters.category === 'all' || (f.categories || []).includes(featureFilters.category);

                         return matchesSearch && matchesPlatform && matchesCategory;
                    });
                }, [features, featureFilters]);

                return <FeatureList
                    features={filteredFeatures}
                    onFeatureClick={setSelectedFeature}
                    onDelete={handleDeleteFeature}
                    filters={featureFilters}
                    setFilters={setFeatureFilters}
                    allCategories={allCategories}
                />;
            case 'meetings':
                 const filteredMeetings = useMemo(() => {
                    const searchLower = meetingFilters.searchTerm.toLowerCase();
                    if (!searchLower) return meetings;
                    return meetings.filter(m => 
                        m.name.toLowerCase().includes(searchLower) ||
                        m.attendees.some(a => a.toLowerCase().includes(searchLower)) ||
                        m.notes.toLowerCase().includes(searchLower) ||
                        new Date(m.meetingDate).toLocaleDateString().includes(searchLower)
                    );
                 }, [meetings, meetingFilters]);
                 return <MeetingList 
                    meetings={filteredMeetings} 
                    onMeetingClick={setSelectedMeeting} 
                    meetingFilters={meetingFilters}
                    setMeetingFilters={setMeetingFilters}
                 />;
            case 'contacts':
                return <ContactsView
                    contacts={contacts}
                    contactGroups={contactGroups}
                    onUpdateContact={handleSaveContact}
                    onDeleteContact={handleDeleteContact}
                    onUpdateGroup={handleUpdateContactGroup}
                    onDeleteGroup={handleDeleteGroup}
                    showToast={showToast}
                    isContactFormOpen={isContactFormOpen}
                    setIsContactFormOpen={setIsContactFormOpen}
                    editingContact={editingContact}
                    setEditingContact={setEditingContact}
                    onSaveContact={handleSaveContact}
                    isGroupFormOpen={isGroupFormOpen}
                    setIsGroupFormOpen={setIsGroupFormOpen}
                    editingGroup={editingGroup}
                    setEditingGroup={setEditingGroup}
                    onSaveGroup={handleSaveGroup}
                />
            default:
                return <div>Select a view</div>;
        }
    };
    
    const getNewButtonText = () => {
        switch(currentView) {
            case 'tickets': return 'New Ticket';
            case 'projects': return 'New Project';
            case 'dealerships': return 'New Account';
            case 'features': return 'New Feature';
            case 'meetings': return 'New Note';
            case 'contacts': return 'New Contact';
            default: return 'New Item';
        }
    }
    
    // Logic for filtering tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const { searchTerm, status, priority, type, productArea } = ticketFilters;
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm ||
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.submitterName.toLowerCase().includes(searchLower) ||
        (ticket.client || '').toLowerCase().includes(searchLower) ||
        (ticket.pmrNumber || '').toLowerCase().includes(searchLower) ||
        (ticket.fpTicketNumber || '').toLowerCase().includes(searchLower) ||
        (ticket.id.toString() === searchTerm);

      const matchesStatus = status === 'all' || ticket.status === status;
      const matchesPriority = priority === 'all' || ticket.priority === priority;
      const matchesType = type === 'all' || ticket.type === type;
      const matchesProductArea = productArea === 'all' || ticket.productArea === productArea;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProductArea;
    });
  }, [tickets, ticketFilters]);
  
   // Logic for filtering dealerships
  const filteredDealerships = useMemo(() => {
    return dealerships.filter(d => {
      const { searchTerm, status } = dealershipFilters;
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm ||
        d.name.toLowerCase().includes(searchLower) ||
        d.accountNumber.toLowerCase().includes(searchLower) ||
        (d.assignedSpecialist || '').toLowerCase().includes(searchLower) ||
        (d.address || '').toLowerCase().includes(searchLower);

      const matchesStatus = status === 'all' || d.status === status;
      
      return matchesSearch && matchesStatus;
    });
  }, [dealerships, dealershipFilters]);
  
  const handleToggleTicketSelection = (ticketId: string) => {
    setSelectedTicketIds(prev =>
        prev.includes(ticketId)
            ? prev.filter(id => id !== ticketId)
            : [...prev, ticketId]
    );
  };
  
    const handleBulkUpdateStatus = (status: Status) => {
        setTickets(prev =>
            prev.map(t =>
                selectedTicketIds.includes(t.id) ? { ...t, status } : t
            )
        );
        showToast(`Updated ${selectedTicketIds.length} tickets to "${status}"`, 'success');
        setSelectedTicketIds([]);
    };

    const handleBulkUpdatePriority = (priority: Priority) => {
        setTickets(prev =>
            prev.map(t =>
                selectedTicketIds.includes(t.id) ? { ...t, priority } : t
            )
        );
        showToast(`Updated ${selectedTicketIds.length} tickets to "${priority}"`, 'success');
        setSelectedTicketIds([]);
    };
    
    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedTicketIds.length} tickets?`)) {
            setTickets(prev => prev.filter(t => !selectedTicketIds.includes(t.id)));
            showToast(`${selectedTicketIds.length} tickets deleted.`, 'success');
            setSelectedTicketIds([]);
        }
    };
    
    const handleSaveTicketView = (name: string) => {
        const newView: SavedTicketView = {
            id: crypto.randomUUID(),
            name,
            filters: ticketFilters,
        };
        setSavedTicketViews(prev => [...prev, newView]);
        showToast(`View "${name}" saved!`, 'success');
    };

    const handleApplyTicketView = (viewId: string) => {
        const view = savedTicketViews.find(v => v.id === viewId);
        if (view) {
            setTicketFilters(view.filters);
            showToast(`Applied view "${view.name}"`, 'success');
        }
    };

    const handleDeleteTicketView = (viewId: string) => {
        setSavedTicketViews(prev => prev.filter(v => v.id !== viewId));
        showToast('Saved view deleted.', 'success');
    };
    
  return (
    <div className="flex h-screen bg-gray-100">
      {toast.isVisible && <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />}
      
      {isDealershipGroupFormOpen && (
        <Modal title={editingDealershipGroup ? 'Edit Group' : 'Create New Group'} onClose={() => { setIsDealershipGroupFormOpen(false); setEditingDealershipGroup(null); }}>
            <DealershipGroupForm 
              onSave={handleSaveDealershipGroup}
              onClose={() => { setIsDealershipGroupFormOpen(false); setEditingDealershipGroup(null); }}
              groupToEdit={editingDealershipGroup}
            />
        </Modal>
      )}

      {isFormOpen && currentView === 'tickets' && (
        <Modal title="Create New Ticket" onClose={() => setIsFormOpen(false)}>
          <TicketForm onSubmit={(data) => { handleTicketSubmit(data); setIsFormOpen(false); }} projects={projects} />
        </Modal>
      )}
      {isFormOpen && currentView === 'projects' && (
        <Modal title="Create New Project" onClose={() => setIsFormOpen(false)} size="lg">
          <ProjectForm onSubmit={(data) => { handleProjectSubmit(data); setIsFormOpen(false); }} />
        </Modal>
      )}
      {isFormOpen && currentView === 'dealerships' && (
        <Modal title="Create New Dealership Account" onClose={() => setIsFormOpen(false)}>
          <DealershipForm
            onSubmit={(data) => { handleDealershipSubmit(data); setIsFormOpen(false); }}
            onUpdate={handleUpdateDealership}
            onClose={() => setIsFormOpen(false)}
            allGroups={dealershipGroups}
          />
        </Modal>
      )}
      {isFormOpen && currentView === 'features' && (
        <Modal title="Add New Feature Announcement" onClose={() => setIsFormOpen(false)}>
            <FeatureForm onSubmit={(data) => { handleFeatureSubmit(data); setIsFormOpen(false); }} onUpdate={handleUpdateFeature} onClose={() => setIsFormOpen(false)}/>
        </Modal>
      )}
       {isFormOpen && currentView === 'meetings' && (
        <Modal title="Add New Meeting Note" onClose={() => setIsFormOpen(false)} size="4xl">
            <MeetingForm onSubmit={(data) => { handleMeetingSubmit(data); setIsFormOpen(false); }} onClose={() => setIsFormOpen(false)} />
        </Modal>
      )}
      {editingTask && (
        <Modal title="Edit Task" onClose={() => setEditingTask(null)} size="4xl">
            <EditTaskForm 
                task={editingTask}
                onSave={handleUpdateTask}
                onClose={() => setEditingTask(null)}
                onExport={() => handleExportTask(editingTask)}
                {...allDataForLinking}
                {...commonLinkingHandlers('task', editingTask.id)}
            />
        </Modal>
      )}
      {isCreateChoiceModalOpen && (
        <Modal title="Create New Item" onClose={() => setIsCreateChoiceModalOpen(false)} size="md">
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Ticket', icon: <TicketIcon/>, view: 'tickets' },
                    { label: 'Project', icon: <ClipboardListIcon/>, view: 'projects' },
                    { label: 'Dealership', icon: <BuildingStorefrontIcon/>, view: 'dealerships' },
                    { label: 'Feature', icon: <SparklesIcon/>, view: 'features' },
                    { label: 'Meeting', icon: <DocumentTextIcon/>, view: 'meetings' },
                    { label: 'Contact', icon: <UsersIcon/>, view: 'contacts' },
                ].map(({ label, icon, view }) => (
                     <button
                        key={label}
                        onClick={() => {
                            setCurrentView(view as View);
                             if (view === 'contacts') {
                                setEditingContact(null);
                                setIsContactFormOpen(true);
                            } else {
                                setIsFormOpen(true);
                            }
                            setIsCreateChoiceModalOpen(false);
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-6 bg-gray-100 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                        <div className="w-8 h-8">{icon}</div>
                        <span className="font-semibold">{label}</span>
                    </button>
                ))}
            </div>
        </Modal>
      )}
      
      <LeftSidebar 
        ticketFilters={ticketFilters} 
        setTicketFilters={setTicketFilters}
        dealershipFilters={dealershipFilters}
        setDealershipFilters={setDealershipFilters}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={(view) => { setCurrentView(view); setIsSidebarOpen(false); }}
        onImportClick={() => setIsImportModalOpen(true)}
        onExportClick={() => setIsExportModalOpen(true)}
      />
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-200" aria-label="Open sidebar">
                <MenuIcon className="w-6 h-6" />
            </button>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{currentView}</h1>
          <button 
            onClick={() => {
                 if (currentView === 'dashboard') {
                    setIsCreateChoiceModalOpen(true);
                 } else if (currentView === 'contacts') {
                     setEditingContact(null);
                     setIsContactFormOpen(true);
                 } else {
                    setIsFormOpen(true);
                 }
            }}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
          >
            <PlusIcon className="w-5 h-5" />
            <span>{getNewButtonText()}</span>
          </button>
        </div>
        
        {currentView === 'tickets' && selectedTicketIds.length > 0 && (
            <BulkActionBar
                selectedCount={selectedTicketIds.length}
                onClearSelection={() => setSelectedTicketIds([])}
                onUpdateStatus={handleBulkUpdateStatus}
                onUpdatePriority={handleBulkUpdatePriority}
                onDelete={handleBulkDelete}
            />
        )}
        
        {currentView === 'tickets' && (
            <SavedViewsBar
                savedViews={savedTicketViews}
                onSaveView={handleSaveTicketView}
                onApplyView={handleApplyTicketView}
                onDeleteView={handleDeleteTicketView}
            />
        )}
        
        {renderContent()}
      </main>

      {/* Side Views for Details */}
      {selectedTicket && (
        <SideView title={selectedTicket.title} onClose={() => setSelectedTicket(null)} isOpen={!!selectedTicket}>
          <TicketDetailView
            ticket={selectedTicket}
            onUpdate={handleUpdateTicket}
            onAddUpdate={(comment, author, date) => handleAddUpdate(selectedTicket.id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedTicket.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedTicket.id, updateId)}
            onExport={() => handleExportTicket(selectedTicket)}
            onEmail={() => showToast('Email functionality not implemented.', 'error')}
            onDelete={() => { handleDeleteTicket(selectedTicket.id); setSelectedTicket(null); }}
            {...allDataForLinking}
            {...commonLinkingHandlers('ticket', selectedTicket.id)}
          />
        </SideView>
      )}
      {selectedProject && (
        <SideView title={selectedProject.name} onClose={() => setSelectedProject(null)} isOpen={!!selectedProject}>
          <ProjectDetailView
            project={selectedProject}
            onUpdate={handleUpdateProject}
            onDelete={() => { handleDeleteProject(selectedProject.id); setSelectedProject(null); }}
            onExport={() => handleExportProject(selectedProject)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedProject.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedProject.id, updateId)}
            {...allDataForLinking}
            {...commonLinkingHandlers('project', selectedProject.id)}
          />
        </SideView>
      )}
       {selectedDealership && (
        <SideView title={selectedDealership.name} onClose={() => setSelectedDealership(null)} isOpen={!!selectedDealership}>
          <DealershipDetailView
            dealership={selectedDealership}
            onUpdate={handleUpdateDealership}
            onDelete={() => { handleDeleteDealership(selectedDealership.id); setSelectedDealership(null); }}
            onExport={() => handleExportDealership(selectedDealership)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedDealership.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedDealership.id, updateId)}
            {...allDataForLinking}
            allGroups={dealershipGroups}
            {...commonLinkingHandlers('dealership', selectedDealership.id)}
          />
        </SideView>
      )}
      {selectedMeeting && (
        <SideView title={selectedMeeting.name} onClose={() => setSelectedMeeting(null)} isOpen={!!selectedMeeting}>
            <MeetingDetailView
                meeting={selectedMeeting}
                onUpdate={handleUpdateMeeting}
                onDelete={() => { handleDeleteMeeting(selectedMeeting.id); setSelectedMeeting(null); }}
                onExport={() => handleExportMeeting(selectedMeeting)}
                {...allDataForLinking}
                {...commonLinkingHandlers('meeting', selectedMeeting.id)}
            />
        </SideView>
      )}
       {selectedFeature && (
        <SideView title={selectedFeature.title} onClose={() => setSelectedFeature(null)} isOpen={!!selectedFeature}>
            <FeatureDetailView
                feature={selectedFeature}
                onUpdate={handleUpdateFeature}
                onDelete={() => { handleDeleteFeature(selectedFeature.id); setSelectedFeature(null); }}
                onExport={() => handleExportFeature(selectedFeature)}
                {...allDataForLinking}
                {...commonLinkingHandlers('feature', selectedFeature.id)}
            />
        </SideView>
      )}
    </div>
  );
}

export default App;