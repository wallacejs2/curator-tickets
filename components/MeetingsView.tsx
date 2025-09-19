import React, { useState, useMemo } from 'react';
import { Meeting, MeetingFilterState, Ticket, Project, Task, Dealership, FeatureAnnouncement, Update } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import Modal from './common/Modal.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import SideView from './common/SideView.tsx';
import MeetingForm from './MeetingForm.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature';

interface MeetingsViewProps {
  meetings: Meeting[];
  onSave: (meeting: Omit<Meeting, 'id'> | Meeting) => void;
  onDelete: (meetingId: string) => void;
  onExport: (meeting: Meeting) => void;
  showToast: (message: string, type: 'success' | 'error') => void;

  allTickets: Ticket[];
  allProjects: Project[];
  allTasks: (Task & { projectName?: string; projectId: string | null; })[];
  allMeetings: Meeting[];
  allDealerships: Dealership[];
  allFeatures: FeatureAnnouncement[];

  onLink: (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => void;
  onUnlink: (fromType: EntityType, fromId: string, toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const MeetingsView: React.FC<MeetingsViewProps> = ({ 
    meetings, onSave, onDelete, onExport, showToast,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures,
    onLink, onUnlink, onSwitchView
 }) => {
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [filters, setFilters] = useState<MeetingFilterState>({ searchTerm: '' });

    const filteredMeetings = useMemo(() => {
        const searchLower = filters.searchTerm.toLowerCase();
        return meetings.filter(m => 
            !searchLower ||
            m.name.toLowerCase().includes(searchLower) ||
            m.attendees.some(a => a.toLowerCase().includes(searchLower)) ||
            m.notes.toLowerCase().includes(searchLower) ||
            new Date(m.meetingDate).toLocaleDateString().includes(searchLower)
        ).sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
    }, [meetings, filters]);

    const handleSave = (meetingData: Omit<Meeting, 'id'> | Meeting) => {
        onSave(meetingData);
        setIsFormOpen(false);
        setEditingMeeting(null);
        
        if ('id' in meetingData) {
            setSelectedMeeting(meetingData);
        } else {
             setTimeout(() => {
                const newMeeting = meetings.find(m => m.name === meetingData.name && m.notes === meetingData.notes);
                if (newMeeting) setSelectedMeeting(newMeeting);
            }, 100);
        }
    };
    
    const handleDelete = () => {
        if(selectedMeeting && window.confirm(`Are you sure you want to delete "${selectedMeeting.name}"?`)) {
            onDelete(selectedMeeting.id);
            setSelectedMeeting(null);
        }
    }

    const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
        <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || 'N/A'}</p>
        </div>
    );
    
    // Linking data for selected meeting
    const linkedTickets = allTickets.filter(item => selectedMeeting?.ticketIds?.includes(item.id));
    const linkedProjects = allProjects.filter(item => selectedMeeting?.projectIds?.includes(item.id));
    const linkedTasks = allTasks.filter(item => selectedMeeting?.taskIds?.includes(item.id));
    const linkedMeetings = allMeetings.filter(item => item.id !== selectedMeeting?.id && selectedMeeting?.linkedMeetingIds?.includes(item.id));
    const linkedDealerships = allDealerships.filter(item => selectedMeeting?.dealershipIds?.includes(item.id));
    const linkedFeatures = allFeatures.filter(item => selectedMeeting?.featureIds?.includes(item.id));
    
    const availableTickets = allTickets.filter(item => !selectedMeeting?.ticketIds?.includes(item.id));
    const availableProjects = allProjects.filter(item => !selectedMeeting?.projectIds?.includes(item.id));
    const availableTasks = allTasks.filter(item => !selectedMeeting?.taskIds?.includes(item.id));
    const availableMeetings = allMeetings.filter(item => item.id !== selectedMeeting?.id && !selectedMeeting?.linkedMeetingIds?.includes(item.id));
    const availableDealerships = allDealerships.filter(item => !selectedMeeting?.dealershipIds?.includes(item.id));
    const availableFeatures = allFeatures.filter(item => !selectedMeeting?.featureIds?.includes(item.id));

    return (
        <div className="flex h-full">
            {isFormOpen && !editingMeeting && (
                <Modal title="Create New Note" onClose={() => { setIsFormOpen(false); }}>
                    <MeetingForm onSave={handleSave} onClose={() => { setIsFormOpen(false); }} />
                </Modal>
            )}

            <SideView
                isOpen={isFormOpen && !!editingMeeting}
                onClose={() => { setIsFormOpen(false); setEditingMeeting(null); }}
                title="Edit Meeting Note"
            >
                {editingMeeting && (
                    <MeetingForm
                        onSave={handleSave}
                        onClose={() => { setIsFormOpen(false); setEditingMeeting(null); }}
                        meetingToEdit={editingMeeting}
                    />
                )}
            </SideView>

            {/* Sidebar */}
            <aside className="w-1/3 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col p-4">
                <div className="relative mb-4">
                    <input type="text" placeholder="Search notes..." value={filters.searchTerm} onChange={e => setFilters({ searchTerm: e.target.value })} className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button onClick={() => { setEditingMeeting(null); setIsFormOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm mb-4">
                    <PlusIcon className="w-5 h-5" /> New Note
                </button>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                    {filteredMeetings.map(meeting => (
                        <div key={meeting.id} onClick={() => setSelectedMeeting(meeting)} className={`p-3 rounded-md cursor-pointer border ${selectedMeeting?.id === meeting.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50 border-transparent'}`}>
                            <p className="font-semibold text-gray-800 text-sm flex-grow truncate">{meeting.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(meeting.meetingDate).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6">
                {selectedMeeting ? (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-y-auto">
                        <div className="flex justify-between items-start mb-4 pb-4 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.name}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onExport(selectedMeeting)} className="p-2 text-gray-400 hover:text-green-600 rounded-full" title="Export Note"><DownloadIcon className="w-5 h-5"/></button>
                                <button onClick={() => { setEditingMeeting(selectedMeeting); setIsFormOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full" title="Edit Note"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 rounded-full" title="Delete Note"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DetailField label="Meeting Date" value={new Date(selectedMeeting.meetingDate).toLocaleDateString(undefined, { timeZone: 'UTC' })} />
                                <DetailField label="Attendees" value={selectedMeeting.attendees.join(', ')} />
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Notes</h3>
                                <div className="max-w-none p-4 bg-gray-50 border border-gray-200 rounded-md rich-text-content text-gray-900" dangerouslySetInnerHTML={{ __html: selectedMeeting.notes }} />
                            </div>

                            <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('meeting', selectedMeeting.id, 'ticket', id)} onUnlink={(id) => onUnlink('meeting', selectedMeeting.id, 'ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
                            <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink('meeting', selectedMeeting.id, 'project', id)} onUnlink={(id) => onUnlink('meeting', selectedMeeting.id, 'project', id)} onItemClick={(id) => onSwitchView('project', id)} />
                            <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('meeting', selectedMeeting.id, 'task', id)} onUnlink={(id) => onUnlink('meeting', selectedMeeting.id, 'task', id)} onItemClick={(id) => onSwitchView('task', id)} />
                            <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', selectedMeeting.id, 'meeting', id)} onUnlink={(id) => onUnlink('meeting', selectedMeeting.id, 'meeting', id)} onItemClick={(id) => onSwitchView('meeting', id)} />
                            <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('meeting', selectedMeeting.id, 'dealership', id)} onUnlink={(id) => onUnlink('meeting', selectedMeeting.id, 'dealership', id)} onItemClick={(id) => onSwitchView('dealership', id)} />
                            <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink('meeting', selectedMeeting.id, 'feature', id)} onUnlink={(id) => onUnlink('meeting', selectedMeeting.id, 'feature', id)} onItemClick={(id) => onSwitchView('feature', id)} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Meeting Notes</h2>
                        <p className="mt-2 text-gray-500">Select a meeting note from the left to view its details, or create a new one.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MeetingsView;
