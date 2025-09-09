

export enum TicketType {
  Issue = 'Issue',
  FeatureRequest = 'Feature Request',
}

export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  InReview = 'In Review',
  DevReview = 'DEV Review',
  PmdReview = 'PMD Review',
  Testing = 'Testing',
  Completed = 'Completed',
}

export enum Priority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
  P5 = 'P5',
  P8 = 'P8',
}

export enum ProductArea {
  Reynolds = 'Reynolds',
  Fullpath = 'Fullpath',
}

export enum Platform {
  Curator = 'Curator',
  UCP = 'UCP',
  FOCUS = 'FOCUS',
}

// New types for Feature Announcements
export enum FeatureStatus {
  Backlog = 'Backlog',
  InDiscovery = 'In Discovery',
  InDevelopment = 'In Development',
  Testing = 'Testing',
  Upcoming = 'Upcoming',
  Launched = 'Launched',
}

export interface FeatureAnnouncement {
  id: string;
  title: string;
  location: string;
  description: string;
  launchDate: string;
  version?: string;
  platform: Platform;
  status: FeatureStatus;
  categories?: string[];
  successMetrics?: string;
  targetAudience?: string;
  supportUrl?: string;
  history?: HistoryEntry[];
  // Linking fields
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  linkedFeatureIds?: string[];
}

export interface HistoryEntry {
  id: string;
  author: string;
  timestamp: string;
  type: 'comment' | 'creation' | 'edit';
  field?: string; // e.g., 'status', 'priority'
  oldValue?: string;
  newValue?: string;
  comment?: string;
}

export interface Update {
  id: string;
  author: string;
  date: string;
  comment: string;
}

interface BaseTicket {
  id: string;
  title: string;
  type: TicketType;
  productArea: ProductArea;
  platform: Platform;
  pmrNumber?: string;
  pmrLink?: string;
  fpTicketNumber?: string;
  ticketThreadId?: string;
  submissionDate: string;
  startDate?: string;
  estimatedCompletionDate?: string;
  completionDate?: string;
  status: Status;
  priority: Priority;
  submitterName: string;
  client?: string;
  location: string;
  updates?: Update[];
  history?: HistoryEntry[];
  completionNotes?: string;
  onHoldReason?: string;
  isFavorite?: boolean;
  tasks?: Task[];
  
  // Linking fields
  projectIds?: string[];
  linkedTicketIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

export interface IssueTicket extends BaseTicket {
  type: TicketType.Issue;
  problem: string;
  duplicationSteps: string;
  workaround: string;
  frequency: string;
}

export interface FeatureRequestTicket extends BaseTicket {
  type: TicketType.FeatureRequest;
  improvement: string;
  currentFunctionality: string;
  suggestedSolution: string;
  benefits: string;
}

export type Ticket = IssueTicket | FeatureRequestTicket;

export interface FilterState {
  searchTerm: string;
  status: string; // 'all' or a Status enum value
  priority: string; // 'all' or a Priority enum value
  type: string; // 'all' or a TicketType enum value
  productArea: string; // 'all' or a ProductArea enum value
}

export interface DealershipFilterState {
  searchTerm: string;
  status: string; // 'all' or a DealershipStatus enum value
}

export interface MeetingFilterState {
  searchTerm: string;
}

export interface FeatureAnnouncementFilterState {
  searchTerm: string;
  platform: string;
  category: string;
}

export interface ContactFilterState {
  searchTerm: string;
  type: string; // 'all' or a ContactType enum value
}

export interface KnowledgeBaseFilterState {
  searchTerm: string;
  category: string;
  tag: string;
}


// New types for Projects
export enum ProjectStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum TaskPriority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export interface Task {
  id: string;
  description: string;
  assignedUser: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: string;
  creationDate: string;
  dueDate?: string;
  notifyOnCompletion?: string;
  history?: HistoryEntry[];
  // Hierarchical fields
  subTasks?: Task[];
  dependsOn?: string[]; // Array of task IDs this task is waiting for
  // Linking fields
  linkedTaskIds?: string[];
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

export interface EnrichedTask extends Task {
  projectName?: string;
  projectId: string | null;
  ticketId: string | null;
  ticketTitle?: string;
  parentTaskId?: string | null;
  level?: number;
}


export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tasks: Task[];
  creationDate: string;
  updates?: Update[];
  history?: HistoryEntry[];
  involvedPeople?: string[];
  // Linking fields
  ticketIds: string[];
  meetingIds?: string[];
  linkedProjectIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

// New types for Meeting Notes
export interface Meeting {
  id: string;
  name: string;
  meetingDate: string;
  attendees: string[];
  notes: string; // Rich text content
  history?: HistoryEntry[];
  // Linking fields
  projectIds: string[];
  ticketIds: string[];
  linkedMeetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

// Type for main application view
export type View = 'dashboard' | 'tickets' | 'projects' | 'dealerships' | 'tasks' | 'features' | 'meetings' | 'contacts' | 'knowledge';

// New types for Dealerships
export enum DealershipStatus {
  PendingFocus = 'Pending FOCUS',
  PendingDmt = 'Pending DMT',
  PendingSetup = 'Pending Setup',
  Onboarding = 'Onboarding',
  Live = 'Live',
  Pilot = 'PILOT',
  Cancelled = 'Cancelled',
}

export interface Dealership {
  id: string;
  name: string;
  accountNumber: string; // CIF
  status: DealershipStatus;
  orderNumber?: string;
  orderReceivedDate?: string; // Ship Date
  goLiveDate?: string;
  termDate?: string;
  enterprise?: string; // Group Name
  storeNumber?: string;
  branchNumber?: string;
  eraSystemId?: string;
  ppSysId?: string;
  buId?: string;
  address?: string;
  assignedSpecialist?: string;
  sales?: string;
  pocName?: string;
  pocEmail?: string;
  pocPhone?: string;
  updates?: Update[];
  history?: HistoryEntry[];
  groupIds?: string[];
  // Linking fields
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  linkedDealershipIds?: string[];
  featureIds?: string[];
}

export interface DealershipGroup {
  id: string;
  name: string;
  description?: string;
  dealershipIds: string[];
}

export interface SavedTicketView {
  id: string;
  name: string;
  filters: FilterState;
}

// New types for Contacts
export enum ContactType {
  Internal = 'Internal',
  External = 'External',
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  type: ContactType;
  isFavorite?: boolean;
  groupIds?: string[];
  history?: HistoryEntry[];
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contactIds: string[];
}

// New for Knowledge Base
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string; // Rich text
  tags: string[];
  category: string;
  createdDate: string;
  lastModifiedDate: string;
  isFavorite?: boolean;
  history?: HistoryEntry[];

  // Linking fields
  linkedArticleIds?: string[];
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

// Types for Dashboard Customization
export type WidgetType = 'performance' | 'deadlines' | 'updates' | 'favorites' | 'my_tasks';

export interface WidgetConfig {
    id: string;
    type: WidgetType;
}