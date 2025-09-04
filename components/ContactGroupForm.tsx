import React, { useState, useEffect } from 'react';
import { ContactGroup } from '../types.ts';

interface ContactGroupFormProps {
  onSave: (group: Omit<ContactGroup, 'id' | 'contactIds'> | ContactGroup) => void;
  onClose: () => void;
  groupToEdit?: ContactGroup | null;
}

const getInitialState = (): Omit<ContactGroup, 'id' | 'contactIds'> => ({
  name: '',
  description: '',
});

const ContactGroupForm: React.FC<ContactGroupFormProps> = ({ onSave, onClose, groupToEdit }) => {
  const [formData, setFormData] = useState<Omit<ContactGroup, 'id' | 'contactIds'> | ContactGroup>(getInitialState());
  const isEditing = !!groupToEdit;

  useEffect(() => {
    if (groupToEdit) {
      setFormData(groupToEdit);
    } else {
      setFormData(getInitialState());
    }
  }, [groupToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The formData state correctly holds either a ContactGroup (when editing)
    // or an Omit<ContactGroup, 'id' | 'contactIds'> (when creating).
    // The onSave handler in App.tsx is designed to handle both cases based on the presence of an 'id' property.
    onSave(formData);
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClasses}>Group Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formElementClasses} />
      </div>
      <div>
        <label className={labelClasses}>Description</label>
        <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={formElementClasses} />
      </div>
      <div className="flex justify-end pt-4 border-t">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="ml-3 bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {isEditing ? 'Save Changes' : 'Create Group'}
        </button>
      </div>
    </form>
  );
};

export default ContactGroupForm;