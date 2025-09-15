import React, { useState, useEffect, useRef } from 'react';
import { Meeting } from '../types.ts';
import RichTextEditor from './common/RichTextEditor.tsx';

type FormSubmitCallback = (meeting: Omit<Meeting, 'id'>) => void;

interface MeetingFormProps {
  onSubmit: FormSubmitCallback;
  onClose: () => void;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendees, setAttendees] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAttendees = attendees.split(',').map(a => a.trim()).filter(Boolean);
        onSubmit({
            name,
            meetingDate: new Date(`${meetingDate}T00:00:00`).toISOString(),
            attendees: finalAttendees,
            notes,
            projectIds: [],
            ticketIds: [],
        });
        onClose();
    };

    const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className={labelClasses}>Meeting Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className={formElementClasses} />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Date of Meeting</label>
                    <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} required className={formElementClasses} />
                </div>
                 <div>
                    <label className={labelClasses}>Attendees (comma-separated)</label>
                    <input type="text" value={attendees} onChange={e => setAttendees(e.target.value)} required className={formElementClasses} />
                </div>
            </div>
            <div>
                 <label className={labelClasses}>Meeting Notes</label>
                <RichTextEditor value={notes} onChange={setNotes} placeholder="Type your notes here..." />
            </div>
             <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Save Note
                </button>
            </div>
        </form>
    );
};

export default MeetingForm;