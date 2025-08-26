
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform, Project, View, Dealership, DealershipStatus, ProjectStatus, DealershipFilterState, Task, FeatureAnnouncement, Meeting, MeetingFilterState } from './types.ts';
import TicketList from './components/TicketList.tsx';
import TicketForm from './components/TicketForm.tsx';
import LeftSidebar from './components/FilterBar.tsx';
import SideView from './components/common/SideView.tsx';
import { PencilIcon } from './components/icons/PencilIcon.tsx';
import PerformanceInsights from './components/PerformanceInsights.tsx';
import { DownloadIcon } from './components/icons/DownloadIcon.tsx';
import { PlusIcon } from './components/icons/PlusIcon.tsx';
import { MenuIcon } from './components/icons/MenuIcon.tsx';
import { STATUS_OPTIONS, ISSUE_PRIORITY_OPTIONS, FEATURE_REQUEST_PRIORITY_OPTIONS } from './constants.ts';
import { TrashIcon } from './components/icons/TrashIcon.tsx';
import Modal from './components/common/Modal.tsx';
import { EmailIcon } from './components/icons/EmailIcon.tsx';
import { XIcon } from './components/icons/XIcon.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { initialTickets, initialProjects, initialDealerships, initialTasks, initialFeatures, initialMeetings } from './mockData.ts';
import { UploadIcon } from './components/icons/UploadIcon.tsx';
import ProjectList from './components/ProjectList.tsx';
import ProjectDetailView from './components/ProjectDetailView.tsx';
import ProjectForm from './components/ProjectForm.tsx';
import DealershipList from './components/DealershipList.tsx';
import DealershipDetailView from './components/DealershipDetailView.tsx';
import DealershipInsights from './components/DealershipInsights.tsx';
import { useToast } from './hooks/useToast.ts';
import Toast from './components/common/Toast.tsx';
import DealershipForm from './components/DealershipForm.tsx';
import TaskList from './components/TaskList.tsx';
import FeatureList from './components/FeatureList.tsx';
import FeatureForm from './components/FeatureForm.tsx';
import MeetingList from './components/MeetingList.tsx';
import MeetingDetailView from './components/MeetingDetailView.tsx';
import MeetingForm from './components/MeetingForm.tsx';


const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || 'N/A'}</p>
  </div>
);

const formElementClasses = "mt-1 block w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
const labelClasses = "block text-sm font-medium text-gray-700";

const FormSection: React.FC<{ title: string; children: React.ReactNode, gridCols?: number, className?: string }> = ({ title, children, gridCols = 2, className }) => (
  <fieldset className={`mb-6 ${className}`}>
    <legend className="text-md font-semibold text-gray-800 pb-2 mb-5 border-b border-gray-200 w-full">
      {title}
    </legend>
    <div className={`grid grid-cols-1 sm:grid-cols-${gridCols} gap-x-6 gap-y-5`}>
      {children}
    </div>
  </fieldset>
);

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

const DetailTag: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[value] || 'bg-gray-200 text-gray-800'}`}>
      {value}
    </span>
  </div>
);

const TicketDetailView = ({ ticket, onUpdate, onAddUpdate, onExport, onEmail, onUpdateCompletionNotes, onDelete, projects, tickets }: { ticket: Ticket, onUpdate: (ticket: Ticket) => void, onAddUpdate: (comment: string, author: string, date: string) => void, onExport: () => void, onEmail: () => void, onUpdateCompletionNotes: (notes: string) => void, onDelete: (ticketId: string) => void, projects: Project[], tickets: Ticket[] }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(ticket.completionNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editableTicket, setEditableTicket] = useState<Ticket>(ticket);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToLink, setTicketToLink] = useState('');
  
  const commentEditorRef = useRef<HTMLDivElement>(null);
  const MAX_COMMENT_LENGTH = 2000;
  const [textContentLength, setTextContentLength] = useState(0);
  const [isCommentEmpty, setIsCommentEmpty] = useState(true);

  useEffect(() => {
    setEditableTicket(ticket);
    setIsEditing(false); // Exit edit mode if the selected ticket changes
  }, [ticket]);

  const handleCommentInput = () => {
    if (commentEditorRef.current) {
        const textLength = commentEditorRef.current.textContent?.length || 0;
        setNewUpdate(commentEditorRef.current.innerHTML);
        setTextContentLength(textLength);
        setIsCommentEmpty(!commentEditorRef.current.textContent?.trim());
    }
  };

  const handleFormat = (command: string) => {
      document.execCommand(command, false, undefined);
      commentEditorRef.current?.focus();
      handleCommentInput();
  };
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim() && updateDate) {
      onAddUpdate(newUpdate, authorName, updateDate);
       if (commentEditorRef.current) {
            commentEditorRef.current.innerHTML = '';
        }
        setNewUpdate('');
        setTextContentLength(0);
        setIsCommentEmpty(true);
    }
  };
  
  const handleNotesSave = () => {
    onUpdateCompletionNotes(completionNotes);
    setIsEditingNotes(false);
  };
  
  const handleSave = () => {
      onUpdate(editableTicket);
      setIsEditing(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'type') {
            newState.priority = value === TicketType.Issue ? Priority.P3 : Priority.P5;
        }
        return newState;
    });
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => ({
      ...prev,
      [name]: value ? new Date(`${value}T00:00:00`).toISOString() : undefined,
    }));
  };
  
  const handleLinkTicket = () => {
    if (!ticketToLink) return;
    setEditableTicket(prev => ({
      ...prev,
      linkedTicketIds: [...(prev.linkedTicketIds || []), ticketToLink]
    }));
    setTicketToLink('');
  };

  const handleUnlinkTicket = (ticketIdToUnlink: string) => {
    setEditableTicket(prev => ({
      ...prev,
      linkedTicketIds: (prev.linkedTicketIds || []).filter(id => id !== ticketIdToUnlink)
    }));
  };

  const projectName = ticket.projectId ? projects.find(p => p.id === ticket.projectId)?.name : 'N/A';
  const linkedTickets = ticket.linkedTicketIds?.map(id => tickets.find(t => t.id === id)).filter(Boolean) as Ticket[];

  return (
    <div>
      {isDeleteModalOpen && (
        <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
            <p className="text-gray-700">Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button onClick={() => onDelete(ticket.id)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Ticket</button>
            </div>
        </Modal>
      )}

      <div className="flex justify-end items-center gap-3 mb-6">
          <button onClick={onEmail} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"><EmailIcon className="w-4 h-4"/><span>Email</span></button>
          <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm"><DownloadIcon className="w-4 h-4"/><span>Export</span></button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
          <button onClick={() => { setEditableTicket(ticket); setIsEditing(true); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
      </div>
      
      {isEditing ? (
        <div className="space-y-6">
            <FormSection title="Core Information">
                 <div className="col-span-2">
                    <label className={labelClasses}>Title</label>
                    <input type="text" name="title" value={editableTicket.title} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
                 <div>
                    <label className={labelClasses}>Type</label>
                    <select name="type" value={editableTicket.type} onChange={handleFormChange} className={formElementClasses}>
                        {Object.values(TicketType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClasses}>Product Area</label>
                    <select name="productArea" value={editableTicket.productArea} onChange={handleFormChange} className={formElementClasses}>
                        {Object.values(ProductArea).map(pa => <option key={pa} value={pa}>{pa}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClasses}>Platform</label>
                    <select name="platform" value={editableTicket.platform} onChange={handleFormChange} className={formElementClasses}>
                        {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClasses}>Client</label>
                    <input type="text" name="client" value={editableTicket.client || ''} onChange={handleFormChange} className={formElementClasses}/>
                </div>
                 <div>
                    <label className={labelClasses}>Location</label>
                    <input type="text" name="location" value={editableTicket.location} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
            </FormSection>
             <FormSection title="Tracking & Ownership">
                <div>
                    <label className={labelClasses}>PMR Number</label>
                    <input type="text" name="pmrNumber" value={editableTicket.pmrNumber || ''} onChange={handleFormChange} className={formElementClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>FP Ticket Number</label>
                    <input type="text" name="fpTicketNumber" value={editableTicket.fpTicketNumber || ''} onChange={handleFormChange} className={formElementClasses}/>
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Ticket Thread ID</label>
                    <input type="text" name="ticketThreadId" value={editableTicket.ticketThreadId || ''} onChange={handleFormChange} className={formElementClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" value={editableTicket.status} onChange={handleFormChange} className={formElementClasses}>
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select name="priority" value={editableTicket.priority} onChange={handleFormChange} className={formElementClasses}>
                        {(editableTicket.type === TicketType.Issue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Project</label>
                    <select name="projectId" value={editableTicket.projectId || ''} onChange={handleFormChange} className={formElementClasses}>
                        <option value="">None</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                {editableTicket.status === Status.OnHold && (
                    <div className="col-span-2">
                        <label className={labelClasses}>Reason for On Hold Status</label>
                        <textarea name="onHoldReason" value={editableTicket.onHoldReason || ''} onChange={handleFormChange} rows={2} required className={formElementClasses}/>
                    </div>
                )}
            </FormSection>
            <FormSection title="Dates">
                <div>
                    <label className={labelClasses}>Start Date</label>
                    <input type="date" name="startDate" value={editableTicket.startDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Est. Time of Completion</label>
                    <input type="date" name="estimatedCompletionDate" value={editableTicket.estimatedCompletionDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} />
                </div>
                {editableTicket.status === Status.Completed && (
                    <div>
                        <label className={labelClasses}>Completion Date</label>
                        <input type="date" name="completionDate" value={editableTicket.completionDate?.split('T')[0] || ''} onChange={handleDateChange} className={formElementClasses} />
                    </div>
                )}
            </FormSection>
            {editableTicket.type === TicketType.Issue && (
                <FormSection title="Issue Details">
                    <div className="col-span-2"><label className={labelClasses}>Problem</label><textarea name="problem" value={(editableTicket as IssueTicket).problem} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                    <div className="col-span-2"><label className={labelClasses}>Duplication Steps</label><textarea name="duplicationSteps" value={(editableTicket as IssueTicket).duplicationSteps} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                    <div className="col-span-2"><label className={labelClasses}>Workaround</label><textarea name="workaround" value={(editableTicket as IssueTicket).workaround} onChange={handleFormChange} rows={2} className={formElementClasses}></textarea></div>
                    <div className="col-span-2"><label className={labelClasses}>Frequency</label><textarea name="frequency" value={(editableTicket as IssueTicket).frequency} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                </FormSection>
            )}
            {editableTicket.type === TicketType.FeatureRequest && (
                 <FormSection title="Feature Request Details">
                    <div className="col-span-2"><label className={labelClasses}>Improvement</label><textarea name="improvement" value={(editableTicket as FeatureRequestTicket).improvement} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                    <div className="col-span-2"><label className={labelClasses}>Current Functionality</label><textarea name="currentFunctionality" value={(editableTicket as FeatureRequestTicket).currentFunctionality} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                    <div className="col-span-2"><label className={labelClasses}>Suggested Solution</label><textarea name="suggestedSolution" value={(editableTicket as FeatureRequestTicket).suggestedSolution} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                    <div className="col-span-2"><label className={labelClasses}>Benefits</label><textarea name="benefits" value={(editableTicket as FeatureRequestTicket).benefits} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                </FormSection>
            )}
             <FormSection title="Linked Tickets" gridCols={1}>
              <div className="flex items-center gap-2">
                  <select value={ticketToLink} onChange={e => setTicketToLink(e.target.value)} className={`flex-grow ${formElementClasses} mt-0`}>
                      <option value="">Select a ticket to link...</option>
                      {tickets.filter(t => t.id !== editableTicket.id && !(editableTicket.linkedTicketIds || []).includes(t.id)).map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                  </select>
                  <button type="button" onClick={handleLinkTicket} disabled={!ticketToLink} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm disabled:bg-blue-300">Link Ticket</button>
              </div>
              <div className="mt-3 space-y-2">
                  {(editableTicket.linkedTicketIds || []).length > 0 ? editableTicket.linkedTicketIds!.map(linkedId => {
                      const linkedTicket = tickets.find(t => t.id === linkedId);
                      if (!linkedTicket) return null;
                      return (
                          <div key={linkedId} className="flex justify-between items-center p-2 bg-gray-50 border rounded-md text-sm">
                              <span className="text-gray-800">{linkedTicket.title}</span>
                              <button type="button" onClick={() => handleUnlinkTicket(linkedId)} className="p-1 text-gray-400 hover:text-red-600 rounded-full" aria-label={`Unlink ticket ${linkedTicket.title}`}>
                                  <XIcon className="w-4 h-4" />
                              </button>
                          </div>
                      );
                  }) : <p className="text-sm text-gray-500 italic mt-2">No tickets are linked yet.</p>}
              </div>
            </FormSection>
             <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleSave} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Changes</button>
            </div>
        </div>
      ) : (
      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
            <DetailTag label="Type" value={ticket.type} />
            <DetailTag label="Status" value={ticket.status} />
            <DetailTag label="Priority" value={ticket.priority} />
            <DetailTag label="Product Area" value={ticket.productArea} />
            <DetailTag label="Platform" value={ticket.platform} />
        </div>
        
        <FormSection title="Details" className="pt-6 border-t border-gray-200">
          <DetailField label="Project" value={projectName} />
          <DetailField label="Submitter" value={ticket.submitterName} />
          <DetailField label="Client" value={ticket.client} />
          <DetailField label="Location" value={ticket.location} />
        </FormSection>

        {ticket.type === TicketType.Issue && (
          <FormSection title="Issue Information" className="pt-6 border-t border-gray-200">
            <div className="col-span-2"><DetailField label="Problem" value={(ticket as IssueTicket).problem} /></div>
            <div className="col-span-2"><DetailField label="Duplication Steps" value={(ticket as IssueTicket).duplicationSteps} /></div>
            <DetailField label="Workaround" value={(ticket as IssueTicket).workaround} />
            <DetailField label="Frequency" value={(ticket as IssueTicket).frequency} />
          </FormSection>
        )}

        {ticket.type === TicketType.FeatureRequest && (
          <FormSection title="Feature Request Information" className="pt-6 border-t border-gray-200">
            <div className="col-span-2"><DetailField label="Improvement" value={(ticket as FeatureRequestTicket).improvement} /></div>
            <div className="col-span-2"><DetailField label="Current Functionality" value={(ticket as FeatureRequestTicket).currentFunctionality} /></div>
            <div className="col-span-2"><DetailField label="Suggested Solution" value={(ticket as FeatureRequestTicket).suggestedSolution} /></div>
            <div className="col-span-2"><DetailField label="Benefits" value={(ticket as FeatureRequestTicket).benefits} /></div>
          </FormSection>
        )}

        <FormSection title="Tracking" className="pt-6 border-t border-gray-200">
            <DetailField label="PMR Number" value={ticket.pmrNumber} />
            <DetailField label="FP Ticket Number" value={ticket.fpTicketNumber} />
            <DetailField label="Ticket Thread ID" value={ticket.ticketThreadId} />
        </FormSection>
        
        <FormSection title="Timeline" className="pt-6 border-t border-gray-200" gridCols={3}>
            <DetailField label="Submission Date" value={new Date(ticket.submissionDate).toLocaleDateString()} />
            <DetailField label="Start Date" value={ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : 'N/A'} />
            <DetailField label="Est. Completion Date" value={ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleDateString() : 'N/A'} />
            {ticket.status === Status.Completed && <DetailField label="Completion Date" value={ticket.completionDate ? new Date(ticket.completionDate).toLocaleDateString() : 'N/A'} />}
        </FormSection>

        {linkedTickets && linkedTickets.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Linked Tickets</h3>
              <div className="space-y-2">
                  {linkedTickets.map(linked => (
                      <div key={linked.id} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm font-medium text-gray-800">{linked.title}</p>
                          <div className="text-xs text-gray-500 mt-1">
                              <span>{linked.type}</span>
                              <span className="mx-1.5">•</span>
                              <span>{linked.status}</span>
                              <span className="mx-1.5">•</span>
                              <span>{linked.priority}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        )}

        {ticket.onHoldReason && ticket.status === Status.OnHold && (
             <div className="pt-6 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Reason for 'On Hold'</h3>
                <p className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">{ticket.onHoldReason}</p>
             </div>
        )}

        {ticket.completionNotes && ticket.status === Status.Completed && (
            <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold text-gray-800">Completion Notes</h3>
                     <button onClick={() => setIsEditingNotes(true)} className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1.5"><PencilIcon className="w-3.5 h-3.5"/> Edit</button>
                </div>
                {isEditingNotes ? (
                    <div>
                        <textarea value={completionNotes} onChange={(e) => setCompletionNotes(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"></textarea>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setIsEditingNotes(false)} className="bg-white text-gray-700 font-semibold px-3 py-1 rounded-md border border-gray-300 text-sm">Cancel</button>
                            <button onClick={handleNotesSave} className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm">Save</button>
                        </div>
                    </div>
                ) : (
                    <p className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 whitespace-pre-wrap">{ticket.completionNotes}</p>
                )}
            </div>
        )}

        <div className="pt-6 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({ticket.updates?.length || 0})</h3>
             <form onSubmit={handleUpdateSubmit} className="p-4 border border-gray-200 rounded-md mb-6 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                
                <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>
                <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-gray-50"/>

                 <div className="relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md">
                        <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-sm w-8 h-8 flex items-center justify-center" aria-label="Bold">B</button>
                        <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 italic text-sm w-8 h-8 flex items-center justify-center" aria-label="Italic">I</button>
                        <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Bulleted List">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                        </button>
                    </div>
                    <div
                        ref={commentEditorRef}
                        contentEditable
                        onInput={handleCommentInput}
                        className="w-full text-sm p-2 min-h-[90px] focus:outline-none rich-text-content"
                        role="textbox"
                        aria-multiline="true"
                        aria-label="New update comment"
                        aria-describedby="char-count"
                    ></div>
                    {/* FIX: Use a conditional div to simulate a placeholder for the contentEditable div. */}
                    {isCommentEmpty && (
                        <div className="absolute top-[49px] left-2 text-sm text-gray-500 pointer-events-none select-none">
                            Type your comment here...
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <p id="char-count" className="text-xs text-gray-500">{textContentLength} / {MAX_COMMENT_LENGTH}</p>
                    <button type="submit" disabled={isCommentEmpty || !authorName.trim() || textContentLength > MAX_COMMENT_LENGTH} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm">Add Update</button>
                </div>
            </form>
            <div className="space-y-4">
            {[...(ticket.updates || [])].reverse().map((update, index) => (
                <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-xs text-gray-500 font-medium">
                        <span className="font-semibold text-gray-700">{update.author}</span>
                        <span className="mx-1.5">•</span>
                        <span>{new Date(update.date).toLocaleString()}</span>
                    </p>
                    <div className="mt-2 text-sm text-gray-800 rich-text-content" dangerouslySetInnerHTML={{ __html: update.comment }}></div>
                </div>
            ))}
            </div>
        </div>
      </div>
      )}
    </div>
  );
};


function App() {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', initialProjects);
  const [dealerships, setDealerships] = useLocalStorage<Dealership[]>('dealerships', initialDealerships);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [features, setFeatures] = useLocalStorage<FeatureAnnouncement[]>('features', initialFeatures);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', initialMeetings);
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [ticketFilters, setTicketFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    productArea: 'all',
  });
  
  const [dealershipFilters, setDealershipFilters] = useState<DealershipFilterState>({
    searchTerm: '',
    status: 'all',
  });
  
  const [meetingFilters, setMeetingFilters] = useState<MeetingFilterState>({ searchTerm: '' });
  
  const [currentView, setCurrentView] = useState<View>('tickets');
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [editingFeature, setEditingFeature] = useState<FeatureAnnouncement | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const allTasks = useMemo(() => {
    const projectTasks = projects.flatMap(p => 
      (p.tasks || []).map(st => ({
        ...st,
        projectId: p.id,
        projectName: p.name
      }))
    );
    const standaloneTasks = tasks.map(t => ({
        ...t,
        projectId: null,
        projectName: 'General'
    }));
    return [...projectTasks, ...standaloneTasks];
  }, [projects, tasks]);
  
  const handleTicketSubmit = (newTicketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
      updates: [],
    } as Ticket;
    
    setTickets(prev => [...prev, newTicket]);
    showToast('Ticket created successfully!', 'success');
    
    // If a project was selected, add this ticket ID to that project
    if (newTicket.projectId) {
      setProjects(prevProjects => prevProjects.map(p => 
        p.id === newTicket.projectId 
          ? { ...p, ticketIds: [...p.ticketIds, newTicket.id] }
          : p
      ));
    }
  };
  
  const handleProjectSubmit = (newProjectData: Omit<Project, 'id' | 'creationDate' | 'tasks' | 'ticketIds'>) => {
      const newProject: Project = {
          ...newProjectData,
          id: crypto.randomUUID(),
          creationDate: new Date().toISOString(),
          tasks: [],
          ticketIds: [],
          meetingIds: [],
          updates: [],
          involvedPeople: [],
      };
      setProjects(prev => [...prev, newProject]);
      showToast('Project created successfully!', 'success');
  };
  
  const handleDealershipSubmit = (newDealershipData: Omit<Dealership, 'id'>) => {
    const newDealership: Dealership = {
      id: crypto.randomUUID(),
      ...newDealershipData,
    };
    setDealerships(prev => [...prev, newDealership]);
    showToast('Dealership account created successfully!', 'success');
  };
  
  const handleFeatureSubmit = (newFeatureData: Omit<FeatureAnnouncement, 'id'>) => {
      const newFeature: FeatureAnnouncement = {
          id: crypto.randomUUID(),
          ...newFeatureData,
      };
      setFeatures(prev => [...prev, newFeature]);
      showToast('Feature announcement added!', 'success');
  };
  
  const handleMeetingSubmit = (newMeetingData: Omit<Meeting, 'id'>) => {
      const newMeeting: Meeting = {
          id: crypto.randomUUID(),
          ...newMeetingData,
      };
      setMeetings(prev => [...prev, newMeeting]);
      showToast('Meeting note saved!', 'success');
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    showToast('Ticket updated successfully!', 'success');
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    showToast('Project updated successfully!', 'success');
  };
  
  const handleUpdateDealership = (updatedDealership: Dealership) => {
      setDealerships(prev => prev.map(d => d.id === updatedDealership.id ? updatedDealership : d));
      showToast('Dealership account updated successfully!', 'success');
      if (selectedDealership?.id === updatedDealership.id) {
          setSelectedDealership(updatedDealership);
      }
  };
  
  const handleUpdateFeature = (updatedFeature: FeatureAnnouncement) => {
      setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
      showToast('Feature announcement updated!', 'success');
  };
  
  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
      setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
      showToast('Meeting note updated!', 'success');
      if (selectedMeeting?.id === updatedMeeting.id) {
        setSelectedMeeting(updatedMeeting);
      }
  };

  const handleDeleteTicket = (ticketId: string) => {
    const ticketToDelete = tickets.find(t => t.id === ticketId);
    if (!ticketToDelete) return;

    setTickets(prev => prev.filter(t => t.id !== ticketId));

    // Also remove from any associated project
    if (ticketToDelete.projectId) {
        setProjects(prev => prev.map(p => {
            if (p.id === ticketToDelete.projectId) {
                return { ...p, ticketIds: p.ticketIds.filter(id => id !== ticketId) };
            }
            return p;
        }));
    }
    showToast('Ticket deleted successfully!', 'success');
    setSelectedTicket(null); // Close side view
  };
  
  const handleDeleteProject = (projectId: string) => {
      const projectToDelete = projects.find(p => p.id === projectId);
      if (!projectToDelete) return;
      
      // Unlink all tickets associated with this project
      setTickets(prevTickets => prevTickets.map(t => {
          if (t.projectId === projectId) {
              const { projectId, ...rest } = t;
              return rest as Ticket;
          }
          return t;
      }));

      setProjects(prev => prev.filter(p => p.id !== projectId));
      showToast('Project deleted successfully!', 'success');
      setSelectedProject(null);
  };
  
  const handleDeleteDealership = (dealershipId: string) => {
      setDealerships(prev => prev.filter(d => d.id !== dealershipId));
      showToast('Dealership account deleted successfully!', 'success');
      setSelectedDealership(null);
  };
  
  const handleDeleteFeature = (featureId: string) => {
    if (window.confirm('Are you sure you want to delete this feature announcement?')) {
        setFeatures(prev => prev.filter(f => f.id !== featureId));
        showToast('Feature announcement deleted!', 'success');
    }
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
      // Also unlink from any projects
      setProjects(prevProjects => prevProjects.map(p => ({
          ...p,
          meetingIds: (p.meetingIds || []).filter(id => id !== meetingId)
      })));

      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      showToast('Meeting note deleted successfully!', 'success');
      setSelectedMeeting(null);
  };
  
  const handleAddUpdate = (id: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { author, date: new Date(date).toISOString(), comment };
    
    if (currentView === 'tickets' && selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, updates: [...(prev.updates || []), newUpdate] } : null);
        setTickets(prevTickets => prevTickets.map(t => t.id === id ? { ...t, updates: [...(t.updates || []), newUpdate] } : t));
    } else if (currentView === 'projects' && selectedProject && selectedProject.id === id) {
        setSelectedProject(prev => prev ? { ...prev, updates: [...(prev.updates || []), newUpdate] } : null);
        setProjects(prevProjects => prevProjects.map(p => p.id === id ? { ...p, updates: [...(p.updates || []), newUpdate] } : p));
    }
    showToast('Update added!', 'success');
  };
  
  const handleUpdateCompletionNotes = (ticketId: string, notes: string) => {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, completionNotes: notes } : t));
      if (selectedTicket?.id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, completionNotes: notes } : null);
      }
      showToast('Completion notes updated!', 'success');
  };
  
  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
      setTickets(prev => prev.map(t => {
          if (t.id === ticketId) {
              const updatedTicket: Ticket = { ...t, status: newStatus };
              if (newStatus === Status.Completed && !t.completionDate) {
                  updatedTicket.completionDate = new Date().toISOString();
              }
              if (newStatus === Status.OnHold) {
                  updatedTicket.onHoldReason = onHoldReason || t.onHoldReason;
              }
              return updatedTicket;
          }
          return t;
      }));
      showToast('Status updated!', 'success');
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const searchTerm = ticketFilters.searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' ||
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.submitterName.toLowerCase().includes(searchTerm) ||
        (ticket.client && ticket.client.toLowerCase().includes(searchTerm)) ||
        (ticket.pmrNumber && ticket.pmrNumber.toLowerCase().includes(searchTerm)) ||
        (ticket.fpTicketNumber && ticket.fpTicketNumber.toLowerCase().includes(searchTerm));
      
      const matchStatus = ticketFilters.status === 'all' || ticket.status === ticketFilters.status;
      const matchPriority = ticketFilters.priority === 'all' || ticket.priority === ticketFilters.priority;
      const matchType = ticketFilters.type === 'all' || ticket.type === ticketFilters.type;
      const matchProductArea = ticketFilters.productArea === 'all' || ticket.productArea === ticketFilters.productArea;

      return matchSearch && matchStatus && matchPriority && matchType && matchProductArea;
    }).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [tickets, ticketFilters]);
  
  const filteredDealerships = useMemo(() => {
      return dealerships.filter(d => {
          const searchTerm = dealershipFilters.searchTerm.toLowerCase();
          const matchSearch = searchTerm === '' ||
              d.name.toLowerCase().includes(searchTerm) ||
              d.accountNumber.toLowerCase().includes(searchTerm) ||
              (d.enterprise && d.enterprise.toLowerCase().includes(searchTerm)) ||
              (d.assignedSpecialist && d.assignedSpecialist.toLowerCase().includes(searchTerm));
          
          const matchStatus = dealershipFilters.status === 'all' || d.status === dealershipFilters.status;
          return matchSearch && matchStatus;
      }).sort((a, b) => a.name.localeCompare(b.name));
  }, [dealerships, dealershipFilters]);
  
  const filteredMeetings = useMemo(() => {
      return meetings.filter(m => {
          const searchTerm = meetingFilters.searchTerm.toLowerCase();
          if (searchTerm === '') return true;
          return m.name.toLowerCase().includes(searchTerm) ||
                 m.attendees.some(a => a.toLowerCase().includes(searchTerm)) ||
                 new Date(m.meetingDate).toLocaleDateString().includes(searchTerm) ||
                 m.notes.toLowerCase().includes(searchTerm);
      }).sort((a,b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
  }, [meetings, meetingFilters]);

  const performanceInsights = useMemo(() => {
    const completedLast30Days = tickets.filter(t => 
      t.status === Status.Completed && 
      t.completionDate && 
      new Date(t.completionDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const completedWithDates = tickets.filter(t => 
      t.status === Status.Completed && t.completionDate && t.startDate
    );
    const totalCompletionDays = completedWithDates.reduce((acc, t) => {
      const start = new Date(t.startDate!).getTime();
      const end = new Date(t.completionDate!).getTime();
      return acc + (end - start) / (1000 * 3600 * 24);
    }, 0);

    return {
      openTickets: tickets.filter(t => t.status !== Status.Completed).length,
      completedLast30Days: completedLast30Days.length,
      avgCompletionDays: completedWithDates.length > 0 ? totalCompletionDays / completedWithDates.length : null,
    };
  }, [tickets]);
  
  const dealershipInsights = useMemo(() => {
    return {
      totalDealerships: dealerships.length,
      liveAccounts: dealerships.filter(d => d.status === DealershipStatus.Live).length,
      onboardingAccounts: dealerships.filter(d => d.status === DealershipStatus.Onboarding).length,
    }
  }, [dealerships]);

  const handleExportTicket = (ticket: Ticket) => {
    let content = `Ticket Title: ${ticket.title}\n`;
    content += `ID: ${ticket.id}\n`;
    content += `Status: ${ticket.status}\n`;
    content += `Priority: ${ticket.priority}\n`;
    // ... add all fields
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Ticket exported!', 'success');
  };
  
  const handleEmailTicket = (ticket: Ticket) => {
      let subject = `Ticket: ${ticket.title}`;
      let body = `Details for ticket #${ticket.id}:\n\n`;
      body += `Title: ${ticket.title}\n`;
      body += `Status: ${ticket.status}\n`;
      body += `Priority: ${ticket.priority}\n`;
      // ... add all fields
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleViewChange = (view: View) => {
      setCurrentView(view);
      setSelectedTicket(null);
      setSelectedProject(null);
      setSelectedDealership(null);
      setSelectedMeeting(null);
      setIsFormOpen(false);
      setIsSidebarOpen(false);
  }

  const getFormTitle = () => {
    switch(currentView) {
      case 'tickets': return 'Create New Ticket';
      case 'projects': return 'Create New Project';
      case 'dealerships': return 'Create New Account';
      case 'features': return 'Add New Feature';
      case 'meetings': return 'Create New Note';
      default: return 'New Item';
    }
  };
  
  const getNewButtonText = () => {
    switch(currentView) {
        case 'tickets': return 'New Ticket';
        case 'projects': return 'New Project';
        case 'dealerships': return 'New Account';
        case 'features': return 'New Feature';
        case 'meetings': return 'New Note';
        default: return 'New Item';
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tickets':
        return <TicketList tickets={filteredTickets} onRowClick={setSelectedTicket} onStatusChange={handleStatusChange} projects={projects} />;
      case 'projects':
        return <ProjectList projects={projects} onProjectClick={setSelectedProject} tickets={tickets} />;
      case 'dealerships':
        return <DealershipList dealerships={filteredDealerships} onDealershipClick={setSelectedDealership} />;
      case 'tasks':
        return <TaskList projects={projects} onUpdateProject={handleUpdateProject} tasks={tasks} setTasks={setTasks} allTasks={allTasks} />;
      case 'features':
        return <FeatureList features={features} onDelete={handleDeleteFeature} onEdit={setEditingFeature} />;
      case 'meetings':
        return <MeetingList meetings={filteredMeetings} onMeetingClick={setSelectedMeeting} meetingFilters={meetingFilters} setMeetingFilters={setMeetingFilters} />;
      default:
        return null;
    }
  };
  
  const renderSideViewContent = () => {
    if (selectedTicket) {
      return <TicketDetailView ticket={selectedTicket} onUpdate={handleUpdateTicket} onAddUpdate={(comment, author, date) => handleAddUpdate(selectedTicket.id, comment, author, date)} onExport={() => handleExportTicket(selectedTicket)} onEmail={() => handleEmailTicket(selectedTicket)} onUpdateCompletionNotes={(notes) => handleUpdateCompletionNotes(selectedTicket.id, notes)} onDelete={handleDeleteTicket} projects={projects} tickets={tickets} />
    }
    if (selectedProject) {
      return <ProjectDetailView project={selectedProject} onUpdate={handleUpdateProject} onDelete={handleDeleteProject} tickets={tickets} onUpdateTicket={handleUpdateTicket} onAddUpdate={(projectId, comment, author, date) => handleAddUpdate(projectId, comment, author, date)} meetings={meetings} onUpdateMeeting={handleUpdateMeeting} allTasks={allTasks} />;
    }
    if (selectedDealership) {
        return <DealershipDetailView dealership={selectedDealership} onUpdate={handleUpdateDealership} onDelete={handleDeleteDealership} />
    }
    if (selectedMeeting) {
        return <MeetingDetailView meeting={selectedMeeting} onUpdate={handleUpdateMeeting} onDelete={handleDeleteMeeting} projects={projects} tickets={tickets} onUpdateProject={handleUpdateProject} onUpdateTicket={handleUpdateTicket} />
    }
    return null;
  };

  const renderModalContent = () => {
    if (isFormOpen && currentView === 'tickets') {
        return <TicketForm onSubmit={(data) => { handleTicketSubmit(data); setIsFormOpen(false); }} projects={projects} />
    }
    if (isFormOpen && currentView === 'projects') {
        return <ProjectForm onSubmit={(data) => { handleProjectSubmit(data); setIsFormOpen(false); }} />
    }
    if (isFormOpen && currentView === 'dealerships') {
        return <DealershipForm onSubmit={(data) => { handleDealershipSubmit(data); setIsFormOpen(false); }} onUpdate={() => {}} dealershipToEdit={null} onClose={() => setIsFormOpen(false)} />
    }
     if ((isFormOpen || editingFeature) && currentView === 'features') {
        return <FeatureForm onSubmit={(data) => { handleFeatureSubmit(data); setIsFormOpen(false); }} onUpdate={(data) => { handleUpdateFeature(data); setEditingFeature(null); }} featureToEdit={editingFeature} onClose={() => { setIsFormOpen(false); setEditingFeature(null); }} />
    }
    if (isFormOpen && currentView === 'meetings') {
        return <MeetingForm onSubmit={(data) => { handleMeetingSubmit(data); setIsFormOpen(false); }} onClose={() => setIsFormOpen(false)} />
    }
    return null;
  };
  
  const getSideViewTitle = () => {
      if (selectedTicket) return selectedTicket.title;
      if (selectedProject) return selectedProject.name;
      if (selectedDealership) return selectedDealership.name;
      if (selectedMeeting) return selectedMeeting.name;
      return 'Details';
  };
  
  const getModalTitle = () => {
      if (editingFeature) return 'Edit Feature Announcement';
      return getFormTitle();
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <LeftSidebar 
        ticketFilters={ticketFilters} 
        setTicketFilters={setTicketFilters} 
        dealershipFilters={dealershipFilters}
        setDealershipFilters={setDealershipFilters}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-200" aria-label="Open sidebar">
                    <MenuIcon className="w-6 h-6"/>
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
                    {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                </h1>
            </div>
            { (currentView === 'tickets' || currentView === 'projects' || currentView === 'dealerships' || currentView === 'features' || currentView === 'meetings') &&
                <button onClick={() => { setIsFormOpen(true); setEditingFeature(null); }} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{getNewButtonText()}</span>
                </button>
            }
        </div>
        
        {currentView === 'tickets' && <PerformanceInsights {...performanceInsights} />}
        {currentView === 'dealerships' && <DealershipInsights {...dealershipInsights} />}

        {renderCurrentView()}
      </main>
      
      {(isFormOpen || editingFeature) && currentView !== 'tasks' && (
        <Modal title={getModalTitle()} onClose={() => { setIsFormOpen(false); setEditingFeature(null); }}>
          {renderModalContent()}
        </Modal>
      )}

      <SideView 
        title={getSideViewTitle()}
        isOpen={!!selectedTicket || !!selectedProject || !!selectedDealership || !!selectedMeeting}
        onClose={() => {
            setSelectedTicket(null);
            setSelectedProject(null);
            setSelectedDealership(null);
            setSelectedMeeting(null);
        }}
      >
        {renderSideViewContent()}
      </SideView>
    </div>
  );
}

export default App;
