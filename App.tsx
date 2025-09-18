import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus, FeatureStatus, TaskPriority, FeatureAnnouncementFilterState, SavedTicketView, Contact, ContactGroup, ContactFilterState, DealershipGroup, WidgetConfig, KnowledgeArticle, EnrichedTask, Shopper, ShopperFilterState, WebsiteLink, Release } from './types.ts';
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
import { initialTickets, initialProjects, initialDealerships, initialTasks, initialFeatures, initialMeetings, initialContacts, initialContactGroups, initialDealershipGroups, initialKnowledgeArticles, initialShoppers, initialReleases } from './mockData.ts';
import ProjectList from './components/ProjectList.tsx';
import ProjectDetailView from './components/ProjectDetailView.tsx';
import ProjectForm from './components/ProjectForm.tsx';
import DealershipList from './components/DealershipList.tsx';
import DealershipDetailView from './components/DealershipDetailView.tsx';
import DealershipInsights from './components/DealershipInsights.tsx';
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
import KnowledgeBaseView from './components/KnowledgeBaseView.tsx';
import ShoppersView from './components/ShopperList.tsx';
import ShopperForm from './components/ShopperForm.tsx';
import ShopperDetailView from './components/ShopperDetailView.tsx';
import { PersonIcon } from './components/icons/PersonIcon.tsx';
import ReleaseList from './components/ReleaseList.tsx';
import ReleaseDetailView from './components/ReleaseDetailView.tsx';
import ReleaseForm from './components/ReleaseForm.tsx';
import { RocketLaunchIcon } from './components/icons/RocketLaunchIcon.tsx';
import * as XLSX from 'xlsx';
import { formatDisplayName } from './utils.ts';

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
      {formatDisplayName(value)}
    </span>
  </div>
);

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'contact' | 'knowledge' | 'shopper' | 'release';

// Hardcoded current user for dashboard widgets
const CURRENT_USER = 'John Doe';

// FIX: Added default export to the function definition.
export default function App() {
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
  const [releases, setReleases] = useLocalStorage<Release[]>('releases', initialReleases);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureAnnouncement | null>(null);
  const [selectedShopper, setSelectedShopper] = useState<Shopper | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
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

  const [isReleaseFormOpen, setIsReleaseFormOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);


  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateChoiceModalOpen, setIsCreateChoiceModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  const dataMap = useMemo(() => ({
    tickets, projects, dealerships, tasks, features, meetings, shoppers, releases
  }), [tickets, projects, dealerships, tasks, features, meetings, shoppers, releases]);


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
  
  useEffect(() => {
    if (selectedRelease) {
      const freshRelease = releases.find(r => r.id === selectedRelease.id);
      setSelectedRelease(freshRelease || null);
    }
  }, [releases]);

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
  
  const handleTicketSubmit = (newTicketData: Omit<IssueTicket, 'id' | 'submissionDate' | 'lastUpdatedDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate' | 'lastUpdatedDate'>) => {
    const submissionDate = new Date().toISOString();
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      submissionDate: submissionDate,
      lastUpdatedDate: submissionDate,
      updates: [],
      tasks: [],
    } as Ticket;
    
    setTickets(prev => [...prev, newTicket]);
    
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
  };
  
  const handleFeatureSubmit = (newFeatureData: Omit<FeatureAnnouncement, 'id'>) => {
      const newFeature: FeatureAnnouncement = {
          id: crypto.randomUUID(),
          ...newFeatureData,
          updates: [],
      };
      setFeatures(prev => [...prev, newFeature]);
  };
  
  const handleMeetingSubmit = (newMeetingData: Omit<Meeting, 'id'>) => {
      const newMeeting: Meeting = {
          id: crypto.randomUUID(),
          ...newMeetingData,
      };
      setMeetings(prev => [...prev, newMeeting]);
  };

  const handleSaveRelease = (releaseData: Omit<Release, 'id'> | Release) => {
    if ('id' in releaseData) {
        setReleases(prev => prev.map(r => r.id === releaseData.id ? releaseData : r));
        if (selectedRelease?.id === releaseData.id) {
            setSelectedRelease(releaseData);
        }
    } else {
        const newRelease = { ...releaseData, id: crypto.randomUUID() };
        setReleases(prev => [...prev, newRelease]);
    }
    setIsReleaseFormOpen(false);
    setEditingRelease(null);
  };
  
  const handleSaveShopper = (shopperData: Omit<Shopper, 'id'> | Shopper) => {
    if ('id' in shopperData) {
        const updatedShopper = shopperData;
        setShoppers(prev => prev.map(s => s.id === updatedShopper.id ? updatedShopper : s));
        if (selectedShopper?.id === updatedShopper.id) {
            setSelectedShopper(updatedShopper);
        }
    } else {
        const newShopper: Shopper = { ...shopperData, id: crypto.randomUUID(), recentActivity: [], ticketIds: [], taskIds: [] };
        setShoppers(prev => [...prev, newShopper]);
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
    } else {
        updatedContact = { ...contactData, id: crypto.randomUUID() };
        setContacts(prev => [...prev, updatedContact]);
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
    }
  };
  
  const handleSaveGroup = (groupData: Omit<ContactGroup, 'id' | 'contactIds'> | ContactGroup) => {
      if ('id' in groupData) {
          setContactGroups(prev => prev.map(g => g.id === groupData.id ? groupData : g));
      } else {
          const newGroup = { ...groupData, id: crypto.randomUUID(), contactIds: [] };
          setContactGroups(prev => [...prev, newGroup]);
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
  };

  const handleSaveDealership = (dealershipData: Omit<Dealership, 'id'> | Dealership) => {
    let updatedDealership: Dealership;
    const oldDealership = 'id' in dealershipData ? dealerships.find(d => d.id === dealershipData.id) : undefined;

    if ('id' in dealershipData) {
        updatedDealership = dealershipData;
        setDealerships(prev => prev.map(d => d.id === dealershipData.id ? dealershipData : d));
    } else {
        updatedDealership = { ...dealershipData, id: crypto.randomUUID() };
        setDealerships(prev => [...prev, updatedDealership]);
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
  };

  const handleDeleteDealership = (dealershipId: string) => {
    if (window.confirm('Are you sure you want to delete this dealership account?')) {
      setDealerships(prev => prev.filter(d => d.id !== dealershipId));
      setDealershipGroups(prev => prev.map(g => ({
          ...g,
          dealershipIds: g.dealershipIds.filter(id => id !== dealershipId)
      })));
      setSelectedDealership(null);
    }
  };
  
  const handleSaveDealershipGroup = (groupData: Omit<DealershipGroup, 'id' | 'dealershipIds'> | DealershipGroup) => {
      if ('id' in groupData) {
          setDealershipGroups(prev => prev.map(g => g.id === groupData.id ? groupData : g));
      } else {
          const newGroup = { ...groupData, id: crypto.randomUUID(), dealershipIds: [] };
          setDealershipGroups(prev => [...prev, newGroup]);
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
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    if (selectedTicket?.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
    }
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
  };
  
  const handleUpdateFeature = (updatedFeature: FeatureAnnouncement) => {
      setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
      if (selectedFeature?.id === updatedFeature.id) {
          setSelectedFeature(updatedFeature);
      }
  };
  
  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
      setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
      if (selectedMeeting?.id === updatedMeeting.id) {
        setSelectedMeeting(updatedMeeting);
      }
  };

  const handleUpdateShopper = (updatedShopper: Shopper) => {
      setShoppers(prev => prev.map(s => s.id === updatedShopper.id ? updatedShopper : s));
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
      setSelectedProject(null);
  };
  
  const handleDeleteFeature = (featureId: string) => {
    if (window.confirm('Are you sure you want to delete this feature announcement?')) {
        setFeatures(prev => prev.filter(f => f.id !== featureId));
        setSelectedFeature(null);
    }
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
      setProjects(prevProjects => prevProjects.map(p => ({
          ...p,
          meetingIds: (p.meetingIds || []).filter(id => id !== meetingId)
      })));

      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      setSelectedMeeting(null);
  };

  const handleDeleteRelease = (releaseId: string) => {
    if (window.confirm('Are you sure you want to delete this release?')) {
      setReleases(prev => prev.filter(r => r.id !== releaseId));
      setFeatures(prev => prev.map(f => ({ ...f, releaseIds: (f.releaseIds || []).filter(id => id !== releaseId) })));
      setTickets(prev => prev.map(t => ({ ...t, releaseIds: (t.releaseIds || []).filter(id => id !== releaseId) })));
      setSelectedRelease(null);
    }
  };

  const handleDeleteShopper = (shopperId: string) => {
    if (window.confirm('Are you sure you want to delete this shopper?')) {
        setShoppers(prev => prev.filter(s => s.id !== shopperId));
        // Remove shopper from linked tickets and dealerships
        setTickets(prev => prev.map(t => ({ ...t, shopperIds: (t.shopperIds || []).filter(id => id !== shopperId) })));
        setDealerships(prev => prev.map(d => ({ ...d, shopperIds: (d.shopperIds || []).filter(id => id !== shopperId) })));
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
        appendField('Has Managed Solution', dealership.hasManagedSolution ? 'Yes' : 'No');
        appendField('Enterprise (Group)', dealership.enterprise);
        appendField('Address', dealership.address);

        appendSection('Key Contacts');
        appendField('Assigned Specialist', dealership.assignedSpecialist);
        appendField('Sales', dealership.sales);
        appendField('POC Name', dealership.pocName);
        appendField('POC Email', dealership.pocEmail);
        appendField('POC Phone', dealership.pocPhone);
        
        if (dealership.websiteLinks && dealership.websiteLinks.length > 0) {
            appendSection('Website Links');
            dealership.websiteLinks.forEach(link => {
                content += `- URL: ${link.url}\n`;
                if (link.clientId) {
                    content += `  Client ID: ${link.clientId}\n`;
                }
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
        appendField('Group IDs', (dealership.groupIds || []).join(', '));
        appendField('Ticket IDs', (dealership.ticketIds || []).join(', '));
        appendField('Project IDs', (dealership.projectIds || []).join(', '));
        appendField('Meeting IDs', (dealership.meetingIds || []).join(', '));
        appendField('Task IDs', (dealership.taskIds || []).join(', '));
        appendField('Linked Dealership IDs', (dealership.linkedDealershipIds || []).join(', '));
        appendField('Feature IDs', (dealership.featureIds || []).join(', '));
        appendField('Shopper IDs', (dealership.shopperIds || []).join(', '));

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
          case 'release': return setReleases;
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
        const pendingStatuses = [DealershipStatus.PendingDmt, DealershipStatus.PendingFocus, DealershipStatus.PendingSetup];
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

    const getFormTitle = () => {
        switch (currentView) {
            case 'tickets': return 'Create New Ticket';
            case 'projects': return 'Create New Project';
            case 'dealerships': return 'Create New Account';
            case 'features': return 'Add Feature Announcement';
            case 'meetings': return 'Add New Meeting Note';
            case 'contacts': return 'Create New Contact';
            case 'releases': return 'Create New Release';
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
            case 'releases': return <ReleaseForm onSave={handleSaveRelease} onClose={() => setIsReleaseFormOpen(false)} />;
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
            } else if (view === 'releases') {
                setEditingRelease(null);
                setIsReleaseFormOpen(true);
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
        } else if (currentView === 'releases') {
            setEditingRelease(null);
            setIsReleaseFormOpen(true);
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

    const handleExportDealerships = (dealershipsToExport: Dealership[]) => {
        // 1. Define headers in the desired order.
        const headers = [
            'status', 'accountNumber', 'name', 'enterprise', 'storeNumber', 'branchNumber', 'address',
            'wasFullpathCustomer', 'hasManagedSolution', 'orderNumber', 'orderReceivedDate', 'goLiveDate', 'termDate',
            'eraSystemId', 'ppSysId', 'buId', 'assignedSpecialist', 'sales', 'pocName', 'pocEmail', 'pocPhone',
            'clientID1', 'websiteLink1', 'clientID2', 'websiteLink2', 'updates'
        ];
    
        // 2. Process the data.
        const dataForSheet = dealershipsToExport.map(d => {
            const row: Record<string, any> = {};
    
            // Map main fields
            row.status = d.status;
            row.accountNumber = d.accountNumber;
            row.name = d.name;
            row.enterprise = d.enterprise;
            row.storeNumber = d.storeNumber;
            row.branchNumber = d.branchNumber;
            row.address = d.address;
            row.wasFullpathCustomer = d.wasFullpathCustomer;
            row.hasManagedSolution = d.hasManagedSolution;
            row.orderNumber = d.orderNumber;
            row.orderReceivedDate = d.orderReceivedDate ? d.orderReceivedDate.split('T')[0] : '';
            row.goLiveDate = d.goLiveDate ? d.goLiveDate.split('T')[0] : '';
            row.termDate = d.termDate ? d.termDate.split('T')[0] : '';
            row.eraSystemId = d.eraSystemId;
            row.ppSysId = d.ppSysId;
            row.buId = d.buId;
            row.assignedSpecialist = d.assignedSpecialist;
            row.sales = d.sales;
            row.pocName = d.pocName;
            row.pocEmail = d.pocEmail;
            row.pocPhone = d.pocPhone;
    
            // Flatten website links
            (d.websiteLinks || []).slice(0, 2).forEach((link, index) => {
                row[`clientID${index + 1}`] = link.clientId;
                row[`websiteLink${index + 1}`] = link.url;
            });
    
            // Flatten updates
            row.updates = (d.updates || [])
                .map(u => `${new Date(u.date).toISOString().split('T')[0]} by ${u.author}: ${u.comment.replace(/<br\s*\/?>/gi, '\n')}`)
                .join('\n\n');
    
            return row;
        });
    
        // 3. Create worksheet and workbook.
        const ws = XLSX.utils.json_to_sheet(dataForSheet, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dealerships');
    
        // 4. Trigger download.
        const today = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `dealership_export_${today}.xlsx`);
    
    };

    const handleExportTickets = (ticketsToExport: Ticket[]) => {
        const headers = [
            'type','title','productArea','platform','location','pmrNumber','fpTicketNumber','ticketThreadId',
            'startDate','priority','submitterName','client','status','onHoldReason','completionDate',
            'completionNotes','problem','duplicationSteps','workaround','frequency','updates',
            'linkedTicketNames','lastUpdatedDate'
        ];
    
        const ticketMap = new Map(tickets.map(t => [t.id, t]));
    
        const dataForSheet = ticketsToExport.map(t => {
            const row: Record<string, any> = {};
            
            row.type = t.type;
            row.title = t.title;
            row.productArea = t.productArea;
            row.platform = t.platform;
            row.location = t.location;
            row.pmrNumber = t.pmrNumber;
            row.fpTicketNumber = t.fpTicketNumber;
            row.ticketThreadId = t.ticketThreadId;
            row.startDate = t.startDate ? t.startDate.split('T')[0] : '';
            row.priority = t.priority;
            row.submitterName = t.submitterName;
            row.client = t.client;
            row.status = t.status;
            row.onHoldReason = t.onHoldReason;
            row.completionDate = t.completionDate ? t.completionDate.split('T')[0] : '';
            row.completionNotes = t.completionNotes;
    
            if (t.type === TicketType.Issue) {
                const issueTicket = t as IssueTicket;
                row.problem = issueTicket.problem;
                row.duplicationSteps = issueTicket.duplicationSteps;
                row.workaround = issueTicket.workaround;
                row.frequency = issueTicket.frequency;
            }
    
            row.updates = (t.updates || [])
                .map(u => `${new Date(u.date).toISOString().split('T')[0]} by ${u.author}: ${u.comment.replace(/<br\s*\/?>/gi, '\n')}`)
                .join('\n\n');
            
            row.linkedTicketNames = (t.linkedTicketIds || [])
                .map(id => ticketMap.get(id)?.title || `ID:${id}`)
                .join('; ');
    
            row.lastUpdatedDate = t.lastUpdatedDate ? t.lastUpdatedDate.split('T')[0] : '';
    
            return row;
        });
    
        const ws = XLSX.utils.json_to_sheet(dataForSheet, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
    
        const today = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `tickets_export_${today}.xlsx`);
    
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
            case 'releases': return 'New Release';
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
        setSelectedRelease(null);
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
                case 'release':
                    const release = releases.find(r => r.id === id);
                    if (release) setSelectedRelease(release);
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
      { title: 'Releases', data: releases },
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
        setSelectedTicketIds([]);
    };

    const handleBulkUpdateTicketPriority = (priority: Priority) => {
        setTickets(prev => prev.map(t => selectedTicketIds.includes(t.id) ? { ...t, priority } : t));
        setSelectedTicketIds([]);
    };

    const handleBulkDeleteTickets = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedTicketIds.length} ticket(s)?`)) {
            setTickets(prev => prev.filter(t => !selectedTicketIds.includes(t.id)));
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
    };

    const handleApplyTicketView = (viewId: string) => {
        const viewToApply = savedTicketViews.find(v => v.id === viewId);
        if (viewToApply) {
            setTicketFilters(viewToApply.filters);
        }
    };

    const handleDeleteTicketView = (viewId: string) => {
        setSavedTicketViews(prev => prev.filter(v => v.id !== viewId));
    };
    
    const allDataForLinking = {
        allTickets: tickets,
        allProjects: projects,
        allTasks: allTasks,
        allMeetings: meetings,
        allDealerships: dealerships,
        allFeatures: features,
        allShoppers: shoppers,
        allReleases: releases,
    };
    
    // Knowledge Base Handlers
    const handleSaveKnowledgeArticle = (articleData: Omit<KnowledgeArticle, 'id'> | KnowledgeArticle) => {
        if ('id' in articleData) {
            setKnowledgeArticles(prev => prev.map(a => a.id === articleData.id ? articleData : a));
        } else {
            const newArticle = { ...articleData, id: crypto.randomUUID() };
            setKnowledgeArticles(prev => [...prev, newArticle]);
        }
    };

    const handleDeleteKnowledgeArticle = (articleId: string) => {
        setKnowledgeArticles(prev => prev.filter(a => a.id !== articleId));
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
                onExport={() => handleExportTickets(filteredTickets)}
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
                  onNewGroupClick={handleNewDealershipGroupClick}
                  onEditGroupClick={handleEditDealershipGroupClick}
                  onExport={() => handleExportDealerships(filteredDealerships)}
                />
              </>
          )}
           {currentView === 'shoppers' && (
            <ShoppersView 
                shoppers={filteredShoppers} 
                onShopperClick={setSelectedShopper} 
                allDealerships={dealerships} 
                onUpdateShopper={handleUpdateShopper}
                onDeleteShopper={handleDeleteShopper}
                onEditShopperClick={(shopper) => { setEditingShopper(shopper); setIsShopperFormOpen(true); }}
                shopperFilters={shopperFilters}
                setShopperFilters={setShopperFilters}
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
                isContactFormOpen={isContactFormOpen}
                setIsContactFormOpen={setIsContactFormOpen}
                editingContact={editingContact}
                setEditingContact={setEditingContact}
                onSaveContact={handleSaveContact}
                isGroupFormOpen={isGroupFormOpen}
                setIsGroupFormOpen={setIsGroupFormOpen}
                editingGroup={editingGroup}
                setEditingGroup={setEditingGroup}
// FIX: Changed 'onSaveGroup' to 'handleSaveGroup' to pass the correct function.
                onSaveGroup={handleSaveGroup}
            />
          )}
          {currentView === 'releases' && <ReleaseList releases={releases.sort((a,b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())} onReleaseClick={setSelectedRelease} />}
        </div>
      </main>
      
      {isFormOpen && (
          <Modal title={getFormTitle()} onClose={() => setIsFormOpen(false)}>
              {renderForm()}
          </Modal>
      )}

       {isReleaseFormOpen && (
        <Modal title={editingRelease ? 'Edit Release' : 'Create New Release'} onClose={() => { setIsReleaseFormOpen(false); setEditingRelease(null); }}>
          <ReleaseForm onSave={handleSaveRelease} onClose={() => { setIsReleaseFormOpen(false); setEditingRelease(null); }} releaseToEdit={editingRelease} />
        </Modal>
      )}

      {isShopperFormOpen && (
        <Modal title={editingShopper ? 'Edit Shopper' : 'Create New Shopper'} onClose={() => { setIsShopperFormOpen(false); setEditingShopper(null); }}>
            <ShopperForm onSave={handleSaveShopper} onClose={() => { setIsShopperFormOpen(false); setEditingShopper(null); }} shopperToEdit={editingShopper} allDealerships={dealerships} />
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
                      <span className="font-semibold text-gray-800">Account</span>
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
                  <button onClick={() => handleCreateChoice('releases')} className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <RocketLaunchIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">Release</span>
                  </button>
              </div>
          </Modal>
      )}

       {isDealershipGroupFormOpen && (
          <Modal title={editingDealershipGroup ? 'Edit Group' : 'Create New Group'} onClose={() => { setIsDealershipGroupFormOpen(false); setEditingDealershipGroup(null); }}>
              <DealershipGroupForm onSave={handleSaveDealershipGroup} onClose={() => { setIsDealershipGroupFormOpen(false); setEditingDealershipGroup(null); }} groupToEdit={editingDealershipGroup} />
          </Modal>
       )}

      {selectedTicket && (
        <SideView title={selectedTicket.title} onClose={closeAllSideViews} isOpen={!!selectedTicket}>
          <TicketDetailView
              ticket={selectedTicket}
              onUpdate={handleUpdateTicket}
              onAddUpdate={(comment, author, date) => handleAddUpdate(selectedTicket.id, comment, author, date)}
              onEditUpdate={(update) => handleEditUpdate(selectedTicket.id, update)}
              onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedTicket.id, updateId)}
              onExport={() => handleExportTicket(selectedTicket)}
              onEmail={() => handleEmailTicket(selectedTicket)}
              onDelete={() => handleDeleteTicket(selectedTicket.id)}
              onLink={(toType, toId) => handleLinkItem('ticket', selectedTicket.id, toType, toId)}
              onUnlink={(toType, toId) => handleUnlinkItem('ticket', selectedTicket.id, toType, toId)}
              onSwitchView={handleSwitchToDetailView}
              {...allDataForLinking}
          />
        </SideView>
      )}
      
       {selectedProject && (
        <SideView title={selectedProject.name} onClose={closeAllSideViews} isOpen={!!selectedProject}>
          <ProjectDetailView
            project={selectedProject}
            onUpdate={handleUpdateProject}
            onDelete={handleDeleteProject}
            onExport={() => handleExportProject(selectedProject)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedProject.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedProject.id, updateId)}
            onLink={(toType, toId) => handleLinkItem('project', selectedProject.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('project', selectedProject.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
            {...allDataForLinking}
          />
        </SideView>
      )}
      
       {selectedDealership && (
        <SideView title={selectedDealership.name} onClose={closeAllSideViews} isOpen={!!selectedDealership}>
          <DealershipDetailView
            dealership={selectedDealership}
            onUpdate={handleUpdateDealership}
            onDelete={handleDeleteDealership}
            onExport={() => handleExportDealership(selectedDealership)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedDealership.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedDealership.id, updateId)}
            onLink={(toType, toId) => handleLinkItem('dealership', selectedDealership.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('dealership', selectedDealership.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
            allGroups={dealershipGroups}
            {...allDataForLinking}
          />
        </SideView>
      )}

      {selectedMeeting && (
        <SideView title={selectedMeeting.name} onClose={closeAllSideViews} isOpen={!!selectedMeeting}>
          <MeetingDetailView 
            meeting={selectedMeeting}
            onUpdate={handleUpdateMeeting}
            onDelete={handleDeleteMeeting}
            onExport={() => handleExportMeeting(selectedMeeting)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedMeeting.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedMeeting.id, updateId)}
            onLink={(toType, toId) => handleLinkItem('meeting', selectedMeeting.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('meeting', selectedMeeting.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
            {...allDataForLinking}
          />
        </SideView>
      )}
      
      {selectedFeature && (
        <SideView title={selectedFeature.title} onClose={closeAllSideViews} isOpen={!!selectedFeature}>
          <FeatureDetailView 
            feature={selectedFeature}
            onUpdate={handleUpdateFeature}
            onDelete={handleDeleteFeature}
            onExport={() => handleExportFeature(selectedFeature)}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedFeature.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedFeature.id, updateId)}
            onLink={(toType, toId) => handleLinkItem('feature', selectedFeature.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('feature', selectedFeature.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
            {...allDataForLinking}
          />
        </SideView>
      )}

       {selectedShopper && (
        <SideView title={selectedShopper.customerName} onClose={closeAllSideViews} isOpen={!!selectedShopper}>
          <ShopperDetailView 
            shopper={selectedShopper}
            onUpdate={handleUpdateShopper}
            onDelete={handleDeleteShopper}
            onAddUpdate={(id, comment, author, date) => handleAddUpdate(id, comment, author, date)}
            onEditUpdate={(update) => handleEditUpdate(selectedShopper.id, update)}
            onDeleteUpdate={(updateId) => handleDeleteUpdate(selectedShopper.id, updateId)}
            onLink={(toType, toId) => handleLinkItem('shopper', selectedShopper.id, toType, toId)}
            onUnlink={(toType, toId) => handleUnlinkItem('shopper', selectedShopper.id, toType, toId)}
            onSwitchView={handleSwitchToDetailView}
            {...allDataForLinking}
          />
        </SideView>
      )}

      {selectedRelease && (
          <SideView title={selectedRelease.name} onClose={closeAllSideViews} isOpen={!!selectedRelease}>
              <ReleaseDetailView
                  release={selectedRelease}
                  onUpdate={handleSaveRelease}
                  onDelete={handleDeleteRelease}
                  onLink={(toType, toId) => handleLinkItem('release', selectedRelease.id, toType, toId)}
                  onUnlink={(toType, toId) => handleUnlinkItem('release', selectedRelease.id, toType, toId)}
                  onSwitchView={handleSwitchToDetailView}
                  {...allDataForLinking}
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
                onLink={(toType, toId) => handleLinkItem('task', editingTask.id, toType, toId)}
                onUnlink={(toType, toId) => handleUnlinkItem('task', editingTask.id, toType, toId)}
                onSwitchView={handleSwitchFromTaskModal}
                {...allDataForLinking}
            />
        </Modal>
      )}
      
      {isExportModalOpen && (
        <ExportModal 
            onClose={() => setIsExportModalOpen(false)} 
            dataSources={dataSourcesForExport} 
        />
      )}
    </div>
  );
}