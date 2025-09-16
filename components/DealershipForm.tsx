

import React, { useState, useEffect } from 'react';
import { Dealership, DealershipStatus, DealershipGroup } from '../types.ts';
import { XIcon } from './icons/XIcon.tsx';

type FormSubmitCallback = (dealership: Omit<Dealership, 'id'>) => void;
type FormUpdateCallback = (dealership: Dealership) => void;

interface DealershipFormProps {
  onSubmit: FormSubmitCallback;
  onUpdate: FormUpdateCallback;
  dealershipToEdit?: Dealership | null;
  onClose: () => void;
  allGroups: DealershipGroup[];
}

const initialFormData: Omit<Dealership, 'id'> = {
  name: '',
  accountNumber: '',
  clientId: '',
  status: DealershipStatus.Onboarding,
  hasManagedSolution: false,
  orderNumber: '',
  orderReceivedDate: '',
  goLiveDate: '',
  termDate: '',
  enterprise: '',
  storeNumber: '',
  branchNumber: '',
  eraSystemId: '',
  ppSysId: '',
  buId: '',
  address: '',
  assignedSpecialist: '',
  sales: '',
  pocName: '',
  pocEmail: '',
  pocPhone: '',
  websiteLinks: [],
  groupIds: [],
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

const DealershipForm: React.FC<DealershipFormProps> = ({ onSubmit, onUpdate, dealershipToEdit, onClose, allGroups }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [newLink, setNewLink] = useState('');
  const isEditing = !!dealershipToEdit;

  // This function safely converts a UTC ISO string to a YYYY-MM-DD string for date inputs.
  const toInputDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      // Slicing the string is safer than using new Date() which can have timezone issues.
      return isoString.slice(0, 10);
    } catch {
      return '';
    }
  };
  
  useEffect(() => {
    if (dealershipToEdit) {
      setFormData({
        ...initialFormData,
        ...dealershipToEdit,
        hasManagedSolution: dealershipToEdit.hasManagedSolution || false,
        websiteLinks: dealershipToEdit.websiteLinks || [],
        orderReceivedDate: toInputDate(dealershipToEdit.orderReceivedDate),
        goLiveDate: toInputDate(dealershipToEdit.goLiveDate),
        termDate: toInputDate(dealershipToEdit.termDate),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [dealershipToEdit]);
  
  // FIX: Destructuring `checked` was causing a TypeScript error because it doesn't exist on all element types.
  // This has been updated to safely handle both checkbox and other input types.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => {
      const currentGroupIds = prev.groupIds || [];
      const newGroupIds = currentGroupIds.includes(groupId)
        ? currentGroupIds.filter(id => id !== groupId)
        : [...currentGroupIds, groupId];
      return { ...prev, groupIds: newGroupIds };
    });
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
        try {
            // Basic validation: check if it can be parsed as a URL.
            new URL(newLink.trim());
            if (!(formData.websiteLinks || []).includes(newLink.trim())) {
                setFormData(prev => ({
                    ...prev,
                    websiteLinks: [...(prev.websiteLinks || []), newLink.trim()]
                }));
                setNewLink('');
            }
        } catch (_) {
            alert('Please enter a valid URL (e.g., https://example.com)');
        }
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    setFormData(prev => ({
        ...prev,
        websiteLinks: (prev.websiteLinks || []).filter(link => link !== linkToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This function converts a YYYY-MM-DD string to a full ISO string at UTC midnight,
    // which prevents timezone-related "off-by-one-day" errors.
    const toUtcIsoString = (dateString?: string) => {
        if (!dateString || dateString.length === 0) return undefined;
        return `${dateString}T00:00:00.000Z`;
    }

    const submissionData = {
        ...formData,
        orderReceivedDate: toUtcIsoString(formData.orderReceivedDate),
        goLiveDate: toUtcIsoString(formData.goLiveDate),
        termDate: toUtcIsoString(formData.termDate),
    };

    if (isEditing) {
      onUpdate({ id: dealershipToEdit!.id, ...submissionData });
    } else {
      onSubmit(submissionData);
    }
    onClose();
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Account Information">
        <div>
          <label className={labelClasses}>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Account Number (CIF)</label>
          <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>
            {Object.values(DealershipStatus).map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
         <div>
          <label className={labelClasses}>Enterprise (Group Name)</label>
          <input type="text" name="enterprise" value={formData.enterprise || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div className="col-span-2 flex items-center mt-2">
            <input
                type="checkbox"
                id="hasManagedSolution"
                name="hasManagedSolution"
                checked={formData.hasManagedSolution || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasManagedSolution" className="ml-2 block text-sm text-gray-900">
                This dealership has a Managed Solution.
            </label>
        </div>
      </FormSection>

      <FormSection title="Groups" gridCols={1}>
        <div className="col-span-1">
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
      </FormSection>

      <FormSection title="Key Contacts">
        <div>
            <label className={labelClasses}>Assigned Specialist</label>
            <input type="text" name="assignedSpecialist" value={formData.assignedSpecialist || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
            <label className={labelClasses}>Sales</label>
            <input type="text" name="sales" value={formData.sales || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div className="col-span-2">
            <label className={labelClasses}>Point of Contact Name</label>
            <input type="text" name="pocName" value={formData.pocName || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
            <label className={labelClasses}>Point of Contact Email</label>
            <input type="email" name="pocEmail" value={formData.pocEmail || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
            <label className={labelClasses}>Point of Contact Phone</label>
            <input type="tel" name="pocPhone" value={formData.pocPhone || ''} onChange={handleChange} className={formElementClasses} />
        </div>
      </FormSection>
      
      <FormSection title="Website Links" gridCols={1}>
        <div>
            <label className={labelClasses}>Add a Website URL</label>
            <div className="mt-1 flex gap-2">
                <input
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                    placeholder="https://example.com"
                    className={formElementClasses + " flex-grow !mt-0"}
                />
                <button
                    type="button"
                    onClick={handleAddLink}
                    className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-sm shadow-sm hover:bg-gray-300 text-sm flex-shrink-0"
                >
                    Add
                </button>
            </div>
            <div className="mt-3 space-y-2">
                {(formData.websiteLinks || []).map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">{link}</a>
                        <button
                            type="button"
                            onClick={() => handleRemoveLink(link)}
                            className="text-red-500 hover:text-red-700 p-1"
                            aria-label={`Remove ${link}`}
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {(formData.websiteLinks || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-2">No website links added yet.</p>
                )}
            </div>
        </div>
      </FormSection>

      <FormSection title="Order & Dates" gridCols={3}>
        <div>
            <label className={labelClasses}>Order Number</label>
            <input type="text" name="orderNumber" value={formData.orderNumber || ''} onChange={handleChange} className={formElementClasses} />
        </div>
         <div>
            <label className={labelClasses}>Order Received (Ship Date)</label>
            <input type="date" name="orderReceivedDate" value={formData.orderReceivedDate || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
            <label className={labelClasses}>Go-Live Date</label>
            <input type="date" name="goLiveDate" value={formData.goLiveDate || ''} onChange={handleChange} className={formElementClasses} />
        </div>
         <div>
            <label className={labelClasses}>Term Date</label>
            <input type="date" name="termDate" value={formData.termDate || ''} onChange={handleChange} className={formElementClasses} />
        </div>
      </FormSection>

      <FormSection title="Identifiers" gridCols={3}>
        <div>
          <label className={labelClasses}>Store Number</label>
          <input type="text" name="storeNumber" value={formData.storeNumber || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Branch Number</label>
          <input type="text" name="branchNumber" value={formData.branchNumber || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>ERA System ID</label>
          <input type="text" name="eraSystemId" value={formData.eraSystemId || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>PPSysID</label>
          <input type="text" name="ppSysId" value={formData.ppSysId || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>BU-ID</label>
          <input type="text" name="buId" value={formData.buId || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Client_ID</label>
          <input type="text" name="clientId" value={formData.clientId || ''} onChange={handleChange} className={formElementClasses} />
        </div>
      </FormSection>
      
      <FormSection title="Location" gridCols={1}>
        <div>
            <label className={labelClasses}>Address</label>
            <textarea name="address" value={formData.address || ''} onChange={handleChange} rows={3} className={formElementClasses} />
        </div>
      </FormSection>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
          {isEditing ? 'Save Changes' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export default DealershipForm;