

import React, { useState, useEffect, useRef } from 'react';
import { Meeting } from '../types.ts';

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
    const notesEditorRef = useRef<HTMLDivElement>(null);
    // FIX: Add state to manage the placeholder for the contentEditable div
    const [isNotesEmpty, setIsNotesEmpty] = useState(true);

    const handleNotesInput = () => {
        if (notesEditorRef.current) {
            setNotes(notesEditorRef.current.innerHTML);
            // FIX: Update placeholder visibility based on content
            setIsNotesEmpty(!notesEditorRef.current.textContent?.trim());
        }
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false, undefined);
        notesEditorRef.current?.focus();
        handleNotesInput();
    };

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
                <div className="mt-1 relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md">
                        <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-sm w-8 h-8 flex items-center justify-center" aria-label="Bold">B</button>
                        <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 italic text-sm w-8 h-8 flex items-center justify-center" aria-label="Italic">I</button>
                        <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Bulleted List">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                            </svg>
                        </button>
                        <button type="button" onClick={() => handleFormat('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Numbered List">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/>
                                <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/>
                                <path d="M3.652 7.332v-.474H4c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.954.773 0 .448-.285.722-.885.722h-.342v.474z"/>
                                <path d="M2.24 3.862v.428h.832v-.428h.633V5.1h-.633v.569h-.832v-.569H1.41V3.862z"/>
                            </svg>
                        </button>
                    </div>
                     <div
                        ref={notesEditorRef}
                        contentEditable
                        onInput={handleNotesInput}
                        className="w-full text-sm p-2 min-h-[120px] focus:outline-none rich-text-content text-gray-900"
                        role="textbox"
                        aria-multiline="true"
                        aria-label="Meeting notes"
                    />
                    {/* FIX: Removed invalid 'placeholder' attribute and implemented a custom placeholder */}
                    {isNotesEmpty && (
                        <div className="absolute top-[49px] left-2 text-sm text-gray-500 pointer-events-none select-none">
                            Type your notes here...
                        </div>
                    )}
                </div>
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