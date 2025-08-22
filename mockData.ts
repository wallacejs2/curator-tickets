import { Ticket, TicketType, Status, Priority, ProductArea } from './types.ts';

export const initialTickets: Ticket[] = [
  {
    id: '1',
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
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
    title: 'Implement Dark Mode',
    client: 'Luxury Auto Group',
    pmrNumber: 'PMR-67890',
    fpTicketNumber: 'FP-002',
    ticketThreadId: 'THREAD-DEF-456',
    submissionDate: new Date('2024-07-15T14:30:00Z').toISOString(),
    startDate: new Date('2024-07-18T09:00:00Z').toISOString(),
    estimatedCompletionDate: new Date('2024-08-15T17:00:00Z').toISOString(),
    status: Status.InReview,
    priority: Priority.P3,
    submitterName: 'Bob Williams',
    location: 'Entire Application',
    improvement: 'Add a user-selectable dark mode theme to the application.',
    currentFunctionality: 'The application currently only has a light theme, which can cause eye strain in low-light environments.',
    suggestedSolution: 'Implement a theme switcher in the user settings that toggles CSS variables for colors across the entire UI.',
    benefits: 'Improved user experience, reduced eye strain, modern look and feel, and better accessibility for some users.',
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
  }
];