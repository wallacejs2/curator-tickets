
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
  // Linking fields
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  linkedFeatureIds?: string[];
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
  // Linking fields
  linkedTaskIds?: string[];
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tasks: Task[];
  creationDate: string;
  updates?: Update[];
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
  // Linking fields
  projectIds: string[];
  ticketIds: string[];
  linkedMeetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

// Type for main application view
export type View = 'dashboard' | 'tickets' | 'projects' | 'dealerships' | 'tasks' | 'features' | 'meetings' | 'contacts';

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
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  contactIds: string[];
}
