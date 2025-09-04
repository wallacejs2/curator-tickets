
import React from 'react';
import { Meeting, MeetingFilterState } from '../types.ts';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { AccountBalanceIcon } from './icons/AccountBalanceIcon.tsx';

interface MeetingListProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
  meetingFilters: MeetingFilterState;
  setMeetingFilters: React.Dispatch<React.SetStateAction<MeetingFilterState>>;
}

const MeetingCard: React.FC<{ meeting: Meeting; onClick: () => void }> = ({ meeting, onClick }) => {
    return (
        <div 
            onClick={onClick} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
        >
            <h3 className="text-lg font-semibold text-gray-900">{meeting.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{new Date(meeting.meetingDate).toLocaleDateString()}</p>
            <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendees</h4>
                <p className="text-sm text-gray-600 mt-1">{meeting.attendees.join(', ')}</p>
            </div>
             <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                {(meeting.linkedMeetingIds?.length || 0) > 0 && <span title={`${meeting.linkedMeetingIds?.length} linked meeting(s)`} className="flex items-center gap-1 text-blue-600"><DocumentTextIcon className="w-4 h-4" /><span className="text-xs font-medium">{meeting.linkedMeetingIds?.length}</span></span>}
                {(meeting.ticketIds?.length || 0) > 0 && <span title={`${meeting.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1 text-yellow-600"><ReceiptLongIcon className="w-4 h-4" /><span className="text-xs font-medium">{meeting.ticketIds?.length}</span></span>}
                {(meeting.projectIds?.length || 0) > 0 && <span title={`${meeting.projectIds?.length} linked project(s)`} className="flex items-center gap-1 text-red-600"><WorkspaceIcon className="w-4 h-4" /><span className="text-xs font-medium">{meeting.projectIds?.length}</span></span>}
                {(meeting.taskIds?.length || 0) > 0 && <span title={`${meeting.taskIds?.length} linked task(s)`} className="flex items-center gap-1 text-green-600"><ChecklistIcon className="w-4 h-4" /><span className="text-xs font-medium">{meeting.taskIds?.length}</span></span>}
                {(meeting.dealershipIds?.length || 0) > 0 && <span title={`${meeting.dealershipIds?.length} linked dealership(s)`} className="flex items-center gap-1 text-gray-600"><AccountBalanceIcon className="w-4 h-4" /><span className="text-xs font-medium">{meeting.dealershipIds?.length}</span></span>}
                {(meeting.featureIds?.length || 0) > 0 && <span title={`${meeting.featureIds?.length} linked feature(s)`} className="flex items-center gap-1 text-pink-600"><SparklesIcon className="w-4 h-4" /><span className="text-xs font-medium">{meeting.featureIds?.length}</span></span>}
            </div>
        </div>
    );
};


const MeetingList: React.FC<MeetingListProps> = ({ meetings, onMeetingClick, meetingFilters, setMeetingFilters }) => {

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingFilters({ searchTerm: e.target.value });
  };

  return (
    <div>
      <div className="mb-6 relative">
        <input
          type="text"
          value={meetingFilters.searchTerm}
          onChange={handleSearchChange}
          placeholder="Search meetings by name, date, attendees, or notes..."
          className="w-full p-3 pl-10 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">No Meeting Notes Found</h3>
          <p className="text-gray-500 mt-2">
            {meetingFilters.searchTerm
              ? `No meetings match your search for "${meetingFilters.searchTerm}".`
              : "Click the 'New Note' button to add your first meeting note."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(meeting => (
            <MeetingCard key={meeting.id} meeting={meeting} onClick={() => onMeetingClick(meeting)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingList;
