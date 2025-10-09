


import React, { useState, useMemo, useEffect } from 'react';
import { Dealership, DealershipStatus, Ticket, Project, Task, Meeting, FeatureAnnouncement, Status, ProjectStatus, TaskStatus, Update, DealershipGroup, Shopper, ProductPricing, Product, WebsiteLink } from '../types.ts';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import LinkingSection from './common/LinkingSection.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import { PRODUCTS, DEALERSHIP_STATUS_OPTIONS } from '../constants.ts';
import EditableText from './common/inlineEdit/EditableText.tsx';
import EditableSelect from './common/inlineEdit/EditableSelect.tsx';
import EditableDate from './common/inlineEdit/EditableDate.tsx';
import EditableCheckbox from './common/inlineEdit/EditableCheckbox.tsx';
import EditableTextArea from './common/inlineEdit/EditableTextArea.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';

type EntityType = 'ticket' | 'project' | 'task' | 'meeting' | 'dealership' | 'feature' | 'shopper';

interface DealershipDetailViewProps {
  dealership: Dealership;
  onUpdate: (dealership: Dealership) => void;
  onDelete: (dealershipId: string) => void;
  onExport: () => void;
  onAddUpdate: (dealershipId: string, comment: string, author: string, date: string) => void;
  onEditUpdate: (updatedUpdate: Update) => void;
  onDeleteUpdate: (updateId: string) => void;
  isReadOnly?: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
  
  // All entities for linking
  allTickets: Ticket[];
  allProjects: Project[];
  allTasks: (Task & { projectName?: string; projectId: string | null; })[];
  allMeetings: Meeting[];
  allDealerships: Dealership[];
  allFeatures: FeatureAnnouncement[];
  allGroups: DealershipGroup[];
  allShoppers: Shopper[];

  // Linking handlers
  onLink: (toType: EntityType, toId: string) => void;
  onUnlink: (toType: EntityType, toId: string) => void;
  onSwitchView: (type: EntityType, id: string) => void;
}

const DetailField: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{value || 'N/A'}</p>
  </div>
);

const statusColors: Record<DealershipStatus, string> = {
  [DealershipStatus.Pending]: 'bg-purple-200 text-purple-800',
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const DealershipDetailView: React.FC<DealershipDetailViewProps> = ({ 
    dealership, onUpdate, onDelete, onExport, isReadOnly = false,
    onAddUpdate, onEditUpdate, onDeleteUpdate, showToast,
    allTickets, allProjects, allTasks, allMeetings, allDealerships, allFeatures, allGroups, allShoppers,
    onLink, onUnlink, onSwitchView
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<Dealership>>(dealership);

    const [newUpdate, setNewUpdate] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [updateDate, setUpdateDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    
    const MAX_COMMENT_LENGTH = 2000;
    
    useEffect(() => {
        if (!isEditing) {
            setEditedData(dealership);
        }
    }, [dealership, isEditing]);

    const { totalFixedPrice, totalSellingPrice } = useMemo(() => {
        const products = isEditing ? editedData.products : dealership.products;
        if (!products || products.length === 0) {
            return { totalFixedPrice: 0, totalSellingPrice: 0 };
        }
    
        return products.reduce(
            (totals, productPricing) => {
                const productInfo = PRODUCTS.find(p => p.id === productPricing.productId);
                if (productInfo) {
                    totals.totalFixedPrice += productInfo.fixedPrice;
                    totals.totalSellingPrice += productPricing.sellingPrice ?? 0;
                }
                return totals;
            },
            { totalFixedPrice: 0, totalSellingPrice: 0 }
        );
    }, [isEditing, editedData.products, dealership.products]);
    
    const dealershipMemberOfGroups = useMemo(() => allGroups.filter(g => (dealership.groupIds || []).includes(g.id)), [allGroups, dealership.groupIds]);

    const handleFieldSave = (field: keyof Dealership, value: any) => {
      setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setEditedData(dealership);
        setIsEditing(false);
    };

    const handleSave = () => {
        const dataToSave = {
            ...editedData,
             products: (editedData.products || []).filter(p => p.productId).map(p => ({
                ...p,
                sellingPrice: p.sellingPrice == null ? undefined : parseFloat(String(p.sellingPrice)),
                orderReceivedDate: p.orderReceivedDate ? new Date(`${p.orderReceivedDate}`).toISOString() : undefined
            })),
            goLiveDate: editedData.goLiveDate ? new Date(`${editedData.goLiveDate}`).toISOString() : undefined,
            termDate: editedData.termDate ? new Date(`${editedData.termDate}`).toISOString() : undefined,
            websiteLinks: (editedData.websiteLinks || []).filter(link => link.url.trim() !== ''),
        }
        onUpdate(dataToSave as Dealership);
        setIsEditing(false);
    };

    // --- Handlers for multi-value fields in edit mode ---
    const groupedProducts = useMemo(() => {
        return PRODUCTS.reduce<Record<Product['category'], Product[]>>((acc, product) => {
            (acc[product.category] = acc[product.category] || []).push(product);
            return acc;
        }, { New: [], Old: [] });
    }, []);

    // FIX: Refactor product change handler to use a functional update with .map for safer immutable state updates, which can resolve subtle type inference issues.
    const handleProductChange = (index: number, field: keyof ProductPricing, value: string) => {
        setEditedData(prev => {
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
        const newProduct: ProductPricing = { id: crypto.randomUUID(), productId: '', sellingPrice: undefined };
        setEditedData(prev => ({ ...prev, products: [...(prev.products || []), newProduct] }));
    };

    const removeProduct = (id: string) => {
        setEditedData(prev => ({ ...prev, products: (prev.products || []).filter(p => p.id !== id) }));
    };

    const handleWebsiteLinkChange = (index: number, field: keyof WebsiteLink, value: string) => {
        const newLinks = [...(editedData.websiteLinks || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setEditedData(prev => ({ ...prev, websiteLinks: newLinks }));
    };
    
    const addWebsiteLink = () => {
        setEditedData(prev => ({ ...prev, websiteLinks: [...(prev.websiteLinks || []), { url: '', clientId: '' }] }));
    };

    const removeWebsiteLink = (index: number) => {
        const newLinks = [...(editedData.websiteLinks || [])];
        newLinks.splice(index, 1);
        setEditedData(prev => ({ ...prev, websiteLinks: newLinks }));
    };

    const handleGroupToggle = (groupId: string) => {
        setEditedData(prev => {
            const currentGroupIds = prev.groupIds || [];
            const newGroupIds = currentGroupIds.includes(groupId)
                ? currentGroupIds.filter(id => id !== groupId)
                : [...currentGroupIds, groupId];
            return { ...prev, groupIds: newGroupIds };
        });
    };
    
    // Linked items
    const linkedTickets = allTickets.filter(item => (dealership.ticketIds || []).includes(item.id));
    const linkedProjects = allProjects.filter(item => (dealership.projectIds || []).includes(item.id));
    const linkedMeetings = allMeetings.filter(item => (dealership.meetingIds || []).includes(item.id));
    const linkedDealerships = allDealerships.filter(item => item.id !== dealership.id && (dealership.linkedDealershipIds || []).includes(item.id));
    const linkedFeatures = allFeatures.filter(item => (dealership.featureIds || []).includes(item.id));
    const linkedShoppers = allShoppers.filter(item => (dealership.shopperIds || []).includes(item.id));
    const directlyLinkedTaskIds = dealership.taskIds || [];
    const taskIdsFromLinkedTickets = linkedTickets.flatMap(ticket => ticket.tasks?.map(task => task.id) || []);
    const tasksFromLinkedProjects = allProjects.filter(p => (dealership.projectIds || []).includes(p.id)).flatMap(p => p.tasks?.map(t => t.id) || []);
    const allRelatedTaskIds = [...new Set([...directlyLinkedTaskIds, ...taskIdsFromLinkedTickets, ...tasksFromLinkedProjects])];
    const linkedTasks = allTasks.filter(item => allRelatedTaskIds.includes(item.id));

    // Available items
    const availableTickets = allTickets.filter(item => item.status !== Status.Completed && !(dealership.ticketIds || []).includes(item.id));
    const availableProjects = allProjects.filter(item => item.status !== ProjectStatus.Completed && !(dealership.projectIds || []).includes(item.id));
    const availableTasks = allTasks.filter(item => item.status !== TaskStatus.Done && !allRelatedTaskIds.includes(item.id));
    const availableMeetings = allMeetings.filter(item => !(dealership.meetingIds || []).includes(item.id));
    const availableDealerships = allDealerships.filter(item => item.id !== dealership.id && !(dealership.linkedDealershipIds || []).includes(item.id));
    const availableFeatures = allFeatures.filter(item => !(dealership.featureIds || []).includes(item.id));
    const availableShoppers = allShoppers.filter(item => !(dealership.shopperIds || []).includes(item.id));
    
    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUpdate.trim() && authorName.trim() && updateDate) {
          const commentAsHtml = newUpdate.replace(/\n/g, '<br />');
          onAddUpdate(dealership.id, commentAsHtml, authorName.trim(), updateDate);
          setNewUpdate('');
          setAuthorName('');
        }
    };

    const handleCopyInfo = (e: React.MouseEvent) => {
        onExport(); // The export function already does this text formatting
        showToast('Dealership info copied!', 'success');
    };
    
    const data = isEditing ? editedData : dealership;

    return (
        <div>
            {isDeleteModalOpen && (
                <Modal title="Confirm Deletion" onClose={() => setIsDeleteModalOpen(false)}>
                    <p className="text-gray-700">Are you sure you want to delete this dealership account? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={() => { onDelete(dealership.id); setIsDeleteModalOpen(false); }} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-red-700">Delete Account</button>
                    </div>
                </Modal>
            )}

            {!isReadOnly && (
              <div className="flex justify-end items-center gap-3 mb-6">
                  {isEditing ? (
                      <>
                        <button onClick={handleCancel} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 text-sm">Cancel</button>
                        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Save Changes</button>
                      </>
                  ) : (
                      <>
                        <button onClick={handleCopyInfo} className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 text-sm"><ContentCopyIcon className="w-4 h-4"/><span>Copy Info</span></button>
                        <button onClick={onExport} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 text-sm"><DownloadIcon className="w-4 h-4"/><span>Export</span></button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 text-sm"><TrashIcon className="w-4 h-4"/><span>Delete</span></button>
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 text-sm"><PencilIcon className="w-4 h-4"/><span>Edit</span></button>
                      </>
                  )}
              </div>
            )}

            <div className="space-y-8">
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <EditableText label="Account Name" value={data.name} onSave={(v) => handleFieldSave('name', v)} isReadOnly={!isEditing} />
                        <EditableText label="Account Number (CIF)" value={data.accountNumber} onSave={(v) => handleFieldSave('accountNumber', v)} isReadOnly={!isEditing} />
                        <EditableSelect label="Status" value={data.status || ''} onSave={(v) => handleFieldSave('status', v)} options={DEALERSHIP_STATUS_OPTIONS} isReadOnly={!isEditing} tagColors={statusColors} />
                        <EditableDate label="Go-Live Date" value={data.goLiveDate} onSave={(v) => handleFieldSave('goLiveDate', v)} isReadOnly={!isEditing} />
                        <EditableDate label="Term Date" value={data.termDate} onSave={(v) => handleFieldSave('termDate', v)} isReadOnly={!isEditing} />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <EditableText label="Enterprise (Group)" value={data.enterprise} onSave={(v) => handleFieldSave('enterprise', v)} isReadOnly={!isEditing} />
                        <EditableText label="Store Number" value={data.storeNumber} onSave={(v) => handleFieldSave('storeNumber', v)} isReadOnly={!isEditing} />
                        <EditableText label="Branch Number" value={data.branchNumber} onSave={(v) => handleFieldSave('branchNumber', v)} isReadOnly={!isEditing} />
                        <EditableText label="ERA System ID" value={data.eraSystemId} onSave={(v) => handleFieldSave('eraSystemId', v)} isReadOnly={!isEditing} />
                        <EditableText label="PPSysID" value={data.ppSysId} onSave={(v) => handleFieldSave('ppSysId', v)} isReadOnly={!isEditing} />
                        <EditableText label="BU-ID" value={data.buId} onSave={(v) => handleFieldSave('buId', v)} isReadOnly={!isEditing} />
                         <div className="sm:col-span-3"><EditableText label="Address" value={data.address} onSave={(v) => handleFieldSave('address', v)} isReadOnly={!isEditing} /></div>
                        
                        <div className="sm:col-span-3">
                             <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Groups</h4>
                            {isEditing ? (
                                 <div className="space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md bg-gray-50">
                                    {allGroups.map(group => (
                                        <label key={group.id} className="flex items-center text-sm cursor-pointer"><input type="checkbox" checked={(editedData.groupIds || []).includes(group.id)} onChange={() => handleGroupToggle(group.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/><span className="ml-2 text-gray-800">{group.name}</span></label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-800 mt-1">{dealershipMemberOfGroups.length > 0 ? dealershipMemberOfGroups.map(g => g.name).join(', ') : 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Website Links</h4>
                    {isEditing ? (
                         <div className="space-y-4">
                            {(editedData.websiteLinks || []).map((link, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-3 items-end">
                                    <EditableText label={index === 0 ? "URL" : ""} value={link.url} onSave={(v) => handleWebsiteLinkChange(index, 'url', v)} isReadOnly={!isEditing} isUrl={true} placeholder="https://example.com"/>
                                    <EditableText label={index === 0 ? "Client ID" : ""} value={link.clientId} onSave={(v) => handleWebsiteLinkChange(index, 'clientId', v)} isReadOnly={!isEditing} placeholder="e.g., AB-1234"/>
                                    <button type="button" onClick={() => removeWebsiteLink(index)} className="p-2 text-red-600 hover:bg-red-100 rounded-md mb-1"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addWebsiteLink} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"><PlusIcon className="w-4 h-4" /> Add Link</button>
                        </div>
                    ) : ((dealership.websiteLinks && dealership.websiteLinks.length > 0) ? (
                        <ul className="space-y-2">
                            {dealership.websiteLinks.map((link, index) => (
                                <li key={index} className="p-2 bg-gray-50 rounded-md border">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{link.url}</a>
                                    {link.clientId && <p className="text-xs text-gray-600 mt-1">Client ID: <span className="font-medium">{link.clientId}</span></p>}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-500 italic">No website links added.</p>)}
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <EditableCheckbox label="Has Managed Solution" value={data.hasManagedSolution} onSave={(v) => handleFieldSave('hasManagedSolution', v)} isReadOnly={!isEditing} />
                       <EditableCheckbox label="Previously Fullpath Customer" value={data.wasFullpathCustomer} onSave={(v) => handleFieldSave('wasFullpathCustomer', v)} isReadOnly={!isEditing} />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <EditableText label="Assigned Specialist" value={data.assignedSpecialist} onSave={(v) => handleFieldSave('assignedSpecialist', v)} isReadOnly={!isEditing} />
                        <EditableText label="Sales" value={data.sales} onSave={(v) => handleFieldSave('sales', v)} isReadOnly={!isEditing} />
                        <div />
                        <EditableText label="Point of Contact Name" value={data.pocName} onSave={(v) => handleFieldSave('pocName', v)} isReadOnly={!isEditing} />
                        <EditableText label="Point of Contact Email" value={data.pocEmail} onSave={(v) => handleFieldSave('pocEmail', v)} isReadOnly={!isEditing} />
                        <EditableText label="Point of Contact Phone" value={data.pocPhone} onSave={(v) => handleFieldSave('pocPhone', v)} isReadOnly={!isEditing} />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Products &amp; Pricing</h3>
                    <div className="space-y-3">
                        {/* FIX: Use Array.isArray as a type guard to prevent runtime errors if data.products is not an array. */}
                        {(Array.isArray(data.products) ? data.products : []).map((product, index) => {
                            const selectedProduct = PRODUCTS.find(p => p.id === product.productId);
                            return isEditing ? (
                                <div key={product.id} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,2fr,1fr,1fr,auto] gap-3 items-end p-3 bg-gray-50 rounded-md border">
                                    <div><label className="text-xs font-semibold text-gray-500">Received</label><input type="date" value={product.orderReceivedDate?.split('T')[0] || ''} onChange={(e) => handleProductChange(index, 'orderReceivedDate', e.target.value)} className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-sm py-1 px-2 text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-500">Order #</label><input type="text" value={product.orderNumber || ''} onChange={(e) => handleProductChange(index, 'orderNumber', e.target.value)} className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-sm py-1 px-2 text-sm" /></div>
                                    <div><label className="text-xs font-semibold text-gray-500">Product</label><select value={product.productId} onChange={(e) => handleProductChange(index, 'productId', e.target.value)} className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-sm py-1 px-2 text-sm"><option value="">-- Select --</option>{Object.entries(groupedProducts).map(([cat, prods]) => (<optgroup label={cat} key={cat}>{prods.map(p => <option key={p.id} value={p.id}>{p.id} | {p.name}</option>)}</optgroup>))}</select></div>
                                    <div><label className="text-xs font-semibold text-gray-500">Fixed</label><div className="mt-1 h-[34px] flex items-center px-3 text-sm text-gray-600 bg-gray-200 rounded-sm border">{selectedProduct ? `$${selectedProduct.fixedPrice.toLocaleString()}` : 'N/A'}</div></div>
                                    <div><label className="text-xs font-semibold text-gray-500">Selling</label><input type="number" min="0" step="0.01" value={product.sellingPrice ?? ''} onChange={(e) => handleProductChange(index, 'sellingPrice', e.target.value)} className="mt-1 block w-full bg-white text-gray-900 border border-gray-300 rounded-sm py-1 px-2 text-sm" /></div>
                                    <button type="button" onClick={() => removeProduct(product.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md mb-0"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            ) : (
                                <div key={product.id} className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-3 bg-gray-50 rounded-md border">
                                    <div><DetailField label="Received" value={product.orderReceivedDate ? new Date(product.orderReceivedDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'} /></div>
                                    <div><DetailField label="Order Number" value={product.orderNumber} /></div>
                                    <div className="sm:col-span-1"><DetailField label="Product" value={`${selectedProduct?.id} | ${selectedProduct?.name}`} /></div>
                                    <div className="sm:col-span-1"><DetailField label="Fixed Price" value={selectedProduct ? `$${selectedProduct.fixedPrice.toLocaleString()}` : 'N/A'} /></div>
                                    <div className="sm:col-span-1"><DetailField label="Selling Price" value={product.sellingPrice != null ? `$${product.sellingPrice.toLocaleString()}` : 'N/A'} /></div>
                                </div>
                            )
                        })}
                        {isEditing && <button type="button" onClick={addProduct} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mt-2"><PlusIcon className="w-4 h-4" /> Add Product</button>}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4 mt-4 border-t-2 border-gray-300">
                            <div className="sm:col-span-3 font-bold text-gray-800 text-base flex items-end pb-1">Total</div>
                            <div className="sm:col-span-1"><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fixed</h4><p className="text-sm font-semibold text-gray-900 mt-1">{`$${totalFixedPrice.toLocaleString()}`}</p></div>
                            <div className="sm:col-span-1"><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Selling</h4><p className="text-sm font-semibold text-gray-900 mt-1">{`$${totalSellingPrice.toLocaleString()}`}</p></div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800 mb-4">Updates ({dealership.updates?.length || 0})</h3>
                    {!isReadOnly && !isEditing && (
                      <form onSubmit={handleUpdateSubmit} className="p-4 border border-gray-200 rounded-md mb-6 space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700">Add a new update</h4>
                          <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your Name" required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                          <input type="date" value={updateDate} onChange={(e) => setUpdateDate(e.target.value)} required className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                          <textarea value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Type your comment here..." required rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white" maxLength={MAX_COMMENT_LENGTH} />
                          <div className="flex justify-between items-center"><p className="text-xs text-gray-500">{newUpdate.length}/{MAX_COMMENT_LENGTH}</p><button type="submit" disabled={!newUpdate.trim()||!authorName.trim()} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">Add Update</button></div>
                      </form>
                    )}
                    <div className="space-y-4">
                        {[...(dealership.updates || [])].reverse().map((update) => (
                            <div key={update.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                {editingUpdateId === update.id && !isReadOnly ? (
                                    <div>
                                        <textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} rows={4} className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"/>
                                        <div className="flex justify-end gap-2 mt-2"><button onClick={() => setEditingUpdateId(null)} className="bg-white text-gray-700 font-semibold px-3 py-1 rounded-md border border-gray-300 text-sm">Cancel</button><button onClick={() => {onEditUpdate({ ...update, comment: editedComment.replace(/\n/g, '<br />') }); setEditingUpdateId(null);}} className="bg-blue-600 text-white font-semibold px-3 py-1 rounded-md text-sm">Save</button></div>
                                    </div>
                                ) : (
                                    <div className="group">
                                        <div className="flex justify-between items-start"><p className="text-xs text-gray-500 font-medium"><span className="font-semibold text-gray-700">{update.author}</span><span className="mx-1.5">•</span><span>{new Date(update.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span></p>
                                            {!isReadOnly && !isEditing && (<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => {setEditingUpdateId(update.id); setEditedComment(update.comment.replace(/<br\s*\/?>/gi, '\n'));}} className="p-1 text-gray-400 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button><button onClick={() => {if(window.confirm('Are you sure?')){onDeleteUpdate(update.id)}}} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button></div>)}
                                        </div>
                                        <div className="mt-2 text-sm text-gray-800 rich-text-content" dangerouslySetInnerHTML={{ __html: update.comment }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {!isReadOnly && !isEditing && (
                  <>
                    <LinkingSection title="Linked Tickets" itemTypeLabel="ticket" linkedItems={linkedTickets} availableItems={availableTickets} onLink={(id) => onLink('ticket', id)} onUnlink={(id) => onUnlink('ticket', id)} onItemClick={(id) => onSwitchView('ticket', id)} />
                    <LinkingSection title="Linked Projects" itemTypeLabel="project" linkedItems={linkedProjects} availableItems={availableProjects} onLink={(id) => onLink('project', id)} onUnlink={(id) => onUnlink('project', id)} onItemClick={(id) => onSwitchView('project', id)} />
                    <LinkingSection title="Linked Tasks" itemTypeLabel="task" linkedItems={linkedTasks} availableItems={availableTasks} onLink={(id) => onLink('task', id)} onUnlink={(id) => onUnlink('task', id)} onItemClick={(id) => onSwitchView('task', id)} />
                    <LinkingSection title="Linked Meetings" itemTypeLabel="meeting" linkedItems={linkedMeetings} availableItems={availableMeetings} onLink={(id) => onLink('meeting', id)} onUnlink={(id) => onUnlink('meeting', id)} onItemClick={(id) => onSwitchView('meeting', id)} />
                    <LinkingSection title="Linked Dealerships" itemTypeLabel="dealership" linkedItems={linkedDealerships} availableItems={availableDealerships} onLink={(id) => onLink('dealership', id)} onUnlink={(id) => onUnlink('dealership', id)} onItemClick={(id) => onSwitchView('dealership', id)} />
                    <LinkingSection title="Linked Features" itemTypeLabel="feature" linkedItems={linkedFeatures} availableItems={availableFeatures} onLink={(id) => onLink('feature', id)} onUnlink={(id) => onUnlink('feature', id)} onItemClick={(id) => onSwitchView('feature', id)} />
                    <LinkingSection title="Linked Shoppers" itemTypeLabel="shopper" linkedItems={linkedShoppers} availableItems={availableShoppers} onLink={(id) => onLink('shopper', id)} onUnlink={(id) => onUnlink('shopper', id)} onItemClick={(id) => onSwitchView('shopper', id)} />
                  </>
                )}
            </div>
        </div>
    );
};
export default DealershipDetailView;