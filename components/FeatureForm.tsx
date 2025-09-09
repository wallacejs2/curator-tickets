import React, { useState, useEffect } from 'react';
import { FeatureAnnouncement, FeatureStatus, Platform } from '../types.ts';
import { FEATURE_STATUS_OPTIONS, PLATFORM_OPTIONS } from '../constants.ts';

type FormSubmitCallback = (feature: Omit<FeatureAnnouncement, 'id'>) => void;
type FormUpdateCallback = (feature: FeatureAnnouncement) => void;

interface FeatureFormProps {
  onSubmit: FormSubmitCallback;
  onUpdate: FormUpdateCallback;
  featureToEdit?: FeatureAnnouncement | null;
  onClose: () => void;
}

const getInitialState = (): Omit<FeatureAnnouncement, 'id'> & { categoriesString?: string } => ({
    title: '',
    location: '',
    description: '',
    launchDate: new Date().toISOString().split('T')[0],
    version: '',
    platform: Platform.Curator,
    status: FeatureStatus.Backlog,
    categories: [],
    categoriesString: '',
    successMetrics: '',
    targetAudience: '',
    supportUrl: '',
});

const FeatureForm: React.FC<FeatureFormProps> = ({ onSubmit, onUpdate, featureToEdit, onClose }) => {
  const [formData, setFormData] = useState(getInitialState());
  const isEditing = !!featureToEdit;

  useEffect(() => {
    if (featureToEdit) {
      setFormData({
        ...featureToEdit,
        launchDate: featureToEdit.launchDate.split('T')[0],
        categoriesString: (featureToEdit.categories || []).join(', '),
      });
    } else {
      setFormData(getInitialState());
    }
  }, [featureToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'categoriesString') {
        setFormData(prev => ({ ...prev, categoriesString: value }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { categoriesString, ...rest } = formData;
    const submissionData = {
        ...rest,
        launchDate: new Date(`${formData.launchDate}T00:00:00`).toISOString(),
        categories: categoriesString?.split(',').map(c => c.trim()).filter(Boolean) || [],
    };
    if (isEditing) {
      onUpdate({ id: featureToEdit!.id, ...submissionData });
    } else {
      onSubmit(submissionData);
    }
    onClose();
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClasses}>Feature Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required className={formElementClasses} />
      </div>
      <div>
        <label className={labelClasses}>Location of Feature</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} required className={formElementClasses} />
      </div>
      <div>
        <label className={labelClasses}>Description / Functionality</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={formElementClasses} />
      </div>
      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <label className={labelClasses}>Target Launch Date</label>
          <input type="date" name="launchDate" value={formData.launchDate} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Version (Optional)</label>
          <input type="text" name="version" value={formData.version || ''} onChange={handleChange} className={formElementClasses} placeholder="e.g., v2.5.0" />
        </div>
      </div>
       <div className="grid grid-cols-2 gap-x-6">
        <div>
          <label className={labelClasses}>Platform</label>
          <select name="platform" value={formData.platform} onChange={handleChange} className={formElementClasses}>
            {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClasses}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>
            {FEATURE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClasses}>Categories (comma-separated)</label>
        <input type="text" name="categoriesString" value={formData.categoriesString || ''} onChange={handleChange} className={formElementClasses} placeholder="e.g., UI/UX, Reporting, API" />
      </div>
      <div>
        <label className={labelClasses}>Support Material URL (Optional)</label>
        <input type="url" name="supportUrl" value={formData.supportUrl || ''} onChange={handleChange} className={formElementClasses} placeholder="https://example.com/support/feature-name" />
      </div>
       <div>
        <label className={labelClasses}>Target Audience</label>
        <textarea name="targetAudience" value={formData.targetAudience || ''} onChange={handleChange} rows={2} className={formElementClasses} placeholder="Who is this feature for?" />
      </div>
       <div>
        <label className={labelClasses}>Success Metrics</label>
        <textarea name="successMetrics" value={formData.successMetrics || ''} onChange={handleChange} rows={2} className={formElementClasses} placeholder="How will we measure the success of this feature?" />
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          {isEditing ? 'Save Changes' : 'Add Feature'}
        </button>
      </div>
    </form>
  );
};

export default FeatureForm;