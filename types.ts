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
}

export interface Update {
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
  projectId?: string;
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
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tasks: Task[];
  creationDate: string;
  ticketIds: string[];
  updates?: Update[];
}

// Type for main application view
export type View = 'tickets' | 'projects' | 'dealerships' | 'tasks' | 'features';

// New types for Dealerships
export enum DealershipStatus {
  Onboarding = 'Onboarding',
  Live = 'Live',
  Cancelled = 'Cancelled',
  Pilot = 'Pilot',
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
}