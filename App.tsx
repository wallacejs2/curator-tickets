

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus, FeatureStatus, TaskPriority, FeatureAnnouncementFilterState, SavedTicketView, Contact, ContactGroup, ContactFilterState, DealershipGroup, WidgetConfig, KnowledgeArticle, EnrichedTask, Shopper, ShopperFilterState } from './types.ts';
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
import { initialTickets, initialProjects, initialDealerships, initialTasks, initialFeatures, initialMeetings, initialContacts, initialContactGroups, initialDealershipGroups, initialKnowledgeArticles, initialShoppers } from './mockData.ts';
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
import { SearchIcon } from './components/icons/SearchIcon.tsx';
import { ShareIcon } from './components/icons/ShareIcon.tsx';
import MyDayView from './components/MyDayView.tsx';
import KnowledgeBaseView from './components/KnowledgeBaseView.tsx';
import ShoppersView from './components/ShopperList.tsx';
import ShopperForm from './components/ShopperForm.tsx';
import ShopperDetailView from './components/ShopperDetailView.tsx';
import { PersonIcon } from './components/icons/PersonIcon.tsx';


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


type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'contact' | 'knowledge' | 'shopper';

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

export function App() {
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
  const [knowledgeArticles, setKnowledgeArticles] = useLocalStorage<KnowledgeArticle[]>('knowledgeArticles', initialKnowledgeArticles);
  const [shoppers, setShoppers] = useLocalStorage<Shopper[]>('shoppers', initialShoppers);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureAnnouncement | null>(null);
  const [selectedShopper, setSelectedShopper] = useState<Shopper | null>(null);
  const [editingTask, setEditingTask] = useState<(Task & { projectId: string | null; projectName?: string; ticketId: string | null; ticketTitle?: string; }) | null>(null);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);

  const [isDealershipGroupFormOpen, setIsDealershipGroupFormOpen] = useState(false);
  const [editingDealershipGroup, setEditingDealershipGroup] = useState<DealershipGroup | null>(null);
  
  const [editingShopper, setEditingShopper] = useState<Shopper | null>(null);
  const [isShopperFormOpen, setIsShopperFormOpen] = useState(false);


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
  
  const [shopperFilters, setShopperFilters] = useState<ShopperFilterState>({ searchTerm: '' });

  const [featureFilters, setFeatureFilters] = useState<FeatureAnnouncementFilterState>({
    searchTerm: '',
    platform: 'all',
    category: 'all',
  });
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { toast, showToast, hideToast } = useToast();

  const dataMap = useMemo(() => ({
    tickets, projects, dealerships, tasks, features, meetings, shoppers
  }), [tickets, projects, dealerships, tasks, features, meetings, shoppers]);


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

  useEffect(() => {
    if (selectedShopper) {
      const freshShopper = shoppers.find(s => s.id === selectedShopper.id);
      setSelectedShopper(freshShopper || null);
    }
  }, [shoppers]);

  // When changing views, clear selections
  useEffect(() => {
    setSelectedTicketIds([]);
  }, [currentView]);


  const allTasks: EnrichedTask[] = useMemo(() => {
    const projectTasks = projects.flatMap(p => 
      (p.tasks || []).map(task => ({
        ...task,
        projectId: p.id,
        projectName: p.name,
        ticketId: null,
        ticketTitle: undefined,
      }))
    );
     const ticketTasks = tickets.flatMap(t => 
        (t.tasks || []).map(task => ({
            ...task,
            projectId: null,
            projectName: undefined,
            ticketId: t.id,
            ticketTitle: t.title,
        }))
    );
    const standaloneTasks = tasks.map(t => ({
        ...t,
        projectId: null,
        projectName: 'General',
        ticketId: null,
        ticketTitle: undefined,
    }));
    return [...projectTasks, ...ticketTasks, ...standaloneTasks];
  }, [projects, tickets, tasks]);
  
  const handleTicketSubmit = (newTicketData: Omit<IssueTicket, 'id' | 'lastUpdatedDate'> | Omit<FeatureRequestTicket, 'id' | 'lastUpdatedDate'>) => {
    const now = new Date().toISOString();
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      lastUpdatedDate: now,
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
          updates: [],
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
  
  const handleSaveShopper = (shopperData: Omit<Shopper, 'id'> | Shopper) => {
    if ('id' in shopperData) {
        const updatedShopper = shopperData;
        setShoppers(prev => prev.map(s => s.id === updatedShopper.id ? updatedShopper : s));
        showToast('Shopper updated!', 'success');
        if (selectedShopper?.id === updatedShopper.id) {
            setSelectedShopper(updatedShopper);
        }
    } else {
        const newShopper: Shopper = { ...shopperData, id: crypto.randomUUID(), recentActivity: [], ticketIds: [], taskIds: [] };
        setShoppers(prev => [...prev, newShopper]);
        showToast('Shopper created!', 'success');
    }
    setIsShopperFormOpen(false);
    setEditingShopper(null);
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
  
  const handleDealershipStatusChange = (dealershipId: string, newStatus: DealershipStatus) => {
    setDealerships(prev => prev.map(d => 
        d.id === dealershipId ? { ...d, status: newStatus } : d
    ));
    showToast('Dealership status updated!', 'success');
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
    const ticketWithTimestamp = {
        ...updatedTicket,
        lastUpdatedDate: new Date().toISOString(),
    };
    setTickets(prev => prev.map(t => t.id === ticketWithTimestamp.id ? ticketWithTimestamp : t));
    showToast('Ticket updated successfully!', 'success');
    if (selectedTicket?.id === ticketWithTimestamp.id) {
        setSelectedTicket(ticketWithTimestamp);
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

  const handleUpdateShopper = (updatedShopper: Shopper) => {
      setShoppers(prev => prev.map(s => s.id === updatedShopper.id ? updatedShopper : s));
      showToast('Shopper updated successfully!', 'success');
      if (selectedShopper?.id === updatedShopper.id) {
          setSelectedShopper(updatedShopper);
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

  const handleDeleteShopper = (shopperId: string) => {
    if (window.confirm('Are you sure you want to delete this shopper?')) {
        setShoppers(prev => prev.filter(s => s.id !== shopperId));
        // Remove shopper from linked tickets and dealerships
        setTickets(prev => prev.map(t => ({ ...t, shopperIds: (t.shopperIds || []).filter(id => id !== shopperId) })));
        setDealerships(prev => prev.map(d => ({ ...d, shopperIds: (d.shopperIds || []).filter(id => id !== shopperId) })));
        showToast('Shopper deleted successfully!', 'success');
        setSelectedShopper(null);
    }
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
// FIX: Changed .map to .filter to correctly remove the task from state.
            setTasks(prev => prev.filter(t => t.id !== taskId));
        }
        showToast('Task deleted!', 'success');
    };

  const handleAddUpdate = (id: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { id: crypto.randomUUID(), author, date: new Date(`${date}T00:00:00`).toISOString(), comment };
    
    if (selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { ...selectedTicket, updates: [...(selectedTicket.updates || []), newUpdate], lastUpdatedDate: new Date().toISOString() };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (selectedProject && selectedProject.id === id) {
        const updatedProject = { ...selectedProject, updates: [...(selectedProject.updates || []), newUpdate] };
        setSelectedProject(updatedProject);
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    } else if (selectedDealership && selectedDealership.id === id) {
        const updatedDealership = { ...selectedDealership, updates: [...(selectedDealership.updates || []), newUpdate] };
        setSelectedDealership(updatedDealership);
        setDealerships(prevDealerships => prevDealerships.map(d => d.id === id ? updatedDealership : d));
    } else if (selectedFeature && selectedFeature.id === id) {
        const updatedFeature = { ...selectedFeature, updates: [...(selectedFeature.updates || []), newUpdate] };
        setSelectedFeature(updatedFeature);
        setFeatures(prevFeatures => prevFeatures.map(f => f.id === id ? updatedFeature : f));
    } else if (selectedMeeting && selectedMeeting.id === id) {
        const updatedMeeting = { ...selectedMeeting, updates: [...(selectedMeeting.updates || []), newUpdate] };
        setSelectedMeeting(updatedMeeting);
        setMeetings(prevMeetings => prevMeetings.map(m => m.id === id ? updatedMeeting : m));
    } else if (selectedShopper && selectedShopper.id === id) {
        const updatedShopper = { ...selectedShopper, updates: [...(selectedShopper.updates || []), newUpdate] };
        setSelectedShopper(updatedShopper);
        setShoppers(prevShoppers => prevShoppers.map(s => s.id === id ? updatedShopper : s));
    }
    showToast('Update added!', 'success');
  };

  const handleEditUpdate = (id: string, updatedUpdate: Update) => {
    if (selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { 
            ...selectedTicket, 
            updates: (selectedTicket.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u),
            lastUpdatedDate: new Date().toISOString()
        };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (selectedProject && selectedProject.id === id) {
        const updatedProject = { 
            ...selectedProject, 
            updates: (selectedProject.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedProject(updatedProject);
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    } else if (selectedDealership && selectedDealership.id === id) {
        const updatedDealership = { 
            ...selectedDealership, 
            updates: (selectedDealership.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedDealership(updatedDealership);
        setDealerships(prevDealerships => prevDealerships.map(d => d.id === id ? updatedDealership : d));
    } else if (selectedFeature && selectedFeature.id === id) {
        const updatedFeature = { 
            ...selectedFeature, 
            updates: (selectedFeature.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedFeature(updatedFeature);
        setFeatures(prevFeatures => prevFeatures.map(f => f.id === id ? updatedFeature : f));
    } else if (selectedMeeting && selectedMeeting.id === id) {
        const updatedMeeting = { 
            ...selectedMeeting, 
            updates: (selectedMeeting.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedMeeting(updatedMeeting);
        setMeetings(prevMeetings => prevMeetings.map(m => m.id === id ? updatedMeeting : m));
    } else if (selectedShopper && selectedShopper.id === id) {
        const updatedShopper = { 
            ...selectedShopper, 
            updates: (selectedShopper.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u)
        };
        setSelectedShopper(updatedShopper);
        setShoppers(prevShoppers => prevShoppers.map(s => s.id === id ? updatedShopper : s));
    }
    showToast('Update modified!', 'success');
  };

  const handleDeleteUpdate = (id: string, updateId: string) => {
    if (selectedTicket && selectedTicket.id === id) {
        const updatedTicket = { 
            ...selectedTicket, 
            updates: (selectedTicket.updates || []).filter(u => u.id !== updateId),
            lastUpdatedDate: new Date().toISOString()
        };
        setSelectedTicket(updatedTicket);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? updatedTicket : t));
    } else if (selectedProject && selectedProject.id === id) {
        const updatedProject = { 
            ...selectedProject, 
            updates: (selectedProject.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedProject(updatedProject);
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? updatedProject : p));
    } else if (selectedDealership && selectedDealership.id === id) {
        const updatedDealership = { 
            ...selectedDealership, 
            updates: (selectedDealership.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedDealership(updatedDealership);
        setDealerships(prevDealerships => prevDealerships.map(d => d.id === id ? updatedDealership : d));
    } else if (selectedFeature && selectedFeature.id === id) {
        const updatedFeature = { 
            ...selectedFeature, 
            updates: (selectedFeature.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedFeature(updatedFeature);
        setFeatures(prevFeatures => prevFeatures.map(f => f.id === id ? updatedFeature : f));
    } else if (selectedMeeting && selectedMeeting.id === id) {
        const updatedMeeting = { 
            ...selectedMeeting, 
            updates: (selectedMeeting.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedMeeting(updatedMeeting);
        setMeetings(prevMeetings => prevMeetings.map(m => m.id === id ? updatedMeeting : m));
    } else if (selectedShopper && selectedShopper.id === id) {
        const updatedShopper = { 
            ...selectedShopper, 
            updates: (selectedShopper.updates || []).filter(u => u.id !== updateId)
        };
        setSelectedShopper(updatedShopper);
        setShoppers(prevShoppers => prevShoppers.map(s => s.id === id ? updatedShopper : s));
    }
    showToast('Update deleted!', 'success');
  };
  
  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
      setTickets(prev => prev.map(t => {
          if (t.id === ticketId) {
              const updatedTicket: Ticket = { 
                  ...t, 
                  status: newStatus,
                  lastUpdatedDate: new Date().toISOString()
              };
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
            t.id === ticketId ? { ...t, isFavorite: !t.isFavorite, lastUpdatedDate: new Date().toISOString() } : t
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
        appendDateField('Start Date', ticket.startDate);
        appendDateField('Last Updated', ticket.lastUpdatedDate);
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
        const appendSection = (title: string) => {
            content += `\n--- ${title.toUpperCase()} ---\n`;
        };

        appendField('ID', task.id);
        appendField('Description', task.description);
        appendField('Status', task.status);
        appendField('Priority', task.priority);
        appendField('Assigned to', task.assignedUser);
        appendField('Type', task.type);
        appendDateField('Creation Date', task.creationDate);
        appendDateField('Due Date', task.dueDate);
        appendField('Notify on Completion', task.notifyOnCompletion);

        appendSection('Linked Item IDs');
        appendField('Linked Task IDs', (task.linkedTaskIds || []).join(', '));
        appendField('Ticket IDs', (task.ticketIds || []).join(', '));
        appendField('Project IDs', (task.projectIds || []).join(', '));
        appendField('Meeting IDs', (task.meetingIds || []).join(', '));
        appendField('Dealership IDs', (task.dealershipIds || []).join(', '));
        appendField('Feature IDs', (task.featureIds || []).join(', '));
        
        createTxtFileDownloader(content, `Task_${task.id}_${task.description.substring(0, 30)}`);
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
        const appendSection = (title: string) => {
            content += `\n--- ${title.toUpperCase()} ---\n`;
        };
        
        appendField('ID', meeting.id);
        appendDateField('Date', meeting.meetingDate);
        appendField('Attendees', meeting.attendees.join(', '));

        appendSection('Notes');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = meeting.notes;
        const notesText = tempDiv.textContent || tempDiv.innerText || "";
        content += `${notesText}\n`;
        
        appendSection('Linked Item IDs');
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

        appendSection('Account Information');
        appendField('ID', dealership.id);
        appendField('Account Number (CIF)', dealership.accountNumber);
        appendField('Status', dealership.status);
        appendField('Enterprise (Group)', dealership.enterprise);
        appendField('Address', dealership.address);

        appendSection('Key Contacts');
        appendField('Assigned Specialist', dealership.assignedSpecialist);
        appendField('Sales', dealership.sales);
        appendField('POC Name', dealership.pocName);
        appendField('POC Email', dealership.pocEmail);
        appendField('POC Phone', dealership.pocPhone);
        
        if (dealership.websiteLinks && dealership.websiteLinks.length > 0) {
            content += 'Website Links:\n';
            dealership.websiteLinks.forEach(link => {
                content += `- ${link.url}`;
                if (link.clientId) {
                    content += ` (Client ID: ${link.clientId})`;
                }
                content += '\n';
            });
        }

        appendSection('Order & Dates');
        appendField('Order Number', dealership.orderNumber);
        appendDateField('Order Received Date', dealership.orderReceivedDate);
        appendDateField('Go-Live Date', dealership.goLiveDate);
        appendDateField('Term Date', dealership.termDate);
        
        appendSection('Identifiers');
        appendField('Store Number', dealership.storeNumber);
        appendField('Branch Number', dealership.branchNumber);
        appendField('ERA System ID', dealership.eraSystemId);
        appendField('PPSysID', dealership.ppSysId);
        appendField('BU-ID', dealership.buId);

        if (dealership.updates && dealership.updates.length > 0) {
            appendSection(`Updates (${dealership.updates.length})`);
            [...dealership.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n');
                content += `[${new Date(update.date).toLocaleString(undefined, { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n\n`;
            });
        }
        
        appendSection('Linked Item IDs');
        appendField('Ticket IDs', (dealership.ticketIds || []).join(', '));
        appendField('Project IDs', (dealership.projectIds || []).join(', '));
        appendField('Meeting IDs', (dealership.meetingIds || []).join(', '));
        appendField('Task IDs', (dealership.taskIds || []).join(', '));
        appendField('Linked Dealership IDs', (dealership.linkedDealershipIds || []).join(', '));
        appendField('Feature IDs', (dealership.featureIds || []).join(', '));

        createTxtFileDownloader(content, `Dealership_${dealership.id}_${dealership.name}`);
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
        const appendSection = (title: string) => {
            content += `\n--- ${title.toUpperCase()} ---\n`;
        };
        const appendTextArea = (label: string, value: any) => {
             if (value) {
                content += `${label}:\n${value}\n\n`;
            }
        };

        appendField('ID', feature.id);
        appendField('Status', feature.status);
        appendField('Platform', feature.platform);
        appendField('Location', feature.location);
        appendDateField('Launch Date', feature.launchDate);
        appendField('Version', feature.version);
        appendField('Categories', (feature.categories || []).join(', '));

        appendSection('Details');
        appendTextArea('Description', feature.description);
        appendTextArea('Target Audience', feature.targetAudience);
        appendTextArea('Success Metrics', feature.successMetrics);

        appendSection('Linked Item IDs');
        appendField('Ticket IDs', (feature.ticketIds || []).join(', '));
        appendField('Project IDs', (feature.projectIds || []).join(', '));
        appendField('Meeting IDs', (feature.meetingIds || []).join(', '));
        appendField('Task IDs', (feature.taskIds || []).join(', '));
        appendField('Dealership IDs', (feature.dealershipIds || []).join(', '));
        appendField('Linked Feature IDs', (feature.linkedFeatureIds || []).join(', '));

        createTxtFileDownloader(content, `Feature_${feature.id}_${feature.title}`);
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
          case 'contact': return setContacts;
          case 'knowledge': return setKnowledgeArticles;
          case 'shopper': return setShoppers;
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
                    ? { ...t, tasks: (t.tasks || []).map(subTask => subTask.id === id ? updateFn(subTask) : subTask), lastUpdatedDate: new Date().toISOString() }
                    : t
                ));
            } else {
                setTasks(prev => prev.map(t => t.id === id ? updateFn(t) : t));
            }
        } else {
            const setter = getSetterForType(type);
            if(setter) {
              setter((prev: any[]) => prev.map(e => {
                  if (e.id === id) {
                      const updatedEntity = updateFn(e);
                      if (type === 'ticket') {
                          updatedEntity.lastUpdatedDate = new Date().toISOString();
                      }
                      return updatedEntity;
                  }
                  return e;
              }));
            }
        }
    };
    
    const getLinkKeys = (fromType: EntityType, toType: EntityType): { forwardKey: string, reverseKey: string } => {
        const getSelfLinkKey = (type: EntityType) => {
            switch (type) {
                case 'ticket': return 'linkedTicketIds';
                case 'project': return 'linkedProjectIds';
                case 'task': return 'linkedTaskIds';
                case 'meeting': return 'linkedMeetingIds';
                case 'dealership': return 'linkedDealershipIds';
                case 'feature': return 'linkedFeatureIds';
                case 'knowledge': return 'linkedArticleIds';
                default: return `${type}Ids`;
            }
        }

        const forwardKey = fromType === toType ? getSelfLinkKey(fromType) : `${toType}Ids`;
        const reverseKey = fromType === toType ? getSelfLinkKey(toType) : `${fromType}Ids`;
        
        return { forwardKey, reverseKey };
    }
    
    const handleLinkItem = (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => {
        const { forwardKey, reverseKey } = getLinkKeys(fromType, toType);

        updateEntity(fromType, fromId, (entity) => ({
            ...entity,
            [forwardKey]: [...new Set([...(entity[forwardKey] || []), toId])]
        }));
        
        updateEntity(toType, toId, (entity) => ({
            ...entity,
            [reverseKey]: [...new Set([...(entity[reverseKey] || []), fromId])]
        }));

        showToast(`${fromType.charAt(0).toUpperCase() + fromType.slice(1)} and ${toType} linked successfully!`, 'success');
    };
    
    const handleUnlinkItem = (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => {
        const { forwardKey, reverseKey } = getLinkKeys(fromType, toType);
        
        updateEntity(fromType, fromId, (entity) => ({
            ...entity,
            [forwardKey]: (entity[forwardKey] || []).filter((id: string) => id !== toId)
        }));
        
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
        }).sort((a, b) => new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime());
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
        return features.filter(feature => {
            const searchLower = featureFilters.searchTerm.toLowerCase();
            const matchesSearch = !searchLower ||
                feature.title.toLowerCase().includes(searchLower) ||
                feature.description.toLowerCase().includes(searchLower);
            
            const matchesPlatform = featureFilters.platform === 'all' || feature.platform === featureFilters.platform;
            
            const matchesCategory = featureFilters.category === 'all' ||
                (feature.categories || []).includes(featureFilters.category);

            return matchesSearch && matchesPlatform && matchesCategory;
        });
    }, [features, featureFilters]);

    const filteredShoppers = useMemo(() => {
        return shoppers.filter(s => {
            const searchLower = shopperFilters.searchTerm.toLowerCase();
            return (
                s.customerName.toLowerCase().includes(searchLower) ||
                s.curatorId.toLowerCase().includes(searchLower) ||
                (s.email || '').toLowerCase().includes(searchLower) ||
                (s.cdpId || '').toLowerCase().includes(searchLower) ||
                (s.dmsId || '').toLowerCase().includes(searchLower)
            );
        }).sort((a, b) => a.customerName.localeCompare(b.customerName));
    }, [shoppers, shopperFilters]);

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
            totalDealerships: dealerships.filter(d => d.status !== DealershipStatus.Cancelled && d.status !== DealershipStatus.Prospect).length,
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
              return ['id', 'title', 'type', 'productArea', 'platform', 'pmrNumber', 'pmrLink', 'fpTicketNumber', 'ticketThreadId', 'startDate', 'completionDate', 'status', 'priority', 'submitterName', 'client', 'location', 'updates', 'completionNotes', 'onHoldReason', 'isFavorite', 'projectIds', 'linkedTicketIds', 'meetingIds', 'taskIds', 'dealershipIds', 'featureIds', 'problem', 'duplicationSteps', 'workaround', 'frequency', 'improvement', 'currentFunctionality', 'suggestedSolution', 'benefits'];
          case 'Projects':
              return ['id', 'name', 'description', 'status', 'tasks', 'creationDate', 'updates', 'involvedPeople', 'ticketIds', 'meetingIds', 'linkedProjectIds', 'taskIds', 'dealershipIds', 'featureIds'];
          case 'Dealerships':
              return ['id', 'name', 'accountNumber', 'status', 'hasManagedSolution', 'orderNumber', 'orderReceivedDate', 'goLiveDate', 'termDate', 'enterprise', 'storeNumber', 'branchNumber', 'eraSystemId', 'ppSysId', 'buId', 'address', 'assignedSpecialist', 'sales', 'pocName', 'pocEmail', 'pocPhone', 'websiteLinks', 'ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'linkedDealershipIds', 'featureIds'];
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
    
        const toUtcIsoString = (dateString?: string): string | undefined => {
            if (!dateString || typeof dateString !== 'string') return undefined;
    
            // Try parsing common formats before falling back to new Date()
            // Format 1: YYYY-MM-DD (robust) - also catches ISO strings
            const isoMatch = dateString.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
            if (isoMatch) {
                const d = new Date(Date.UTC(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3])));
                if (!isNaN(d.getTime())) return d.toISOString();
            }
    
            // Format 2: MM/DD/YYYY (common US)
            const usMatch = dateString.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
            if (usMatch) {
                const year = parseInt(usMatch[3]);
                const fullYear = year < 100 ? 2000 + year : year;
                const d = new Date(Date.UTC(fullYear, parseInt(usMatch[1]) - 1, parseInt(usMatch[2])));
                if (!isNaN(d.getTime())) return d.toISOString();
            }
    
            // Fallback to native parser
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return undefined;
    
            // Handle timezone offset for date-only strings parsed natively
            if (!dateString.includes('T') && !dateString.toLowerCase().includes('z')) {
                const tzOffset = date.getTimezoneOffset() * 60000;
                return new Date(date.getTime() + tzOffset).toISOString();
            }
            return date.toISOString();
        };

        const enumFields: Record<string, any[]> = {};
        const dateFields: string[] = [];
        const arrayFields: string[] = [];
        const jsonFields: string[] = ['updates', 'tasks'];
        const booleanFields: string[] = ['isFavorite'];
    
        switch (entityType) {
            case 'Tickets':
                dateFields.push('startDate', 'completionDate');
                arrayFields.push('projectIds', 'linkedTicketIds', 'meetingIds', 'taskIds', 'dealershipIds', 'featureIds');
                enumFields['type'] = TICKET_TYPE_OPTIONS;
                enumFields['status'] = STATUS_OPTIONS;
                enumFields['priority'] = PRIORITY_OPTIONS;
                enumFields['productArea'] = PRODUCT_AREA_OPTIONS;
                enumFields['platform'] = PLATFORM_OPTIONS;
                break;
            case 'Projects':
                dateFields.push('creationDate');
                arrayFields.push('ticketIds', 'meetingIds', 'linkedProjectIds', 'taskIds', 'dealershipIds', 'featureIds', 'involvedPeople');
                enumFields['status'] = Object.values(ProjectStatus);
                break;
            case 'Dealerships':
                dateFields.push('orderReceivedDate', 'goLiveDate', 'termDate');
                arrayFields.push('ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'linkedDealershipIds', 'featureIds');
                jsonFields.push('websiteLinks');
                enumFields['status'] = DEALERSHIP_STATUS_OPTIONS;
                booleanFields.push('hasManagedSolution');
                break;
            case 'Standalone Tasks':
                dateFields.push('creationDate', 'dueDate');
                arrayFields.push('linkedTaskIds', 'ticketIds', 'projectIds', 'meetingIds', 'dealershipIds', 'featureIds');
                enumFields['status'] = Object.values(TaskStatus);
                enumFields['priority'] = Object.values(TaskPriority);
                break;
            case 'Features':
                dateFields.push('launchDate');
                arrayFields.push('ticketIds', 'projectIds', 'meetingIds', 'taskIds', 'dealershipIds', 'linkedFeatureIds');
                enumFields['status'] = Object.values(FeatureStatus);
                enumFields['platform'] = PLATFORM_OPTIONS;
                break;
            case 'Meetings':
                dateFields.push('meetingDate');
                arrayFields.push('attendees', 'projectIds', 'ticketIds', 'linkedMeetingIds', 'taskIds', 'dealershipIds', 'featureIds');
                break;
        }

        // Apply formatting
        Object.keys(formattedRow).forEach(key => {
            const value = formattedRow[key];
            if (value === undefined || value === null) return;
            
            if (enumFields[key]) {
                const normalized = normalizeEnumValue(value, enumFields[key]);
                if (normalized) formattedRow[key] = normalized;
            } else if (booleanFields.includes(key)) {
                const normalized = normalizeBooleanValue(value);
                if (normalized !== undefined) formattedRow[key] = normalized;
            } else if (dateFields.includes(key)) {
                formattedRow[key] = toUtcIsoString(value);
            } else if (arrayFields.includes(key)) {
                if (typeof value === 'string') {
                    try {
                        const parsed = JSON.parse(value.replace(/'/g, '"'));
                        formattedRow[key] = Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                    } catch (e) {
                        formattedRow[key] = value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                    }
                } else if (!Array.isArray(value)) {
                    formattedRow[key] = [];
                }
            } else if (jsonFields.includes(key)) {
                if (typeof value === 'string') {
                    try {
                        formattedRow[key] = JSON.parse(value);
                    } catch (e) {
                        console.warn(`Could not parse JSON for field '${key}'`, { value });
                        formattedRow[key] = (key === 'tasks' || key === 'websiteLinks') ? [] : undefined;
                    }
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
                
                const setter = settersMap[title];
                if (!setter) {
                    showToast(`Could not import data for "${title}".`, 'error');
                    return;
                }

                let addedCount = 0;
                let updatedCount = 0;
                let skippedCount = 0;

                if (mode === 'replace') { // Upsert logic: Update existing, add new
                    setter((currentData: any[]) => {
                        const dataMap = new Map(currentData.map(item => [item.id, item]));
                        validData.forEach(item => {
                            const id = item.id;
                            if (id && dataMap.has(id)) {
                                const existingItem = dataMap.get(id);
                                dataMap.set(id, { ...existingItem, ...item });
                                updatedCount++;
                            } else {
                                const newId = id || crypto.randomUUID();
                                dataMap.set(newId, { ...item, id: newId, lastUpdatedDate: new Date().toISOString() });
                                addedCount++;
                            }
                        });
                        return Array.from(dataMap.values());
                    });
                } else { // Append logic: Add new, skip existing
                    setter((currentData: any[]) => {
                        const existingIds = new Set(currentData.map(item => item.id));
                        const newData: any[] = [];
                        validData.forEach(item => {
                            const id = item.id;
                            if (id && existingIds.has(id)) {
                                skippedCount++;
                            } else {
                                const newId = id || crypto.randomUUID();
                                newData.push({ ...item, id: newId, lastUpdatedDate: new Date().toISOString() });
                                addedCount++;
                            }
                        });
                        return [...currentData, ...newData];
                    });
                }

                let toastMessage = `Import from ${file.name} complete. `;
                let toastType: 'success' | 'error' = 'success';
                
                if (addedCount > 0) toastMessage += `${addedCount} row(s) added. `;
                if (updatedCount > 0) toastMessage += `${updatedCount} row(s) updated. `;
                if (skippedCount > 0) toastMessage += `${skippedCount} row(s) skipped (ID already exists). `;

                if (failedRowCount > 0) {
                    toastMessage += `${failedRowCount} row(s) failed. Check console.`;
                    if (addedCount === 0 && updatedCount === 0) toastType = 'error';
                }

                if (addedCount === 0 && updatedCount === 0 && skippedCount === 0 && failedRowCount === 0) {
                    toastMessage = `No data was imported from ${file.name}. The file might be empty or all rows failed validation.`;
                    toastType = 'error';
                }
                
                showToast(toastMessage.trim(), toastType);
                
                if (addedCount > 0 || updatedCount > 0) {
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
            case 'contacts': return 'Create New Contact';
            default: return 'Create New Item';
        }
    }
    
    const renderForm = () => {
        switch (currentView) {
            case 'tickets': return <TicketForm onSubmit={data => { handleTicketSubmit(data); setIsFormOpen(false); }} projects={projects} />;
            case 'projects': return <ProjectForm onSubmit={data => { handleProjectSubmit(data); setIsFormOpen(false); }} />;
            case 'dealerships': return <DealershipForm onSubmit={data => { handleDealershipSubmit(data); setIsFormOpen(false); }} onUpdate={handleUpdateDealership} onClose={() => setIsFormOpen(false)} allGroups={dealershipGroups}/>;
            case 'features': return <FeatureForm onSubmit={data => { handleFeatureSubmit(data); setIsFormOpen(false); }} onUpdate={() => {}} onClose={() => setIsFormOpen(false)} />;
            case 'meetings': return <MeetingForm onSubmit={data => { handleMeetingSubmit(data); setIsFormOpen(false); }} onClose={() => setIsFormOpen(false)} />;
            case 'contacts': return <ContactForm onSave={handleSaveContact} onClose={() => setIsContactFormOpen(false)} contactToEdit={null} allGroups={contactGroups} />;
            default: return null;
        }
    }

    const handleCreateChoice = (view: View) => {
        setIsCreateChoiceModalOpen(false);
        setCurrentView(view);
        setTimeout(() => {
            if (view === 'contacts') {
                setEditingContact(null);
                setIsContactFormOpen(true);
            } else if (view === 'shoppers') {
                setEditingShopper(null);
                setIsShopperFormOpen(true);
            } else {
                setIsFormOpen(true);
            }
        }, 50);
    };

    const handleHeaderNewClick = () => {
        if (currentView === 'dashboard') {
            setIsCreateChoiceModalOpen(true);
        } else if (currentView === 'contacts') {
            setEditingContact(null);
            setIsContactFormOpen(true);
        } else if (currentView === 'shoppers') {
            setEditingShopper(null);
            setIsShopperFormOpen(true);
        } else {
            setIsFormOpen(true);
        }
    };

    const handleNewDealershipGroupClick = () => {
        setEditingDealershipGroup(null);
        setIsDealershipGroupFormOpen(true);
    };
    
    const handleEditDealershipGroupClick = (group: DealershipGroup) => {
        setEditingDealershipGroup(group);
        setIsDealershipGroupFormOpen(true);
    };

    const getNewButtonText = () => {
        switch (currentView) {
            case 'tickets': return 'New Ticket';
            case 'projects': return 'New Project';
            case 'dealerships': return 'New Account';
            case 'features': return 'New Feature';
            case 'meetings': return 'New Note';
            case 'contacts': return 'New Contact';
            case 'shoppers': return 'New Shopper';
            case 'tasks': return ''; // No main "new" button for tasks view
            case 'dashboard': return 'New Item';
            case 'knowledge': return '';
            default: return 'New Item';
        }
    }
    
    const closeAllSideViews = () => {
        setSelectedTicket(null);
        setSelectedProject(null);
        setSelectedDealership(null);
        setSelectedMeeting(null);
        setSelectedFeature(null);
        setSelectedShopper(null);
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
                case 'shopper':
                    const shopper = shoppers.find(s => s.id === id);
                    if (shopper) setSelectedShopper(shopper);
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
      { title: 'Shoppers', data: shoppers },
    ];

    // Data for Dashboard
    const upcomingDeadlines = useMemo(() => {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        const taskDeadlines = allTasks
            .filter(t => t.dueDate && new Date(t.dueDate) <= sevenDaysFromNow && t.status !== TaskStatus.Done)
            .map(t => ({...t, type: 'task' as const}));

        return [...taskDeadlines].sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    }, [allTasks]);

// FIX: Corrected logic for recentlyUpdatedItems to match DashboardView's expectations and fixed truncation.
    const recentlyUpdatedItems = useMemo(() => {
        const allItemsWithLastUpdate = [
            ...tickets.map(item => ({ ...item, itemType: 'ticket' as const})),
            ...projects.map(item => ({ ...item, itemType: 'project' as const})),
            ...dealerships.map(item => ({ ...item, itemType: 'dealership' as const})),
        ]
        .map(item => {
            if (!item.updates || item.updates.length === 0) return null;
            const lastUpdate = [...item.updates].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            return { ...item, lastUpdate };
        })
        .filter((item): item is (typeof item & { lastUpdate: Update }) => item !== null);
        
        return allItemsWithLastUpdate
            .sort((a,b) => new Date(b.lastUpdate.date).getTime() - new Date(a.lastUpdate.date).getTime())
            .slice(0, 5);

    }, [tickets, projects, dealerships]);

    const dueToday = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const taskDueToday = allTasks
            .filter(t => t.dueDate && new Date(t.dueDate) <= today && t.status !== TaskStatus.Done)
            .map(t => ({...t, type: 'task' as const}));
            
        // Assuming tickets don't have a due date for now
        
        return [...taskDueToday].sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    }, [allTasks, tickets]);

    const myFavorites = useMemo(() => {
        const favTickets = tickets.filter(t => t.isFavorite);
        const favKnowledge = knowledgeArticles.filter(a => a.isFavorite);
        return [...favTickets, ...favKnowledge];
    }, [tickets, knowledgeArticles]);

    // This is the main render of the App component. The file provided was truncated,
    // so this is a reconstruction based on the available state and components.
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Toast {...toast} onClose={hideToast} />
            <LeftSidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                currentView={currentView}
                onViewChange={handleViewChange}
                ticketFilters={ticketFilters}
                setTicketFilters={setTicketFilters}
                dealershipFilters={dealershipFilters}
                setDealershipFilters={setDealershipFilters}
                shopperFilters={shopperFilters}
                setShopperFilters={setShopperFilters}
                onImportClick={() => setIsImportModalOpen(true)}
                onExportClick={() => setIsExportModalOpen(true)}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 text-gray-600 hover:text-gray-900 rounded-full focus:outline-none focus:ring-2 ring-gray-400">
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 capitalize">{currentView}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input type="text" placeholder="Global search..." className="w-full pl-10 pr-4 py-2 border rounded-md text-sm" />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-100"><ShareIcon className="w-5 h-5 text-gray-600" /></button>
                        {getNewButtonText() && (
                            <button onClick={handleHeaderNewClick} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                                <PlusIcon className="w-4 h-4" />
                                <span>{getNewButtonText()}</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {currentView === 'dashboard' && (
                        <DashboardView 
                            performanceInsights={performanceInsights}
                            projectInsights={projectInsights}
                            dealershipInsights={dealershipInsights}
                            taskInsights={taskInsights}
                            upcomingDeadlines={upcomingDeadlines}
                            recentlyUpdatedItems={recentlyUpdatedItems}
                            dueToday={dueToday}
                            myFavorites={myFavorites}
                            onSwitchView={handleSwitchToDetailView}
                        />
                    )}
                    {currentView === 'tickets' && (
                        <>
                            {selectedTicketIds.length > 0 && <BulkActionBar selectedCount={selectedTicketIds.length} onClearSelection={() => setSelectedTicketIds([])} onUpdateStatus={() => {}} onUpdatePriority={() => {}} onDelete={() => {}} />}
                            <SavedViewsBar savedViews={savedTicketViews} onSaveView={() => {}} onApplyView={() => {}} onDeleteView={() => {}} />
                            <PerformanceInsights {...performanceInsights} />
                            {/* FIX: Corrected a reference error where 'i' was used instead of 'id' when adding a new ticket to the selection. */}
<TicketList tickets={filteredTickets} onRowClick={setSelectedTicket} onStatusChange={handleStatusChange} projects={projects} onToggleFavorite={handleToggleFavoriteTicket} selectedTicketIds={selectedTicketIds} onToggleSelection={(id) => setSelectedTicketIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} />
                        </>
                    )}
                    {currentView === 'projects' && (
                        <>
                            <ProjectInsights {...projectInsights} />
                            <ProjectList projects={filteredProjects} onProjectClick={setSelectedProject} tickets={tickets} />
                        </>
                    )}
                    {currentView === 'dealerships' && (
                        <>
                            <DealershipInsights {...dealershipInsights} />
                            <DealershipList 
                                dealerships={filteredDealerships} 
                                onDealershipClick={setSelectedDealership}
                                onStatusChange={handleDealershipStatusChange}
                                dealershipGroups={dealershipGroups}
                                onUpdateGroup={handleUpdateDealershipGroup}
                                onDeleteGroup={handleDeleteDealershipGroup}
                                showToast={showToast}
                                onNewGroupClick={handleNewDealershipGroupClick}
                                onEditGroupClick={handleEditDealershipGroupClick}
                            />
                        </>
                    )}
                    {currentView === 'tasks' && (
                        <>
                            <TaskInsights {...taskInsights} />
                            <TaskList projects={projects} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} allTasks={allTasks} onSwitchView={handleSwitchToDetailView} />
                        </>
                    )}
                     {currentView === 'features' && (
                        <FeatureList 
                            features={filteredFeatures} 
                            onFeatureClick={setSelectedFeature} 
                            onDelete={handleDeleteFeature}
                            filters={featureFilters}
                            setFilters={setFeatureFilters}
                            allCategories={Array.from(new Set(features.flatMap(f => f.categories || [])))}
                        />
                    )}
                    {currentView === 'meetings' && (
                        <MeetingList 
                            meetings={filteredMeetings} 
                            onMeetingClick={setSelectedMeeting}
                            meetingFilters={meetingFilters}
                            setMeetingFilters={setMeetingFilters}
                        />
                    )}
                    {currentView === 'contacts' && (
                       <ContactsView 
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
                    )}
                    {currentView === 'knowledge' && (
                       <KnowledgeBaseView 
                           articles={knowledgeArticles} 
                           onSave={(data) => {}} 
                           onDelete={(id) => {}}
                           onToggleFavorite={(id) => {}}
                       />
                    )}
                    {currentView === 'shoppers' && (
                        <ShoppersView 
                            shoppers={filteredShoppers}
                            allDealerships={dealerships}
                            onShopperClick={setSelectedShopper}
                            onEditShopperClick={(shopper) => { setEditingShopper(shopper); setIsShopperFormOpen(true); }}
                            onUpdateShopper={handleSaveShopper}
                            onDeleteShopper={handleDeleteShopper}
                            showToast={showToast}
                            shopperFilters={shopperFilters}
                            setShopperFilters={setShopperFilters}
                        />
                    )}
                </div>
            </main>

            {/* Side Views for Details */}
            {selectedTicket && (
                <SideView title={`Ticket: ${selectedTicket.title}`} isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
                    <TicketDetailView
                        ticket={selectedTicket}
                        onUpdate={handleUpdateTicket}
                        onAddUpdate={(comment, author, date) => handleAddUpdate(selectedTicket.id, comment, author, date)}
                        onEditUpdate={(update) => handleEditUpdate(selectedTicket.id, update)}
                        onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedTicket.id, updateId)}
                        onExport={() => handleExportTicket(selectedTicket)}
                        onEmail={() => handleEmailTicket(selectedTicket)}
                        onDelete={handleDeleteTicket}
                        showToast={showToast}
                        allTickets={tickets}
                        allProjects={projects}
                        allTasks={allTasks}
                        allMeetings={meetings}
                        allDealerships={dealerships}
                        allFeatures={features}
                        allShoppers={shoppers}
                        onLink={(toType, toId) => handleLinkItem('ticket', selectedTicket.id, toType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('ticket', selectedTicket.id, toType, toId)}
                        onSwitchView={handleSwitchToDetailView}
                    />
                </SideView>
            )}
             {selectedProject && (
                <SideView title={`Project: ${selectedProject.name}`} isOpen={!!selectedProject} onClose={() => setSelectedProject(null)}>
                    <ProjectDetailView 
                        project={selectedProject} 
                        onUpdate={handleUpdateProject}
                        onDelete={handleDeleteProject}
                        onExport={() => handleExportProject(selectedProject)}
                        onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
                        onEditUpdate={(update) => handleEditUpdate(selectedProject.id, update)}
                        onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedProject.id, updateId)}
                        showToast={showToast}
                        allTickets={tickets}
                        allProjects={projects}
                        allTasks={allTasks}
                        allMeetings={meetings}
                        allDealerships={dealerships}
                        allFeatures={features}
                        onLink={(toType, toId) => handleLinkItem('project', selectedProject.id, toType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('project', selectedProject.id, toType, toId)}
                        onSwitchView={handleSwitchToDetailView}
                    />
                </SideView>
            )}
             {selectedDealership && (
                <SideView title={`Account: ${selectedDealership.name}`} isOpen={!!selectedDealership} onClose={() => setSelectedDealership(null)}>
                    <DealershipDetailView
                        dealership={selectedDealership}
                        onUpdate={handleUpdateDealership}
                        onDelete={handleDeleteDealership}
                        onExport={() => handleExportDealership(selectedDealership)}
                        showToast={showToast}
                        onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
                        onEditUpdate={(update) => handleEditUpdate(selectedDealership.id, update)}
                        onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedDealership.id, updateId)}
                        allTickets={tickets}
                        allProjects={projects}
                        allTasks={allTasks}
                        allMeetings={meetings}
                        allDealerships={dealerships}
                        allFeatures={features}
                        allGroups={dealershipGroups}
                        allShoppers={shoppers}
                        onLink={(toType, toId) => handleLinkItem('dealership', selectedDealership.id, toType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('dealership', selectedDealership.id, toType, toId)}
                        onSwitchView={handleSwitchToDetailView}
                    />
                </SideView>
            )}
            {selectedMeeting && (
                 <SideView title={`Meeting: ${selectedMeeting.name}`} isOpen={!!selectedMeeting} onClose={() => setSelectedMeeting(null)}>
                    <MeetingDetailView 
                        meeting={selectedMeeting} 
                        onUpdate={handleUpdateMeeting}
                        onDelete={handleDeleteMeeting}
                        onExport={() => handleExportMeeting(selectedMeeting)}
                        onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
                        onEditUpdate={(update) => handleEditUpdate(selectedMeeting.id, update)}
                        onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedMeeting.id, updateId)}
                        showToast={showToast}
                        allTickets={tickets}
                        allProjects={projects}
                        allTasks={allTasks}
                        allMeetings={meetings}
                        allDealerships={dealerships}
                        allFeatures={features}
                        onLink={(toType, toId) => handleLinkItem('meeting', selectedMeeting.id, toType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('meeting', selectedMeeting.id, toType, toId)}
                        onSwitchView={handleSwitchToDetailView}
                    />
                 </SideView>
            )}
            {selectedFeature && (
                <SideView title={`Feature: ${selectedFeature.title}`} isOpen={!!selectedFeature} onClose={() => setSelectedFeature(null)}>
                    <FeatureDetailView 
                        feature={selectedFeature}
                        onUpdate={handleUpdateFeature}
                        onDelete={handleDeleteFeature}
                        onExport={() => handleExportFeature(selectedFeature)}
                        onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
                        onEditUpdate={(update) => handleEditUpdate(selectedFeature.id, update)}
                        onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedFeature.id, updateId)}
                        showToast={showToast}
                        allTickets={tickets}
                        allProjects={projects}
                        allTasks={allTasks}
                        allMeetings={meetings}
                        allDealerships={dealerships}
                        allFeatures={features}
                        onLink={(toType, toId) => handleLinkItem('feature', selectedFeature.id, toType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('feature', selectedFeature.id, toType, toId)}
                        onSwitchView={handleSwitchToDetailView}
                    />
                </SideView>
            )}
            {selectedShopper && (
                <SideView title={`Shopper: ${selectedShopper.customerName}`} isOpen={!!selectedShopper} onClose={() => setSelectedShopper(null)}>
                    <ShopperDetailView 
                        shopper={selectedShopper}
                        onUpdate={handleUpdateShopper}
                        onDelete={handleDeleteShopper}
                        showToast={showToast}
                        onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
                        onEditUpdate={(update) => handleEditUpdate(selectedShopper.id, update)}
                        onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedShopper.id, updateId)}
                        allTickets={tickets}
                        allDealerships={dealerships}
                        allTasks={allTasks}
                        onLink={(toType, toId) => handleLinkItem('shopper', selectedShopper.id, toType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('shopper', selectedShopper.id, toType, toId)}
                        onSwitchView={handleSwitchFromTaskModal}
                    />
                </SideView>
            )}
            {editingTask && (
                <Modal title="Edit Task" onClose={() => setEditingTask(null)} size="4xl">
                    <EditTaskForm 
                        task={editingTask} 
                        onSave={handleUpdateTask} 
                        onClose={() => setEditingTask(null)}
                        onExport={() => handleExportTask(editingTask)}
                        showToast={showToast}
                        allTasks={allTasks}
                        allTickets={tickets}
                        allProjects={projects}
                        allMeetings={meetings}
                        allDealerships={dealerships}
                        allFeatures={features}
                        allShoppers={shoppers}
                        onLink={(toType, toId) => handleLinkItem('task', editingTask.id, toType as EntityType, toId)}
                        onUnlink={(toType, toId) => handleUnlinkItem('task', editingTask.id, toType as EntityType, toId)}
                        onSwitchView={handleSwitchFromTaskModal}
                    />
                </Modal>
            )}

            {/* Modals for creating new items */}
            {isFormOpen && (
                <Modal title={getFormTitle()} onClose={() => setIsFormOpen(false)}>
                    {renderForm()}
                </Modal>
            )}
            {isShopperFormOpen && (
                 <Modal title={editingShopper ? "Edit Shopper" : "Create New Shopper"} onClose={() => { setIsShopperFormOpen(false); setEditingShopper(null); }}>
                    <ShopperForm onSave={handleSaveShopper} onClose={() => { setIsShopperFormOpen(false); setEditingShopper(null); }} shopperToEdit={editingShopper} allDealerships={dealerships} />
                </Modal>
            )}
            {isCreateChoiceModalOpen && (
                <Modal title="Create New Item" onClose={() => setIsCreateChoiceModalOpen(false)} size="lg">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleCreateChoice('tickets')} className="p-4 border rounded-lg hover:bg-gray-100 flex flex-col items-center gap-2"><TicketIcon className="w-8 h-8 text-blue-6--- START OF FILE mockData.ts ---

import { Ticket, TicketType, Status, Priority, ProductArea, Platform, Project, ProjectStatus, TaskStatus, Dealership, DealershipStatus, TaskPriority, Task, FeatureAnnouncement, FeatureStatus, Meeting, Contact, ContactType, ContactGroup, DealershipGroup, KnowledgeArticle, Shopper, RecentActivity, IssueTicket, FeatureRequestTicket, Update } from './types.ts';

export const initialTickets: Ticket[] = [
  {
    id: '1',
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
    platform: Platform.Curator,
    title: 'Login button unresponsive on Safari',
    client: 'ABC Motors',
    pmrNumber: 'PMR-12345',
    pmrLink: 'https://example.com/pmr/12345',
    fpTicketNumber: 'FP-001',
    ticketThreadId: 'THREAD-ABC-123',
    lastUpdatedDate: new Date('2024-07-23T15:30:00Z').toISOString(),
    startDate: new Date('2024-07-21T09:00:00Z').toISOString(),
    status: Status.InProgress,
    priority: Priority.P1,
    submitterName: 'Alice Johnson',
    location: 'Login Page',
    problem: 'The main login button does not respond to clicks on Safari 15.2 and newer. No errors are thrown in the console.',
    duplicationSteps: '1. Open Safari 15.2+. 2. Navigate to the login page. 3. Enter credentials. 4. Click the "Log In" button. Nothing happens.',
    workaround: 'Users can press the Enter key after filling in the password field to log in successfully.',
    frequency: 'Occurs 100% of the time for affected users.',
    linkedTicketIds: ['5'],
    updates: [
      {
        id: 'update-1-1',
        author: 'Dev Team',
        date: new Date('2024-07-22T11:00:00Z').toISOString(),
        comment: 'Assigned to John Doe. Starting investigation.'
      },
      {
        id: 'update-1-2',
        author: 'John Doe',
        date: new Date('2024-07-23T15:30:00Z').toISOString(),
        comment: 'Identified the issue is related to event propagation in WebKit. Working on a fix.'
      }
    ],
    tasks: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
    shopperIds: ['shopper-1'],
  } as IssueTicket,
  {
    id: '2',
    type: TicketType.FeatureRequest,
    productArea: ProductArea.Fullpath,
    platform: Platform.UCP,
    title: 'Implement Dark Mode',
    client: 'Luxury Auto Group',
    pmrNumber: 'PMR-67890',
    fpTicketNumber: 'FP-002',
    ticketThreadId: 'THREAD-DEF-456',
    lastUpdatedDate: new Date('2024-07-18T09:00:00Z').toISOString(),
    startDate: new Date('2024-07-18T09:00:00Z').toISOString(),
    status: Status.InReview,
    priority: Priority.P5,
    submitterName: 'Bob Williams',
    location: 'Entire Application',
    improvement: 'Add a user-selectable dark mode theme to the application.',
    currentFunctionality: 'The application currently only has a light theme, which can cause eye strain in low-light environments.',
    suggestedSolution: 'Implement a theme switcher in the user settings that toggles CSS variables for colors across the entire UI.',
    benefits: 'Improved user experience, reduced eye strain, modern look and feel, and better accessibility for some users.',
    projectIds: ['proj-1'],
    updates: [
      {
        id: 'update-2-1',
        author: 'Product Team',
        date: new Date('2024-07-16T10:00:00Z').toISOString(),
        comment: 'Feature request has been received and is under review for the next quarter planning.'
      }
    ],
    tasks: [],
    linkedTicketIds: [],
    meetingIds: ['meet-1'],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
    isFavorite: true,
  } as FeatureRequestTicket,
  {
    id: '3',
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
    platform: Platform.FOCUS,
    title: 'User profile picture not updating',
    client: 'Community Cars',
    fpTicketNumber: 'FP-003',
    ticketThreadId: 'THREAD-GHI-789',
    lastUpdatedDate: new Date('2024-07-22T09:00:00Z').toISOString(),
    startDate: new Date('2024-07-22T09:00:00Z').toISOString(),
    status: Status.NotStarted,
    priority: Priority.P2,
    submitterName: 'Charlie Brown',
    location: 'User Profile Settings',
    problem: 'When a user uploads a new profile picture, the old one remains visible until they clear their browser cache.',
    duplicationSteps: '1. Go to profile settings. 2. Upload a new avatar. 3. Observe that the old avatar is still displayed.',
    workaround: 'Perform a hard refresh (Ctrl+Shift+R) or clear the browser cache.',
    frequency: 'Always.',
    updates: [],
    tasks: [],
    projectIds: [],
    linkedTicketIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  } as IssueTicket,
  {
    id: '4',
    type: TicketType.Issue,
    productArea: ProductArea.Fullpath,
    platform: Platform.Curator,
    title: 'Export to CSV functionality is broken on Firefox',
    client: 'Prestige Imports',
    pmrNumber: 'PMR-55555',
    fpTicketNumber: 'FP-004',
    ticketThreadId: 'THREAD-JKL-101',
    startDate: new Date('2024-07-10T09:00:00Z').toISOString(),
    lastUpdatedDate: new Date('2024-07-25T16:00:00Z').toISOString(),
    completionDate: new Date('2024-07-25T16:00:00Z').toISOString(),
    status: Status.Completed,
    priority: Priority.P2,
    submitterName: 'Diana Prince',
    location: 'Reports Page',
    problem: 'The "Export to CSV" button triggers a download, but the resulting file is corrupted and cannot be opened in any spreadsheet software. This issue is specific to Firefox.',
    duplicationSteps: '1. Log in using Firefox. 2. Go to the "Reports" section. 3. Generate any report. 4. Click "Export to CSV". 5. Try to open the downloaded file.',
    workaround: 'Use a different browser like Chrome or Edge.',
    frequency: 'Always on Firefox.',
    updates: [
        { id: 'update-4-1', author: 'QA Team', date: new Date('2024-07-11T09:00:00Z').toISOString(), comment: 'Confirmed and reproduced the issue. Root cause seems to be related to MIME type handling on Firefox.' },
        { id: 'update-4-2', author: 'Dev Team', date: new Date('2024-07-12T14:20:00Z').toISOString(), comment: 'Fix has been implemented and deployed to staging for verification.' },
        { id: 'update-4-3', author: 'QA Team', date: new Date('2024-07-13T11:00:00Z').toISOString(), comment: 'Verified the fix on staging. Issue is resolved. Marking as complete.' }
    ],
    completionNotes: 'The fix involved correcting the Blob constructor to explicitly set the MIME type to "text/csv;charset=utf-8;". This ensures Firefox correctly interprets the file format upon download. The change was deployed in patch v2.3.1.',
    tasks: [],
    projectIds: [],
    linkedTicketIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  } as IssueTicket,
  {
    id: '5',
    type: TicketType.Issue,
    productArea: ProductArea.Fullpath,
    platform: Platform.UCP,
    title: 'API endpoint timing out',
    client: 'Global Auto',
    startDate: new Date('2024-07-28T09:00:00Z').toISOString(),
    lastUpdatedDate: new Date('2024-07-28T10:00:00Z').toISOString(),
    status: Status.OnHold,
    onHoldReason: 'Waiting for dependency on external API to be resolved by their team. ETA: 2 weeks.',
    priority: Priority.P2,
    submitterName: 'Edward Snowden',
    location: 'Backend API service',
    problem: 'The /api/v2/inventory endpoint is frequently timing out under moderate load.',
    duplicationSteps: '1. Send 10 concurrent requests to the endpoint. 2. Observe 504 Gateway Timeout errors.',
    workaround: 'None.',
    frequency: 'During peak hours.',
    linkedTicketIds: ['1'],
    updates: [],
    tasks: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  } as IssueTicket
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Q3 Feature Rollout: Dark Mode & Performance Boost',
    description: 'Implement dark mode across the entire application and optimize key performance metrics before the end of Q3.',
    status: ProjectStatus.InProgress,
    creationDate: new Date('2024-07-10T10:00:00Z').toISOString(),
    ticketIds: ['2'],
    involvedPeople: ['Project Lead', 'John Doe', 'UX Team', 'Backend Team', 'Alice Johnson'],
    meetingIds: ['meet-1'],
    updates: [
      {
        id: 'update-proj-1-1',
        author: 'Project Lead',
        date: new Date('2024-07-12T09:00:00Z').toISOString(),
        comment: 'Project kickoff complete. Design phase has begun.'
      }
    ],
    tasks: [
      { id: 'sub-1-1', description: 'Design dark mode color palette', assignedUser: 'UX Team', status: TaskStatus.Done, priority: TaskPriority.P1, type: 'Design', creationDate: new Date('2024-07-11T10:00:00Z').toISOString(), dueDate: new Date('2024-07-15T17:00:00Z').toISOString() },
      { id: 'sub-1-2', description: 'Implement CSS variables for theming', assignedUser: 'John Doe', status: TaskStatus.InProgress, priority: TaskPriority.P1, type: 'Development', creationDate: new Date('2024-07-11T11:00:00Z').toISOString(), dueDate: new Date().toISOString(), linkedTaskIds: ['sub-1-4'], notifyOnCompletion: 'Project Lead' }, // Due today for "My Day"
      { id: 'sub-1-3', description: 'Analyze API response times', assignedUser: 'Backend Team', status: TaskStatus.ToDo, priority: TaskPriority.P3, type: 'QA', creationDate: new Date('2024-07-12T10:00:00Z').toISOString(), dueDate: new Date('2024-08-05T17:00:00Z').toISOString() },
      { id: 'sub-1-4', description: 'Refactor main dashboard component', assignedUser: 'Alice Johnson', status: TaskStatus.ToDo, priority: TaskPriority.P3, type: 'Development', creationDate: new Date('2024-07-12T11:00:00Z').toISOString(), dueDate: new Date('2024-08-10T17:00:00Z').toISOString() },
    ],
    linkedProjectIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  },
  {
    id: 'proj-2',
    name: '2024 Compliance Audit Prep',
    description: 'Prepare all necessary documentation and system reports for the upcoming annual compliance audit.',
    status: ProjectStatus.NotStarted,
    creationDate: new Date('2024-07-25T14:30:00Z').toISOString(),
    ticketIds: [],
    involvedPeople: ['Security Team', 'DevOps Team'],
    meetingIds: ['meet-2'],
    updates: [],
    tasks: [
       { id: 'sub-2-1', description: 'Gather all user access logs', assignedUser: 'Security Team', status: TaskStatus.ToDo, priority: TaskPriority.P1, type: 'Documentation', creationDate: new Date('2024-07-25T15:00:00Z').toISOString() },
       { id: 'sub-2-2', description: 'Verify data encryption at rest', assignedUser: 'DevOps', status: TaskStatus.ToDo, priority: TaskPriority.P1, type: 'QA', creationDate: new Date('2024-07-25T16:00:00Z').toISOString(), dueDate: new Date('2024-08-20T17:00:00Z').toISOString() },
    ],
    linkedProjectIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  },
    {
    id: 'proj-3',
    name: 'Mobile App Launch Campaign',
    description: 'Coordinate marketing efforts for the new mobile application launch in September.',
    status: ProjectStatus.Completed,
    creationDate: new Date('2024-05-01T09:00:00Z').toISOString(),
    ticketIds: [],
    involvedPeople: ['Marketing Team', 'PR Team'],
    updates: [],
    tasks: [
       { id: 'sub-3-1', description: 'Finalize App Store screenshots', assignedUser: 'Marketing', status: TaskStatus.Done, priority: TaskPriority.P3, type: 'Design', creationDate: new Date('2024-05-02T10:00:00Z').toISOString() },
       { id: 'sub-3-2', description: 'Prepare press release', assignedUser: 'PR Team', status: TaskStatus.Done, priority: TaskPriority.P3, type: 'Documentation', creationDate: new Date('2024-05-02T11:00:00Z').toISOString() },
       { id: 'sub-3-3', description: 'Schedule social media posts', assignedUser: 'Marketing', status: TaskStatus.Done, priority: TaskPriority.P4, type: 'Meeting', creationDate: new Date('2024-05-03T10:00:00Z').toISOString() },
    ],
    meetingIds: [],
    linkedProjectIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  }
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    description: 'Update the company-wide design system documentation',
    assignedUser: 'Jane Doe',
    status: TaskStatus.InProgress,
    priority: TaskPriority.P2,
    type: 'Documentation',
    creationDate: new Date('2024-07-20T10:00:00Z').toISOString(),
    dueDate: new Date('2024-08-15T17:00:00Z').toISOString(),
    notifyOnCompletion: 'design-team@example.com',
    linkedTaskIds: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    dealershipIds: [],
    featureIds: [],
    shopperIds: ['shopper-2'],
  },
  {
    id: 'task-2',
    description: 'Plan the team offsite for Q4',
    assignedUser: 'John Doe',
    status: TaskStatus.ToDo,
    priority: TaskPriority.P4,
    type: 'Planning',
    creationDate: new Date('2024-07-21T10:00:00Z').toISOString(),
    linkedTaskIds: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    dealershipIds: [],
    featureIds: [],
  }
];

export const initialDealerships: Dealership[] = [
  {
    id: 'dealership-1',
    name: 'Prestige Motors',
    accountNumber: 'CIF-1001',
    status: DealershipStatus.Live,
    hasManagedSolution: true,
    orderNumber: 'ORD-2024-001',
    orderReceivedDate: new Date('2024-01-15T00:00:00Z').toISOString(),
    goLiveDate: new Date('2024-02-01T00:00:00Z').toISOString(),
    enterprise: 'Luxury Auto Group',
    storeNumber: 'S-01',
    branchNumber: 'B-01',
    eraSystemId: 'ERA-PM-01',
    ppSysId: 'PPSYS-PM-01',
    buId: 'BU-PM-01',
    address: '123 Luxury Lane, Beverly Hills, CA 90210',
    assignedSpecialist: 'John Smith',
    sales: 'Sarah Conner',
    pocName: 'Mike Miller',
    pocEmail: 'mike.miller@prestigemotors.com',
    pocPhone: '555-123-4567',
    websiteLinks: [
      { url: 'https://www.prestigemotors.com', clientId: 'PM-WEB-01' },
      { url: 'https://inventory.prestigemotors.com', clientId: 'PM-INV-01' }
    ],
    updates: [
      {
        id: 'update-deal-1-1',
        author: 'John Smith',
        date: new Date('2024-02-15T10:00:00Z').toISOString(),
        comment: 'Initial setup call completed. Client is excited to get started.'
      },
      {
        id: 'update-deal-1-2',
        author: 'Mike Miller (Client)',
        date: new Date('2024-03-01T14:30:00Z').toISOString(),
        comment: 'Training for sales team went well. A few questions about the reporting dashboard.'
      }
    ],
    groupIds: ['d-group-1'],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
    shopperIds: ['shopper-1'],
  },
  {
    id: 'dealership-2',
    name: 'City Cars',
    accountNumber: 'CIF-1002',
    status: DealershipStatus.Onboarding,
    hasManagedSolution: true,
    orderNumber: 'ORD-2024-002',
    orderReceivedDate: new Date('2024-07-01T00:00:00Z').toISOString(),
    goLiveDate: new Date('2024-08-01T00:00:00Z').toISOString(),
    enterprise: 'Urban Motors Inc.',
    storeNumber: 'S-05',
    branchNumber: 'B-10',
    address: '456 Main Street, Anytown, USA 12345',
    assignedSpecialist: 'Jane Doe',
    sales: 'Bill Paxton',
    pocName: 'Anna Williams',
    pocEmail: 'anna.w@citycars.com',
    pocPhone: '555-987-6543',
    websiteLinks: [{ url: 'https://www.citycars.com', clientId: 'CC-MAIN-34' }],
    updates: [],
    groupIds: ['d-group-2'],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
    shopperIds: ['shopper-2'],
  },
  {
    id: 'dealership-3',
    name: 'Reliable Rides',
    accountNumber: 'CIF-1003',
    status: DealershipStatus.Cancelled,
    hasManagedSolution: false,
    orderNumber: 'ORD-2023-050',
    orderReceivedDate: new Date('2023-10-01T00:00:00Z').toISOString(),
    goLiveDate: new Date('2023-11-01T00:00:00Z').toISOString(),
    termDate: new Date('2024-06-30T00:00:00Z').toISOString(),
    enterprise: 'Value Vehicles',
    address: '789 Budget Ave, Thriftyville, TX 75001',
    assignedSpecialist: 'Peter Jones',
    sales: 'Rick Deckard',
    pocName: 'Rachael',
    pocEmail: 'rachael@tyrellcorp.com',
    pocPhone: '555-555-5555',
    updates: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
  },
  {
    id: 'dealership-4',
    name: 'Future Fleet',
    accountNumber: 'CIF-1004',
    status: DealershipStatus.Pilot,
    orderNumber: 'ORD-2024-004',
    orderReceivedDate: new Date('2024-07-15T00:00:00Z').toISOString(),
    goLiveDate: new Date('2024-09-01T00:00:00Z').toISOString(),
    enterprise: 'NextGen Auto',
    address: '1 Innovation Drive, Tech City, USA 54321',
    assignedSpecialist: 'Susan Storm',
    sales: 'Reed Richards',
    pocName: 'Ben Grimm',
    pocEmail: 'b.grimm@ff.com',
    pocPhone: '555-444-4444',
    updates: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
  },
  {
    id: 'dealership-5',
    name: 'Focus Forward',
    accountNumber: 'CIF-1005',
    status: DealershipStatus.PendingFocus,
    orderNumber: 'ORD-2024-005',
    orderReceivedDate: new Date('2024-07-20T00:00:00Z').toISOString(),
    enterprise: 'Urban Motors Inc.',
    address: '2 Tech Way, Anytown, USA 12345',
    assignedSpecialist: 'Jane Doe',
    updates: [],
    groupIds: ['d-group-2'],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
  },
  {
    id: 'dealership-6',
    name: 'DMT Dynamics',
    accountNumber: 'CIF-1006',
    status: DealershipStatus.PendingDmt,
    orderNumber: 'ORD-2024-006',
    orderReceivedDate: new Date('2024-07-22T00:00:00Z').toISOString(),
    enterprise: 'Value Vehicles',
    address: '3 Integration Blvd, Thriftyville, TX 75001',
    assignedSpecialist: 'Peter Jones',
    updates: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
  },
  {
    id: 'dealership-7',
    name: 'Setup Solutions',
    accountNumber: 'CIF-1007',
    status: DealershipStatus.PendingSetup,
    orderNumber: 'ORD-2024-007',
    orderReceivedDate: new Date('2024-07-25T00:00:00Z').toISOString(),
    enterprise: 'NextGen Auto',
    address: '4 Config Ct, Tech City, USA 54321',
    assignedSpecialist: 'Susan Storm',
    updates: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
  },
  {
    id: 'dealership-8',
    name: 'Future Horizons Automotive',
    accountNumber: 'CIF-1008',
    status: DealershipStatus.Prospect,
    enterprise: 'Visionary Motors',
    sales: 'Sarah Conner',
    pocName: 'John Anderton',
    pocEmail: 'j.anderton@futurehorizons.com',
    updates: [],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    linkedDealershipIds: [],
    featureIds: [],
  },
];

export const initialFeatures: FeatureAnnouncement[] = [
  {
    id: 'feat-1',
    title: 'Dark Mode',
    location: 'Entire Application',
    description: 'A new dark mode theme has been introduced to reduce eye strain in low-light environments. You can enable it from your user settings.',
    launchDate: new Date('2024-08-15T00:00:00Z').toISOString(),
    version: 'v3.0.0',
    platform: Platform.UCP,
    status: FeatureStatus.Launched,
    categories: ['UI/UX', 'Accessibility'],
    successMetrics: '50% user adoption within 3 months. Reduction in user-reported eye strain complaints.',
    targetAudience: 'All users, especially those working in low-light conditions or with visual sensitivities.',
    supportUrl: 'https://example.com/support/dark-mode',
    updates: [
        {
            id: 'update-feat-1-1',
            author: 'UX Team',
            date: new Date('2024-07-20T10:00:00Z').toISOString(),
            comment: 'Final design patterns approved.'
        }
    ],
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  },
  {
    id: 'feat-2',
    title: 'Project Task Drag & Drop',
    location: 'Project Detail View',
    description: 'You can now reorder tasks within a project by simply dragging and dropping them. This makes organizing your project workflow more intuitive.',
    launchDate: new Date('2024-08-01T00:00:00Z').toISOString(),
    version: 'v2.9.0',
    platform: Platform.Curator,
    status: FeatureStatus.Launched,
    categories: ['UI/UX', 'Project Management'],
    successMetrics: 'Increase in task reordering actions by 20%. Positive feedback in user surveys.',
    targetAudience: 'Project managers and team members.',
    supportUrl: 'https://example.com/support/drag-drop',
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  },
  {
    id: 'feat-3',
    title: 'Advanced Reporting Filters',
    location: 'Reports Page',
    description: 'We are adding more granular filtering options to the reporting suite, allowing you to create more specific and insightful reports. This will include filtering by custom date ranges and additional ticket properties.',
    launchDate: new Date('2024-09-01T00:00:00Z').toISOString(),
    platform: Platform.Curator,
    status: FeatureStatus.InDevelopment,
    categories: ['Reporting', 'Data Analysis'],
    successMetrics: 'Users generate 30% more custom reports. Decrease in requests for custom report generation from support.',
    targetAudience: 'Managers, Analysts, and Account Executives.',
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  },
  {
    id: 'feat-4',
    title: 'API Rate Limiting',
    location: 'Backend API',
    description: 'Implement rate limiting on public API endpoints to ensure stability and prevent abuse.',
    launchDate: new Date('2024-10-01T00:00:00Z').toISOString(),
    platform: Platform.Curator,
    status: FeatureStatus.Upcoming,
    categories: ['API', 'Performance', 'Security'],
    successMetrics: 'No API downtime caused by traffic spikes. Fair usage across all API clients.',
    targetAudience: 'Third-party developers and integrators.',
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  },
  {
    id: 'feat-5',
    title: 'Real-time Collaboration on Meeting Notes',
    location: 'Meeting Notes View',
    description: 'Allow multiple users to edit meeting notes simultaneously, similar to Google Docs.',
    launchDate: new Date('2025-01-15T00:00:00Z').toISOString(),
    platform: Platform.Curator,
    status: FeatureStatus.InDiscovery,
    categories: ['Collaboration', 'UI/UX'],
    successMetrics: 'Increased usage of meeting notes feature. Positive qualitative feedback.',
    targetAudience: 'All teams participating in meetings.',
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  },
   {
    id: 'feat-6',
    title: 'SSO Integration (SAML)',
    location: 'Login & Authentication',
    description: 'Provide support for Single Sign-On (SSO) using the SAML 2.0 protocol to allow enterprise customers to manage their own user access.',
    launchDate: new Date('2024-11-01T00:00:00Z').toISOString(),
    platform: Platform.UCP,
    status: FeatureStatus.Backlog,
    categories: ['Security', 'Authentication'],
    successMetrics: 'Onboard 5 major enterprise clients using SSO within 6 months.',
    targetAudience: 'Enterprise-level customers with internal identity providers.',
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  },
  {
    id: 'feat-7',
    title: 'Mobile Responsiveness Overhaul',
    location: 'Entire Application',
    description: 'Conduct a full audit and update of all pages to ensure they are fully responsive and usable on mobile devices.',
    launchDate: new Date('2024-09-20T00:00:00Z').toISOString(),
    platform: Platform.Curator,
    status: FeatureStatus.Testing,
    categories: ['UI/UX', 'Mobile'],
    successMetrics: 'Achieve a Lighthouse accessibility and performance score of 90+ on key pages. Increase in mobile session duration by 15%.',
    targetAudience: 'All users, especially those accessing the app on tablets and phones.',
    ticketIds: [],
    projectIds: [],
    meetingIds: [],
    taskIds: [],
    dealershipIds: [],
    linkedFeatureIds: [],
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    name: 'Project Kickoff: Dark Mode',
    meetingDate: new Date('2024-07-11T10:00:00Z').toISOString(),
    attendees: ['Project Lead', 'John Doe', 'UX Team'],
    notes: '<h3>Agenda</h3><ul><li>Finalize design specs</li><li>Outline development tasks</li><li>Set timeline</li></ul><p>Discussion points were positive. Team is aligned.</p>',
    projectIds: ['proj-1'],
    ticketIds: ['2'],
    linkedMeetingIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  },
  {
    id: 'meet-2',
    name: 'Compliance Audit Weekly Sync',
    meetingDate: new Date('2024-07-28T14:00:00Z').toISOString(),
    attendees: ['Security Team', 'DevOps', 'Legal Advisor'],
    notes: '<p>Reviewed progress on log gathering. DevOps to provide an update on encryption verification by EOW.</p>',
    projectIds: ['proj-2'],
    ticketIds: [],
    linkedMeetingIds: [],
    taskIds: [],
    dealershipIds: [],
    featureIds: [],
  }
];

export const initialContacts: Contact[] = [
  { id: 'contact-1', name: 'John Doe', email: 'john.doe@internal.com', role: 'Lead Developer', type: ContactType.Internal, isFavorite: true, groupIds: ['group-1'] },
  { id: 'contact-2', name: 'Alice Johnson', email: 'alice.j@internal.com', role: 'Frontend Developer', type: ContactType.Internal, groupIds: ['group-1'] },
  { id: 'contact-3', name: 'Bob Williams', email: 'bob.w@internal.com', role: 'Project Manager', type: ContactType.Internal },
  { id: 'contact-4', name: 'Mike Miller', email: 'mike.miller@prestigemotors.com', role: 'Client POC', type: ContactType.External, phone: '555-123-4567', groupIds: ['group-2'] },
  { id: 'contact-5', name: 'Anna Williams', email: 'anna.w@citycars.com', role: 'General Manager', type: ContactType.External, phone: '555-987-6543', groupIds: ['group-2'] },
];

export const initialContactGroups: ContactGroup[] = [
  { id: 'group-1', name: 'Development Team', description: 'Core engineers for the Curator project.', contactIds: ['contact-1', 'contact-2'] },
  { id: 'group-2', name: 'Key Client Contacts', description: 'Main points of contact for our top clients.', contactIds: ['contact-4', 'contact-5'] },
];

export const initialDealershipGroups: DealershipGroup[] = [
  { id: 'd-group-1', name: 'Luxury Auto Group', description: 'High-end dealerships.', dealershipIds: ['dealership-1'] },
  { id: 'd-group-2', name: 'Urban Motors Inc.', description: 'Dealerships located in metropolitan areas.', dealershipIds: ['dealership-2', 'dealership-5'] },
];

export const initialKnowledgeArticles: KnowledgeArticle[] = [
    {
        id: 'kb-1',
        title: 'Onboarding Checklist for New Clients',
        content: '<h3>Phase 1: Pre-Kickoff</h3><ul><li>Send welcome email</li><li>Schedule kickoff call</li><li>Grant system access</li></ul><h3>Phase 2: Post-Kickoff</h3><ol><li>Complete user training</li><li>Set up initial reports</li><li>Schedule first check-in</li></ol>',
        tags: ['onboarding', 'checklist', 'client-success'],
        category: 'Process',
        createdDate: new Date('2024-07-20T10:00:00Z').toISOString(),
        lastModifiedDate: new Date('2024-07-22T11:00:00Z').toISOString(),
        isFavorite: true,
    },
    {
        id: 'kb-2',
        title: 'Common Safari CSS Bugs',
        content: '<p>Safari can be tricky. Here are a few common issues:</p><p><strong>1. Flexbox alignment:</strong> Sometimes requires explicit `align-items` settings.</p><p><strong>2. `vh` units in modals:</strong> Can cause sizing issues due to the browser UI. Use JavaScript to calculate height instead.</p>',
        tags: ['css', 'safari', 'frontend', 'bugs'],
        category: 'Technical',
        createdDate: new Date('2024-07-15T14:30:00Z').toISOString(),
        lastModifiedDate: new Date('2024-07-15T14:30:00Z').toISOString(),
    }
];

export const initialShoppers: Shopper[] = [
  {
    id: 'shopper-1',
    customerName: 'Jane Smith',
    curatorId: 'CUR-98765',
    curatorLink: 'https://example.com/curator/98765',
    email: 'jane.smith@example.com',
    phone: '555-111-2222',
    cdpId: 'CDP-JSMITH',
    dmsId: 'DMS-456',
    uniqueIssue: 'User is unable to see vehicle pricing on VDPs. Console shows a 403 error on the pricing API endpoint.',
    recentActivity: [
      {
        id: 'act-1-1',
        date: '2024-07-28',
        time: '10:30 AM',
        activity: 'Visited VDP for 2024 Ford F-150',
        action: 'Clicked on "Get E-Price", no price displayed',
      },
      {
        id: 'act-1-2',
        date: '2024-07-28',
        time: '10:32 AM',
        activity: 'Navigated to inventory search',
        action: 'Performed search for "Ford"',
      }
    ],
    dealershipIds: ['dealership-1'],
    ticketIds: ['1'],
    isFavorite: true,
  },
  {
    id: 'shopper-2',
    customerName: 'John Appleseed',
    curatorId: 'CUR-12345',
    email: 'john.a@example.com',
    uniqueIssue: 'Trade-in value form is not accepting VIN.',
    dealershipIds: ['dealership-2'],
    ticketIds: [],
    taskIds: ['task-1'],
    isFavorite: false,
  }
];