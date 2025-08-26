import { Ticket, TicketType, Status, Priority, ProductArea, Platform, Project, ProjectStatus, TaskStatus, Dealership, DealershipStatus, TaskPriority, Task, FeatureAnnouncement, FeatureStatus } from './types.ts';

export const initialTickets: Ticket[] = [
  {
    id: '1',
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
    platform: Platform.Curator,
    title: 'Login button unresponsive on Safari',
    client: 'ABC Motors',
    pmrNumber: 'PMR-12345',
    fpTicketNumber: 'FP-001',
    ticketThreadId: 'THREAD-ABC-123',
    submissionDate: new Date('2024-07-20T10:00:00Z').toISOString(),
    startDate: new Date('2024-07-21T09:00:00Z').toISOString(),
    estimatedCompletionDate: new Date('2024-07-30T17:00:00Z').toISOString(),
    status: Status.InProgress,
    priority: Priority.P1,
    submitterName: 'Alice Johnson',
    location: 'Login Page',
    problem: 'The main login button does not respond to clicks on Safari 15.2 and newer. No errors are thrown in the console.',
    duplicationSteps: '1. Open Safari 15.2+. 2. Navigate to the login page. 3. Enter credentials. 4. Click the "Log In" button. Nothing happens.',
    workaround: 'Users can press the Enter key after filling in the password field to log in successfully.',
    frequency: 'Occurs 100% of the time for affected users.',
    updates: [
      {
        author: 'Dev Team',
        date: new Date('2024-07-22T11:00:00Z').toISOString(),
        comment: 'Assigned to John Doe. Starting investigation.'
      },
      {
        author: 'John Doe',
        date: new Date('2024-07-23T15:30:00Z').toISOString(),
        comment: 'Identified the issue is related to event propagation in WebKit. Working on a fix.'
      }
    ]
  },
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
    submissionDate: new Date('2024-07-15T14:30:00Z').toISOString(),
    startDate: new Date('2024-07-18T09:00:00Z').toISOString(),
    estimatedCompletionDate: new Date('2024-08-15T17:00:00Z').toISOString(),
    status: Status.InReview,
    priority: Priority.P5,
    submitterName: 'Bob Williams',
    location: 'Entire Application',
    improvement: 'Add a user-selectable dark mode theme to the application.',
    currentFunctionality: 'The application currently only has a light theme, which can cause eye strain in low-light environments.',
    suggestedSolution: 'Implement a theme switcher in the user settings that toggles CSS variables for colors across the entire UI.',
    benefits: 'Improved user experience, reduced eye strain, modern look and feel, and better accessibility for some users.',
    projectId: 'proj-1',
    updates: [
      {
        author: 'Product Team',
        date: new Date('2024-07-16T10:00:00Z').toISOString(),
        comment: 'Feature request has been received and is under review for the next quarter planning.'
      }
    ]
  },
  {
    id: '3',
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
    platform: Platform.FOCUS,
    title: 'User profile picture not updating',
    client: 'Community Cars',
    fpTicketNumber: 'FP-003',
    ticketThreadId: 'THREAD-GHI-789',
    submissionDate: new Date('2024-07-22T09:00:00Z').toISOString(),
    estimatedCompletionDate: new Date('2024-08-01T17:00:00Z').toISOString(),
    status: Status.NotStarted,
    priority: Priority.P2,
    submitterName: 'Charlie Brown',
    location: 'User Profile Settings',
    problem: 'When a user uploads a new profile picture, the old one remains visible until they clear their browser cache.',
    duplicationSteps: '1. Go to profile settings. 2. Upload a new avatar. 3. Observe that the old avatar is still displayed.',
    workaround: 'Perform a hard refresh (Ctrl+Shift+R) or clear the browser cache.',
    frequency: 'Always.',
    updates: []
  },
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
    submissionDate: new Date('2024-07-10T11:00:00Z').toISOString(),
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
        { author: 'QA Team', date: new Date('2024-07-11T09:00:00Z').toISOString(), comment: 'Confirmed and reproduced the issue. Root cause seems to be related to MIME type handling on Firefox.' },
        { author: 'Dev Team', date: new Date('2024-07-12T14:20:00Z').toISOString(), comment: 'Fix has been implemented and deployed to staging for verification.' },
        { author: 'QA Team', date: new Date('2024-07-13T11:00:00Z').toISOString(), comment: 'Verified the fix on staging. Issue is resolved. Marking as complete.' }
    ],
    completionNotes: 'The fix involved correcting the Blob constructor to explicitly set the MIME type to "text/csv;charset=utf-8;". This ensures Firefox correctly interprets the file format upon download. The change was deployed in patch v2.3.1.'
  },
  {
    id: '5',
    type: TicketType.Issue,
    productArea: ProductArea.Fullpath,
    platform: Platform.UCP,
    title: 'API endpoint timing out',
    client: 'Global Auto',
    submissionDate: new Date('2024-07-28T10:00:00Z').toISOString(),
    status: Status.OnHold,
    onHoldReason: 'Waiting for dependency on external API to be resolved by their team. ETA: 2 weeks.',
    priority: Priority.P2,
    submitterName: 'Edward Snowden',
    location: 'Backend API service',
    problem: 'The /api/v2/inventory endpoint is frequently timing out under moderate load.',
    duplicationSteps: '1. Send 10 concurrent requests to the endpoint. 2. Observe 504 Gateway Timeout errors.',
    workaround: 'None.',
    frequency: 'During peak hours.',
    updates: []
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Q3 Feature Rollout: Dark Mode & Performance Boost',
    description: 'Implement dark mode across the entire application and optimize key performance metrics before the end of Q3.',
    status: ProjectStatus.InProgress,
    creationDate: new Date('2024-07-10T10:00:00Z').toISOString(),
    ticketIds: ['2'],
    updates: [
      {
        author: 'Project Lead',
        date: new Date('2024-07-12T09:00:00Z').toISOString(),
        comment: 'Project kickoff complete. Design phase has begun.'
      }
    ],
    tasks: [
      { id: 'sub-1-1', description: 'Design dark mode color palette', assignedUser: 'UX Team', status: TaskStatus.Done, priority: TaskPriority.P1, type: 'Design', dueDate: new Date('2024-07-15T17:00:00Z').toISOString() },
      { id: 'sub-1-2', description: 'Implement CSS variables for theming', assignedUser: 'John Doe', status: TaskStatus.InProgress, priority: TaskPriority.P1, type: 'Development', dueDate: new Date('2024-07-30T17:00:00Z').toISOString() },
      { id: 'sub-1-3', description: 'Analyze API response times', assignedUser: 'Backend Team', status: TaskStatus.ToDo, priority: TaskPriority.P3, type: 'QA', dueDate: new Date('2024-08-05T17:00:00Z').toISOString() },
      { id: 'sub-1-4', description: 'Refactor main dashboard component', assignedUser: 'Alice Johnson', status: TaskStatus.ToDo, priority: TaskPriority.P3, type: 'Development', dueDate: new Date('2024-08-10T17:00:00Z').toISOString() },
    ],
  },
  {
    id: 'proj-2',
    name: '2024 Compliance Audit Prep',
    description: 'Prepare all necessary documentation and system reports for the upcoming annual compliance audit.',
    status: ProjectStatus.NotStarted,
    creationDate: new Date('2024-07-25T14:30:00Z').toISOString(),
    ticketIds: [],
    updates: [],
    tasks: [
       { id: 'sub-2-1', description: 'Gather all user access logs', assignedUser: 'Security Team', status: TaskStatus.ToDo, priority: TaskPriority.P1, type: 'Documentation' },
       { id: 'sub-2-2', description: 'Verify data encryption at rest', assignedUser: 'DevOps', status: TaskStatus.ToDo, priority: TaskPriority.P1, type: 'QA', dueDate: new Date('2024-08-20T17:00:00Z').toISOString() },
    ],
  },
    {
    id: 'proj-3',
    name: 'Mobile App Launch Campaign',
    description: 'Coordinate marketing efforts for the new mobile application launch in September.',
    status: ProjectStatus.Completed,
    creationDate: new Date('2024-05-01T09:00:00Z').toISOString(),
    ticketIds: [],
    updates: [],
    tasks: [
       { id: 'sub-3-1', description: 'Finalize App Store screenshots', assignedUser: 'Marketing', status: TaskStatus.Done, priority: TaskPriority.P3, type: 'Design' },
       { id: 'sub-3-2', description: 'Prepare press release', assignedUser: 'PR Team', status: TaskStatus.Done, priority: TaskPriority.P3, type: 'Documentation' },
       { id: 'sub-3-3', description: 'Schedule social media posts', assignedUser: 'Marketing', status: TaskStatus.Done, priority: TaskPriority.P4, type: 'Meeting' },
    ],
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
    dueDate: new Date('2024-08-15T17:00:00Z').toISOString(),
  },
  {
    id: 'task-2',
    description: 'Plan the team offsite for Q4',
    assignedUser: 'Admin Team',
    status: TaskStatus.ToDo,
    priority: TaskPriority.P4,
    type: 'Planning',
  }
];

export const initialDealerships: Dealership[] = [
  {
    id: 'dealership-1',
    name: 'Prestige Motors',
    accountNumber: 'CIF-1001',
    status: DealershipStatus.Live,
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
  },
  {
    id: 'dealership-2',
    name: 'City Cars',
    accountNumber: 'CIF-1002',
    status: DealershipStatus.Onboarding,
    orderNumber: 'ORD-2024-002',
    orderReceivedDate: new Date('2024-07-01T00:00:00Z').toISOString(),
    goLiveDate: new Date('2024-08-01T00:00:00Z').toISOString(),
    enterprise: 'Urban Motors Inc.',
    storeNumber: 'S-05',
    branchNumber: 'B-10',
    address: '456 Main Street, Anytown, USA 12345',
    assignedSpecialist: 'Jane Doe',
  },
  {
    id: 'dealership-3',
    name: 'Reliable Rides',
    accountNumber: 'CIF-1003',
    status: DealershipStatus.Cancelled,
    orderNumber: 'ORD-2023-050',
    orderReceivedDate: new Date('2023-10-01T00:00:00Z').toISOString(),
    goLiveDate: new Date('2023-11-01T00:00:00Z').toISOString(),
    termDate: new Date('2024-06-30T00:00:00Z').toISOString(),
    enterprise: 'Value Vehicles',
    address: '789 Budget Ave, Thriftyville, TX 75001',
    assignedSpecialist: 'Peter Jones',
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
  },
  {
    id: 'feat-3',
    title: 'Advanced Reporting Filters',
    location: 'Reports Page',
    description: 'We are adding more granular filtering options to the reporting suite, allowing you to create more specific and insightful reports. This will include filtering by custom date ranges and additional ticket properties.',
    launchDate: new Date('2024-09-01T00:00:00Z').toISOString(),
    platform: Platform.Curator,
    status: FeatureStatus.Upcoming,
  }
];
