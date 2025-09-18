import React, { useState, useEffect } from 'react';
import { Release, ReleaseStatus } from '../types.ts';
import { RELEASE_STATUS_OPTIONS } from '../constants.ts';

type FormSaveCallback = (release: Omit<Release, 'id'> | Release) => void;

interface ReleaseFormProps {
  onSave: FormSaveCallback;
  onClose: () => void;
  releaseToEdit?: Release | null;
}

const getInitialState = (): Omit<Release, 'id'> => ({
  name: '',
  version: '',
  releaseDate: new Date().toISOString().split('T')[0],
  status: ReleaseStatus.Planned,
  description: '',
  featureIds: [],
  ticketIds: [],
});

const ReleaseForm: React.FC<ReleaseFormProps> = ({ onSave, onClose, releaseToEdit }) => {
  const [formData, setFormData] = useState(getInitialState());
  const isEditing = !!releaseToEdit;

  useEffect(() => {
    if (releaseToEdit) {
      setFormData({
        ...getInitialState(),
        ...releaseToEdit,
        releaseDate: releaseToEdit.releaseDate.split('T')[0],
      });
    } else {
      setFormData(getInitialState());
    }
  }, [releaseToEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
        ...formData,
        releaseDate: new Date(`${formData.releaseDate}T00:00:00`).toISOString(),
    };
    onSave(submissionData);
    onClose();
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Release Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formElementClasses} placeholder="e.g., Q3 Core Features"/>
        </div>
        <div>
          <label className={labelClasses}>Version</label>
          <input type="text" name="version" value={formData.version} onChange={handleChange} required className={formElementClasses} placeholder="e.g., v3.5.0"/>
        </div>
        <div>
          <label className={labelClasses}>Target Release Date</label>
          <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>
            {RELEASE_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClasses}>Description (Optional)</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={formElementClasses} />
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">
          {isEditing ? 'Save Changes' : 'Create Release'}
        </button>
      </div>
    </form>
  );
};

export default ReleaseForm;
