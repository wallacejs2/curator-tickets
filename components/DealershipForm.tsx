
import React, { useState, useEffect } from 'react';
import { Dealership, DealershipStatus, DealershipGroup, WebsiteLink } from '../types.ts';
import { DEALERSHIP_STATUS_OPTIONS } from '../constants.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { formatDisplayName } from '../utils.ts';

// A helper for consistent styling
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

interface DealershipFormProps {
  onSubmit?: (dealership: Omit<Dealership, 'id'>) => void;
  onUpdate?: (dealership: Dealership) => void;
  onClose: () => void;
  dealershipToEdit?: Dealership | null;
  allGroups: DealershipGroup[];
}

const getInitialState = (): Omit<Dealership, 'id' | 'updates'> => ({
    name: '',
    accountNumber: '',
    status: DealershipStatus.Prospect,
    hasManagedSolution: false,
    wasFullpathCustomer: false,
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
    websiteLinks: [{ url: '', clientId: '' }],
    groupIds: [],
});


const DealershipForm: React.FC<DealershipFormProps> = ({ onSubmit, onUpdate, onClose, dealershipToEdit, allGroups }) => {
  const [formData, setFormData] = useState(getInitialState());
  const isEditing = !!dealershipToEdit;

  useEffect(() => {
    if (dealershipToEdit) {
      setFormData({
        ...getInitialState(),
        ...dealershipToEdit,
        orderReceivedDate: dealershipToEdit.orderReceivedDate?.split('T')[0] || '',
        goLiveDate: dealershipToEdit.goLiveDate?.split('T')[0] || '',
        termDate: dealershipToEdit.termDate?.split('T')[0] || '',
        websiteLinks: dealershipToEdit.websiteLinks?.length ? dealershipToEdit.websiteLinks : [{ url: '', clientId: '' }],
      });
    } else {
      setFormData(getInitialState());
    }
  }, [dealershipToEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleWebsiteLinkChange = (index: number, field: keyof WebsiteLink, value: string) => {
    const newLinks = [...(formData.websiteLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, websiteLinks: newLinks }));
  };
  
  const addWebsiteLink = () => {
    setFormData(prev => ({
      ...prev,
      websiteLinks: [...(prev.websiteLinks || []), { url: '', clientId: '' }],
    }));
  };

  const removeWebsiteLink = (index: number) => {
    const newLinks = [...(formData.websiteLinks || [])];
    newLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, websiteLinks: newLinks }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      orderReceivedDate: formData.orderReceivedDate ? new Date(`${formData.orderReceivedDate}T00:00:00`).toISOString() : undefined,
      goLiveDate: formData.goLiveDate ? new Date(`${formData.goLiveDate}T00:00:00`).toISOString() : undefined,
      termDate: formData.termDate ? new Date(`${formData.termDate}T00:00:00`).toISOString() : undefined,
      websiteLinks: (formData.websiteLinks || []).filter(link => link.url.trim() !== ''),
    };

    if (isEditing) {
      onUpdate?.(submissionData as Dealership);
    } else {
      onSubmit?.(submissionData as Omit<Dealership, 'id'>);
    }
    onClose();
  };
  
  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Account Information">
        <div><label className={labelClasses}>Dealership Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className={formElementClasses} /></div>
        <div><label className={labelClasses}>Account Number (CIF)</label><input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className={formElementClasses} /></div>
        <div><label className={labelClasses}>Status</label><select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>{DEALERSHIP_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{formatDisplayName(opt)}</option>)}</select></div>
        <div><label className={labelClasses}>Enterprise (Group)</label><input type="text" name="enterprise" value={formData.enterprise || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div className="col-span-2"><label className={labelClasses}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div className="col-span-2 flex items-center gap-6">
          <label className="flex items-center text-sm"><input type="checkbox" name="hasManagedSolution" checked={formData.hasManagedSolution} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><span className="ml-2 text-gray-800">Has Managed Solution</span></label>
          <label className="flex items-center text-sm"><input type="checkbox" name="wasFullpathCustomer" checked={formData.wasFullpathCustomer} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><span className="ml-2 text-gray-800">Was Fullpath Customer</span></label>
        </div>
      </FormSection>

      <FormSection title="Key Contacts">
          <div><label className={labelClasses}>Assigned Specialist</label><input type="text" name="assignedSpecialist" value={formData.assignedSpecialist || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>Sales</label><input type="text" name="sales" value={formData.sales || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>POC Name</label><input type="text" name="pocName" value={formData.pocName || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>POC Email</label><input type="email" name="pocEmail" value={formData.pocEmail || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>POC Phone</label><input type="tel" name="pocPhone" value={formData.pocPhone || ''} onChange={handleChange} className={formElementClasses} /></div>
      </FormSection>

      <FormSection title="Order & Dates">
          <div><label className={labelClasses}>Order Number</label><input type="text" name="orderNumber" value={formData.orderNumber || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>Order Received</label><input type="date" name="orderReceivedDate" value={formData.orderReceivedDate || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>Go-Live Date</label><input type="date" name="goLiveDate" value={formData.goLiveDate || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>Term Date</label><input type="date" name="termDate" value={formData.termDate || ''} onChange={handleChange} className={formElementClasses} /></div>
      </FormSection>

      <FormSection title="System Identifiers">
          <div><label className={labelClasses}>Store Number</label><input type="text" name="storeNumber" value={formData.storeNumber || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>Branch Number</label><input type="text" name="branchNumber" value={formData.branchNumber || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>ERA System ID</label><input type="text" name="eraSystemId" value={formData.eraSystemId || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>PPSysID</label><input type="text" name="ppSysId" value={formData.ppSysId || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>BU-ID</label><input type="text" name="buId" value={formData.buId || ''} onChange={handleChange} className={formElementClasses} /></div>
      </FormSection>

      <FormSection title="Website Links" gridCols={1}>
        <div className="space-y-4">
            {(formData.websiteLinks || []).map((link, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-3 items-end">
                    <div>
                        {index === 0 && <label className={labelClasses}>URL</label>}
                        <input type="url" placeholder="https://example.com" value={link.url} onChange={(e) => handleWebsiteLinkChange(index, 'url', e.target.value)} className={formElementClasses} />
                    </div>
                     <div>
                        {index === 0 && <label className={labelClasses}>Client ID (Optional)</label>}
                        <input type="text" placeholder="e.g., AB-1234" value={link.clientId || ''} onChange={(e) => handleWebsiteLinkChange(index, 'clientId', e.target.value)} className={formElementClasses} />
                    </div>
                    <button type="button" onClick={() => removeWebsiteLink(index)} className="p-2 text-red-600 hover:bg-red-100 rounded-md mb-1"><TrashIcon className="w-5 h-5"/></button>
                </div>
            ))}
            <button type="button" onClick={addWebsiteLink} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                <PlusIcon className="w-4 h-4" /> Add Link
            </button>
        </div>
      </FormSection>
      
       <FormSection title="Groups" gridCols={1}>
        <div className="space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50">
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
      </FormSection>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {isEditing ? 'Save Changes' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export default DealershipForm;
