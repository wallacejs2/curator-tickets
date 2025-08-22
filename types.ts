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

export interface Update {
  author: string;
  date: string;
  comment: string;
}

export interface BaseTicket {
  id: string;
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
  title: string;
  updates?: Update[];
  completionNotes?: string;
  onHoldReason?: string;
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