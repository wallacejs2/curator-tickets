

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

const TicketDetailView = ({ ticket, onUpdate, onAddUpdate, onExport, onEmail, onUpdateCompletionNotes, onDelete, projects }: { ticket: Ticket, onUpdate: (ticket: Ticket) => void, onAddUpdate: (comment: string, author: string, date: string) => void, onExport: () => void, onEmail: () => void, onUpdateCompletionNotes: (notes: string) => void, onDelete: (ticketId: string) => void, projects: Project[] }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(ticket.completionNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editableTicket, setEditableTicket] = useState<Ticket>(ticket);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
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
    const commentText = commentEditorRef.current?.textContent?.trim() || '';
    const commentHtml = commentEditorRef.current?.innerHTML || '';

    if (commentText && authorName.trim() && updateDate && textContentLength <= MAX_COMMENT_LENGTH) {
      onAddUpdate(commentHtml, authorName.trim(), updateDate);
      setNewUpdate('');
      setTextContentLength(0);
      setIsCommentEmpty(true);
      if (commentEditorRef.current) {
        commentEditorRef.current.innerHTML = '';
      }
    }
  };
  
  const handleSaveNotes = () => {
    onUpdateCompletionNotes(completionNotes);
    setIsEditingNotes(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => {
        const newState = { ...prev!, [name]: value };
        if (name === 'type') {
          // If the current priority is not valid for the new type, reset it to a default.
          const currentPriority = newState.priority;
          const isIssue = value === TicketType.Issue;
          const validPriorities = isIssue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS;
          if (!validPriorities.includes(currentPriority as Priority)) {
              newState.priority = isIssue ? Priority.P3 : Priority.P5;
          }
        }
        return newState;
    });
  };
  
  const handleSave = () => {
    const toSafeISOString = (dateString: string | undefined) => {
      if (!dateString) return undefined;
      // If it's just a date string (from date input), add time to parse as local date
      if (!dateString.includes('T')) {
        return new Date(`${dateString}T00:00:00`).toISOString();
      }
      // Otherwise, it's likely already an ISO string, just re-parse to be safe
      return new Date(dateString).toISOString();
    };

    let finalTicket = {
      ...editableTicket,
      startDate: toSafeISOString(editableTicket.startDate),
      estimatedCompletionDate: toSafeISOString(editableTicket.estimatedCompletionDate),
    };
    
    if (finalTicket.projectId === '') finalTicket.projectId = undefined;

    onUpdate(finalTicket);
    setIsEditing(false);
  };
  
  const projectName = ticket.projectId ? (projects.find(p => p.id === ticket.projectId)?.name || 'N/A') : 'None';

  if (isEditing) {
    const issueTicket = editableTicket as IssueTicket;
    const featureRequestTicket = editableTicket as FeatureRequestTicket;
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="flex justify-end items-center gap-3 mb-6">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">Save Changes</button>
            </div>
             <FormSection title="Core Information">
                <div className="col-span-2">
                    <label className={labelClasses}>Title</label>
                    <input type="text" name="title" value={editableTicket.title} onChange={handleFormChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Submitter Name</label>
                    <input type="text" name="submitterName" value={editableTicket.submitterName} onChange={handleFormChange} required className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>Client</label>
                    <input type="text" name="client" value={editableTicket.client || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Location of Feature/Issue</label>
                    <input type="text" name="location" value={editableTicket.location} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
             </FormSection>

             <FormSection title="Categorization" gridCols={3}>
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
             </FormSection>

             <FormSection title="Tracking & Status">
                 <div>
                    <label className={labelClasses}>Status</label>
                    <select name="status" value={editableTicket.status} onChange={handleFormChange} className={formElementClasses}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>Priority</label>
                    <select name="priority" value={editableTicket.priority} onChange={handleFormChange} className={formElementClasses}>
                        {(editableTicket.type === TicketType.Issue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={labelClasses}>Start Date</label>
                    <input type="date" name="startDate" value={editableTicket.startDate?.split('T')[0] || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                 <div>
                    <label className={labelClasses}>Est. Completion</label>
                    <input type="date" name="estimatedCompletionDate" value={editableTicket.estimatedCompletionDate?.split('T')[0] || ''} onChange={handleFormChange} className={formElementClasses} />
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
                        <label htmlFor="onHoldReason" className={labelClasses}>Reason for On Hold Status</label>
                        <textarea id="onHoldReason" name="onHoldReason" value={editableTicket.onHoldReason || ''} onChange={handleFormChange} rows={2} required className={formElementClasses} placeholder="Explain why this ticket is on hold..." />
                    </div>
                )}
             </FormSection>

            <FormSection title="External Identifiers" gridCols={2}>
                <div>
                    <label className={labelClasses}>PMR Number</label>
                    <input type="text" name="pmrNumber" value={editableTicket.pmrNumber || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div>
                    <label className={labelClasses}>FP Ticket Number</label>
                    <input type="text" name="fpTicketNumber" value={editableTicket.fpTicketNumber || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>Ticket Thread ID</label>
                    <input type="text" name="ticketThreadId" value={editableTicket.ticketThreadId || ''} onChange={handleFormChange} className={formElementClasses} />
                </div>
            </FormSection>
            
            <FormSection title={editableTicket.type === TicketType.Issue ? 'Issue Details' : 'Feature Request Details'} gridCols={1}>
                {editableTicket.type === TicketType.Issue ? (
                    <div className="space-y-5">
                        <div><label className={labelClasses}>Problem</label><textarea name="problem" value={issueTicket.problem} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div><label className={labelClasses}>Duplication Steps</label><textarea name="duplicationSteps" value={issueTicket.duplicationSteps} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div><label className={labelClasses}>Workaround</label><textarea name="workaround" value={issueTicket.workaround} onChange={handleFormChange} rows={2} className={formElementClasses}></textarea></div>
                        <div><label className={labelClasses}>Frequency</label><textarea name="frequency" value={issueTicket.frequency} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                    </div>
                ) : (
                    <div className="space-y-5">
                            <div><label className={labelClasses}>Improvement</label><textarea name="improvement" value={featureRequestTicket.improvement} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                            <div><label className={labelClasses}>Current Functionality</label><textarea name="currentFunctionality" value={featureRequestTicket.currentFunctionality} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                            <div><label className={labelClasses}>Suggested Solution</label><textarea name="suggestedSolution" value={featureRequestTicket.suggestedSolution} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                            <div><label className={labelClasses}>Benefits</label><textarea name="benefits" value={featureRequestTicket.benefits} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                    </div>
                )}
            </FormSection>
        </form>
    );
  }

  return (
    <div>
      {isDeleteModalOpen && (
        <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
            <p className="text-gray-700">Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                <button onClick={() => { onDelete(ticket.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Ticket</button>
            </div>
        </Modal>
      )}

      <div className="flex justify-end items-center gap-3 mb-6">
        <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
        <button onClick={onEmail} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"><EmailIcon className="w-4 h-4"/><span>Email</span></button>
        <button onClick={onExport} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"><DownloadIcon className="w-4 h-4"/><span>Export</span></button>
        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
      </div>
      
      <div className="space-y-8">
        {/* Core Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DetailTag label="Status" value={ticket.status} />
          <DetailTag label="Priority" value={ticket.priority} />
          <DetailTag label="Type" value={ticket.type} />
          <DetailTag label="Product Area" value={ticket.productArea} />
          <DetailTag label="Platform" value={ticket.platform} />
          <DetailField label="Project" value={projectName} />
        </div>

        {/* Detailed Info */}
        <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DetailField label="Submitter" value={ticket.submitterName} />
          <DetailField label="Client" value={ticket.client} />
          <DetailField label="Location" value={ticket.location} />
          <DetailField label="PMR Number" value={ticket.pmrNumber} />
          <DetailField label="FP Ticket #" value={ticket.fpTicketNumber} />
          <DetailField label="Thread ID" value={ticket.ticketThreadId} />
        </div>

        {/* Dates */}
        <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DetailField label="Submitted On" value={new Date(ticket.submissionDate).toLocaleString()} />
            <DetailField label="Start Date" value={ticket.startDate ? new Date(ticket.startDate).toLocaleString() : 'N/A'} />
            <DetailField label="Est. Completion" value={ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleString() : 'N/A'} />
        </div>
        
        {ticket.status === Status.OnHold && ticket.onHoldReason && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">On Hold Reason</h3>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                {ticket.onHoldReason}
            </div>
          </div>
        )}

        {/* Specific Fields */}
        <div className="border-t border-gray-200 pt-6">
          {ticket.type === TicketType.Issue ? (
            <div className="space-y-6">
              <DetailField label="Problem" value={(ticket as IssueTicket).problem} />
              <DetailField label="Duplication Steps" value={(ticket as IssueTicket).duplicationSteps} />
              <DetailField label="Workaround" value={(ticket as IssueTicket).workaround} />
              <DetailField label="Frequency" value={(ticket as IssueTicket).frequency} />
            </div>
          ) : (
            <div className="space-y-6">
              <DetailField label="Improvement" value={(ticket as FeatureRequestTicket).improvement} />
              <DetailField label="Current Functionality" value={(ticket as FeatureRequestTicket).currentFunctionality} />
              <DetailField label="Suggested Solution" value={(ticket as FeatureRequestTicket).suggestedSolution} />
              <DetailField label="Benefits" value={(ticket as FeatureRequestTicket).benefits} />
            </div>
          )}
        </div>

        {/* Updates Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({ticket.updates?.length || 0})</h3>
          
          <form onSubmit={handleUpdateSubmit} className="p-3 border border-gray-200 rounded-md mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Add a new update</h4>
            <div className="mb-2">
                <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Jayden"
                    required
                    className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
             <div className="mb-2">
                <input
                    type="date"
                    value={updateDate}
                    onChange={(e) => setUpdateDate(e.target.value)}
                    required
                    className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            {/* Fix: Replaced invalid 'placeholder' attribute with a custom placeholder implementation for contentEditable div */}
            <div className="relative border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                <div className="p-1 border-b border-gray-300 bg-gray-50 flex items-center gap-1 rounded-t-md">
                    <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 font-bold text-sm w-8 h-8 flex items-center justify-center" aria-label="Bold">B</button>
                    <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 italic text-sm w-8 h-8 flex items-center justify-center" aria-label="Italic">I</button>
                    <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200 text-gray-700 text-sm w-8 h-8 flex items-center justify-center" aria-label="Bulleted List">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                    </button>
                </div>
                <div
                    ref={commentEditorRef}
                    contentEditable
                    onInput={handleCommentInput}
                    className="w-full text-sm p-2 min-h-[80px] focus:outline-none"
                    role="textbox"
                    aria-multiline="true"
                    aria-label="Update comment"
                />
                {isCommentEmpty && (
                    <div className="absolute top-[49px] left-2 text-sm text-gray-500 pointer-events-none select-none">
                        Type your comment here...
                    </div>
                )}
            </div>
            <div className={`text-right text-xs mt-1 ${textContentLength > MAX_COMMENT_LENGTH ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                {textContentLength} / {MAX_COMMENT_LENGTH}
            </div>

            <div className="flex justify-end mt-2">
                <button 
                    type="submit"
                    disabled={isCommentEmpty || textContentLength > MAX_COMMENT_LENGTH}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm disabled:bg-blue-300 disabled:cursor-not-allowed">
                    Add Update
                </button>
            </div>
          </form>
          
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {ticket.updates && ticket.updates.length > 0 ? (
              [...ticket.updates].reverse().map((update, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                        <span className="font-semibold text-gray-700">{update.author}</span> - {new Date(update.date).toLocaleString()}
                    </p>
                    <div className="text-sm text-gray-800 rich-text-content" dangerouslySetInnerHTML={{ __html: update.comment }} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No updates have been added yet.</p>
            )}
          </div>
        </div>
        
        {/* Completion Notes Section */}
        <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-800">Completion Notes</h3>
                {!isEditingNotes && ticket.status === Status.Completed && (
                    <button onClick={() => setIsEditingNotes(true)} className="text-sm font-semibold text-blue-600 hover:underline">Edit Notes</button>
                )}
            </div>
            {isEditingNotes ? (
                <div>
                    <textarea value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    <div className="flex justify-end gap-2 mt-2">
                         <button onClick={() => setIsEditingNotes(false)} className="text-sm font-semibold text-gray-600 px-3 py-1 rounded-md hover:bg-gray-100">Cancel</button>
                        <button onClick={handleSaveNotes} className="text-sm font-semibold text-white bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.completionNotes || 'No completion notes added.'}</p>
            )}
        </div>

      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', initialProjects);
  const [dealerships, setDealerships] = useLocalStorage<Dealership[]>('dealerships', initialDealerships);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [features, setFeatures] = useLocalStorage<FeatureAnnouncement[]>('features', initialFeatures);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', initialMeetings);

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
  
  const [meetingFilters, setMeetingFilters] = useState<MeetingFilterState>({
    searchTerm: '',
  });

  const [currentView, setCurrentView] = useState<View>('tickets');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isSideViewOpen, setIsSideViewOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [isDealershipFormOpen, setIsDealershipFormOpen] = useState(false);
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [featureToEdit, setFeatureToEdit] = useState<FeatureAnnouncement | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isMeetingFormOpen, setIsMeetingFormOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();


  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(ticket => {
        const searchTermLower = ticketFilters.searchTerm.toLowerCase();
        const ticketDescription = ticket.type === TicketType.Issue ? (ticket as IssueTicket).problem : (ticket as FeatureRequestTicket).improvement;
        const matchesSearch =
          ticket.title.toLowerCase().includes(searchTermLower) ||
          ticketDescription.toLowerCase().includes(searchTermLower) ||
          ticket.submitterName.toLowerCase().includes(searchTermLower) ||
          (ticket.client && ticket.client.toLowerCase().includes(searchTermLower)) ||
          ticket.id.toLowerCase().includes(searchTermLower) ||
          (ticket.pmrNumber && ticket.pmrNumber.toLowerCase().includes(searchTermLower)) ||
          (ticket.fpTicketNumber && ticket.fpTicketNumber.toLowerCase().includes(searchTermLower));

        const matchesStatus = ticketFilters.status === 'all' || ticket.status === ticketFilters.status;
        const matchesPriority = ticketFilters.priority === 'all' || ticket.priority === ticketFilters.priority;
        const matchesType = ticketFilters.type === 'all' || ticket.type === ticketFilters.type;
        const matchesProductArea = ticketFilters.productArea === 'all' || ticket.productArea === ticketFilters.productArea;

        return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProductArea;
      })
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [tickets, ticketFilters]);
  
  const filteredDealerships = useMemo(() => {
    return dealerships
        .filter(dealership => {
            const searchTermLower = dealershipFilters.searchTerm.toLowerCase();
            const matchesSearch =
                dealership.name.toLowerCase().includes(searchTermLower) ||
                dealership.accountNumber.toLowerCase().includes(searchTermLower) ||
                (dealership.enterprise && dealership.enterprise.toLowerCase().includes(searchTermLower)) ||
                (dealership.assignedSpecialist && dealership.assignedSpecialist.toLowerCase().includes(searchTermLower));

            const matchesStatus = dealershipFilters.status === 'all' || dealership.status === dealershipFilters.status;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [dealerships, dealershipFilters]);
  
  const filteredMeetings = useMemo(() => {
    return meetings
      .filter(meeting => {
        const searchTermLower = meetingFilters.searchTerm.toLowerCase();
        if (!searchTermLower) return true;

        // Create a temporary div to parse HTML and get plain text for searching
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = meeting.notes;
        const notesText = tempDiv.textContent || tempDiv.innerText || "";

        const matchesSearch =
          meeting.name.toLowerCase().includes(searchTermLower) ||
          notesText.toLowerCase().includes(searchTermLower) ||
          meeting.attendees.some(attendee => attendee.toLowerCase().includes(searchTermLower));
        
        return matchesSearch;
      });
  }, [meetings, meetingFilters]);

  const performanceInsights = useMemo(() => {
    const openTickets = tickets.filter(t => t.status !== Status.Completed).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const completedLast30Days = tickets.filter(t => 
        t.status === Status.Completed && 
        t.completionDate && 
        new Date(t.completionDate) > thirtyDaysAgo
    ).length;
    
    const completedTicketsWithDates = tickets.filter(t =>
        t.status === Status.Completed && t.startDate && t.completionDate
    );
    
    const avgCompletionDays = completedTicketsWithDates.length > 0
        ? completedTicketsWithDates.reduce((acc, t) => {
            const start = new Date(t.startDate!).getTime();
            const end = new Date(t.completionDate!).getTime();
            const diffDays = (end - start) / (1000 * 3600 * 24);
            return acc + diffDays;
        }, 0) / completedTicketsWithDates.length
        : null;

    return { openTickets, completedLast30Days, avgCompletionDays };
}, [tickets]);

  const dealershipInsights = useMemo(() => {
    const totalDealerships = dealerships.length;
    const liveAccounts = dealerships.filter(d => d.status === DealershipStatus.Live).length;
    const onboardingAccounts = dealerships.filter(d => d.status === DealershipStatus.Onboarding).length;
    return { totalDealerships, liveAccounts, onboardingAccounts };
  }, [dealerships]);


  const closeSideView = () => {
    setIsSideViewOpen(false);
    setSelectedTicket(null);
    setSelectedProject(null);
    setSelectedDealership(null);
    setSelectedMeeting(null);
  };

  // Click handlers for opening side panel
  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedProject(null);
    setSelectedDealership(null);
    setSelectedMeeting(null);
    setIsSideViewOpen(true);
  };
  
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setSelectedTicket(null);
    setSelectedDealership(null);
    setSelectedMeeting(null);
    setIsSideViewOpen(true);
  };

  const handleDealershipClick = (dealership: Dealership) => {
    setSelectedDealership(dealership);
    setSelectedTicket(null);
    setSelectedProject(null);
    setSelectedMeeting(null);
    setIsSideViewOpen(true);
  };
  
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setSelectedTicket(null);
    setSelectedProject(null);
    setSelectedDealership(null);
    setIsSideViewOpen(true);
  };

  // Ticket CRUD and actions
  const handleAddNewTicket = (newTicketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    const newTicket = {
      ...newTicketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
    };
    setTickets(prev => [...prev, newTicket]);
    setIsTicketFormOpen(false);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    // Also update the selected ticket if it's the one being edited
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
        setSelectedTicket(updatedTicket);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    // If the deleted ticket was selected, close the side view
    if (selectedTicket && selectedTicket.id === ticketId) {
        closeSideView();
    }
  };

  const handleAddUpdateToTicket = (ticketId: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { author, date: new Date(date).toISOString(), comment };
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, updates: [...(ticket.updates || []), newUpdate] }
          : ticket
      )
    );
  };
  
  const handleUpdateCompletionNotes = (ticketId: string, notes: string) => {
     setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, completionNotes: notes }
          : ticket
      )
    );
  };
  
  const handleTicketStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updatedTicket: Ticket = { ...t, status: newStatus };
        if (newStatus === Status.Completed) {
            updatedTicket.completionDate = new Date().toISOString();
        }
        if (newStatus === Status.OnHold) {
            updatedTicket.onHoldReason = onHoldReason || t.onHoldReason;
        } else {
            updatedTicket.onHoldReason = undefined;
        }
        return updatedTicket;
      }
      return t;
    }));
  };

  // Project CRUD
  const handleAddNewProject = (newProjectData: Omit<Project, 'id' | 'creationDate' | 'tasks' | 'ticketIds'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: crypto.randomUUID(),
      creationDate: new Date().toISOString(),
      tasks: [],
      ticketIds: [],
    };
    setProjects(prev => [newProject, ...prev]);
    setIsProjectFormOpen(false);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
     if (selectedProject && selectedProject.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    // Also unlink tickets associated with this project
    setTickets(prevTickets => prevTickets.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t));
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject && selectedProject.id === projectId) {
        closeSideView();
    }
  };

  const handleAddUpdateToProject = (projectId: string, comment: string, author: string, date: string) => {
    const newUpdate: Update = { author, date: new Date(date).toISOString(), comment };
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, updates: [...(project.updates || []), newUpdate] }
          : project
      )
    );
  };

  // Dealership CRUD
  const handleAddNewDealership = (newDealershipData: Omit<Dealership, 'id'>) => {
    const newDealership: Dealership = { ...newDealershipData, id: crypto.randomUUID() };
    setDealerships(prev => [newDealership, ...prev]);
    showToast('Account created successfully!', 'success');
  };
  
  const handleUpdateDealership = (updatedDealership: Dealership) => {
    setDealerships(prev => prev.map(d => d.id === updatedDealership.id ? updatedDealership : d));
     if (selectedDealership && selectedDealership.id === updatedDealership.id) {
        setSelectedDealership(updatedDealership);
    }
    showToast('Account updated successfully!', 'success');
  };
  
  const handleDeleteDealership = (dealershipId: string) => {
    setDealerships(prev => prev.filter(d => d.id !== dealershipId));
    if (selectedDealership && selectedDealership.id === dealershipId) {
        closeSideView();
    }
    showToast('Account deleted successfully.', 'success');
  };

  // Feature CRUD
  const handleAddNewFeature = (newFeatureData: Omit<FeatureAnnouncement, 'id'>) => {
    const newFeature: FeatureAnnouncement = { ...newFeatureData, id: crypto.randomUUID() };
    setFeatures(prev => [newFeature, ...prev]);
    setIsFeatureFormOpen(false);
    showToast('Feature announcement added!', 'success');
  };

  const handleUpdateFeature = (updatedFeature: FeatureAnnouncement) => {
    setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
    setFeatureToEdit(null);
    setIsFeatureFormOpen(false);
    showToast('Feature announcement updated!', 'success');
  };
  
  const handleDeleteFeature = (featureId: string) => {
    if (window.confirm("Are you sure you want to delete this feature announcement?")) {
      setFeatures(prev => prev.filter(f => f.id !== featureId));
      showToast('Feature announcement deleted.', 'success');
    }
  };
  
  // Meeting CRUD
  const handleAddNewMeeting = (newMeetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = { ...newMeetingData, id: crypto.randomUUID() };
    setMeetings(prev => [newMeeting, ...prev]);
    setIsMeetingFormOpen(false);
    showToast('Meeting note created!', 'success');
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
     if (selectedMeeting && selectedMeeting.id === updatedMeeting.id) {
        setSelectedMeeting(updatedMeeting);
    }
    showToast('Meeting note updated!', 'success');
  };

  const handleDeleteMeeting = (meetingId: string) => {
    // Also unlink projects
    setProjects(prev => prev.map(p => ({ ...p, meetingIds: (p.meetingIds || []).filter(id => id !== meetingId) })));
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      closeSideView();
    }
    showToast('Meeting note deleted.', 'success');
  };

  const exportTicketAsText = () => {
    if (!selectedTicket) return;
    const { title, updates, ...rest } = selectedTicket;
    let content = `Ticket: ${title}\n\n`;
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        content += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
      }
    }
    if (updates && updates.length > 0) {
      content += "\n--- Updates ---\n";
      updates.forEach(u => {
        content += `[${new Date(u.date).toLocaleString()}] ${u.author}:\n${u.comment}\n\n`;
      });
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/ /g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const emailTicketSummary = () => {
      if (!selectedTicket) return;
      const subject = `Ticket Summary: ${selectedTicket.title}`;
      let body = `Ticket: ${selectedTicket.title}\n`;
      body += `Status: ${selectedTicket.status}\n`;
      body += `Priority: ${selectedTicket.priority}\n\n`;
      if (selectedTicket.type === TicketType.Issue) {
        body += `Problem: ${(selectedTicket as IssueTicket).problem}\n`;
      } else {
        body += `Improvement: ${(selectedTicket as FeatureRequestTicket).improvement}\n`;
      }
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.tickets && data.projects && data.dealerships && data.tasks && data.features && data.meetings) {
            setTickets(data.tickets);
            setProjects(data.projects);
            setDealerships(data.dealerships);
            setTasks(data.tasks);
            setFeatures(data.features);
            setMeetings(data.meetings);
            showToast('Data imported successfully!', 'success');
          } else {
            showToast('Invalid data file format.', 'error');
          }
        } catch (error) {
          showToast('Failed to parse data file.', 'error');
        } finally {
            // Reset the file input value to allow re-uploading the same file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportData = () => {
    const data = { tickets, projects, dealerships, tasks, features, meetings };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curator_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  };
  
  const renderView = () => {
    switch (currentView) {
      case 'tickets':
        return <TicketList tickets={filteredTickets} onRowClick={handleTicketClick} onStatusChange={handleTicketStatusChange} />;
      case 'projects':
        return <ProjectList projects={projects} onProjectClick={handleProjectClick} tickets={tickets} />;
      case 'dealerships':
        return <DealershipList dealerships={filteredDealerships} onDealershipClick={handleDealershipClick} />;
      case 'tasks':
        return <TaskList projects={projects} onUpdateProject={handleUpdateProject} tasks={tasks} setTasks={setTasks} />;
      case 'features':
        return <FeatureList features={features} onDelete={handleDeleteFeature} onEdit={(feature) => { setFeatureToEdit(feature); setIsFeatureFormOpen(true); }} />;
      case 'meetings':
        return <MeetingList meetings={filteredMeetings} onMeetingClick={handleMeetingClick} />;
      default:
        return <div>Select a view</div>;
    }
  };
  
  const renderInsights = () => {
    switch (currentView) {
        case 'tickets':
            return <PerformanceInsights {...performanceInsights} />;
        case 'dealerships':
            return <DealershipInsights {...dealershipInsights} />;
        default:
            return null;
    }
  };

  const getSideViewTitle = () => {
    if (selectedTicket) return selectedTicket.title;
    if (selectedProject) return selectedProject.name;
    if (selectedDealership) return selectedDealership.name;
    if (selectedMeeting) return selectedMeeting.name;
    return 'Details';
  };

  const getNewItemButton = () => {
    switch (currentView) {
        case 'tickets':
            return { label: 'New Ticket', onClick: () => setIsTicketFormOpen(true) };
        case 'projects':
            return { label: 'New Project', onClick: () => setIsProjectFormOpen(true) };
        case 'dealerships':
            return { label: 'New Account', onClick: () => setIsDealershipFormOpen(true) };
        case 'features':
            return { label: 'New Announcement', onClick: () => { setFeatureToEdit(null); setIsFeatureFormOpen(true); } };
        case 'meetings':
            return { label: 'New Note', onClick: () => setIsMeetingFormOpen(true) };
        default:
            return null;
    }
  };
  
  const newItemButton = getNewItemButton();

  return (
    <div className="flex h-screen bg-gray-100">
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      
      {isTicketFormOpen && (
        <Modal title="Create New Ticket" onClose={() => setIsTicketFormOpen(false)}>
          <TicketForm onSubmit={handleAddNewTicket} projects={projects} />
        </Modal>
      )}

      {isProjectFormOpen && (
        <Modal title="Create New Project" onClose={() => setIsProjectFormOpen(false)}>
            <ProjectForm onSubmit={handleAddNewProject} />
        </Modal>
      )}

      {isDealershipFormOpen && (
        <Modal title="Create New Dealership Account" onClose={() => setIsDealershipFormOpen(false)}>
            <DealershipForm onSubmit={handleAddNewDealership} onUpdate={()=>{}} onClose={() => setIsDealershipFormOpen(false)} />
        </Modal>
      )}

      {isFeatureFormOpen && (
        <Modal title={featureToEdit ? "Edit Feature Announcement" : "New Feature Announcement"} onClose={() => { setIsFeatureFormOpen(false); setFeatureToEdit(null); }}>
            <FeatureForm 
                onSubmit={handleAddNewFeature} 
                onUpdate={handleUpdateFeature} 
                featureToEdit={featureToEdit}
                onClose={() => { setIsFeatureFormOpen(false); setFeatureToEdit(null); }}
            />
        </Modal>
      )}
      
      {isMeetingFormOpen && (
        <Modal title="Create New Meeting Note" onClose={() => setIsMeetingFormOpen(false)}>
            <MeetingForm onSubmit={handleAddNewMeeting} onClose={() => setIsMeetingFormOpen(false)} />
        </Modal>
      )}

      <LeftSidebar
        ticketFilters={ticketFilters}
        setTicketFilters={setTicketFilters}
        dealershipFilters={dealershipFilters}
        setDealershipFilters={setDealershipFilters}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onViewChange={(view) => { setCurrentView(view); closeSideView(); }}
      />
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mr-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 ring-gray-400"
              aria-label="Open sidebar"
            >
              <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{currentView}</h1>
          </div>
          <div className="flex items-center gap-3">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                <UploadIcon className="w-4 h-4" />
                <span>Import</span>
            </button>
            <button onClick={handleExportData} className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                <DownloadIcon className="w-4 h-4" />
                <span>Export</span>
            </button>
            {newItemButton && (
                <button onClick={newItemButton.onClick} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                  <PlusIcon className="w-4 h-4" />
                  <span>{newItemButton.label}</span>
                </button>
            )}
          </div>
        </header>

        {renderInsights()}
        
        {renderView()}
      </main>

      <SideView title={getSideViewTitle()} isOpen={isSideViewOpen} onClose={closeSideView}>
        {selectedTicket && (
          <TicketDetailView
            ticket={selectedTicket}
            onUpdate={handleUpdateTicket}
            onAddUpdate={(comment, author, date) => handleAddUpdateToTicket(selectedTicket.id, comment, author, date)}
            onExport={exportTicketAsText}
            onEmail={emailTicketSummary}
            onUpdateCompletionNotes={(notes) => handleUpdateCompletionNotes(selectedTicket.id, notes)}
            onDelete={handleDeleteTicket}
            projects={projects}
          />
        )}
        {selectedProject && (
            <ProjectDetailView 
                project={selectedProject}
                onUpdate={handleUpdateProject}
                onDelete={handleDeleteProject}
                tickets={tickets}
                onUpdateTicket={handleUpdateTicket}
                onAddUpdate={handleAddUpdateToProject}
                meetings={meetings}
                onUpdateMeeting={handleUpdateMeeting}
            />
        )}
        {selectedDealership && (
            <DealershipDetailView
                dealership={selectedDealership}
                onUpdate={handleUpdateDealership}
                onDelete={handleDeleteDealership}
            />
        )}
        {selectedMeeting && (
          <MeetingDetailView
            meeting={selectedMeeting}
            onUpdate={handleUpdateMeeting}
            onDelete={handleDeleteMeeting}
            projects={projects}
            tickets={tickets}
            onUpdateProject={handleUpdateProject}
            onUpdateTicket={handleUpdateTicket}
          />
        )}
      </SideView>
    </div>
  );
};

export default App;
