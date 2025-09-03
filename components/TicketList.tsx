


import React, { useState, useMemo } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea, IssueTicket, FeatureRequestTicket, Platform, Project } from '../types.ts';
import { STATUS_OPTIONS } from '../constants.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { TicketIcon } from './icons/TicketIcon.tsx';
import { StarIcon } from './icons/StarIcon.tsx';


interface TicketTableProps {
  tickets: Ticket[];
  onRowClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: Status, onHoldReason?: string) => void;
  projects: Project[];
  onToggleFavorite: (ticketId: string) => void;
}

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


const Tag: React.FC<{ label: string }> = ({ label }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[label] || 'bg-gray-200 text-gray-800'}`}>
        {label}
    </span>
);

const SummaryField: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="md:col-span-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value}</p>
        </div>
    );
};

const ExpandedSummaryContent: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const mostRecentUpdate = ticket.updates && ticket.updates.length > 0
        ? [...ticket.updates].pop()
        : null;

    return (
        <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {ticket.type === TicketType.Issue && (
                <>
                    <SummaryField label="Problem" value={(ticket as IssueTicket).problem} />
                    <SummaryField label="Duplication Steps" value={(ticket as IssueTicket).duplicationSteps} />
                    <SummaryField label="Workaround" value={(ticket as IssueTicket).workaround} />
                    <SummaryField label="Frequency" value={(ticket as IssueTicket).frequency} />
                </>
            )}
            {ticket.type === TicketType.FeatureRequest && (
                <>
                    <SummaryField label="Improvement" value={(ticket as FeatureRequestTicket).improvement} />
                    <SummaryField label="Current Functionality" value={(ticket as FeatureRequestTicket).currentFunctionality} />
                    <SummaryField label="Suggested Solution" value={(ticket as FeatureRequestTicket).suggestedSolution} />
                    <SummaryField label="Benefits" value={(ticket as FeatureRequestTicket).benefits} />
                </>
            )}
            
            <div className="md:col-span-2 pt-5 mt-5 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Most Recent Update</h4>
                <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                    {mostRecentUpdate
                        ? `${new Date(mostRecentUpdate.date).toLocaleDateString(undefined, { timeZone: 'UTC' })} - ${mostRecentUpdate.author}:\n${mostRecentUpdate.comment}`
                        : "No updates have been added yet."
                    }
                </p>
            </div>
        </div>
    );
}

type TicketView = 'active' | 'completed' | 'favorites';

const TicketTable: React.FC<TicketTableProps> = ({ tickets, onRowClick, onStatusChange, projects, onToggleFavorite }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ticketView, setTicketView] = useState<TicketView>('active');

  const { activeTickets, completedTickets, favoriteTickets } = useMemo(() => {
    const active: Ticket[] = [];
    const completed: Ticket[] = [];
    const favorites: Ticket[] = [];

    for (const ticket of tickets) {
        if (ticket.isFavorite) {
            favorites.push(ticket);
        }
        if (ticket.status === Status.Completed) {
            completed.push(ticket);
        } else {
            active.push(ticket);
        }
    }
    return { activeTickets: active, completedTickets: completed, favoriteTickets: favorites };
  }, [tickets]);

  const ticketsToShow = ticketView === 'active' ? activeTickets : ticketView === 'completed' ? completedTickets : favoriteTickets;


  const calculateDaysActive = (ticket: Ticket): string => {
    const startDate = ticket.startDate ? new Date(ticket.startDate) : null;

    if (ticket.status === Status.Completed && ticket.completionDate) {
      const completionDate = new Date(ticket.completionDate);
      const start = startDate || new Date(ticket.submissionDate); // Fallback to submission date for completed tickets if no start date
      const diffTime = Math.abs(completionDate.getTime() - start.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return `Completed in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    if (!startDate) {
        return 'Not started';
    }

    const endDate = new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} active`;
  };
  
  return (
    <div>
      <div className="mb-4 flex border-b border-gray-200">
        <button
          onClick={() => setTicketView('active')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            ticketView === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-pressed={ticketView === 'active'}
        >
          Active ({activeTickets.length})
        </button>
        <button
          onClick={() => setTicketView('completed')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            ticketView === 'completed'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-pressed={ticketView === 'completed'}
        >
          Completed ({completedTickets.length})
        </button>
        <button
          onClick={() => setTicketView('favorites')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            ticketView === 'favorites'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-pressed={ticketView === 'favorites'}
        >
          Favorites ({favoriteTickets.length})
        </button>
      </div>

      {ticketsToShow.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">No {ticketView} tickets found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new ticket.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketsToShow.map(ticket => {
            const reviewStatuses = [Status.InReview, Status.DevReview, Status.PmdReview];
            let reasonText: string | undefined;
            let reasonLabel: string | undefined;
            let reasonContainerStyle: string | undefined;

            if (ticket.status === Status.Completed) {
                reasonText = ticket.completionNotes;
                reasonLabel = "Completed";
                reasonContainerStyle = "bg-green-50 border-green-200 text-green-800";
            } else if (ticket.status === Status.OnHold) {
                reasonText = ticket.onHoldReason;
                reasonLabel = "On Hold";
                reasonContainerStyle = "bg-[#ffcd85]/20 border-[#ffcd85] text-stone-800";
            } else if (reviewStatuses.includes(ticket.status)) {
                reasonText = ticket.onHoldReason;
                reasonLabel = ticket.status;
                reasonContainerStyle = "bg-[#fff494]/40 border-yellow-300 text-stone-800";
            }

            return (
            <div key={ticket.id} className="bg-white rounded-md shadow-sm border border-gray-200 flex flex-col">
              <div className="p-4 cursor-pointer flex-grow" onClick={() => onRowClick(ticket)}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(ticket.id);
                        }}
                        className="p-1 text-gray-400 hover:text-yellow-500 rounded-full focus:outline-none focus:ring-2 ring-offset-1 ring-yellow-500"
                        aria-label={ticket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        title={ticket.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <StarIcon filled={!!ticket.isFavorite} className={`w-5 h-5 ${ticket.isFavorite ? 'text-yellow-500' : ''}`} />
                    </button>
                    <Tag label={ticket.priority} />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3 flex-wrap">
                    {(ticket.linkedTicketIds?.length || 0) > 0 && <span title={`${ticket.linkedTicketIds?.length} linked ticket(s)`} className="flex items-center gap-1 text-yellow-600"><TicketIcon className="w-4 h-4" /><span className="text-xs font-medium">{ticket.linkedTicketIds?.length}</span></span>}
                    {(ticket.projectIds?.length || 0) > 0 && <span title={`${ticket.projectIds?.length} linked project(s)`} className="flex items-center gap-1 text-red-600"><ClipboardListIcon className="w-4 h-4" /><span className="text-xs font-medium">{ticket.projectIds?.length}</span></span>}
                    {(ticket.taskIds?.length || 0) > 0 && <span title={`${ticket.taskIds?.length} linked task(s)`} className="flex items-center gap-1 text-green-600"><ChecklistIcon className="w-4 h-4" /><span className="text-xs font-medium">{ticket.taskIds?.length}</span></span>}
                    {(ticket.meetingIds?.length || 0) > 0 && <span title={`${ticket.meetingIds?.length} linked meeting(s)`} className="flex items-center gap-1 text-blue-600"><DocumentTextIcon className="w-4 h-4" /><span className="text-xs font-medium">{ticket.meetingIds?.length}</span></span>}
                    {(ticket.dealershipIds?.length || 0) > 0 && <span title={`${ticket.dealershipIds?.length} linked dealership(s)`} className="flex items-center gap-1 text-gray-600"><BuildingStorefrontIcon className="w-4 h-4" /><span className="text-xs font-medium">{ticket.dealershipIds?.length}</span></span>}
                    {(ticket.featureIds?.length || 0) > 0 && <span title={`${ticket.featureIds?.length} linked feature(s)`} className="flex items-center gap-1 text-pink-600"><SparklesIcon className="w-4 h-4" /><span className="text-xs font-medium">{ticket.featureIds?.length}</span></span>}
                </div>
                
                <div className="text-sm text-gray-500 mt-2">
                  <div>
                    {ticket.client && (
                      <>
                        <span className="font-medium text-gray-600">{ticket.client}</span>
                        <span className="mx-2 text-gray-300">•</span>
                      </>
                    )}
                    <span>{ticket.submitterName}</span>
                  </div>
                  <div className="mt-1">
                    <span>Start Date: {ticket.startDate ? new Date(ticket.startDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span>{calculateDaysActive(ticket)}</span>
                  </div>
                </div>

                {reasonText && reasonLabel && (
                  <div className={`mt-3 p-2 rounded-md text-sm text-ellipsis overflow-hidden border ${reasonContainerStyle}`}>
                      <span className="font-semibold">{reasonLabel}:</span> {reasonText}
                  </div>
                )}
                
                 <div className="text-xs text-gray-500 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {ticket.pmrNumber && (
                        <span>
                            PMR: <span className="font-medium text-gray-700">{ticket.pmrNumber}</span>
                            {ticket.pmrLink && (
                                <a
                                    href={ticket.pmrLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="ml-2 font-semibold text-blue-600 hover:underline"
                                >
                                    Visit PMR
                                </a>
                            )}
                        </span>
                    )}
                    {ticket.fpTicketNumber && <span>FP#: <span className="font-medium text-gray-700">{ticket.fpTicketNumber}</span></span>}
                    {ticket.ticketThreadId && <span>Thread: <span className="font-medium text-gray-700">{ticket.ticketThreadId}</span></span>}
                 </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag label={ticket.type} />
                    <Tag label={ticket.productArea} />
                    <Tag label={ticket.platform} />
                  </div>
                  <select
                    value={ticket.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newStatus = e.target.value as Status;
                      let reason = ticket.onHoldReason;
                      if (newStatus === Status.OnHold && !reason) {
                          reason = 'No reason provided. Click to edit.';
                      }
                      onStatusChange(ticket.id, newStatus, reason);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-2 border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none ${tagColorStyles[ticket.status]}`}
                    aria-label={`Change status for ticket ${ticket.title}`}
                  >
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
                <div className="border-t border-gray-200">
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expandedId === ticket.id ? null : ticket.id);
                      }}
                      className="w-full flex justify-between items-center p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none rounded-b-md"
                      aria-expanded={expandedId === ticket.id}
                      aria-label={expandedId === ticket.id ? `Collapse summary for ${ticket.title}`: `Expand summary for ${ticket.title}`}
                  >
                      <span>View Summary</span>
                      <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === ticket.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedId === ticket.id && (
                      <ExpandedSummaryContent ticket={ticket} />
                  )}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default TicketTable;