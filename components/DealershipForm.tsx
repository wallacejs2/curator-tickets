


import React, { useState, useEffect, useMemo } from 'react';
import { Dealership, DealershipStatus, DealershipGroup, WebsiteLink, ProductPricing, Product } from '../types.ts';
import { DEALERSHIP_STATUS_OPTIONS, PRODUCTS } from '../constants.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';

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
    status: DealershipStatus.Pending,
    products: [],
    hasManagedSolution: false,
    wasFullpathCustomer: false,
    goLiveDate: '',
    termDate: '',
    enterprise: '',
    storeNumber: '',
    branchNumber: '',
    eraSystemId: '',
    ppSysId: '',
    buId: '',
    useCustomEquityProvider: false,
    equityBookProvider: '',
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
  // FIX: Explicitly type the formData state with Partial<Dealership> to fix type inference issues.
  const [formData, setFormData] = useState<Partial<Dealership>>(getInitialState());
  const isEditing = !!dealershipToEdit;

  const groupedProducts = useMemo(() => {
    // FIX: Refactored reduce for better type safety to prevent potential type inference issues.
    return PRODUCTS.reduce<Record<Product['category'], Product[]>>((acc, product) => {
        (acc[product.category] = acc[product.category] || []).push(product);
        return acc;
    }, { New: [], Old: [] });
  }, []);

  useEffect(() => {
    if (dealershipToEdit) {
      setFormData({
        ...getInitialState(),
        ...dealershipToEdit,
        goLiveDate: dealershipToEdit.goLiveDate?.split('T')[0] || '',
        termDate: dealershipToEdit.termDate?.split('T')[0] || '',
        websiteLinks: dealershipToEdit.websiteLinks?.length ? dealershipToEdit.websiteLinks : [{ url: '', clientId: '' }],
        products: (dealershipToEdit.products || []).map(p => ({
            ...p,
            orderReceivedDate: p.orderReceivedDate?.split('T')[0] || ''
        })),
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

  // FIX: Refactor product change handler to use a functional update with .map for safer immutable state updates, which can resolve subtle type inference issues.
  const handleProductChange = (index: number, field: keyof ProductPricing, value: string) => {
    setFormData(prev => {
        const newProducts = (prev.products || []).map((product, i) => {
            if (i !== index) {
                return product;
            }
            const updatedProduct = { ...product };
            if (field === 'productId') {
                updatedProduct.productId = value;
                const selectedProduct = PRODUCTS.find(p => p.id === value);
                updatedProduct.sellingPrice = selectedProduct?.fixedPrice;
            } else if (field === 'sellingPrice') {
                updatedProduct.sellingPrice = value === '' ? undefined : parseFloat(value);
            } else if (field === 'orderNumber') {
                updatedProduct.orderNumber = value;
            } else if (field === 'orderReceivedDate') {
                updatedProduct.orderReceivedDate = value;
            }
            return updatedProduct;
        });
        return { ...prev, products: newProducts };
    });
  };

  const addProduct = () => {
    const newProduct: ProductPricing = {
        id: crypto.randomUUID(),
        orderReceivedDate: '',
        orderNumber: '',
        productId: '',
        sellingPrice: undefined,
    };
    setFormData(prev => ({
        ...prev,
        products: [...(prev.products || []), newProduct]
    }));
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({
        ...prev,
        products: (prev.products || []).filter(p => p.id !== id)
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
      products: (formData.products || []).filter(p => p.productId).map(p => ({
        ...p,
        sellingPrice: p.sellingPrice == null ? undefined : parseFloat(String(p.sellingPrice)),
        orderReceivedDate: p.orderReceivedDate ? new Date(`${p.orderReceivedDate}T00:00:00`).toISOString() : undefined
      })),
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
        <div><label className={labelClasses}>Status</label><select name="status" value={formData.status} onChange={handleChange} className={formElementClasses}>{DEALERSHIP_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div><label className={labelClasses}>Go-Live Date</label><input type="date" name="goLiveDate" value={formData.goLiveDate || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div><label className={labelClasses}>Term Date</label><input type="date" name="termDate" value={formData.termDate || ''} onChange={handleChange} className={formElementClasses} /></div>
      </FormSection>

      <FormSection title="Organization Details">
        <div><label className={labelClasses}>Enterprise (Group)</label><input type="text" name="enterprise" value={formData.enterprise || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div><label className={labelClasses}>Store Number</label><input type="text" name="storeNumber" value={formData.storeNumber || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div><label className={labelClasses}>Branch Number</label><input type="text" name="branchNumber" value={formData.branchNumber || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div><label className={labelClasses}>ERA System ID</label><input type="text" name="eraSystemId" value={formData.eraSystemId || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div><label className={labelClasses}>PPSysID</label><input type="text" name="ppSysId" value={formData.ppSysId || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div><label className={labelClasses}>BU-ID</label><input type="text" name="buId" value={formData.buId || ''} onChange={handleChange} className={formElementClasses} /></div>
        <div className="col-span-2 sm:col-span-1">
          <label className="flex items-center text-sm mb-1 h-5">
              <input type="checkbox" name="useCustomEquityProvider" checked={!!formData.useCustomEquityProvider} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
              <span className="ml-2 text-gray-800">Use Custom Provider</span>
          </label>
          <input 
            type="text" 
            name="equityBookProvider" 
            value={formData.equityBookProvider || ''} 
            onChange={handleChange} 
            className={`${formElementClasses} disabled:bg-gray-200 disabled:text-gray-500`}
            disabled={!formData.useCustomEquityProvider}
            placeholder={!formData.useCustomEquityProvider ? "Fullpath KBB (Default)" : "Provider name..."}
          />
        </div>
        <div className="col-span-2"><label className={labelClasses}>Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={formElementClasses} /></div>
         <div className="col-span-2">
            <label className={labelClasses}>Dealership Groups</label>
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
      
      <FormSection title="Customer Status" gridCols={1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <label className="flex items-center text-sm"><input type="checkbox" name="hasManagedSolution" checked={formData.hasManagedSolution} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><span className="ml-2 text-gray-800">Has Managed Solution</span></label>
            <label className="flex items-center text-sm"><input type="checkbox" name="wasFullpathCustomer" checked={formData.wasFullpathCustomer} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><span className="ml-2 text-gray-800">Was Fullpath Customer</span></label>
        </div>
      </FormSection>

      <FormSection title="Team & Contacts">
          <div><label className={labelClasses}>Assigned Specialist</label><input type="text" name="assignedSpecialist" value={formData.assignedSpecialist || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>Sales</label><input type="text" name="sales" value={formData.sales || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>POC Name</label><input type="text" name="pocName" value={formData.pocName || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>POC Email</label><input type="email" name="pocEmail" value={formData.pocEmail || ''} onChange={handleChange} className={formElementClasses} /></div>
          <div><label className={labelClasses}>POC Phone</label><input type="tel" name="pocPhone" value={formData.pocPhone || ''} onChange={handleChange} className={formElementClasses} /></div>
      </FormSection>

      <FormSection title="Products & Pricing" gridCols={1}>
        <div className="space-y-4">
            {/* FIX: Use Array.isArray as a type guard to prevent runtime errors if formData.products is not an array. */}
            {(Array.isArray(formData.products) ? formData.products : []).map((product, index) => {
                const selectedProduct = PRODUCTS.find(p => p.id === product.productId);
                return (
                    <div key={product.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,2fr,1fr,1fr,auto] gap-3 items-end p-3 bg-gray-50 rounded-md border">
                        <div>
                            <label className={labelClasses}>Received</label>
                            <input type="date" name="orderReceivedDate" value={product.orderReceivedDate || ''} onChange={(e) => handleProductChange(index, 'orderReceivedDate', e.target.value)} className={formElementClasses} />
                        </div>
                         <div>
                            <label className={labelClasses}>Order Number</label>
                            <input type="text" name="orderNumber" value={product.orderNumber || ''} onChange={(e) => handleProductChange(index, 'orderNumber', e.target.value)} className={formElementClasses} />
                        </div>
                        <div>
                            <label className={labelClasses}>Product</label>
                            <select value={product.productId} onChange={(e) => handleProductChange(index, 'productId', e.target.value)} className={formElementClasses}>
                                <option value="">-- Select a Product --</option>
                                {Object.entries(groupedProducts).map(([category, products]) => (
                                    <optgroup label={category} key={category}>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.id} | {p.name}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Fixed Price</label>
                            <div className="mt-1 h-9 flex items-center px-3 text-sm text-gray-600 bg-gray-200 rounded-sm border border-gray-300">
                                {selectedProduct ? `$${selectedProduct.fixedPrice.toLocaleString()}` : 'N/A'}
                            </div>
                        </div>
                         <div>
                            <label className={labelClasses}>Selling Price ($)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={product.sellingPrice ?? ''}
                                onChange={(e) => handleProductChange(index, 'sellingPrice', e.target.value)}
                                className={formElementClasses}
                                placeholder="e.g., 2500"
                            />
                        </div>
                        <button type="button" onClick={() => removeProduct(product.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md mb-1"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                )
            })}
             <button type="button" onClick={addProduct} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mt-2">
                <PlusIcon className="w-4 h-4" /> Add Product
            </button>
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