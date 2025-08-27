
import React, { useState, useEffect } from 'react';
import { Ticket, TicketType, Status, Priority, IssueTicket, FeatureRequestTicket, ProductArea, Platform, Project } from '../types.ts';
import { STATUS_OPTIONS, PLATFORM_OPTIONS, ISSUE_PRIORITY_OPTIONS, FEATURE_REQUEST_PRIORITY_OPTIONS } from '../constants.ts';

type FormSubmitCallback = (ticket: Omit<IssueTicket, 'id' | 'submissionDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate'>) => void;

interface TicketFormProps {
  onSubmit: FormSubmitCallback;
  projects: Project[];
}

interface FormData {
  type: TicketType;
  productArea: ProductArea;
  platform: Platform;
  title: string;
  pmrNumber: string;
  fpTicketNumber: string;
  ticketThreadId: string;
  startDate: string;
  estimatedCompletionDate: string;
  status: Status;
  priority: Priority;
  submitterName: string;
  client: string;
  location: string;
  problem: string;
  duplicationSteps: string;
  workaround: string;
  frequency: string;
  improvement: string;
  currentFunctionality: string;
  suggestedSolution: string;
  benefits: string;
  completionNotes: string;
  onHoldReason: string;
  projectId: string;
}

const getInitialState = (): FormData => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return {
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
    platform: Platform.Curator,
    title: '',
    pmrNumber: '',
    fpTicketNumber: '',
    ticketThreadId: '',
    startDate: '',
    estimatedCompletionDate: nextWeek.toISOString().split('T')[0],
    status: Status.NotStarted,
    priority: Priority.P3,
    submitterName: '',
    client: '',
    location: '',
    problem: '',
    duplicationSteps: '',
    workaround: '',
    frequency: '',
    improvement: '',
    currentFunctionality: '',
    suggestedSolution: '',
    benefits: '',
    completionNotes: '',
    onHoldReason: '',
    projectId: '',
  };
};

const FormSection: React.FC<{ title: string; children: React.ReactNode, gridCols?: number }> = ({ title, children, gridCols = 2 }) => (
  <fieldset className="mb-6">
    <legend className="text-md font-semibold text-gray-800 pb-2 mb-5 border-b border-gray-200 w-full">
      {title}
    </legend>
    <div className={`grid grid-cols-1 sm:grid-cols-${gridCols} gap-x-6 gap-y-5`}>
      {children}
    </div>
  </fieldset>
);


const TicketForm: React.FC<TicketFormProps> = ({ onSubmit, projects }) => {
  const [formData, setFormData] = useState<FormData>(getInitialState());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value as any };
        if (name === 'type') {
          // Reset priority when type changes
          newState.priority = value === TicketType.Issue ? Priority.P3 : Priority.P5;
        }
        return newState;
    });
  };

  // FIX: This function was using `projectId` which does not exist on the Ticket type.
  // It has been updated to use `projectIds` (an array of strings) to correctly link a ticket to a project.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { type, projectId, ...rest } = formData;

    const dataToSubmit = {
      ...rest,
      estimatedCompletionDate: rest.estimatedCompletionDate ? new Date(`${rest.estimatedCompletionDate}T00:00:00`).toISOString() : undefined,
      startDate: rest.startDate ? new Date(`${rest.startDate}T00:00:00`).toISOString() : undefined,
      projectIds: projectId ? [projectId] : [],
    }

    if (type === TicketType.Issue) {
      const {
        improvement,
        currentFunctionality,
        suggestedSolution,
        benefits,
        ...issueData
      } = dataToSubmit;
      const finalTicket: Omit<IssueTicket, 'id' | 'submissionDate'> = { type, ...issueData };
      onSubmit(finalTicket);
    } else {
      const {
        problem,
        duplicationSteps,
        workaround,
        frequency,
        ...featureData
      } = dataToSubmit;
      const finalTicket: Omit<FeatureRequestTicket, 'id' | 'submissionDate'> = { type, ...featureData };
      onSubmit(finalTicket);
    }
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  const issueFields = (
    <>
      <div className="col-span-2"><label className={labelClasses}>Problem</label><textarea name="problem" value={formData.problem} onChange={handleChange} rows={3} required className={formElementClasses}></textarea></div>
      <div className="col-span-2"><label className={labelClasses}>Duplication Steps</label><textarea name="duplicationSteps" value={formData.duplicationSteps} onChange={handleChange} rows={3} required className={formElementClasses}></textarea></div>
      <div className="col-span-2"><label className={labelClasses}>Workaround</label><textarea name="workaround" value={formData.workaround} onChange={handleChange} rows={2} className={formElementClasses}></textarea></div>
      <div className="col-span-2"><label className={labelClasses}>Frequency</label><textarea name="frequency" value={formData.frequency} onChange={handleChange} rows={2} required className={formElementClasses}></textarea></div>
    </>
  );

  const featureRequestFields = (
    <>
      <div className="col-span-2"><label className={labelClasses}>Improvement</label><textarea name="improvement" value={formData.improvement} onChange={handleChange} rows={3} required className={formElementClasses}></textarea></div>
      <div className="col-span-2"><label className={labelClasses}>Current Functionality</label><textarea name="currentFunctionality" value={formData.currentFunctionality} onChange={handleChange} rows={3} required className={formElementClasses}></textarea></div>
      <div className="col-span-2"><label className={labelClasses}>Suggested Solution</label><textarea name="suggestedSolution" value={formData.suggestedSolution} onChange={handleChange} rows={3} required className={formElementClasses}></textarea></div>
      <div className="col-span-2"><label className={labelClasses}>Benefits</label><textarea name="benefits" value={formData.benefits} onChange={handleChange} rows={2} required className={formElementClasses}></textarea></div>
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-x-8 mb-6">
        <div>
          <label className={labelClasses}>Ticket Type</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center text-sm"><input type="radio" name="type" value={TicketType.Issue} checked={formData.type === TicketType.Issue} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/> <span className="ml-2 text-gray-800">Issue / Bug</span></label>
            <label className="flex items-center text-sm"><input type="radio" name="type" value={TicketType.FeatureRequest} checked={formData.type === TicketType.FeatureRequest} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/> <span className="ml-2 text-gray-800">Feature Request</span></label>
          </div>
        </div>
        <div>
          <label className={labelClasses}>Product Area</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center text-sm"><input type="radio" name="productArea" value={ProductArea.Reynolds} checked={formData.productArea === ProductArea.Reynolds} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/> <span className="ml-2 text-gray-800">Reynolds</span></label>
            <label className="flex items-center text-sm"><input type="radio" name="productArea" value={ProductArea.Fullpath} checked={formData.productArea === ProductArea.Fullpath} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/> <span className="ml-2 text-gray-800">Fullpath</span></label>
          </div>
        </div>
      </div>

      <FormSection title="Core Information">
        <div className="col-span-2">
          <label className={labelClasses}>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className={formElementClasses}/>
        </div>
        <div>
          <label className={labelClasses}>Submitter Name</label>
          <input type="text" name="submitterName" value={formData.submitterName} onChange={handleChange} required className={formElementClasses}/>
        </div>
        <div>
          <label className={labelClasses}>Client</label>
          <input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="e.g., ABC Motors" className={formElementClasses}/>
        </div>
        <div className="col-span-2">
          <label className={labelClasses}>Location of Feature/Issue</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} required className={formElementClasses}/>
        </div>
        <div className="col-span-2">
          <label className={labelClasses}>Platform</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
            {PLATFORM_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center text-sm">
                <input type="radio" name="platform" value={opt} checked={formData.platform === opt} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"/>
                <span className="ml-2 text-gray-800">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="Tracking & Ownership">
        <div>
          <label className={labelClasses}>PMR Number</label>
          <input type="text" name="pmrNumber" value={formData.pmrNumber} onChange={handleChange} className={formElementClasses}/>
        </div>
        <div>
          <label className={labelClasses}>FP Ticket Number</label>
          <input type="text" name="fpTicketNumber" value={formData.fpTicketNumber} onChange={handleChange} className={formElementClasses}/>
        </div>
        <div className="col-span-2">
          <label className={labelClasses}>Ticket Thread ID</label>
          <input type="text" name="ticketThreadId" value={formData.ticketThreadId} onChange={handleChange} className={formElementClasses}/>
        </div>
        <div>
          <label className={labelClasses}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div>
            <label className={labelClasses}>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={formElementClasses}>
              {(formData.type === TicketType.Issue ? ISSUE_PRIORITY_OPTIONS : FEATURE_REQUEST_PRIORITY_OPTIONS).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
        <div className="col-span-2">
            <label className={labelClasses}>Project</label>
            <select name="projectId" value={formData.projectId} onChange={handleChange} className={formElementClasses}>
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>
        {formData.status === Status.OnHold && (
          <div className="col-span-2">
            <label htmlFor="onHoldReason" className={labelClasses}>Reason for On Hold Status</label>
            <textarea id="onHoldReason" name="onHoldReason" value={formData.onHoldReason} onChange={handleChange} rows={2} required className={formElementClasses} placeholder="Explain why this ticket is on hold..."/>
          </div>
        )}
      </FormSection>
      
      <FormSection title="Dates">
        <div>
          <label className={labelClasses}>Start Date</label>
          <input type="date" name="startDate" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Est. Time of Completion</label>
          <input type="date" name="estimatedCompletionDate" value={formData.estimatedCompletionDate ? formData.estimatedCompletionDate.split('T')[0] : ''} onChange={handleChange} className={formElementClasses} />
        </div>
      </FormSection>

      <FormSection title={formData.type === TicketType.Issue ? 'Issue Details' : 'Feature Request Details'}>
        {formData.type === TicketType.Issue ? issueFields : featureRequestFields}
      </FormSection>
      
      {formData.status === Status.Completed && (
        <FormSection title="Completion Summary" gridCols={1}>
            <div className="col-span-1">
                <label htmlFor="completionNotes" className={labelClasses}>Explanation of Changes/Updates</label>
                <textarea 
                    id="completionNotes"
                    name="completionNotes" 
                    value={formData.completionNotes} 
                    onChange={handleChange} 
                    rows={4} 
                    placeholder="Summarize the resolution, what was changed, or any final notes." 
                    className={formElementClasses}
                />
            </div>
        </FormSection>
      )}

      <div className="mt-8 flex justify-end">
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          Create Ticket
        </button>
      </div>
    </form>
  );
};

export default TicketForm;
