import React, { useState } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea, IssueTicket, FeatureRequestTicket, Platform } from '../types.ts';
import { STATUS_OPTIONS } from '../constants.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';


interface TicketTableProps {
  tickets: Ticket[];
  onRowClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: Status, onHoldReason?: string) => void;
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
                        ? `${new Date(mostRecentUpdate.date).toLocaleString()} - ${mostRecentUpdate.author}:\n${mostRecentUpdate.comment}`
                        : "No updates have been added yet."
                    }
                </p>
            </div>
        </div>
    );
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets, onRowClick, onStatusChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const calculateDaysActive = (ticket: Ticket): string => {
    const startDate = new Date(ticket.submissionDate);
    const endDate = ticket.status === Status.Completed && ticket.completionDate
      ? new Date(ticket.completionDate)
      : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    // Add 1 to make the first day "1 day active" instead of 0
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (ticket.status === Status.Completed) {
      const completionDays = Math.max(1, diffDays); // Ensure it's at least 1 day
      return `Completed in ${completionDays} day${completionDays !== 1 ? 's' : ''}`;
    }
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} active`;
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No tickets found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new ticket.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <div key={ticket.id} className="bg-white rounded-md shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 cursor-pointer flex-grow" onClick={() => onRowClick(ticket)}>
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-semibold text-gray-900 flex-1">{ticket.title}</h3>
              <Tag label={ticket.priority} />
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
                <span>Submitted: {new Date(ticket.submissionDate).toLocaleDateString()}</span>
                <span className="mx-2 text-gray-300">•</span>
                <span>{calculateDaysActive(ticket)}</span>
              </div>
            </div>

            {ticket.status === Status.OnHold && ticket.onHoldReason && (
              <div className="mt-3 p-2 bg-[#ffcd85]/20 border border-[#ffcd85] rounded-md text-sm text-stone-800 text-ellipsis overflow-hidden">
                <span className="font-semibold">On Hold:</span> {ticket.onHoldReason}
              </div>
            )}
            {ticket.status === Status.Completed && ticket.completionNotes && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 text-ellipsis overflow-hidden">
                <span className="font-semibold">Completed:</span> {ticket.completionNotes}
              </div>
            )}
            
             <div className="text-xs text-gray-500 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                {ticket.pmrNumber && <span>PMR: <span className="font-medium text-gray-700">{ticket.pmrNumber}</span></span>}
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
      ))}
    </div>
  );
};

export default TicketTable;