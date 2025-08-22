
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ticket, FilterState, IssueTicket, FeatureRequestTicket, TicketType, Update, Status, Priority, ProductArea, Platform } from './types.ts';
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
import { initialTickets } from './mockData.ts';
import { UploadIcon } from './components/icons/UploadIcon.tsx';


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

const TicketDetailView = ({ ticket, onUpdate, onAddUpdate, onExport, onEmail, onUpdateCompletionNotes, onDelete }: { ticket: Ticket, onUpdate: (ticket: Ticket) => void, onAddUpdate: (comment: string, author: string) => void, onExport: () => void, onEmail: () => void, onUpdateCompletionNotes: (notes: string) => void, onDelete: (ticketId: string) => void }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(ticket.completionNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editableTicket, setEditableTicket] = useState<Ticket>(ticket);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setEditableTicket(ticket);
    setIsEditing(false); // Exit edit mode if the selected ticket changes
  }, [ticket]);

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim()) {
      onAddUpdate(newUpdate.trim(), authorName.trim());
      setNewUpdate('');
    }
  };
  
  const handleSaveNotes = () => {
    onUpdateCompletionNotes(completionNotes);
    setIsEditingNotes(false);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTicket(prev => ({ ...prev!, [name]: value }));
  };
  
  const handleSave = () => {
    let finalTicket = { ...editableTicket };
    // Handle date conversions
    if (finalTicket.startDate) finalTicket.startDate = new Date(finalTicket.startDate).toISOString();
    if (finalTicket.estimatedCompletionDate) finalTicket.estimatedCompletionDate = new Date(finalTicket.estimatedCompletionDate).toISOString();

    onUpdate(finalTicket);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="flex justify-end items-center gap-3 mb-6">
                <button type="button" onClick={() => setIsEditing(false)} className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm">
                    Save Changes
                </button>
            </div>

            <FormSection title="Core Information">
                <div className="col-span-2">
                    <label className={labelClasses}>Title</label>
                    <input type="text" name="title" value={editableTicket.title} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>Submitter Name</label>
                    <input type="text" name="submitterName" value={editableTicket.submitterName} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>Client</label>
                    <input type="text" name="client" value={editableTicket.client} onChange={handleFormChange} placeholder="e.g., ABC Motors" className={formElementClasses}/>
                </div>
                 <div>
                    <label className={labelClasses}>Platform</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                        {Object.values(Platform).map(opt => (
                            <label key={opt} className="flex items-center text-sm">
                                <input type="radio" name="platform" value={opt} checked={editableTicket.platform === opt} onChange={handleFormChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                                <span className="ml-2 text-gray-800">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className={labelClasses}>Location of Feature/Issue</label>
                    <input type="text" name="location" value={editableTicket.location} onChange={handleFormChange} required className={formElementClasses}/>
                </div>
            </FormSection>

            <FormSection title="Dates">
                <div><label className={labelClasses}>Start Date</label><input type="date" name="startDate" value={editableTicket.startDate?.split('T')[0] || ''} onChange={handleFormChange} className={formElementClasses} /></div>
                <div><label className={labelClasses}>Est. Time of Completion</label><input type="date" name="estimatedCompletionDate" value={editableTicket.estimatedCompletionDate ? editableTicket.estimatedCompletionDate.split('T')[0] : ''} onChange={handleFormChange} className={formElementClasses} /></div>
            </FormSection>

            <FormSection title="Tracking & Ownership" gridCols={1}>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                   <div>
                      <label className={labelClasses}>Product Area</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center text-sm"><input type="radio" name="productArea" value={ProductArea.Reynolds} checked={editableTicket.productArea === ProductArea.Reynolds} onChange={handleFormChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/> <span className="ml-2 text-gray-800">Reynolds</span></label>
                            <label className="flex items-center text-sm"><input type="radio" name="productArea" value={ProductArea.Fullpath} checked={editableTicket.productArea === ProductArea.Fullpath} onChange={handleFormChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/> <span className="ml-2 text-gray-800">Fullpath</span></label>
                        </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-5">
                    <div><label className={labelClasses}>Status</label><select name="status" value={editableTicket.status} onChange={handleFormChange} className={formElementClasses}>{STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    <div>
                        <label className={labelClasses}>Priority</label>
                        <select name="priority" value={editableTicket.priority} onChange={handleFormChange} className={formElementClasses}>
                          {(editableTicket.type === TicketType.Issue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                 </div>
                {editableTicket.status === Status.OnHold && (
                    <div className="mt-5">
                        <label htmlFor="onHoldReason" className={labelClasses}>Reason for On Hold Status</label>
                        <textarea id="onHoldReason" name="onHoldReason" value={editableTicket.onHoldReason || ''} onChange={handleFormChange} rows={2} required className={formElementClasses} placeholder="Explain why this ticket is on hold..."/>
                    </div>
                )}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 mt-5">
                    <div><label className={labelClasses}>PMR Number</label><input type="text" name="pmrNumber" value={editableTicket.pmrNumber} onChange={handleFormChange} className={formElementClasses}/></div>
                    <div><label className={labelClasses}>FP Ticket Number</label><input type="text" name="fpTicketNumber" value={editableTicket.fpTicketNumber} onChange={handleFormChange} className={formElementClasses}/></div>
                    <div><label className={labelClasses}>Ticket Thread ID</label><input type="text" name="ticketThreadId" value={editableTicket.ticketThreadId} onChange={handleFormChange} className={formElementClasses}/></div>
                 </div>
            </FormSection>

            <FormSection title={editableTicket.type === TicketType.Issue ? 'Issue Details' : 'Feature Request Details'}>
                {editableTicket.type === TicketType.Issue ? (
                    <>
                        <div className="col-span-2"><label className={labelClasses}>Problem</label><textarea name="problem" value={(editableTicket as IssueTicket).problem} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div className="col-span-2"><label className={labelClasses}>Duplication Steps</label><textarea name="duplicationSteps" value={(editableTicket as IssueTicket).duplicationSteps} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div className="col-span-2"><label className={labelClasses}>Workaround</label><textarea name="workaround" value={(editableTicket as IssueTicket).workaround} onChange={handleFormChange} rows={2} className={formElementClasses}></textarea></div>
                        <div className="col-span-2"><label className={labelClasses}>Frequency</label><textarea name="frequency" value={(editableTicket as IssueTicket).frequency} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                    </>
                ) : (
                     <>
                        <div className="col-span-2"><label className={labelClasses}>Improvement</label><textarea name="improvement" value={(editableTicket as FeatureRequestTicket).improvement} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div className="col-span-2"><label className={labelClasses}>Current Functionality</label><textarea name="currentFunctionality" value={(editableTicket as FeatureRequestTicket).currentFunctionality} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div className="col-span-2"><label className={labelClasses}>Suggested Solution</label><textarea name="suggestedSolution" value={(editableTicket as FeatureRequestTicket).suggestedSolution} onChange={handleFormChange} rows={3} required className={formElementClasses}></textarea></div>
                        <div className="col-span-2"><label className={labelClasses}>Benefits</label><textarea name="benefits" value={(editableTicket as FeatureRequestTicket).benefits} onChange={handleFormChange} rows={2} required className={formElementClasses}></textarea></div>
                    </>
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
                <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        onDelete(ticket.id);
                        setIsDeleteModalOpen(false);
                    }}
                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Delete Ticket
                </button>
            </div>
        </Modal>
      )}
        <div className="flex justify-end items-center gap-3 mb-6 flex-wrap">
             <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-sm"
            >
                <TrashIcon className="w-4 h-4" />
                <span>Delete</span>
            </button>
             <button
                onClick={onEmail}
                className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors text-sm"
            >
                <EmailIcon className="w-4 h-4" />
                <span>Email</span>
            </button>
             <button
                onClick={onExport}
                className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>Export</span>
            </button>
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
            >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
            </button>
        </div>
        
        {ticket.status === Status.OnHold && ticket.onHoldReason && (
          <div className="mb-6 p-4 bg-[#ffcd85]/20 border-l-4 border-[#ffcd85] text-stone-800 rounded-r-md">
            <p className="font-bold">On Hold Reason</p>
            <p className="mt-1 text-sm">{ticket.onHoldReason}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <DetailTag label="Status" value={ticket.status} />
            <DetailTag label="Priority" value={ticket.priority} />
            <DetailTag label="Ticket Type" value={ticket.type} />
            <DetailTag label="Product Area" value={ticket.productArea} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-6">
            <DetailField label="Submitter" value={ticket.submitterName} />
            <DetailField label="Client" value={ticket.client} />
            <DetailField label="Platform" value={
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColorStyles[ticket.platform] || 'bg-gray-200 text-gray-800'}`}>
                {ticket.platform}
              </span>
            } />
            <DetailField label="Location" value={ticket.location} />
            <div className="col-span-full my-2 border-t border-gray-200"></div>
            <DetailField label="Submitted On" value={new Date(ticket.submissionDate).toLocaleDateString()} />
            <DetailField label="Start Date" value={ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : 'N/A'} />
            <DetailField label="Est. Completion" value={ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toLocaleDateString() : 'N/A'} />
            <div className="col-span-full my-2 border-t border-gray-200"></div>
            <DetailField label="PMR Number" value={ticket.pmrNumber} />
            <DetailField label="FP Ticket #" value={ticket.fpTicketNumber} />
            <DetailField label="Ticket Thread ID" value={ticket.ticketThreadId} />
        </div>
        <div className="border-t border-gray-200 pt-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {ticket.type === TicketType.Issue && (
            <>
                <DetailField label="Problem" value={(ticket as IssueTicket).problem} />
                <DetailField label="Duplication Steps" value={(ticket as IssueTicket).duplicationSteps} />
                <DetailField label="Workaround" value={(ticket as IssueTicket).workaround} />
                <DetailField label="Frequency" value={(ticket as IssueTicket).frequency} />
            </>
            )}
            {ticket.type === TicketType.FeatureRequest && (
            <>
                <DetailField label="Improvement" value={(ticket as FeatureRequestTicket).improvement} />
                <DetailField label="Current Functionality" value={(ticket as FeatureRequestTicket).currentFunctionality} />
                <DetailField label="Suggested Solution" value={(ticket as FeatureRequestTicket).suggestedSolution} />
                <DetailField label="Benefits" value={(ticket as FeatureRequestTicket).benefits} />
            </>
            )}
        </div>
        
        {ticket.status === Status.Completed && (
            <div className="mt-8">
                <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800">
                        Completion Summary
                    </h3>
                    {!isEditingNotes && (
                         <button
                            onClick={() => {
                                setCompletionNotes(ticket.completionNotes || '');
                                setIsEditingNotes(true);
                            }}
                            className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-800 focus:outline-none"
                            aria-label="Edit completion summary"
                        >
                            <PencilIcon className="w-3.5 h-3.5" />
                            <span>{ticket.completionNotes ? 'Edit' : 'Add'}</span>
                        </button>
                    )}
                </div>

                {isEditingNotes ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveNotes(); }}>
                        <textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            rows={4}
                            placeholder="Explain what was changed or updated..."
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditingNotes(false)}
                                className="bg-white text-gray-700 font-semibold px-4 py-1.5 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                             <button
                                type="submit"
                                className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                            >
                                Save Summary
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {ticket.completionNotes ? (
                            <p>{ticket.completionNotes}</p>
                        ) : (
                            <p className="text-gray-500 italic">No completion summary has been provided.</p>
                        )}
                    </div>
                )}
            </div>
        )}

         <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-800 pb-2 mb-4 border-b border-gray-200">
                Activity Log
            </h3>
            <form onSubmit={handleUpdateSubmit} className="mb-6">
                <div className="space-y-4 mb-4">
                    <div>
                        <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input 
                            type="text" 
                            id="author-name" 
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="new-update" className="block text-sm font-medium text-gray-700 mb-1">Add an update</label>
                        <textarea
                            id="new-update"
                            value={newUpdate}
                            onChange={(e) => setNewUpdate(e.target.value)}
                            rows={3}
                            placeholder="Provide an update on the ticket..."
                            required
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                    >
                        Add Update
                    </button>
                </div>
            </form>
            
            <div className="space-y-4">
                {ticket.updates && ticket.updates.length > 0 ? (
                    [...ticket.updates].reverse().map((update, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600" title={update.author}>
                                {update.author.charAt(0)}
                            </div>
                            <div className="flex-grow bg-gray-100 p-3 rounded-md">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-sm text-gray-800">{update.author}</p>
                                    <p className="text-xs text-gray-500">{new Date(update.date).toLocaleString()}</p>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{update.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No updates have been added to this ticket yet.</p>
                )}
            </div>
        </div>
    </div>
  )
}

const generateTicketText = (ticket: Ticket): string => {
    let content = `[${ticket.title}]\n\n`;

    const addDetail = (label: string, value: string | undefined | null) => {
      if (value) {
        content += `${label.padEnd(25, ' ')}: ${value}\n`;
      }
    };
    
    const addBlockDetail = (label: string, value: string | undefined | null) => {
        if (value) {
            content += `\n--- ${label.toUpperCase()} ---\n${value}\n`;
        }
    }

    addDetail('Type', ticket.type);
    addDetail('Product Area', ticket.productArea);
    addDetail('Platform', ticket.platform);
    addDetail('Status', ticket.status);
    if (ticket.status === Status.OnHold) addDetail('On Hold Reason', ticket.onHoldReason);
    addDetail('Priority', ticket.priority);
    addDetail('Submitter', ticket.submitterName);
    addDetail('Client', ticket.client);
    addDetail('Location', ticket.location);
    content += '\n';
    addDetail('Submitted On', new Date(ticket.submissionDate).toLocaleDateString());
    if (ticket.startDate) addDetail('Start Date', new Date(ticket.startDate).toLocaleDateString());
    if (ticket.completionDate) addDetail('Completed On', new Date(ticket.completionDate).toLocaleDateString());
    content += '\n';
    addDetail('PMR Number', ticket.pmrNumber);
    addDetail('FP Ticket #', ticket.fpTicketNumber);
    addDetail('Ticket Thread ID', ticket.ticketThreadId);
    
    if (ticket.type === TicketType.Issue) {
      const issueTicket = ticket as IssueTicket;
      addBlockDetail('Problem', issueTicket.problem);
      addBlockDetail('Duplication Steps', issueTicket.duplicationSteps);
      addBlockDetail('Workaround', issueTicket.workaround);
      addBlockDetail('Frequency', issueTicket.frequency);
    } else {
      const featureTicket = ticket as FeatureRequestTicket;
      addBlockDetail('Improvement', featureTicket.improvement);
      addBlockDetail('Current Functionality', featureTicket.currentFunctionality);
      addBlockDetail('Suggested Solution', featureTicket.suggestedSolution);
      addBlockDetail('Benefits', featureTicket.benefits);
    }
    
    if (ticket.status === Status.Completed && ticket.completionNotes) {
        addBlockDetail('Completion Summary', ticket.completionNotes);
    }

    if (ticket.updates && ticket.updates.length > 0) {
      content += '\n--- ACTIVITY LOG ---\n';
      [...ticket.updates].reverse().forEach(update => {
        content += `\n[${new Date(update.date).toLocaleString()}] ${update.author}:\n${update.comment}\n`;
      });
    }

    return content;
};


export default function App() {
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [ticketForEmailConfirm, setTicketForEmailConfirm] = useState<Ticket | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [ticketsToImport, setTicketsToImport] = useState<Ticket[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
    productArea: 'all',
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const performanceMetrics = useMemo(() => {
    const completedTickets = tickets.filter(
      t => t.status === Status.Completed && t.completionDate
    );

    const completedLast30Days = completedTickets.filter(t => {
      const completionDate = new Date(t.completionDate!);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return completionDate > thirtyDaysAgo;
    }).length;

    const totalCompletionDays = completedTickets.reduce((sum, t) => {
      const submission = new Date(t.submissionDate);
      const completion = new Date(t.completionDate!);
      const diffTime = Math.abs(completion.getTime() - submission.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    const avgCompletionDays = completedTickets.length > 0
      ? totalCompletionDays / completedTickets.length
      : null;

    return {
      openTickets: tickets.filter(t => t.status !== Status.Completed).length,
      completedLast30Days,
      avgCompletionDays,
    };
  }, [tickets]);
  
  const isSidePanelOpen = !!selectedTicket || isCreating;

  const handleSendEmail = (ticket: Ticket) => {
    const emailBody = generateTicketText(ticket);
    const emailSubject = ticket.title;
    const to = 'support@fullpath.com';
    const cc = 'Tom_McNamee@reyrey.com,Jayden_Wallace@reyrey.com';
    const mailtoLink = `mailto:${to}?cc=${cc}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    if (mailtoLink.length > 2000) {
      try {
        navigator.clipboard.writeText(emailBody);
        alert('The ticket details are too long for a direct email link. The content has been copied to your clipboard. Please paste it into a new email.');
      } catch (error) {
        console.error('Failed to copy to clipboard', error);
        alert('The ticket details are too long for a direct email link. Please use the "Export" feature and attach the file to your email instead.');
      }
    } else {
        window.location.href = mailtoLink;
    }
  };

  const handleCreateTicket = (ticketData: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: crypto.randomUUID(),
      submissionDate: new Date().toISOString(),
      updates: [],
      completionDate: ticketData.status === Status.Completed ? new Date().toISOString() : undefined,
      onHoldReason: ticketData.status === Status.OnHold ? (ticketData as any).onHoldReason : undefined,
    } as Ticket;
    
    setTickets(prev => [...prev, newTicket].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()));
    
    setIsCreating(false);
    setSelectedTicket(newTicket);
    setTicketForEmailConfirm(newTicket);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    const existingTicket = tickets.find(t => t.id === updatedTicket.id);
    const finalTicket: Ticket = {
      ...updatedTicket,
       onHoldReason: updatedTicket.status === Status.OnHold ? updatedTicket.onHoldReason : undefined,
       completionDate: (updatedTicket.status === Status.Completed && !existingTicket?.completionDate)
        ? new Date().toISOString()
        : (updatedTicket.status !== Status.Completed)
        ? undefined
        : existingTicket?.completionDate,
    };

    setTickets(prev => prev.map(t => (t.id === finalTicket.id ? finalTicket : t)));
    setSelectedTicket(finalTicket);
  };
  
  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsCreating(false);
  };
  
  const handleAddNewClick = () => {
    setSelectedTicket(null);
    setIsCreating(true);
  };

  const handleClosePanel = () => {
    setSelectedTicket(null);
    setIsCreating(false);
  };

  const handleAddUpdate = (comment: string, author: string) => {
    if (!selectedTicket) return;

    const newUpdate: Update = {
      author,
      date: new Date().toISOString(),
      comment,
    };

    const updatedTicket: Ticket = {
      ...selectedTicket,
      updates: [...(selectedTicket.updates || []), newUpdate],
    };
    
    handleUpdateTicket(updatedTicket);
  };
  
  const handleUpdateCompletionNotes = (notes: string) => {
    if (!selectedTicket) return;

    const updatedTicket: Ticket = {
      ...selectedTicket,
      completionNotes: notes.trim(),
    };

    handleUpdateTicket(updatedTicket);
  };
  
  const handleDeleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    handleClosePanel();
  };

  const handleExport = () => {
    if (!selectedTicket) return;
    const content = generateTicketText(selectedTicket);
    const fileContent = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    const link = document.createElement('a');
    link.href = fileContent;
    link.download = `ticket-${selectedTicket.id}.txt`;
    link.click();
  };

  const handleExportAll = () => {
    const sortedTickets = [...tickets].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
    const headers = [
      'ID', 'Type', 'Title', 'Status', 'Priority', 'Product Area', 'Platform', 'Submitter', 'Client', 'Location',
      'Submitted On', 'Start Date', 'Est. Completion', 'Completed On',
      'PMR Number', 'FP Ticket #', 'Ticket Thread ID',
      'Problem', 'Duplication Steps', 'Workaround', 'Frequency',
      'Improvement', 'Current Functionality', 'Suggested Solution', 'Benefits',
      'On Hold Reason', 'Completion Notes', 'Last Update'
    ];

    const escapeCsvCell = (cellData: any): string => {
      const stringData = String(cellData || '');
      if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const rows = sortedTickets.map(ticket => {
      const lastUpdate = ticket.updates && ticket.updates.length > 0 ? [...ticket.updates].pop() : null;
      const lastUpdateText = lastUpdate ? `[${new Date(lastUpdate.date).toLocaleString()}] ${lastUpdate.author}: ${lastUpdate.comment.replace(/\n/g, ' ')}` : '';
      
      const isIssue = ticket.type === TicketType.Issue;
      const issueTicket = ticket as IssueTicket;
      const featureTicket = ticket as FeatureRequestTicket;
      
      const row = [
        ticket.id,
        ticket.type,
        ticket.title,
        ticket.status,
        ticket.priority,
        ticket.productArea,
        ticket.platform,
        ticket.submitterName,
        ticket.client,
        ticket.location,
        ticket.submissionDate ? new Date(ticket.submissionDate).toISOString() : '',
        ticket.startDate ? new Date(ticket.startDate).toISOString() : '',
        ticket.estimatedCompletionDate ? new Date(ticket.estimatedCompletionDate).toISOString() : '',
        ticket.completionDate ? new Date(ticket.completionDate).toISOString() : '',
        ticket.pmrNumber,
        ticket.fpTicketNumber,
        ticket.ticketThreadId,
        isIssue ? issueTicket.problem : '',
        isIssue ? issueTicket.duplicationSteps : '',
        isIssue ? issueTicket.workaround : '',
        isIssue ? issueTicket.frequency : '',
        !isIssue ? featureTicket.improvement : '',
        !isIssue ? featureTicket.currentFunctionality : '',
        !isIssue ? featureTicket.suggestedSolution : '',
        !isIssue ? featureTicket.benefits : '',
        ticket.onHoldReason,
        ticket.completionNotes,
        lastUpdateText
      ];
      return row.map(escapeCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `curator-tickets-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              const text = e.target?.result;
              if (typeof text === 'string') {
                  handleImportTickets(text);
              }
          };
          reader.readAsText(file);
      }
      // Reset file input value to allow re-uploading the same file
      if (event.target) {
        event.target.value = '';
      }
  };

  const handleImportTickets = (csvString: string) => {
    try {
        const lines = csvString.trim().replace(/\r\n/g, '\n').split('\n');
        const headers = lines.shift()?.split(',') || [];
        
        const headerMapping: { [key: string]: keyof IssueTicket | keyof FeatureRequestTicket | 'Last Update' } = {
            'ID': 'id', 'Type': 'type', 'Title': 'title', 'Status': 'status', 'Priority': 'priority',
            'Product Area': 'productArea', 'Platform': 'platform', 'Submitter': 'submitterName', 'Client': 'client',
            'Location': 'location', 'Submitted On': 'submissionDate', 'Start Date': 'startDate',
            'Est. Completion': 'estimatedCompletionDate', 'Completed On': 'completionDate',
            'PMR Number': 'pmrNumber', 'FP Ticket #': 'fpTicketNumber', 'Ticket Thread ID': 'ticketThreadId',
            'Problem': 'problem', 'Duplication Steps': 'duplicationSteps', 'Workaround': 'workaround',
            'Frequency': 'frequency', 'Improvement': 'improvement', 'Current Functionality': 'currentFunctionality',
            'Suggested Solution': 'suggestedSolution', 'Benefits': 'benefits', 'On Hold Reason': 'onHoldReason',
            'Completion Notes': 'completionNotes', 'Last Update': 'Last Update'
        };

        const importedTickets: Ticket[] = lines.map(line => {
            const values = (line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []).map(v => v.trim());
            
            const ticketData: any = {};
            headers.forEach((header, index) => {
                const ticketKey = headerMapping[header.trim()];
                if (ticketKey && ticketKey !== 'Last Update') {
                    let value = (values[index] || '').trim();
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1).replace(/""/g, '"');
                    }
                    if (value) {
                       ticketData[ticketKey] = value;
                    }
                }
            });
            ticketData.updates = [];
            return ticketData as Ticket;
        }).filter(t => t.id && t.title); 

        if (importedTickets.length > 0) {
          setTicketsToImport(importedTickets);
          setIsImportModalOpen(true);
        } else {
          alert('Could not find any valid tickets in the imported file.');
        }
    } catch (error) {
        console.error("Error importing CSV:", error);
        alert("Failed to import tickets. Please check the file format and console for errors.");
    }
  };

  const confirmImport = () => {
    if (ticketsToImport) {
        setTickets(ticketsToImport);
    }
    setIsImportModalOpen(false);
    setTicketsToImport(null);
  };


  const handleStatusChange = (ticketId: string, newStatus: Status, onHoldReason?: string) => {
    setTickets(prevTickets => prevTickets.map(ticket => {
        if (ticket.id === ticketId) {
            return {
                ...ticket,
                status: newStatus,
                onHoldReason: newStatus === Status.OnHold ? onHoldReason : ticket.onHoldReason,
                completionDate: (newStatus === Status.Completed && !ticket.completionDate)
                    ? new Date().toISOString()
                    : (newStatus !== Status.Completed)
                    ? undefined
                    : ticket.completionDate,
            };
        }
        return ticket;
    }));
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTermLower) ||
        (ticket.client && ticket.client.toLowerCase().includes(searchTermLower)) ||
        (ticket.pmrNumber && ticket.pmrNumber.toLowerCase().includes(searchTermLower)) ||
        (ticket.fpTicketNumber && ticket.fpTicketNumber.toLowerCase().includes(searchTermLower)) ||
        (ticket.ticketThreadId && ticket.ticketThreadId.toLowerCase().includes(searchTermLower)) ||
        ticket.submitterName.toLowerCase().includes(searchTermLower) ||
        ticket.location.toLowerCase().includes(searchTermLower);

      const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
      const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
      const matchesType = filters.type === 'all' || ticket.type === filters.type;
      const matchesProductArea = filters.productArea === 'all' || ticket.productArea === filters.productArea;

      return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesProductArea;
    });
  }, [tickets, filters]);

  const activeTickets = useMemo(() => {
    const sorted = filteredTickets.filter(ticket => ticket.status !== Status.Completed);
    return sorted.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [filteredTickets]);

  const completedTickets = useMemo(() => {
    const sorted = filteredTickets.filter(ticket => ticket.status === Status.Completed);
    return sorted.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [filteredTickets]);

  const activeIssues = useMemo(() => {
    return activeTickets.filter(ticket => ticket.type === TicketType.Issue);
  }, [activeTickets]);

  const activeFeatureRequests = useMemo(() => {
    return activeTickets.filter(ticket => ticket.type === TicketType.FeatureRequest);
  }, [activeTickets]);

  const completedIssues = useMemo(() => {
    return completedTickets.filter(ticket => ticket.type === TicketType.Issue);
  }, [completedTickets]);

  const completedFeatureRequests = useMemo(() => {
    return completedTickets.filter(ticket => ticket.type === TicketType.FeatureRequest);
  }, [completedTickets]);


  const getSidePanelTitle = () => {
    if (isCreating) return 'Create New Ticket';
    if (selectedTicket) return selectedTicket.title;
    return '';
  }

  return (
    <div className="h-screen bg-gray-100 text-gray-800 flex overflow-hidden relative">
      <LeftSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} filters={filters} setFilters={setFilters} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-2 sm:p-4 sticky top-0 z-10 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 ring-offset-2 ring-blue-500">
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">Curator Tickets</h1>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <PerformanceInsights {...performanceMetrics} />
          <header className="mb-6 flex flex-wrap gap-4 justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Active Tickets</h1>
              <p className="text-gray-600 mt-1">
                {activeTickets.length} results found. Click a card to see details.
              </p>
            </div>
             <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                <button
                    onClick={handleImportClick}
                    className="flex items-center gap-2 bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                >
                    <UploadIcon className="w-4 h-4" />
                    <span>Import from CSV</span>
                </button>
                <button
                    onClick={handleExportAll}
                    className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export All as CSV</span>
                </button>
             </div>
          </header>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Issues ({activeIssues.length})</h2>
              <TicketList tickets={activeIssues} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />
            </section>
          
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Feature Requests ({activeFeatureRequests.length})</h2>
              <TicketList tickets={activeFeatureRequests} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />
            </section>
          </div>

          {completedTickets.length > 0 && (
            <details className="mt-12 group" open>
                <summary className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-gray-900 list-none flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  Completed Tickets ({completedTickets.length})
                </summary>
                <div className="mt-6 space-y-10">
                    <section>
                      <h3 className="text-xl font-semibold text-gray-700 mb-4">Completed Issues ({completedIssues.length})</h3>
                      <TicketList tickets={completedIssues} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />
                    </section>
                    <section>
                      <h3 className="text-xl font-semibold text-gray-700 mb-4">Completed Feature Requests ({completedFeatureRequests.length})</h3>
                      <TicketList tickets={completedFeatureRequests} onRowClick={handleRowClick} onStatusChange={handleStatusChange} />
                    </section>
                </div>
            </details>
          )}
        </main>
      </div>


      <button
        onClick={handleAddNewClick}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-110 z-20"
        aria-label="Create new ticket"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      <SideView
        title={getSidePanelTitle()}
        onClose={handleClosePanel}
        isOpen={isSidePanelOpen}
      >
        {isCreating ? (
          <TicketForm onSubmit={handleCreateTicket} />
        ) : selectedTicket ? (
          <TicketDetailView 
            ticket={selectedTicket} 
            onUpdate={handleUpdateTicket} 
            onAddUpdate={handleAddUpdate}
            onExport={handleExport}
            onEmail={() => handleSendEmail(selectedTicket)}
            onUpdateCompletionNotes={handleUpdateCompletionNotes}
            onDelete={handleDeleteTicket}
            />
        ) : null}
      </SideView>

      {ticketForEmailConfirm && (
        <Modal title="Send Ticket via Email?" onClose={() => setTicketForEmailConfirm(null)}>
            <p className="text-gray-700">Would you like to send the details for ticket "{ticketForEmailConfirm.title}" via email?</p>
            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={() => setTicketForEmailConfirm(null)}
                    className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    No, Thanks
                </button>
                <button
                    onClick={() => {
                        handleSendEmail(ticketForEmailConfirm);
                        setTicketForEmailConfirm(null);
                    }}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Yes, Send Email
                </button>
            </div>
        </Modal>
      )}

      {isImportModalOpen && (
        <Modal title="Confirm Import" onClose={() => setIsImportModalOpen(false)}>
            <p className="text-gray-700">
              Are you sure you want to replace all current tickets with the ones from the imported file? This will overwrite any existing data.
            </p>
            <p className="text-gray-700 mt-2">
                Found <span className="font-semibold">{ticketsToImport?.length || 0}</span> tickets to import.
            </p>
            <div className="flex justify-end gap-3 mt-6">
                <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmImport}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Yes, Replace
                </button>
            </div>
        </Modal>
      )}
    </div>
  );
}
