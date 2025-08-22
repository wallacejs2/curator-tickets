import React, { useState } from 'react';
import { Ticket, Status, Priority, TicketType, ProductArea } from '../types.ts';
import { STATUS_OPTIONS } from '../constants.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';


interface TicketTableProps {
  tickets: Ticket[];
  onRowClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: Status) => void;
}

const tagColorStyles: Record<string, string> = {
  // Priority
  [Priority.P1]: 'bg-red-200 text-red-800',
  [Priority.P2]: 'bg-orange-200 text-orange-800',
  [Priority.P3]: 'bg-yellow-200 text-yellow-800',
  [Priority.P4]: 'bg-blue-200 text-blue-800',
  [Priority.Mod5]: 'bg-indigo-200 text-indigo-800',
  [Priority.Mod8]: 'bg-purple-200 text-purple-800',
  // Status
  [Status.NotStarted]: 'bg-gray-300 text-gray-800',
  [Status.InProgress]: 'bg-blue-300 text-blue-900',
  [Status.InReview]: 'bg-yellow-300 text-yellow-900',
  [Status.DevReview]: 'bg-purple-300 text-purple-900',
  [Status.PmdReview]: 'bg-pink-300 text-pink-900',
  [Status.Testing]: 'bg-orange-300 text-orange-900',
  [Status.Completed]: 'bg-green-300 text-green-900',
  // TicketType
  [TicketType.Issue]: 'bg-rose-200 text-rose-800',
  [TicketType.FeatureRequest]: 'bg-teal-200 text-teal-800',
  // ProductArea
  [ProductArea.Reynolds]: 'bg-[#10437C] text-white',
  [ProductArea.Fullpath]: 'bg-[#EADEFF] text-[#242424]',
};


const Tag: React.FC<{ label: string }> = ({ label }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[label] || 'bg-gray-200 text-gray-800'}`}>
        {label}
    </span>
);

const ExpandedRowContent: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const lastUpdate = ticket.updates && ticket.updates.length > 0
        ? [...ticket.updates].pop()
        : null;

    return (
        <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Most Recent Update</h4>
            {lastUpdate ? (
                <div className="flex gap-3 items-start text-sm">
                    <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600" title={lastUpdate.author}>
                        {lastUpdate.author.charAt(0)}
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-800">{lastUpdate.author}</p>
                            <p className="text-xs text-gray-500">{new Date(lastUpdate.date).toLocaleString()}</p>
                        </div>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{lastUpdate.comment}</p>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">No updates have been added to this ticket yet.</p>
            )}
        </div>
    );
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets, onRowClick, onStatusChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No tickets found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new ticket.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {tickets.map(ticket => (
        <div key={ticket.id} className="bg-white rounded-md shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 cursor-pointer flex-grow" onClick={() => onRowClick(ticket)}>
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-semibold text-gray-900 flex-1">{ticket.title}</h3>
              <Tag label={ticket.priority} />
            </div>
            <div className="text-sm text-gray-500 mt-2 truncate">
              {ticket.client && (
                <>
                  <span className="font-medium text-gray-600">{ticket.client}</span>
                  <span className="mx-2 text-gray-300">•</span>
                </>
              )}
              <span>{ticket.submitterName}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span>{new Date(ticket.submissionDate).toLocaleDateString()}</span>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag label={ticket.type} />
                <Tag label={ticket.productArea} />
              </div>
              <select
                value={ticket.status}
                onChange={(e) => {
                    e.stopPropagation();
                    onStatusChange(ticket.id, e.target.value as Status);
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
                  <span>Most Recent Update</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${expandedId === ticket.id ? 'rotate-180' : ''}`} />
              </button>
              {expandedId === ticket.id && (
                  <ExpandedRowContent ticket={ticket} />
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketTable;