
import React, { useState, useEffect } from 'react';
import { Shopper, Dealership } from '../types.ts';

type FormSaveCallback = (shopper: Omit<Shopper, 'id'> | Shopper) => void;

interface ShopperFormProps {
  onSave: FormSaveCallback;
  onClose: () => void;
  shopperToEdit?: Shopper | null;
  allDealerships: Dealership[];
}

const getInitialState = (): Omit<Shopper, 'id'> => ({
  customerName: '',
  curatorId: '',
  curatorLink: '',
  email: '',
  phone: '',
  cdpId: '',
  dmsId: '',
  uniqueIssue: '',
  recentActivity: [],
  dealershipIds: [],
  ticketIds: [],
});

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

const ShopperForm: React.FC<ShopperFormProps> = ({ onSave, onClose, shopperToEdit, allDealerships }) => {
  const [formData, setFormData] = useState<Omit<Shopper, 'id'> | Shopper>(getInitialState());
  const isEditing = !!shopperToEdit;

  useEffect(() => {
    if (shopperToEdit) {
      setFormData({ ...getInitialState(), ...shopperToEdit });
    } else {
      setFormData(getInitialState());
    }
  }, [shopperToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'dealershipId') {
      setFormData(prev => ({ ...prev, dealershipIds: value ? [value] : [] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const formElementClasses = "mt-1 block w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Shopper Information">
        <div className="col-span-2">
          <label className={labelClasses}>Customer Name</label>
          <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div className="col-span-2">
          <label className={labelClasses}>Associated Dealership</label>
          <select
            name="dealershipId"
            value={(formData.dealershipIds && formData.dealershipIds[0]) || ''}
            onChange={handleChange}
            className={formElementClasses}
          >
            <option value="">Select a dealership...</option>
            {allDealerships.sort((a, b) => a.name.localeCompare(b.name)).map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.accountNumber})</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses}>Email</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Phone</label>
          <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Curator ID</label>
          <input type="text" name="curatorId" value={formData.curatorId} onChange={handleChange} required className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>Curator Link</label>
          <input type="url" name="curatorLink" value={formData.curatorLink || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>CDP-ID</label>
          <input type="text" name="cdpId" value={formData.cdpId || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div>
          <label className={labelClasses}>DMS-ID</label>
          <input type="text" name="dmsId" value={formData.dmsId || ''} onChange={handleChange} className={formElementClasses} />
        </div>
        <div className="col-span-2">
          <label className={labelClasses}>Unique Issue</label>
          <textarea name="uniqueIssue" value={formData.uniqueIssue} onChange={handleChange} required rows={4} className={formElementClasses} />
        </div>
      </FormSection>

      <div className="mt-8 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md shadow-sm hover:bg-blue-700">
          {isEditing ? 'Save Changes' : 'Create Shopper'}
        </button>
      </div>
    </form>
  );
};

export default ShopperForm;
