
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

export enum FeatureStatus {
  Backlog = 'Backlog',
  InDiscovery = 'In Discovery',
  InDevelopment = 'In Development',
  Testing = 'Testing',
  Upcoming = 'Upcoming',
  Launched = 'Launched',
}

export interface HistoryEntry {
  id: string;
  author: string;
  date: string;
  comment: string;
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
  subTasks?: Task[];
  linkedTaskIds?: string[];
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
  shopperIds?: string[];
}

export interface EnrichedTask extends Task {
    projectId: string | null;
    projectName?: string;
    ticketId: string | null;
    ticketTitle?: string;
}

export interface Ticket {
  id: string;
  type: TicketType;
  productArea: ProductArea;
  platform: Platform;
  title: string;
  client?: string;
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
  location: string;
  updates?: Update[];
  tasks?: Task[];
  completionNotes?: string;
  onHoldReason?: string;
  isFavorite?: boolean;
  projectIds?: string[];
  linkedTicketIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
  shopperIds?: string[];
}

export interface IssueTicket extends Ticket {
  type: TicketType.Issue;
  problem: string;
  duplicationSteps: string;
  workaround?: string;
  frequency: string;
}

export interface FeatureRequestTicket extends Ticket {
  type: TicketType.FeatureRequest;
  improvement: string;
  currentFunctionality: string;
  suggestedSolution: string;
  benefits: string;
}

export enum ProjectStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
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
  ticketIds: string[];
  meetingIds?: string[];
  linkedProjectIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
}

export enum DealershipStatus {
    PendingFocus = 'Pending FOCUS',
    PendingDmt = 'Pending DMT',
    PendingSetup = 'Pending Setup',
    Onboarding = 'Onboarding',
    Live = 'Live',
    Pilot = 'Pilot',
    Cancelled = 'Cancelled',
}

export interface Dealership {
    id: string;
    name: string;
    accountNumber: string;
    status: DealershipStatus;
    orderNumber?: string;
    orderReceivedDate?: string;
    goLiveDate?: string;
    termDate?: string;
    enterprise?: string;
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
    ticketIds?: string[];
    projectIds?: string[];
    meetingIds?: string[];
    taskIds?: string[];
    linkedDealershipIds?: string[];
    featureIds?: string[];
    shopperIds?: string[];
}

export interface DealershipGroup {
  id: string;
  name: string;
  description?: string;
  dealershipIds: string[];
}

export interface Meeting {
    id: string;
    name: string;
    meetingDate: string;
    attendees: string[];
    notes: string;
    projectIds?: string[];
    ticketIds?: string[];
    linkedMeetingIds?: string[];
    taskIds?: string[];
    dealershipIds?: string[];
    featureIds?: string[];
}

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

export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category: string;
    createdDate: string;
    lastModifiedDate: string;
    isFavorite?: boolean;
    linkedArticleIds?: string[];
}


export interface RecentActivity {
    id: string;
    date: string;
    time: string;
    activity: string;
    action: string;
}
export interface Shopper {
  id: string;
  customerName: string;
  curatorId: string;
  curatorLink?: string;
  email?: string;
  phone?: string;
  cdpId?: string;
  dmsId?: string;
  uniqueIssue: string;
  recentActivity?: RecentActivity[];
  isFavorite?: boolean;
  dealershipIds?: string[];
  ticketIds?: string[];
  taskIds?: string[];
}

export type View = 'dashboard' | 'tickets' | 'projects' | 'dealerships' | 'tasks' | 'features' | 'meetings' | 'contacts' | 'knowledge' | 'shoppers';

export interface FilterState {
  searchTerm: string;
  status: 'all' | Status;
  priority: 'all' | Priority;
  type: 'all' | TicketType;
  productArea: 'all' | ProductArea;
}

export interface DealershipFilterState {
    searchTerm: string;
    status: 'all' | DealershipStatus;
}

export interface MeetingFilterState {
    searchTerm: string;
}

export interface FeatureAnnouncementFilterState {
    searchTerm: string;
    platform: 'all' | Platform;
    category: 'all' | string;
}

export interface ContactFilterState {
    searchTerm: string;
    type: 'all' | ContactType;
}

export interface KnowledgeBaseFilterState {
    searchTerm: string;
    category: 'all' | string;
    tag: 'all' | string;
}

export interface ShopperFilterState {
    searchTerm: string;
}

export interface SavedTicketView {
    id: string;
    name: string;
    filters: FilterState;
}

export interface WidgetConfig {
  id: string;
  type: 'kpi' | 'list' | 'chart';
  title: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}
