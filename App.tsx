import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, View, Dealership, DealershipStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState, TaskStatus, FeatureStatus, TaskPriority, FeatureAnnouncementFilterState, SavedTicketView, Contact, ContactGroup, ContactFilterState, DealershipGroup, WidgetConfig, KnowledgeArticle, EnrichedTask, Shopper, ShopperFilterState, WebsiteLink, Release } from './types.ts';
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
import { initialTickets, initialDealerships, initialTasks, initialFeatures, initialMeetings, initialContacts, initialContactGroups, initialDealershipGroups, initialKnowledgeArticles, initialShoppers, initialReleases } from './mockData.ts';
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

type EntityType = 'ticket' | 'task' | 'meeting' | 'dealership' | 'feature' | 'contact' | 'knowledge' | 'shopper' | 'release';

// Hardcoded current user for dashboard widgets
const CURRENT_USER = 'John Doe';

// FIX: Added default export to the function definition.
export default function App() {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureAnnouncement | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedShopper, setSelectedShopper] = useState<Shopper | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [editingDealershipGroup, setEditingDealershipGroup] = useState<DealershipGroup | null>(null);


  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isDealershipFormOpen, setIsDealershipFormOpen] = useState(false);
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [isDealershipGroupFormOpen, setIsDealershipGroupFormOpen] = useState(false);
  const [isShopperFormOpen, setIsShopperFormOpen] = useState(false);
  const [editingShopper, setEditingShopper] = useState<Shopper | null>(null);
  const [isReleaseFormOpen, setIsReleaseFormOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [ticketFilters, setTicketFilters] = useState<FilterState>({ searchTerm: '', status: 'all', priority: 'all', type: 'all', productArea: 'all' });
  const [dealershipFilters, setDealershipFilters] = useState<DealershipFilterState>({ searchTerm: '', status: 'all' });
  const [meetingFilters, setMeetingFilters] = useState<MeetingFilterState>({ searchTerm: '' });
  const [featureFilters, setFeatureFilters] = useState<FeatureAnnouncementFilterState>({ searchTerm: '', platform: 'all', category: 'all' });
  const [shopperFilters, setShopperFilters] = useState<ShopperFilterState>({ searchTerm: '' });

  const handleSaveTicket = (ticketData: Omit<IssueTicket, 'id'> | Omit<FeatureRequestTicket, 'id'>) => {
    const newTicket = {
      ...ticketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      updates: [],
      tasks: [],
    };
    setTickets(prev => [...prev, newTicket]);
    setIsTicketFormOpen(false);
  };
  
  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...updatedTicket, lastUpdatedDate: new Date().toISOString() } : t));
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
      setSelectedTicket({ ...updatedTicket, lastUpdatedDate: new Date().toISOString() });
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, onHoldReason: onHoldReason || t.onHoldReason, lastUpdatedDate: new Date().toISOString() } : t));
  };
  
  const handleToggleFavorite = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, isFavorite: !t.isFavorite } : t));
  };
  
  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    setSelectedTicket(null);
  };
  
  const handleAddUpdate = (ticketId: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { id: crypto.randomUUID(), comment, author, date: new Date(date).toISOString() };
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, updates: [...(t.updates || []), newUpdate], lastUpdatedDate: new Date().toISOString() };
      }
      return t;
    });
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, updates: [...(prev.updates || []), newUpdate], lastUpdatedDate: new Date().toISOString() } : null);
    }
  };

  const handleEditUpdate = (ticketId: string, updatedUpdate: Update) => {
    const updatedTickets = tickets.map(t => {
        if (t.id === ticketId) {
            const newUpdates = (t.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u);
            return { ...t, updates: newUpdates, lastUpdatedDate: new Date().toISOString() };
        }
        return t;
    });
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
        const newUpdates = (selectedTicket.updates || []).map(u => u.id === updatedUpdate.id ? updatedUpdate : u);
        setSelectedTicket(prev => prev ? { ...prev, updates: newUpdates, lastUpdatedDate: new Date().toISOString() } : null);
    }
  };

  const handleDeleteUpdate = (ticketId: string, updateId: string) => {
    const updatedTickets = tickets.map(t => {
        if (t.id === ticketId) {
            const newUpdates = (t.updates || []).filter(u => u.id !== updateId);
            return { ...t, updates: newUpdates, lastUpdatedDate: new Date().toISOString() };
        }
        return t;
    });
    setTickets(updatedTickets);
     if (selectedTicket?.id === ticketId) {
        const newUpdates = (selectedTicket.updates || []).filter(u => u.id !== updateId);
        setSelectedTicket(prev => prev ? { ...prev, updates: newUpdates, lastUpdatedDate: new Date().toISOString() } : null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
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
        onViewChange={(view) => { setCurrentView(view); setIsSidebarOpen(false); }}
        onExportClick={() => setIsExportModalOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 text-gray-500 hover:text-gray-800 rounded-full focus:outline-none focus:ring-2 ring-gray-400">
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          {/* Header content like search, user profile can go here */}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {currentView === 'dashboard' && <DashboardView onSwitchView={() => {}} dueToday={[]} myFavorites={[]} performanceInsights={{openTickets: 0, completedLast30Days: 0, avgCompletionDays: 0}} dealershipInsights={{totalDealerships: 0, liveAccounts: 0, pendingAccounts: 0}} taskInsights={{totalTasks: 0, toDoTasks: 0, inProgressTasks: 0}} upcomingDeadlines={[]} recentlyUpdatedItems={[]} />}
          {currentView === 'tickets' && <div>Tickets View</div>}
          {currentView === 'dealerships' && <div>Dealerships View</div>}
          {currentView === 'tasks' && <div>Tasks View</div>}
          {currentView === 'features' && <div>Features View</div>}
          {currentView === 'meetings' && <div>Meetings View</div>}
          {currentView === 'contacts' && <div>Contacts View</div>}
          {currentView === 'knowledge' && <div>Knowledge Base View</div>}
          {currentView === 'shoppers' && <div>Shoppers View</div>}
          {currentView === 'releases' && <div>Releases View</div>}
        </div>
      </main>
    </div>
  );
}
