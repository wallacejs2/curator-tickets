import React, { useState, useMemo } from 'react';
import { Dealership, DealershipStatus, DealershipGroup } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { ChecklistIcon } from './icons/ChecklistIcon.tsx';
import { DocumentTextIcon } from './icons/DocumentTextIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import Modal from './common/Modal.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { AccountBalanceIcon } from './icons/AccountBalanceIcon.tsx';
import { DEALERSHIP_STATUS_OPTIONS } from '../constants.ts';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { formatDisplayName } from '../utils.ts';

interface DealershipListProps {
  dealerships: Dealership[];
  dealershipGroups: DealershipGroup[];
  onDealershipClick: (dealership: Dealership) => void;
  onStatusChange: (dealershipId: string, newStatus: DealershipStatus) => void;
  onUpdateGroup: (group: DealershipGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onNewGroupClick: () => void;
  onEditGroupClick: (group: DealershipGroup) => void;
  onExport: () => void;
}

const statusColors: Record<DealershipStatus, string> = {
  [DealershipStatus.Prospect]: 'bg-indigo-200 text-indigo-800',
  [DealershipStatus.PendingDmt]: 'bg-purple-200 text-purple-800',
  [DealershipStatus.PendingFocus]: 'bg-sky-200 text-sky-800',
  [DealershipStatus.PendingSetup]: 'bg-yellow-200 text-yellow-800',
  [DealershipStatus.Onboarding]: 'bg-orange-200 text-orange-800',
  [DealershipStatus.Enrollment]: 'bg-teal-200 text-teal-800',
  [DealershipStatus.Live]: 'bg-green-200 text-green-800',
  [DealershipStatus.Pilot]: 'bg-pink-200 text-pink-800',
  [DealershipStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const DealershipCard: React.FC<{
    dealership: Dealership;
    allGroups: DealershipGroup[];
    onClick: () => void;
    onStatusChange: (dealershipId: string, newStatus: DealershipStatus) => void;
}> = ({ dealership, allGroups, onClick, onStatusChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const dealershipMemberOfGroups = useMemo(() => allGroups.filter(g => (dealership.groupIds || []).includes(g.id)), [allGroups, dealership.groupIds]);
    const linkedDealershipsCount = (dealership.linkedDealershipIds || []).filter(id => id !== dealership.id).length;

    const handleCopyInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        let content = `DEALERSHIP DETAILS: ${dealership.name}\n`;
        content += `==================================================\n`;
        
        const appendField = (label: string, value: any) => {
            if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
                content += `${label}: ${value}\n`;
            }
        };
        
        const appendDateField = (label: string, value: any) => {
            if (value) {
                content += `${label}: ${new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' })}\n`;
            }
        };

        appendField('Account Number (CIF)', dealership.accountNumber);
        appendField('Status', dealership.status);
        appendField('Enterprise (Group)', dealership.enterprise);
        appendField('Store Number', dealership.storeNumber);
        appendField('Branch Number', dealership.branchNumber);
        appendField('ERA System ID', dealership.eraSystemId);
        appendField('PPSysID', dealership.ppSysId);
        appendField('BU-ID', dealership.buId);

        if (dealership.websiteLinks && dealership.websiteLinks.length > 0) {
            content += 'Website Links:\n';
            dealership.websiteLinks.forEach(link => {
                content += `- ${link.url}`;
                if (link.clientId) {
                    content += ` (Client ID: ${link.clientId})`;
                }
                content += '\n';
            });
        }
        
        content += '\n--- ORDER & DATES ---\n';
        appendField('Order Number', dealership.orderNumber);
        appendDateField('Order Received Date', dealership.orderReceivedDate);
        appendDateField('Go-Live Date', dealership.goLiveDate);
        
        content += '\n--- KEY CONTACTS ---\n';
        appendField('Assigned Specialist', dealership.assignedSpecialist);
        appendField('Sales', dealership.sales);
        appendField('POC Name', dealership.pocName);
        appendField('POC Email', dealership.pocEmail);
        appendField('POC Phone', dealership.pocPhone);

        if (dealership.updates && dealership.updates.length > 0) {
            content += `\n--- UPDATES (${dealership.updates.length}) ---\n`;
            [...dealership.updates].reverse().forEach(update => {
                const updateComment = (update.comment || '').replace(/<br\s*\/?>/gi, '\n').trim();
                content += `[${new Date(update.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}] ${update.author}:\n${updateComment}\n`;
            });
        }

        navigator.clipboard.writeText(content.trim());
        // FIX: Removed call to deprecated showToast function.
    };

    const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) =>