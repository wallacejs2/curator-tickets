import React, { useMemo } from 'react';
import { FeatureRequestTicket, Dealership, Contact } from '../types.ts';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon.tsx';
import { UsersIcon } from './icons/UsersIcon.tsx';

interface FeedbackViewProps {
  featureRequests: FeatureRequestTicket[];
  dealerships: Dealership[];
  contacts: Contact[];
  onTicketClick: (ticket: FeatureRequestTicket) => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ featureRequests, dealerships, contacts, onTicketClick }) => {

  const dealershipMap = useMemo(() => new Map(dealerships.map(d => [d.id, d.name])), [dealerships]);
  const contactMap = useMemo(() => new Map(contacts.map(c => [c.id, c.name])), [contacts]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Customer Feedback Hub</h1>
        <p className="mt-2 text-gray-600">
          This view centralizes all feature requests submitted and links them to the customers who asked for them.
          Click on any feature request to see its full details.
        </p>
      </div>
      
      <div className="space-y-4">
        {featureRequests.length > 0 ? (
          featureRequests.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => onTicketClick(ticket)}
              >
                <p className="font-semibold text-gray-900">{ticket.title}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.improvement}</p>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requested By</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {(ticket.dealershipIds && ticket.dealershipIds.length > 0) && (
                    <div className="flex items-center gap-2 text-sm">
                        <BuildingStorefrontIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                            {ticket.dealershipIds.map(id => dealershipMap.get(id) || `ID: ${id}`).join(', ')}
                        </span>
                    </div>
                  )}
                  {(ticket.contactIds && ticket.contactIds.length > 0) && (
                    <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                            {ticket.contactIds.map(id => contactMap.get(id) || `ID: ${id}`).join(', ')}
                        </span>
                    </div>
                  )}
                  {(!ticket.dealershipIds || ticket.dealershipIds.length === 0) && (!ticket.contactIds || ticket.contactIds.length === 0) && (
                    <p className="text-sm text-gray-500 italic">No customers linked.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">No Feature Requests Found</h3>
            <p className="text-gray-500 mt-2">Create a new "Feature Request" ticket to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackView;
