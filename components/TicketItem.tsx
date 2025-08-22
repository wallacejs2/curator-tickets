import React, { useState } from 'react';
import { Ticket, TicketType, Status, Priority } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface TicketItemProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
}

const priorityBadgeStyles: Record<Priority, string> = {
  [Priority.P1]: 'bg-red-100 text-red-800',
  [Priority.P2]: 'bg-orange-100 text-orange-800',
  [Priority.P3]: 'bg-yellow-100 text-yellow-800',
  [Priority.P4]: 'bg-blue-100 text-blue-800',
  [Priority.Mod5]: 'bg-indigo-100 text-indigo-800',
  [Priority.Mod8]: 'bg-purple-100 text-purple-800',
};

const statusBadgeStyles: Record<Status, string> = {
  [Status.NotStarted]: 'bg-gray-200 text-gray-800',
  [Status.InProgress]: 'bg-blue-100 text-blue-800',
  [Status.InReview]: 'bg-yellow-100 text-yellow-800',
  [Status.DevReview]: 'bg-purple-100 text-purple-800',
  [Status.PmdReview]: 'bg-pink-100 text-pink-800',
  [Status.Testing]: 'bg-orange-100 text-orange-800',
  [Status.Completed]: 'bg-green-100 text-green-800',
};

const ticketTypeBadgeStyles: Record<TicketType, string> = {
    [TicketType.Issue]: 'bg-rose-100 text-rose-800',
    [TicketType.FeatureRequest]: 'bg-teal-100 text-teal-800',
};

const TicketItem: React.FC<TicketItemProps> = ({ ticket, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const daysSinceSubmission = Math.floor((new Date().getTime() - new Date(ticket.submissionDate).getTime()) / (1000 * 3600 * 24));
  
  const formattedSubmissionDate = new Date(ticket.submissionDate).toLocaleDateString();
  const formattedCompletionDate = ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleDateString() : 'N/A';
  const formattedStartDate = ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : 'N/A';

  const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md">
      <div className="p-4 sm:p-5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Top section: Title and Priority */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-grow">{ticket.title}</h3>
          <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${priorityBadgeStyles[ticket.priority]}`}>
            {ticket.priority}
          </span>
        </div>

        {/* Meta section: Submitter and time */}
        <div className="text-sm text-gray-500 mt-2 mb-4">
          <span>
            {ticket.type === TicketType.Issue ? 'Reported by' : 'Requested by'}{' '}
            <span className="font-medium text-gray-700">{ticket.submitterName}</span>
          </span>
          <span className="mx-2 text-gray-300">•</span>
          <span>{daysSinceSubmission} days ago</span>
        </div>

        {/* Bottom section: Type and Status */}
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ticketTypeBadgeStyles[ticket.type]}`}>
            {ticket.type}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeStyles[ticket.status]}`}>
            {ticket.status}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5">
            <div className="pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-6">
                    <DetailField label="Submitted On" value={formattedSubmissionDate} />
                    <DetailField label="Start Date" value={formattedStartDate} />
                    <DetailField label="Est. Completion" value={formattedCompletionDate} />
                    <DetailField label="PMR Number" value={ticket.pmrNumber || 'N/A'} />
                    <DetailField label="FP Ticket #" value={ticket.fpTicketNumber || 'N/A'} />
                     <DetailField label="Location" value={ticket.location} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                <div className="flex justify-end pt-5 mt-5 border-t border-gray-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(ticket);
                        }}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                </div>
            </div>
        </div>
      )}
       <div 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="flex justify-center items-center py-1 bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-b-xl border-t border-gray-200"
      >
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>
    </div>
  );
};

export default TicketItem;