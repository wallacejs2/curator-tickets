import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status } from './types.ts';
import TicketTable from './components/TicketList.tsx';
import TicketForm from './components/TicketForm.tsx';
import LeftSidebar from './components/FilterBar.tsx';
import SideView from './components/common/SideView.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { initialTickets } from './mockData.ts';
import { PencilIcon } from './components/icons/PencilIcon.tsx';
import PerformanceInsights from './components/PerformanceInsights.tsx';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { MenuIcon } from './components/icons/MenuIcon.tsx';


const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || 'N/A'}</p>
  </div>
);

const TicketDetailView = ({ ticket, onEditRequest, onAddUpdate, onExport, onUpdateCompletionNotes }: { ticket: Ticket, onEditRequest: () => void, onAddUpdate: (comment: string, author: string) => void, onExport: () => void, onUpdateCompletionNotes: (notes: string) => void }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(ticket.completionNotes || '');

  const formattedSubmissionDate = new Date(ticket.submissionDate).toLocaleDateString();
  const formattedCompletionDate = ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleDateString() : 'N/A';
  const formattedStartDate = ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : 'N/A';
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim()) {
      onAddUpdate(newUpdate.trim(), authorName.trim());
      setNewUpdate('');
    }
  };
  
  const handleSaveNotes = () => {
    onUpdateCompletionNotes(completionNotes);
    setIsEditingNotes(false);
  };

  return (
    <div>
        <div className="flex justify-end items-center gap-3 mb-6">
             <button
                onClick={onExport}
                className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>Export Ticket</span>
            </button>
            <button
                onClick={onEditRequest}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
            >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Ticket</span>
            </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-6">
            <DetailField label="Status" value={ticket.status} />
            <DetailField label="Priority" value={ticket.priority} />
            <DetailField label="Product Area" value={ticket.productArea} />
            <DetailField label="Ticket Type" value={ticket.type} />
            <DetailField label="Submitted On" value={formattedSubmissionDate} />
            <DetailField label="Start Date" value={formattedStartDate} />
            <DetailField label="Est. Completion" value={formattedCompletionDate} />
            <DetailField label="Submitter" value={ticket.submitterName} />
            <DetailField label="Client" value={ticket.client} />
            <DetailField label="PMR Number" value={ticket.pmrNumber} />
            <DetailField label="FP Ticket #" value={ticket.fpTicketNumber} />
            <DetailField label="Location" value={ticket.location} />
            <DetailField label="Ticket Thread ID" value={ticket.ticketThreadId} />
        </div>
        <div className="border-t border-gray-200 pt-5 mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {ticket.type === TicketType.Issue && (
            <>
                <DetailField label="Problem" value={ticket.problem} />
                <DetailField label="Duplication Steps" value={ticket.duplicationSteps} />
                <DetailField label="Workaround" value={ticket.workaround} />
                <DetailField label="Frequency" value={ticket.frequency} />
            </>
            )}
            {ticket.type === TicketType.FeatureRequest && (
            <>
                <DetailField label="Improvement" value={ticket.improvement} />
                <DetailField label="Current Functionality" value={ticket.currentFunctionality} />
                <DetailField label="Suggested Solution" value={ticket.suggestedSolution} />
                <DetailField label="Benefits" value={ticket.benefits} />
            </>
            )}
        </div>
        
        {ticket.status === Status.Completed && (
            <div className="mt-8">
                <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800">
                        Completion Summary
                    </h3>
                    {!isEditingNotes && (
                         <button
                            onClick={() => {
                                setCompletionNotes(ticket.completionNotes || '');
                                setIsEditingNotes(true);
                            }}
                            className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-800 focus:outline-none"
                            aria-label="Edit completion summary"
                        >
                            <PencilIcon className="w-3.5 h-3.5" />
                            <span>{ticket.completionNotes ? 'Edit' : 'Add'}</span>
                        </button>
                    )}
                </div>

                {isEditingNotes ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveNotes(); }}>
                        <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            rows={4}
                            placeholder="Explain what was changed or updated..."
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditingNotes(false)}
                                className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                             <button
                                type="submit"
                                className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                            >
                                Save Summary
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {ticket.completionNotes ? (
                            <p>{ticket.completionNotes}</p>
                        ) : (
                            <p className="text-gray-500 italic">No completion summary has been provided.</p>
                        )}
                    </div>
                )}
            </div>
        )}

         <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-800 pb-2 mb-4 border-b border-gray-200">
                Activity Log
            </h3>
            <form onSubmit={handleUpdateSubmit} className="mb-6">
                <div className="space-y-4 mb-4">
                    <div>
                        <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input 
                            type="text" 
                            id="author-name" 
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="new-update" className="block text-sm font-medium text-gray-700 mb-1">Add an update</label>
                        <textarea
                            id="new-update"
                            value={newUpdate}
                            onChange={(e) => setNewUpdate(e.target.value)}
                            rows={3}
                            placeholder="Provide an update on the ticket..."
                            required
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                    >
                        Add Update
                    </button>
                </div>
            </form>
            
            <div className="space-y-4">
                {ticket.updates && ticket.updates.length > 0 ? (
                    [...ticket.updates].reverse().map((update, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600" title={update.author}>
                                {update.author.charAt(0)}
                            </div>
                            <div className="flex-grow bg-gray-100 p-3 rounded-md">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-sm text-gray-800">{update.author}</p>
                                    <p className="text-xs text-gray-500">{new Date(update.date).toLocaleString()}</p>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{update.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No updates have been added to this ticket yet.</p>
                )}
            </div>
        </div>
    </div>
  )
}


export default function App() {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    productArea: 'all',
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const performanceMetrics = useMemo(() => {
    const completedTickets = tickets.filter(
      t => t.status === Status.Completed && t.completionDate
    );

    const completedLast30Days = completedTickets.filter(t => {
      const completionDate = new Date(t.completionDate!);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return completionDate > thirtyDaysAgo;
    }).length;

    const totalCompletionDays = completedTickets.reduce((sum, t) => {
      const submission = new Date(t.submissionDate);
      const completion = new Date(t.completionDate!);
      const diffTime = Math.abs(completion.getTime() - submission.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    const avgCompletionDays = completedTickets.length > 0
      ? totalCompletionDays / completedTickets.length
      : null;

    return {
      openTickets: tickets.filter(t => t.status !== Status.Completed).length,
      completedLast30Days,
      avgCompletionDays,
    };
  }, [tickets]);
  
  const isSidePanelOpen = !!selectedTicket || isCreating;

  const handleFormSubmit = (ticketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    if (isEditing && selectedTicket) {
      // Update existing ticket
      const updatedTicket: Ticket = {
        ...selectedTicket,
        ...ticketData,
         completionDate: (ticketData.status === Status.Completed && !selectedTicket.completionDate)
          ? new Date().toISOString()
          : (ticketData.status !== Status.Completed)
          ? undefined
          : selectedTicket.completionDate,
      };
      setTickets(prevTickets =>
        prevTickets.map(t => (t.id === updatedTicket.id ? updatedTicket : t))
      );
      setSelectedTicket(updatedTicket); // Keep viewing the ticket after edit
    } else {
      // Add new ticket
      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        submissionDate: new Date().toISOString(),
        updates: [],
        completionDate: ticketData.status === Status.Completed ? new Date().toISOString() : undefined,
      } as Ticket;
      setTickets(prevTickets => [newTicket, ...prevTickets]);
    }
    handleClosePanel();
  };
  
  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditing(false);
    setIsCreating(false);
  };
  
  const handleAddNewClick = () => {
    setSelectedTicket(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  const handleClosePanel = () => {
    setSelectedTicket(null);
    setIsEditing(false);
    setIsCreating(false);
  };
  
  const handleEditRequest = () => {
    if (selectedTicket) {
      setIsEditing(true);
    }
  }

  const handleAddUpdate = (comment: string, author: string) => {
    if (!selectedTicket) return;

    const newUpdate: Update = {
      author,
      date: new Date().toISOString(),
      comment,
    };

    const updatedTicket: Ticket = {
      ...selectedTicket,
      updates: [...(selectedTicket.updates || []), newUpdate],
    };

    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
  };
  
  const handleUpdateCompletionNotes = (notes: string) => {
    if (!selectedTicket) return;

    const updatedTicket: Ticket = {
      ...selectedTicket,
      completionNotes: notes.trim(),
    };

    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
  };

  const handleExport = () => {
    if (!selectedTicket) return;

    let content = `[${selectedTicket.title}]\n\n`;

    const addDetail = (label: string, value: string | undefined | null) => {
      if (value) {
        content += `${label.padEnd(25, ' ')}: ${value}\n`;
      }
    };
    
    const addBlockDetail = (label: string, value: string | undefined | null) => {
        if (value) {
            content += `\n--- ${label.toUpperCase()} ---\n${value}\n`;
        }
    }

    addDetail('ID', selectedTicket.id);
    addDetail('Type', selectedTicket.type);
    addDetail('Product Area', selectedTicket.productArea);
    addDetail('Status', selectedTicket.status);
    addDetail('Priority', selectedTicket.priority);
    addDetail('Submitter', selectedTicket.submitterName);
    addDetail('Client', selectedTicket.client);
    addDetail('Location', selectedTicket.location);
    content += '\n';
    addDetail('Submitted On', new Date(selectedTicket.submissionDate).toLocaleDateString());
    if (selectedTicket.startDate) addDetail('Start Date', new Date(selectedTicket.startDate).toLocaleDateString());
    if (selectedTicket.estimatedCompletionDate) addDetail('Est. Completion', new Date(selectedTicket.estimatedCompletionDate).toLocaleDateString());
    if (selectedTicket.completionDate) addDetail('Completed On', new Date(selectedTicket.completionDate).toLocaleDateString());
    content += '\n';
    addDetail('PMR Number', selectedTicket.pmrNumber);
    addDetail('FP Ticket #', selectedTicket.fpTicketNumber);
    addDetail('Ticket Thread ID', selectedTicket.ticketThreadId);
    
    if (selectedTicket.type === TicketType.Issue) {
      const ticket = selectedTicket as IssueTicket;
      addBlockDetail('Problem', ticket.problem);
      addBlockDetail('Duplication Steps', ticket.duplicationSteps);
      addBlockDetail('Workaround', ticket.workaround);
      addBlockDetail('Frequency', ticket.frequency);
    } else {
      const ticket = selectedTicket as FeatureRequestTicket;
      addBlockDetail('Improvement', ticket.improvement);
      addBlockDetail('Current Functionality', ticket.currentFunctionality);
      addBlockDetail('Suggested Solution', ticket.suggestedSolution);
      addBlockDetail('Benefits', ticket.benefits);
    }
    
    if (selectedTicket.status === Status.Completed && selectedTicket.completionNotes) {
        addBlockDetail('Completion Summary', selectedTicket.completionNotes);
    }

    if (selectedTicket.updates && selectedTicket.updates.length > 0) {
      content += '\n--- ACTIVITY LOG ---\n';
      [...selectedTicket.updates].reverse().forEach(update => {
        content += `\n[${new Date(update.date).toLocaleString()}] ${update.author}:\n${update.comment}\n`;
      });
    }

    const fileContent = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = `ticket-${selectedTicket.id}.txt`;
    link.click();
  };

  const handleExportAll = () => {
    const headers = [
      'ID', 'Type', 'Title', 'Status', 'Priority', 'Product Area', 'Submitter', 'Client', 'Location',
      'Submitted On', 'Start Date', 'Est. Completion', 'Completed On',
      'PMR Number', 'FP Ticket #', 'Ticket Thread ID',
      'Problem', 'Duplication Steps', 'Workaround', 'Frequency',
      'Improvement', 'Current Functionality', 'Suggested Solution', 'Benefits',
      'Completion Notes', 'Last Update'
    ];

    const escapeCsvCell = (cellData: any): string => {
      const stringData = String(cellData || '');
      if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const rows = tickets.map(ticket => {
      const lastUpdate = ticket.updates && ticket.updates.length > 0 ? [...ticket.updates].pop() : null;
      const lastUpdateText = lastUpdate ? `[${new Date(lastUpdate.date).toLocaleString()}] ${lastUpdate.author}: ${lastUpdate.comment.replace(/\n/g, ' ')}` : '';
      
      const isIssue = ticket.type === TicketType.Issue;
      const issueTicket = ticket as IssueTicket;
      const featureTicket = ticket as FeatureRequestTicket;
      
      const row = [
        ticket.id,
        ticket.type,
        ticket.title,
        ticket.status,
        ticket.priority,
        ticket.productArea,
        ticket.submitterName,
        ticket.client,
        ticket.location,
        ticket.submissionDate ? new Date(ticket.submissionDate).toISOString() : '',
        ticket.startDate ? new Date(ticket.startDate).toISOString() : '',
        ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toISOString() : '',
        ticket.completionDate ? new Date(ticket.completionDate).toISOString() : '',
        ticket.pmrNumber,
        ticket.fpTicketNumber,
        ticket.ticketThreadId,
        // Issue specific
        isIssue ? issueTicket.problem : '',
        isIssue ? issueTicket.duplicationSteps : '',
        isIssue ? issueTicket.workaround : '',
        isIssue ? issueTicket.frequency : '',
        // Feature Request specific
        !isIssue ? featureTicket.improvement : '',
        !isIssue ? featureTicket.currentFunctionality : '',
        !isIssue ? featureTicket.suggestedSolution : '',
        !isIssue ? featureTicket.benefits : '',
        ticket.completionNotes,
        lastUpdateText
      ];
      return row.map(escapeCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `curator-tickets-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = (ticketId: string, newStatus: Status) => {
    setTickets(prevTickets =>
      prevTickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: newStatus,
            completionDate: (newStatus === Status.Completed && !t.completionDate)
              ? new Date().toISOString()
              : (newStatus !== Status.Completed)
              ? undefined
              : t.completionDate,
          };
        }
        return t;
      })
    );
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTermLower) ||
        (ticket.client && ticket.client.toLowerCase().includes(searchTermLower)) ||
        (ticket.pmrNumber && ticket.pmrNumber.toLowerCase().includes(searchTermLower)) ||
        (ticket.fpTicketNumber && ticket.fpTicketNumber.toLowerCase().includes(searchTermLower)) ||
        (ticket.ticketThreadId && ticket.ticketThreadId.toLowerCase().includes(searchTermLower)) ||
        ticket.submitterName.toLowerCase().includes(searchTermLower) ||
        ticket.location.toLowerCase().includes(searchTermLower);

      const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
      const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
      const matchesType = filters.type === 'all' || ticket.type === filters.type;
      const matchesProductArea = filters.productArea === 'all' || ticket.productArea === filters.productArea;

      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProductArea;
    });
  }, [tickets, filters]);

  const activeTickets = useMemo(() => {
    return filteredTickets.filter(ticket => ticket.status !== Status.Completed);
  }, [filteredTickets]);

  const completedTickets = useMemo(() => {
    return filteredTickets.filter(ticket => ticket.status === Status.Completed);
  }, [filteredTickets]);


  const getSidePanelTitle = () => {
    if (isCreating) return 'Create New Ticket';
    if (isEditing) return `Edit: ${selectedTicket?.title}`;
    if (selectedTicket) return selectedTicket.title;
    return '';
  }

  return (
    <div className="h-screen bg-gray-100 text-gray-800 flex overflow-hidden">
      <LeftSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} filters={filters} setFilters={setFilters} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-2 sm:p-4 sticky top-0 z-10 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 ring-offset-2 ring-blue-500">
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">Curator Tickets</h1>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <PerformanceInsights {...performanceMetrics} />
          <header className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Active Tickets</h1>
              <p className="text-gray-600 mt-1">
                {activeTickets.length} results found. Click a row to see details.
              </p>
            </div>
             <button
                onClick={handleExportAll}
                className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>Export All as CSV</span>
            </button>
          </header>
          <TicketTable tickets={activeTickets} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />

          {completedTickets.length > 0 && (
            <details className="mt-12 group" open>
                <summary className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-gray-900 list-none flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  Completed Tickets ({completedTickets.length})
                </summary>
                <div className="mt-4">
                    <TicketTable tickets={completedTickets} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />
                </div>
            </details>
          )}
        </main>
      </div>


      <button
        onClick={handleAddNewClick}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-110 z-20"
        aria-label="Create new ticket"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      <SideView
        title={getSidePanelTitle()}
        onClose={handleClosePanel}
        isOpen={isSidePanelOpen}
      >
        {isCreating || (isEditing && selectedTicket) ? (
          <TicketForm onSubmit={handleFormSubmit} initialData={isCreating ? null : selectedTicket} />
        ) : selectedTicket ? (
          <TicketDetailView 
            ticket={selectedTicket} 
            onEditRequest={handleEditRequest} 
            onAddUpdate={handleAddUpdate}
            onExport={handleExport}
            onUpdateCompletionNotes={handleUpdateCompletionNotes}
            />
        ) : null}
      </SideView>
    </div>
  );
}