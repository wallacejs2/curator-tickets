import React from 'react';
import { Meeting } from '../types.ts';

interface MeetingListProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
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
        </div>
    );
};


const MeetingList: React.FC<MeetingListProps> = ({ meetings, onMeetingClick }) => {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No Meeting Notes Found</h3>
        <p className="text-gray-500 mt-2">Click the '+' button to add your first meeting note.</p>
      </div>
    );
  }
  
  const sortedMeetings = [...meetings].sort((a,b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());

  return (
    <div className="space-y-4">
      {sortedMeetings.map(meeting => (
        <MeetingCard key={meeting.id} meeting={meeting} onClick={() => onMeetingClick(meeting)} />
      ))}
    </div>
  );
};

export default MeetingList;