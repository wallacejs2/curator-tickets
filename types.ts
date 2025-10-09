// Enums from constants.ts and other files
export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  InReview = 'In Review',
  DevReview = 'Dev Review',
  PmdReview = 'PMD Review',
  OnHold = 'On Hold',
  Testing = 'Testing',
  Completed = 'Completed',
}

export enum Priority {
  P1 = 'P1 - Urgent',
  P2 = 'P2 - High',
  P3 = 'P3 - Medium',
  P4 = 'P4 - Low',
  P5 = 'P5 - Planning',
  P8 = 'P8 - Backlog',
}

export enum TicketType {
  Issue = 'Issue / Bug',
  FeatureRequest = 'Feature Request',
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

export enum DealershipStatus {
  Prospect = 'Prospect',
  PendingDmt = 'Pending DMT',
  PendingFocus = 'Pending FOCUS',
  PendingSetup = 'Pending Setup',
  Onboarding = 'Onboarding',
  Enrollment = 'Enrollment',
  Live = 'Live',
  Pilot = 'Pilot',
  Cancelled = 'Cancelled',
}

export enum FeatureStatus {
  Launched = 'Launched',
  InDevelopment = 'In Development',
  Upcoming = 'Upcoming',
  InDiscovery = 'In Discovery',
  Backlog = 'Backlog',
  Testing = 'Testing',
}

export enum ContactType {
    Internal = 'Internal',
    External = 'External',
}

export enum ReleaseStatus {
    Planned = 'Planned',
    InProgress = 'In Progress',
    Released = 'Released',
    Cancelled = 'Cancelled',
}

export enum ProjectStatus {
  InProgress = 'In Progress',
  NotStarted = 'Not Started',
  OnHold = 'On Hold',
  Completed = 'Completed',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum TaskPriority {
  P1 = 'P1 - High',
  P2 = 'P2 - Medium',
  P3 = 'P3 - Low',
  P4 = 'P4 - Lowest',
}

// Interfaces and Types
export type View = 'dashboard' | 'tickets' | 'projects' | 'dealerships' | 'shoppers' | 'tasks' | 'meetings' | 'features' | 'contacts' | 'knowledge' | 'curator' | 'quarters' | 'releases' | 'reports';

export interface Update {
  id: string;
  author: string;
  date: string;
  comment: string;
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
  linkedTaskIds?: string[];
  subTasks?: Task[];
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

export interface BaseTicket {
  id: string;
  type: TicketType;
  title: string;
  productArea: ProductArea;
  platform: Platform;
  client?: string;
  pmrNumber?: string;
  pmrLink?: string;
  fpTicketNumber?: string;
  ticketThreadId?: string;
  submissionDate: string;
  lastUpdatedDate: string;
  startDate?: string;
  estimatedCompletionDate?: string;
  completionDate?: string;
  status: Status;
  priority: Priority;
  submitterName: string;
  location: string;
  onHoldReason?: string;
  completionNotes?: string;
  updates: Update[];
  tasks?: Task[];
  projectIds: string[];
  linkedTicketIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
  shopperIds?: string[];
  isFavorite?: boolean;
}

export interface IssueTicket extends BaseTicket {
  type: TicketType.Issue;
  problem: string;
  duplicationSteps: string;
  workaround?: string;
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

export interface ProjectSection {
    id: string;
    title: string;
    content: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  creationDate: string;
  ticketIds: string[];
  involvedPeople?: string[];
  updates?: Update[];
  tasks: Task[];
  meetingIds?: string[];
  linkedProjectIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
  sections?: ProjectSection[];
}

export interface WebsiteLink {
  url: string;
  clientId?: string;
}

export interface Product {
  id: string;
  name: string;
  fixedPrice: number;
  category: 'Old' | 'New';
}

export interface ProductPricing {
  id: string;
  orderReceivedDate?: string;
  orderNumber?: string;
  productId: string;
  sellingPrice?: number;
}


export interface Dealership {
    id: string;
    name: string;
    accountNumber: string;
    status: DealershipStatus;
    products?: ProductPricing[];
    hasManagedSolution?: boolean;
    wasFullpathCustomer?: boolean;
    goLiveDate?: string;
    termDate?: string;
    enterprise?: string;
    storeNumber?: string;
    branchNumber?: string;
    eraSystemId?: string;
    ppSysId?: string;
    buId?: string;
    useCustomEquityProvider?: boolean;
    equityBookProvider?: string;
    address?: string;
    assignedSpecialist?: string;
    sales?: string;
    pocName?: string;
    pocEmail?: string;
    pocPhone?: string;
    websiteLinks?: WebsiteLink[];
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
    description: string;
    dealershipIds: string[];
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
  updates?: Update[];
  ticketIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  linkedFeatureIds?: string[];
  curatorIds?: string[];
}

export interface Meeting {
  id: string;
  name: string;
  meetingDate: string;
  attendees: string[];
  notes: string;
  updates?: Update[];
  projectIds: string[];
  ticketIds: string[];
  linkedMeetingIds?: string[];
  taskIds?: string[];
  dealershipIds?: string[];
  featureIds?: string[];
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
    description: string;
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

export interface CuratorArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
    category: string;
    createdDate: string;
    lastModifiedDate: string;
    isFavorite?: boolean;
    navigation?: { title: string, url: string }[];
    supportingMaterialsUrl?: string;
    featureIds?: string[];
    linkedArticleIds?: string[];
}

export interface RecentActivity {
    id: string;
    date: string;
    time: string;
    activity: string;
    action?: string;
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
    updates?: Update[];
    dealershipIds: string[];
    ticketIds: string[];
    taskIds?: string[];
    isFavorite?: boolean;
}

export interface QuarterPlan {
    id: string;
    year: number;
    quarter: 1 | 2 | 3 | 4;
    name: string;
    salesPlan?: string;
    supportPlan?: string;
    developmentPlan?: string;
    productPlan?: string;
    updates?: Update[];
    featureIds?: string[];
    ticketIds?: string[];
    meetingIds?: string[];
    projectIds?: string[];
}

export interface Release {
    id: string;
    name: string;
    version: string;
    releaseDate: string;
    status: ReleaseStatus;
    description?: string;
    featureIds?: string[];
    ticketIds?: string[];
}


// Filter States
export interface FilterState {
  searchTerm: string;
  status: Status | 'all';
  priority: Priority | 'all';
  type: TicketType | 'all';
  productArea: ProductArea | 'all';
}

export interface DealershipFilterState {
  searchTerm: string;
  status: DealershipStatus | 'all';
}

export interface MeetingFilterState {
  searchTerm: string;
}

export interface FeatureAnnouncementFilterState {
    searchTerm: string;
    platform: Platform | 'all';
    category: string | 'all';
}

export interface KnowledgeBaseFilterState {
    searchTerm: string;
    category: string | 'all';
    tag: string | 'all';
}

export interface ShopperFilterState {
    searchTerm: string;
}

export interface ContactFilterState {
    searchTerm: string;
    type: ContactType | 'all';
}

// Other types
export interface SavedTicketView {
  id: string;
  name: string;
  filters: FilterState;
}

export interface WidgetConfig {
    id: string;
    type: 'openTickets' | 'myTasks' | 'recentActivity';
    position: { x: number, y: number };
    size: { width: number, height: number };
}