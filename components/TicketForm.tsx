import React, { useState, useEffect } from 'react';
import { Ticket, TicketType, Status, Priority, IssueTicket, FeatureRequestTicket, ProductArea, Platform, Project, PrioritizationScore } from '../types.ts';
import { STATUS_OPTIONS, PLATFORM_OPTIONS, ISSUE_PRIORITY_OPTIONS, FEATURE_REQUEST_PRIORITY_OPTIONS, PRIORITIZATION_SCORE_OPTIONS } from '../constants.ts';
import { formatDisplayName } from '../utils.ts';

// FIX: Update FormSubmitCallback to omit submissionDate and lastUpdatedDate as they are now handled by the parent.
type FormSubmitCallback = (ticket: Omit<IssueTicket, 'id' | 'submissionDate' | 'lastUpdatedDate'> | Omit<FeatureRequestTicket, 'id' | 'submissionDate' | 'lastUpdatedDate'>) => void;

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
  pmrLink: string;
  fpTicketNumber: string;
  ticketThreadId: string;
  startDate: string;
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
  selectedProjectId: string;
  impact: PrioritizationScore;
  effort: PrioritizationScore;
}

const getInitialState = (): FormData => {
  return {
    type: TicketType.Issue,
    productArea: ProductArea.Reynolds,
    platform: Platform.Curator,
    title: '',
    pmrNumber: '',
    pmrLink: '',
    fpTicketNumber: '',
    ticketThreadId: '',
    startDate: '',
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
    selectedProjectId: '',
    impact: PrioritizationScore.M,
    effort: PrioritizationScore.M,
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
          newState.priority = value === TicketType.Issue ? Priority.P3 : Priority.P3;
        }
        return newState;
    });
  };

  const reviewStatuses = [Status.InReview, Status.DevReview, Status.PmdReview];
  const onHoldReasonStatuses = [Status.OnHold, Status.Testing, ...reviewStatuses];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { type, selectedProjectId, ...rest } = formData;

    const dataToSubmit: any = {
      ...rest,
      startDate: rest.startDate ? new Date(`${rest.startDate}T00:00:00`).toISOString() : undefined,
      projectIds: selectedProjectId ? [selectedProjectId] : [],
    };
    
    // Clean up reason fields if status doesn't require them
    if (!onHoldReasonStatuses.includes(dataToSubmit.status)) {
        delete dataToSubmit.onHoldReason;
    }
    if (dataToSubmit.status !== Status.Completed) {
        delete dataToSubmit.completionNotes;
    }


    if (type === TicketType.Issue) {
      const {
        improvement,
        currentFunctionality,
        suggestedSolution,
        benefits,
        impact,
        effort,
        ...issueData
      } = dataToSubmit;
      // FIX: Update type to match the new FormSubmitCallback.
      const finalTicket: Omit<IssueTicket, 'id' | 'submissionDate' | 'lastUpdatedDate'> = { type, ...issueData };
      onSubmit(finalTicket);
    } else {
      const {
        problem,
        duplicationSteps,
        workaround,
        frequency,
        ...featureData
      } = dataToSubmit;
      // FIX: Update type to match the new FormSubmitCallback.
      const finalTicket: Omit<FeatureRequestTicket, 'id' | 'submissionDate' | 'lastUpdatedDate'> = { type, ...featureData };
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

  const statusesWithReason = [...onHoldReasonStatuses, Status.Completed];
  const currentStatusHasReason = statusesWithReason.includes(formData.status);
  const reasonField = formData.status === Status.Completed ? 'completionNotes' : 'onHoldReason';
  const reasonValue = formData.status === Status.Completed ? formData.completionNotes : formData.onHoldReason;

  const getReasonLabel = (status: Status) => {
      if (status === Status.Completed) return 'Reason for Completion';
      return `Reason for ${formatDisplayName(status)}`;
  };

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
          <label className={labelClasses}>PMR Link</label>
          <input type="url" name="pmrLink" value={formData.pmrLink} onChange={handleChange} placeholder="https://..." className={formElementClasses}/>
        </div>
        <div>
          <label className={labelClasses}>FP Ticket Number</label>
          <input type="text" name="fpTicketNumber" value={formData.fpTicketNumber} onChange={handleChange} className={formElementClasses}/>
        </div>
        <div />
        <div className="col-span-2">
          <label className={labelClasses}>Ticket Thread ID</label>
          <input type="text" name="ticketThreadId" value={formData.ticketThreadId} onChange={handleChange} className={formElementClasses}/>
        </div>
        <div>
          <label className={labelClasses}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>
            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{formatDisplayName(opt)}</option>)}
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
            <select name="selectedProjectId" value={formData.selectedProjectId} onChange={handleChange} className={formElementClasses}>
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>
        {currentStatusHasReason && (
          <div className="col-span-2">
            <label htmlFor="reason" className={labelClasses}>{getReasonLabel(formData.status)}</label>
            <textarea id="reason" name={reasonField} value={reasonValue || ''} onChange={handleChange} rows={2} required className={formElementClasses} placeholder={`Explain why this ticket is ${formatDisplayName(formData.status)}...`}/>
          </div>
        )}
      </FormSection>

      {formData.type === TicketType.FeatureRequest && (
        <FormSection title="Prioritization Scoring">
            <div>
                <label className={labelClasses}>Impact</label>
                <select name="impact" value={formData.impact} onChange={handleChange} className={formElementClasses}>
                    {PRIORITIZATION_SCORE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClasses}>Effort</label>
                <select name="effort" value={formData.effort} onChange={handleChange} className={formElementClasses}>
                    {PRIORITIZATION_SCORE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        </FormSection>
      )}
      
      <FormSection title="Dates" gridCols={1}>
        <div>
          <label className={labelClasses}>Start Date</label>
          <input type="date" name="startDate" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} className={formElementClasses} />
        </div>
      </FormSection>

      <FormSection title={formData.type === TicketType.Issue ? 'Issue Details' : 'Feature Request Details'}>
        {formData.type === TicketType.Issue ? issueFields : featureRequestFields}
      </FormSection>
      
      <div className="mt-8 flex justify-end">
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          Create Ticket
        </button>
      </div>
    </form>
  );
};

export default TicketForm;