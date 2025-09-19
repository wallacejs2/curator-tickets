

import React, { useState, useMemo, useEffect } from 'react';
import { Contact, ContactGroup, ContactFilterState, ContactType } from '../types.ts';
import { CONTACT_TYPE_OPTIONS } from '../constants.ts';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { StarIcon } from './icons/StarIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import Modal from './common/Modal.tsx';
import ContactForm from './ContactForm.tsx';
import ContactGroupForm from './ContactGroupForm.tsx';
import { AlternateEmailIcon } from './icons/AlternateEmailIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';

interface ContactsViewProps {
  contacts: Contact[];
  contactGroups: ContactGroup[];
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onUpdateGroup: (group: ContactGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  isContactFormOpen: boolean;
  setIsContactFormOpen: (isOpen: boolean) => void;
  editingContact: Contact | null;
  setEditingContact: (contact: Contact | null) => void;
  onSaveContact: (contact: Omit<Contact, 'id'> | Contact) => void;
  isGroupFormOpen: boolean;
  setIsGroupFormOpen: (isOpen: boolean) => void;
  editingGroup: ContactGroup | null;
  setEditingGroup: (group: ContactGroup | null) => void;
  onSaveGroup: (group: Omit<ContactGroup, 'id' | 'contactIds'> | ContactGroup) => void;
}

const ContactCard: React.FC<{ contact: Contact; allGroups: ContactGroup[]; onEdit: () => void; onDelete: () => void; onToggleFavorite: () => void; showToast: (message: string, type: 'success' | 'error') => void; }> = ({ contact, allGroups, onEdit, onDelete, onToggleFavorite, showToast }) => {
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.email);
    showToast('Email copied to clipboard!', 'success');
  };

  const contactMemberOfGroups = useMemo(() => allGroups.filter(g => (contact.groupIds || []).includes(g.id)), [allGroups, contact.groupIds]);

  const handleCopyContactInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const groupNames = contactMemberOfGroups.map(g => g.name).join(', ');
    const infoString = [
        `Name: ${contact.name}`,
        contact.role ? `Role/Title: ${contact.role}` : null,
        `Email: ${contact.email}`,
        contact.phone ? `Phone: ${contact.phone}` : null,
        `Type: ${contact.type}`,
        groupNames ? `Groups: ${groupNames}` : null
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(infoString);
    showToast('Contact information copied!', 'success');
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="p-1 text-gray-400 hover:text-yellow-500 flex-shrink-0">
            <StarIcon filled={!!contact.isFavorite} className={`w-6 h-6 ${contact.isFavorite ? 'text-yellow-500' : ''}`} />
        </button>
        <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800 truncate">{contact.name}</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${contact.type === ContactType.Internal ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{contact.type}</span>
            </div>
            <p className="text-sm text-gray-600 truncate">{contact.role}</p>
            {contactMemberOfGroups.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                    {contactMemberOfGroups.map(g => <span key={g.id} className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">{g.name}</span>)}
                </div>
            )}
        </div>
        <div className="text-sm text-gray-700 flex-shrink-0 hidden md:block">
            <div className="flex items-center gap-2">
                <span className="truncate">{contact.email}</span>
            </div>
            {contact.phone && <p className="text-gray-500">{contact.phone}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={handleCopyContactInfo} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Copy All Info">
                <ContentCopyIcon className="w-5 h-5" />
            </button>
            <button onClick={handleCopyEmail} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Copy Email">
                <AlternateEmailIcon className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full">
                <PencilIcon className="w-5 h-5"/>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 hover:text-red-600 rounded-full">
                <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
  );
};

const ContactGroupCard: React.FC<{
    group: ContactGroup;
    allContacts: Contact[];
    onGroupEdit: () => void;
    onGroupDelete: () => void;
    onContactEdit: (contact: Contact) => void;
    onContactDelete: (contactId: string) => void;
    onContactToggleFavorite: (contactId: string) => void;
    onManageMembers: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
    allGroups: ContactGroup[];
}> = ({ group, allContacts, onGroupEdit, onGroupDelete, onContactEdit, onContactDelete, onContactToggleFavorite, onManageMembers, showToast, allGroups }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const memberContacts = useMemo(() => allContacts.filter(c => group.contactIds.includes(c.id)), [allContacts, group.contactIds]);
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 flex justify-between items-center">
                <div onClick={() => setIsExpanded(!isExpanded)} className="flex-grow cursor-pointer">
                    <h3 className="text-lg font-semibold text-gray-800">{group.name} ({memberContacts.length})</h3>
                    <p className="text-sm text-gray-500">{group.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onManageMembers(); }} className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-100">Manage Members</button>
                    <button onClick={(e) => { e.stopPropagation(); onGroupEdit(); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full"><PencilIcon className="w-4 h-4"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onGroupDelete(); }} className="p-2 text-gray-400 hover:text-red-600 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400"><ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-200 space-y-3">
                    {memberContacts.length > 0 ? memberContacts.map(contact => (
                        <ContactCard key={contact.id} contact={contact} allGroups={allGroups} onEdit={() => onContactEdit(contact)} onDelete={() => onContactDelete(contact.id)} onToggleFavorite={() => onContactToggleFavorite(contact.id)} showToast={showToast}/>
                    )) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">No contacts in this group.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const ManageGroupMembersModal: React.FC<{
    group: ContactGroup;
    allContacts: Contact[];
    onSave: (updatedContactIds: string[]) => void;
    onClose: () => void;
}> = ({ group, allContacts, onSave, onClose }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>(group.contactIds);

    const handleToggleId = (contactId: string) => {
        setSelectedIds(prev =>
            prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
        );
    };
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Select the contacts that should be members of this group.</p>
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2 bg-white">
          {allContacts.map(c => (
            <label key={c.id} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedIds.includes(c.id) ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => handleToggleId(c.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <div className="flex-grow">
                    <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
            <button onClick={() => { onSave(selectedIds); onClose(); }} className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">Save Members</button>
        </div>
      </div>
    );
};


const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  contactGroups,
  onUpdateContact,
  onDeleteContact,
  onUpdateGroup,
  onDeleteGroup,
  showToast,
  isContactFormOpen,
  setIsContactFormOpen,
  editingContact,
  setEditingContact,
  onSaveContact,
  isGroupFormOpen,
  setIsGroupFormOpen,
  editingGroup,
  setEditingGroup,
  onSaveGroup,
}) => {
  const [filters, setFilters] = useState<ContactFilterState>({ searchTerm: '', type: 'all' });
  const [displayMode, setDisplayMode] = useState<'all' | 'groups'>('all');
  const [managingGroup, setManagingGroup] = useState<ContactGroup | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // FIX: Cast 'e.target.value' to the expected union type to resolve a TypeScript error.
    setFilters(prev => ({ ...prev, [name]: value as 'all' | ContactType }));
  };
  
  const handleToggleFavorite = (contactId: string) => {
      const contact = contacts.find(c => c.id === contactId);
      if(contact) {
          onUpdateContact({ ...contact, isFavorite: !contact.isFavorite });
      }
  };

  const handleNewGroupClick = () => {
    setEditingGroup(null);
    setIsGroupFormOpen(true);
  };
  const handleEditGroupClick = (group: ContactGroup) => {
    setEditingGroup(group);
    setIsGroupFormOpen(true);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
            (c.name.toLowerCase().includes(searchLower) ||
             c.email.toLowerCase().includes(searchLower) ||
             (c.role || '').toLowerCase().includes(searchLower)) &&
            (filters.type === 'all' || c.type === filters.type)
        );
    }).sort((a,b) => (a.isFavorite === b.isFavorite) ? a.name.localeCompare(b.name) : a.isFavorite ? -1 : 1);
  }, [contacts, filters]);

  const handleUpdateGroupMembers = (updatedContactIds: string[]) => {
      if (!managingGroup) return;
      onUpdateGroup({ ...managingGroup, contactIds: updatedContactIds });
      setManagingGroup(null);
  };

  return (
    <div>
        {isContactFormOpen && (
            <Modal title={editingContact ? 'Edit Contact' : 'Create New Contact'} onClose={() => { setIsContactFormOpen(false); setEditingContact(null); }}>
                <ContactForm onSave={onSaveContact} onClose={() => { setIsContactFormOpen(false); setEditingContact(null); }} contactToEdit={editingContact} allGroups={contactGroups} />
            </Modal>
        )}
        {isGroupFormOpen && (
            <Modal title={editingGroup ? 'Edit Group' : 'Create New Group'} onClose={() => { setIsGroupFormOpen(false); setEditingGroup(null); }}>
                <ContactGroupForm onSave={onSaveGroup} onClose={() => { setIsGroupFormOpen(false); setEditingGroup(null); }} groupToEdit={editingGroup} />
            </Modal>
        )}
        {managingGroup && (
            <Modal title={`Manage Members for "${managingGroup.name}"`} onClose={() => setManagingGroup(null)}>
                <ManageGroupMembersModal group={managingGroup} allContacts={contacts} onSave={handleUpdateGroupMembers} onClose={() => setManagingGroup(null)}/>
            </Modal>
        )}

      <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    placeholder="Search contacts by name, email, or role..."
                    className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Types</option>
                {CONTACT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
      </div>

       <div className="mb-4 flex justify-end items-center gap-4">
            <div className="bg-gray-200 p-0.5 rounded-md flex">
                <button onClick={() => setDisplayMode('all')} className={`px-3 py-1 text-sm rounded ${displayMode === 'all' ? 'bg-white shadow' : 'text-gray-600'}`}>All Contacts</button>
                <button onClick={() => setDisplayMode('groups')} className={`px-3 py-1 text-sm rounded ${displayMode === 'groups' ? 'bg-white shadow' : 'text-gray-600'}`}>Groups</button>
            </div>
            <button onClick={handleNewGroupClick} className="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"><PlusIcon className="w-4 h-4" /> New Group</button>
        </div>

      <div className="space-y-3">
        {displayMode === 'all' ? (
            filteredContacts.length > 0 ? (
                filteredContacts.map(contact => (
                    <ContactCard 
                        key={contact.id} 
                        contact={contact}
                        allGroups={contactGroups}
                        onEdit={() => { setEditingContact(contact); setIsContactFormOpen(true); }}
                        onDelete={() => onDeleteContact(contact.id)}
                        onToggleFavorite={() => handleToggleFavorite(contact.id)}
                        showToast={showToast}
                    />
                ))
            ) : (
                 <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">No contacts found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or create a new contact.</p>
                </div>
            )
        ) : (
            <div className="space-y-6">
                {contactGroups.map(group => (
                    <ContactGroupCard
                        key={group.id}
                        group={group}
                        allContacts={filteredContacts}
                        allGroups={contactGroups}
                        onGroupEdit={() => handleEditGroupClick(group)}
                        onGroupDelete={() => onDeleteGroup(group.id)}
                        onContactEdit={(c) => { setEditingContact(c); setIsContactFormOpen(true); }}
                        onContactDelete={onDeleteContact}
                        onContactToggleFavorite={handleToggleFavorite}
                        onManageMembers={() => setManagingGroup(group)}
                        showToast={showToast}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
export default ContactsView;