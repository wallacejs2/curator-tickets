import React, { useState } from 'react';
import { QuarterPlan, Update, FeatureAnnouncement, Ticket, Meeting, Status, FeatureStatus, Project, ProjectStatus } from '../types.ts';
import EditableRichText from './common/inlineEdit/EditableRichText.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import EditableText from './common/inlineEdit/EditableText.tsx';

type EntityType = 'ticket' | 'feature' | 'meeting' | 'project';

interface QuarterDetailViewProps {
  quarter: QuarterPlan;
  onUpdate: (quarter: QuarterPlan) => void;
  onAddUpdate: (quarterId: string, comment: string, author: string, date: string) => void;
  onEditUpdate: (updatedUpdate: Update) => void;
  onDeleteUpdate: (updateId: string) => void;
  allFeatures: FeatureAnnouncement[];
  allTickets: Ticket[];
  allMeetings: Meeting[];
  allProjects: Project[];
  onLink: (quarterId: string, toType: EntityType, toId: string) => void;
  onUnlink: (quarterId: string, toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const PlanSection: React.FC<{ title: string; content?: string; onSave: (newContent: string) => void; }> = ({ title, content, onSave }) => {
  return (
    <div className="pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <EditableRichText value={content || ''} onSave={onSave} />
    </div>
  );
};

const QuarterDetailView: React.FC<QuarterDetailViewProps> = ({
  quarter, onUpdate, onAddUpdate, onEditUpdate, onDeleteUpdate,
  allFeatures, allTickets, allMeetings, allProjects,
  onLink, onUnlink, onSwitchView
}) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState('');
  
  const handlePlanSave = (planType: keyof QuarterPlan, newContent: string) => {
    onUpdate({ ...quarter, [planType]: newContent });
  };
  
  const handleNameSave = (newName: string) => {
    onUpdate({ ...quarter, name: newName });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() && authorName.trim() && updateDate) {
      const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
      onAddUpdate(quarter.id, commentAsHtml, authorName.trim(), updateDate);
      setNewUpdate('');
      setAuthorName('');
    }
  };

  const linkedFeatures = allFeatures.filter(item => (quarter.featureIds || []).includes(item.id));
  const linkedTickets = allTickets.filter(item => (quarter.ticketIds || []).includes(item.id));
  const linkedMeetings = allMeetings.filter(item => (quarter.meetingIds || []).includes(item.id));
  const linkedProjects = allProjects.filter(item => (quarter.projectIds || []).includes(item.id));

  const availableFeatures = allFeatures.filter(item => item.status !== FeatureStatus.Launched && !(quarter.featureIds || []).includes(item.id));
  const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(quarter.ticketIds || []).includes(item.id));
  const availableMeetings = allMeetings.filter(item => !(quarter.meetingIds || []).includes(item.id));
  const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(quarter.projectIds || []).includes(item.id));

  return (
    <div className="space-y-8">
      <div className="text-2xl font-bold text-gray-900 -m-2">
        <EditableText 
            value={quarter.name} 
            onSave={handleNameSave} 
            label="" 
            placeholder="Plan Name" 
        />
      </div>

      <PlanSection title="Sales Plan" content={quarter.salesPlan} onSave={(c) => handlePlanSave('salesPlan', c)} />
      <PlanSection title="Support Plan" content={quarter.supportPlan} onSave={(c) => handlePlanSave('supportPlan', c)} />
      <PlanSection title="Development Plan" content={quarter.developmentPlan} onSave={(c) => handlePlanSave('developmentPlan', c)} />
      <PlanSection title="Product Plan" content={quarter.productPlan} onSave={(c) => handlePlanSave('productPlan', c)} />

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Updates ({quarter.updates?.length || 0})</h3>
        <form onSubmit={handleUpdateSubmit} className="p-4 border border-gray-200 rounded-md mb-6 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
            </div>
            <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Type your comment here..." required rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
            <button type="submit" disabled={!newUpdate.trim() || !authorName.trim()} className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">Add Update</button>
        </form>
        <div className="space-y-4">
            {[...(quarter.updates || [])].reverse().map(update => (
                 <div key={update.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    {editingUpdateId === update.id ? (
                        <div>
                            <textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white" />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setEditingUpdateId(null)} className="bg-white text-gray-700 font-semibold px-3 py-1 rounded-md border border-gray-300 text-sm">Cancel</button>
                                <button onClick={() => {
                                    const commentAsHtml = editedComment.replace(/\n/g, '<br />');
                                    onEditUpdate({ ...update, comment: commentAsHtml });
                                    setEditingUpdateId(null);
                                }} className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm">
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="group">
                            <div className="flex justify-between items-start">
                                <p className="text-xs text-gray-500 font-medium">
                                    <span className="font-semibold text-gray-700">{update.author}</span>
                                    <span className="mx-1.5">•</span>
                                    <span>{new Date(update.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                                </p>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => {
                                        setEditingUpdateId(update.id);
                                        const commentForEditing = update.comment.replace(/<br\s*\/?>/gi, '\n');
                                        setEditedComment(commentForEditing);
                                    }} className="p-1 text-gray-400 hover:text-blue-600" aria-label="Edit update">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { if (window.confirm('Are you sure?')) { onDeleteUpdate(update.id); } }} className="p-1 text-gray-400 hover:text-red-600" aria-label="Delete update">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-800 rich-text-content" dangerouslySetInnerHTML={{ __html: update.comment }}></div>
                        </div>
                    )}
                 </div>
            ))}
        </div>
      </div>

      <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink(quarter.id, 'project', id)} onUnlink={(id) => onUnlink(quarter.id, 'project', id)} onItemClick={(id) => onSwitchView('project', id)} />
      <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink(quarter.id, 'feature', id)} onUnlink={(id) => onUnlink(quarter.id, 'feature', id)} onItemClick={(id) => onSwitchView('feature', id)} />
      <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink(quarter.id, 'ticket', id)} onUnlink={(id) => onUnlink(quarter.id, 'ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
      <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink(quarter.id, 'meeting', id)} onUnlink={(id) => onUnlink(quarter.id, 'meeting', id)} onItemClick={(id) => onSwitchView('meeting', id)} />
    </div>
  );
};

export default QuarterDetailView;
