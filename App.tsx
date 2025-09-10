
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus, FeatureStatus, TaskPriority, FeatureAnnouncementFilterState, SavedTicketView, Contact, ContactGroup, ContactFilterState, DealershipGroup, HistoryEntry, WidgetConfig, KnowledgeArticle, EnrichedTask, Shopper, ShopperFilterState } from './types.ts';
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
import ShopperList from './components/ShopperList.tsx';
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
  
  const handleShopperSubmit = (newShopperData: Omit<Shopper, 'id'>) => {
      const newShopper: Shopper = {
          id: crypto.randomUUID(),
          ...newShopperData,
      };
      setShoppers(prev => [...prev, newShopper]);
      showToast('Shopper created successfully!', 'success');
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
                    ? { ...t, tasks: (t.tasks || []).map(subTask => subTask.id === id ? updateFn(subTask) : subTask) }
                    : t
                ));
            } else {
                setTasks(prev => prev.map(t => t.id === id ? updateFn(t) : t));
            }
        } else {
            const setter = getSetterForType(type);
            if(setter) {
              setter((prev: any[]) => prev.map(e => e.id === id ? updateFn(e) : e));
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
              return ['id', 'title', 'type', 'productArea', 'platform', 'pmrNumber', 'pmrLink', 'fpTicketNumber', 'ticketThreadId', 'submissionDate', 'startDate', 'estimatedCompletionDate', 'completionDate', 'status', 'priority', 'submitterName', 'client', 'location', 'updates', 'completionNotes', 'onHoldReason', 'isFavorite', 'projectIds', 'linkedTicketIds', 'meetingIds', 'taskIds', 'dealershipIds', 'featureIds', 'problem', 'duplicationSteps', 'workaround', 'frequency', 'improvement', 'currentFunctionality', 'suggestedSolution', 'benefits'];
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
                dateFields.push('submissionDate', 'startDate', 'estimatedCompletionDate', 'completionDate');
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
                enumFields['status'] = DEALERSHIP_STATUS_OPTIONS;
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
                        formattedRow[key] = (key === 'tasks') ? [] : undefined;
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
                                dataMap.set(newId, { ...item, id: newId });
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
                                newData.push({ ...item, id: newId });
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
            case 'shoppers': return 'Create New Shopper';
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
            case 'shoppers': return <ShopperForm onSubmit={data => { handleShopperSubmit(data); setIsFormOpen(false); }} onUpdate={handleUpdateShopper} onClose={() => setIsFormOpen(false)} allDealerships={dealerships} />;
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

        const ticketDeadlines = tickets
            .filter(t => t.estimatedCompletionDate && new Date(t.estimatedCompletionDate) <= sevenDaysFromNow && t.status !== Status.Completed)
            .map(t => ({...t, dueDate: t.estimatedCompletionDate, type: 'ticket' as const}));
        
        const taskDeadlines = allTasks
            .filter(t => t.dueDate && new Date(t.dueDate) <= sevenDaysFromNow && t.status !== TaskStatus.Done)
            .map(t => ({...t, type: 'task' as const}));

        return [...ticketDeadlines, ...taskDeadlines].sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    }, [tickets, allTasks]);

    const recentlyUpdatedItems = useMemo(() => {
        const allItemsWithUpdates = [
            ...tickets.map(t => ({ ...t, itemType: 'ticket' as const })), 
            ...projects.map(p => ({ ...p, itemType: 'project' as const })), 
            ...dealerships.map(d => ({ ...d, itemType: 'dealership' as const }))
        ];

        return allItemsWithUpdates
            .filter(item => item.updates && item.updates.length > 0)
            .map(item => ({
                ...item,
                lastUpdate: item.updates!.reduce((latest, current) => new Date(current.date) > new Date(latest.date) ? current : latest)
            }))
            .sort((a, b) => new Date(b.lastUpdate.date).getTime() - new Date(a.lastUpdate.date).getTime())
            .slice(0, 10);
    }, [tickets, projects, dealerships]);

    // Bulk Actions Handlers
    const handleToggleTicketSelection = (ticketId: string) => {
        setSelectedTicketIds(prev =>
            prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
        );
    };

    const handleBulkUpdateTicketStatus = (status: Status) => {
        setTickets(prev => prev.map(t => selectedTicketIds.includes(t.id) ? { ...t, status } : t));
        showToast(`${selectedTicketIds.length} ticket(s) updated to ${status}.`, 'success');
        setSelectedTicketIds([]);
    };

    const handleBulkUpdateTicketPriority = (priority: Priority) => {
        setTickets(prev => prev.map(t => selectedTicketIds.includes(t.id) ? { ...t, priority } : t));
        showToast(`${selectedTicketIds.length} ticket(s) updated to ${priority}.`, 'success');
        setSelectedTicketIds([]);
    };

    const handleBulkDeleteTickets = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedTicketIds.length} ticket(s)?`)) {
            setTickets(prev => prev.filter(t => !selectedTicketIds.includes(t.id)));
            showToast(`${selectedTicketIds.length} ticket(s) deleted.`, 'success');
            setSelectedTicketIds([]);
        }
    };

    // Saved Views Handlers
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
        const viewToApply = savedTicketViews.find(v => v.id === viewId);
        if (viewToApply) {
            setTicketFilters(viewToApply.filters);
            showToast(`Applied view: ${viewToApply.name}`, 'success');
        }
    };

    const handleDeleteTicketView = (viewId: string) => {
        setSavedTicketViews(prev => prev.filter(v => v.id !== viewId));
        showToast('Saved view deleted.', 'success');
    };
    
    const allDataForLinking = {
        allTickets: tickets,
        allProjects: projects,
        allTasks: allTasks,
        allMeetings: meetings,
        allDealerships: dealerships,
        allFeatures: features,
        allShoppers: shoppers,
    };
    
    // Knowledge Base Handlers
    const handleSaveKnowledgeArticle = (articleData: Omit<KnowledgeArticle, 'id'> | KnowledgeArticle) => {
        if ('id' in articleData) {
            setKnowledgeArticles(prev => prev.map(a => a.id === articleData.id ? articleData : a));
            showToast('Article updated!', 'success');
        } else {
            const newArticle = { ...articleData, id: crypto.randomUUID() };
            setKnowledgeArticles(prev => [...prev, newArticle]);
            showToast('Article created!', 'success');
        }
    };

    const handleDeleteKnowledgeArticle = (articleId: string) => {
        setKnowledgeArticles(prev => prev.filter(a => a.id !== articleId));
        showToast('Article deleted!', 'success');
    };

    const handleToggleFavoriteArticle = (articleId: string) => {
        setKnowledgeArticles(prev => prev.map(a => a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a));
    };
    
    // Data for "My Day" View, now passed to Dashboard
    const myDayData = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        
        const dueTodayTickets = tickets.filter(t => t.estimatedCompletionDate?.startsWith(today) && t.status !== Status.Completed);
        const dueTodayTasks = allTasks.filter(t => t.dueDate?.startsWith(today) && t.status !== TaskStatus.Done);
        const dueToday: (Ticket | EnrichedTask)[] = [...dueTodayTickets, ...dueTodayTasks];
        
        const favoriteTickets = tickets.filter(t => t.isFavorite);
        const favoriteArticles = knowledgeArticles.filter(a => a.isFavorite);
        const myFavorites: (Ticket | KnowledgeArticle)[] = [...favoriteTickets, ...favoriteArticles];
        
        return { dueToday, myFavorites };
    }, [tickets, allTasks, knowledgeArticles]);


    return (
    <div className="flex h-screen bg-gray-100">
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      <LeftSidebar
        ticketFilters={ticketFilters}
        setTicketFilters={setTicketFilters}
        dealershipFilters={dealershipFilters}
        setDealershipFilters={setDealershipFilters}
        shopperFilters={shopperFilters}
        setShopperFilters={setShopperFilters}
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
          <h1 className="text-xl font-semibold text-gray-800 capitalize">{currentView.replace('_', ' ')}</h1>
          {getNewButtonText() && (
            <button onClick={handleHeaderNewClick} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                <PlusIcon className="w-5 h-5" />
                <span>{getNewButtonText()}</span>
            </button>
          )}
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {currentView === 'dashboard' && (
              <DashboardView
                  performanceInsights={performanceInsights}
                  projectInsights={projectInsights}
                  dealershipInsights={dealershipInsights}
                  taskInsights={taskInsights}
                  upcomingDeadlines={upcomingDeadlines}
                  recentlyUpdatedItems={recentlyUpdatedItems}
                  dueToday={myDayData.dueToday}
                  myFavorites={myDayData.myFavorites}
                  onSwitchView={handleSwitchToDetailView}
              />
          )}
           {currentView === 'knowledge' && (
              <KnowledgeBaseView 
                articles={knowledgeArticles}
                onSave={handleSaveKnowledgeArticle}
                onDelete={handleDeleteKnowledgeArticle}
                onToggleFavorite={handleToggleFavoriteArticle}
              />
          )}
          {currentView === 'tickets' && (
            <>
              {selectedTicketIds.length > 0 && (
                <BulkActionBar
                  selectedCount={selectedTicketIds.length}
                  onClearSelection={() => setSelectedTicketIds([])}
                  onUpdateStatus={handleBulkUpdateTicketStatus}
                  onUpdatePriority={handleBulkUpdateTicketPriority}
                  onDelete={handleBulkDeleteTickets}
                />
              )}
              <SavedViewsBar
                savedViews={savedTicketViews}
                onSaveView={handleSaveTicketView}
                onApplyView={handleApplyTicketView}
                onDeleteView={handleDeleteTicketView}
              />
              <PerformanceInsights {...performanceInsights} />
              <TicketList 
                tickets={filteredTickets} 
                onRowClick={setSelectedTicket} 
                onStatusChange={handleStatusChange}
                projects={projects}
                onToggleFavorite={handleToggleFavoriteTicket}
                selectedTicketIds={selectedTicketIds}
                onToggleSelection={handleToggleTicketSelection}
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
           {currentView === 'shoppers' && (
            <ShopperList 
                shoppers={filteredShoppers} 
                onShopperClick={setSelectedShopper} 
                allDealerships={dealerships} 
                showToast={showToast} 
            />
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
          {currentView === 'features' && <FeatureList features={filteredFeatures} onDelete={handleDeleteFeature} onFeatureClick={setSelectedFeature} filters={featureFilters} setFilters={setFeatureFilters} allCategories={[...new Set(features.flatMap(f => f.categories || []))]}/>}
          {currentView === 'meetings' && <MeetingList meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} meetingFilters={meetingFilters} setMeetingFilters={setMeetingFilters} />}
          {currentView === 'contacts' && (
            <ContactsView 
                contacts={contacts}
                contactGroups={contactGroups}
                onUpdateContact={(c) => setContacts(prev => prev.map(p => p.id === c.id ? c : p))}
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
                // FIX: Corrected typo from onSaveGroup to handleSaveGroup
                onSaveGroup={handleSaveGroup}
            />
          )}
        </div>
      </main>
      
      {isFormOpen && currentView !== 'contacts' && (
          <Modal title={getFormTitle()} onClose={() => setIsFormOpen(false)}>
              {renderForm()}
          </Modal>
      )}

      {isCreateChoiceModalOpen && (
          <Modal title="Create New Item" onClose={() => setIsCreateChoiceModalOpen(false)} size="lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                  <button onClick={() => handleCreateChoice('tickets')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <TicketIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Ticket</span>
                  </button>
                  <button onClick={() => handleCreateChoice('projects')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <ClipboardListIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Project</span>
                  </button>
                  <button onClick={() => handleCreateChoice('meetings')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <DocumentTextIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Meeting Note</span>
                  </button>
                  <button onClick={() => handleCreateChoice('dealerships')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <BuildingStorefrontIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Dealership</span>
                  </button>
                   <button onClick={() => handleCreateChoice('contacts')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <UsersIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Contact</span>
                  </button>
                  <button onClick={() => handleCreateChoice('shoppers')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <PersonIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Shopper</span>
                  </button>
                  <button onClick={() => handleCreateChoice('features')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <SparklesIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Feature</span>
                  </button>
              </div>
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
                allShoppers={shoppers}
                onLink={(toType, toId) => handleLinkItem('task', editingTask.id, toType as EntityType, toId)}
                onUnlink={(toType, toId) => handleUnlinkItem('task', editingTask.id, toType as EntityType, toId)}
                onSwitchView={handleSwitchFromTaskModal}
                showToast={showToast}
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
                        <p><strong>Append:</strong> Adds new records only. Records from the file with an ID that already exists in the system will be skipped.</p>
                        <p className="mt-1"><strong>Update &amp; Replace:</strong> Updates records with a matching ID. If no matching ID is found, a new record is added. This does not delete data.</p>
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

      {isDealershipGroupFormOpen && (
        <Modal title={editingDealershipGroup ? 'Edit Dealership Group' : 'Create New Group'} onClose={() => { setIsDealershipGroupFormOpen(false); setEditingDealershipGroup(null); }}>
            <DealershipGroupForm onSave={handleSaveDealershipGroup} onClose={() => { setIsDealershipGroupFormOpen(false); setEditingDealershipGroup(null); }} groupToEdit={editingDealershipGroup} />
        </Modal>
      )}


      <SideView 
        title={selectedTicket?.title || selectedProject?.name || selectedDealership?.name || selectedMeeting?.name || selectedFeature?.title || selectedShopper?.customerName || ''}
        isOpen={!!(selectedTicket || selectedProject || selectedDealership || selectedMeeting || selectedFeature || selectedShopper)}
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
            {...allDataForLinking}
            onLink={(toType, toId) => handleLinkItem('ticket', selectedTicket.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('ticket', selectedTicket.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
            showToast={showToast}
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
            {...allDataForLinking}
            onLink={(toType, toId) => handleLinkItem('project', selectedProject.id, toType, toId)} 
            onUnlink={(toType, toId) => handleUnlinkItem('project', selectedProject.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView} 
            showToast={showToast}
            />}
        {selectedDealership && <DealershipDetailView 
            dealership={selectedDealership} 
            onUpdate={handleUpdateDealership} 
            onDelete={handleDeleteDealership} 
            onExport={() => handleExportDealership(selectedDealership)} 
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(updatedUpdate) => handleEditUpdate(selectedDealership.id, updatedUpdate)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedDealership.id, updateId)}
            {...allDataForLinking}
            allGroups={dealershipGroups}
            onLink={(toType, toId) => handleLinkItem('dealership', selectedDealership.id, toType, toId)} 
            onUnlink={(toType, toId) => handleUnlinkItem('dealership', selectedDealership.id, toType, toId)} onSwitchView={handleSwitchToDetailView} />}
        {selectedMeeting && <MeetingDetailView 
            meeting={selectedMeeting} 
            onUpdate={handleUpdateMeeting} 
            onDelete={handleDeleteMeeting} 
            onExport={() => handleExportMeeting(selectedMeeting)} 
            {...allDataForLinking}
            onLink={(toType, toId) => handleLinkItem('meeting', selectedMeeting.id, toType, toId)} 
            onUnlink={(toType, toId) => handleUnlinkItem('meeting', selectedMeeting.id, toType, toId)} onSwitchView={handleSwitchToDetailView} />}
        {selectedFeature && <FeatureDetailView 
            feature={selectedFeature} 
            onUpdate={handleUpdateFeature} 
            onDelete={handleDeleteFeature} 
            onExport={() => handleExportFeature(selectedFeature)}
            {...allDataForLinking}
            onLink={(toType, toId) => handleLinkItem('feature', selectedFeature.id, toType, toId)} 
            onUnlink={(toType, toId) => handleUnlinkItem('feature', selectedFeature.id, toType, toId)} onSwitchView={handleSwitchToDetailView} />}
        {selectedShopper && <ShopperDetailView
            shopper={selectedShopper}
            onUpdate={handleUpdateShopper}
            onDelete={handleDeleteShopper}
            showToast={showToast}
            {...allDataForLinking}
            onLink={(toType, toId) => handleLinkItem('shopper', selectedShopper.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('shopper', selectedShopper.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
        />}
      </SideView>
    </div>
  );
}

export default App;
