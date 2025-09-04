
import React, { useState, useEffect } from 'react';
import { Contact, ContactGroup, ContactType } from '../types.ts';
import { CONTACT_TYPE_OPTIONS } from '../constants.ts';

interface ContactFormProps {
  onSave: (contact: Omit<Contact, 'id'> | Contact) => void;
  onClose: () => void;
  contactToEdit?: Contact | null;
  allGroups: ContactGroup[];
}

const getInitialState = (): Omit<Contact, 'id'> => ({
  name: '',
  email: '',
  phone: '',
  role: '',
  type: ContactType.Internal,
  isFavorite: false,
  groupIds: [],
});

const ContactForm: React.FC<ContactFormProps> = ({ onSave, onClose, contactToEdit, allGroups }) => {
  const [formData, setFormData] = useState(getInitialState());
  const isEditing = !!contactToEdit;

  useEffect(() => {
    if (contactToEdit) {
      setFormData({ ...getInitialState(), ...contactToEdit });
    } else {
      setFormData(getInitialState());
    }
  }, [contactToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, type: e.target.value as ContactType }));
  }

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => {
      const currentGroupIds = prev.groupIds || [];
      const newGroupIds = currentGroupIds.includes(groupId)
        ? currentGroupIds.filter(id => id !== groupId)
        : [...currentGroupIds, groupId];
      return { ...prev, groupIds: newGroupIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <label className={labelClasses}>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Role / Title</label>
          <input type="text" name="role" value={formData.role || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Phone</label>
          <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div className="col-span-2">
            <label className={labelClasses}>Type</label>
            <div className="flex gap-4 mt-2">
            {CONTACT_TYPE_OPTIONS.map(opt => (
                <label key={opt} className="flex items-center text-sm">
                    <input 
                        type="radio" 
                        name="type" 
                        value={opt} 
                        checked={formData.type === opt} 
                        onChange={handleRadioChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-800">{opt}</span>
                </label>
            ))}
            </div>
        </div>
         <div className="col-span-2">
            <label className={labelClasses}>Groups</label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50">
              {allGroups.length > 0 ? allGroups.map(group => (
                <label key={group.id} className="flex items-center text-sm cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={(formData.groupIds || []).includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-800">{group.name}</span>
                </label>
              )) : (
                <p className="text-gray-500 italic text-sm">No groups created yet.</p>
              )}
            </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {isEditing ? 'Save Changes' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;