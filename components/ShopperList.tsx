import React, { useMemo } from 'react';
import { Shopper, Dealership, ShopperFilterState } from '../types.ts';
import { StarIcon } from './icons/StarIcon.tsx';
import { PencilIcon } from './icons/PencilIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { AlternateEmailIcon } from './icons/AlternateEmailIcon.tsx';

interface ShoppersViewProps {
  shoppers: Shopper[];
  allDealerships: Dealership[];
  onUpdateShopper: (shopper: Shopper) => void;
  onDeleteShopper: (shopperId: string) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  onEditShopperClick: (shopper: Shopper) => void;
  onShopperClick: (shopper: Shopper) => void;
  shopperFilters: ShopperFilterState;
  setShopperFilters: (filters: ShopperFilterState) => void;
}

const ShopperCard: React.FC<{
    shopper: Shopper;
    dealershipName: string | undefined;
    onEdit: () => void;
    onDelete: () => void;
    onToggleFavorite: () => void;
    onClick: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ shopper, dealershipName, onEdit, onDelete, onToggleFavorite, onClick, showToast }) => {

    const handleCopyInfo = (e: React.MouseEvent) => {
        e.stopPropagation();
        let content = `SHOPPER DETAILS\n================================\n`;
        content += `Customer Name: ${shopper.customerName}\n`;
        content += `Curator ID: ${shopper.curatorId}\n`;
        if (shopper.curatorLink) content += `Curator Link: ${shopper.curatorLink}\n`;
        if (shopper.email) content += `Email: ${shopper.email}\n`;
        if (shopper.phone) content += `Phone: ${shopper.phone}\n`;
        if (shopper.cdpId) content += `CDP-ID: ${shopper.cdpId}\n`;
        if (shopper.dmsId) content += `DMS-ID: ${shopper.dmsId}\n`;
        if (dealershipName) content += `Dealership: ${dealershipName}\n`;
        content += `\nUNIQUE ISSUE:\n${shopper.uniqueIssue}\n`;
    
        if (shopper.recentActivity && shopper.recentActivity.length > 0) {
          content += `\nRECENT ACTIVITY:\n`;
          shopper.recentActivity.forEach(act => {
            content += `- ${act.date} ${act.time}: ${act.activity} -> ${act.action}\n`;
          });
        }
        
        navigator.clipboard.writeText(content);
        showToast('Shopper info copied!', 'success');
    };

    const handleCopyEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (shopper.email) {
            navigator.clipboard.writeText(shopper.email);
            showToast('Email copied to clipboard!', 'success');
        }
    };

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 cursor-pointer hover:border-blue-400" onClick={onClick}>
            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="p-1 text-gray-400 hover:text-yellow-500 flex-shrink-0">
                <StarIcon filled={!!shopper.isFavorite} className={`w-6 h-6 ${shopper.isFavorite ? 'text-yellow-500' : ''}`} />
            </button>
            <div className="flex-grow min-w-0">
                <p className="font-bold text-gray-800 truncate">{shopper.customerName}</p>
                <p className="text-sm text-gray-600 truncate">Curator ID: {shopper.curatorId}</p>
                {dealershipName && <p className="text-sm text-gray-500 truncate">{dealershipName}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={handleCopyInfo} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Copy Info">
                    <ContentCopyIcon className="w-5 h-5" />
                </button>
                {shopper.email && (
                    <button onClick={handleCopyEmail} className="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Copy Email">
                        <AlternateEmailIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-full" aria-label={`Edit ${shopper.customerName}`}>
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 hover:text-red-600 rounded-full" aria-label={`Delete ${shopper.customerName}`}>
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const ShoppersView: React.FC<ShoppersViewProps> = ({
  shoppers, allDealerships, onUpdateShopper, onDeleteShopper, showToast, onEditShopperClick, onShopperClick,
  shopperFilters, setShopperFilters,
}) => {
    const dealershipMap = new Map(allDealerships.map(d => [d.id, d.name]));

    const sortedShoppers = useMemo(() => {
        return [...shoppers].sort((a, b) => (a.isFavorite === b.isFavorite) ? a.customerName.localeCompare(b.customerName) : a.isFavorite ? -1 : 1);
    }, [shoppers]);
    
    const handleToggleFavorite = (shopperId: string) => {
        const shopper = shoppers.find(s => s.id === shopperId);
        if(shopper) {
            onUpdateShopper({ ...shopper, isFavorite: !shopper.isFavorite });
        }
    };

    return (
        <div>
            <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search shoppers by name, email, or ID..."
                        value={shopperFilters.searchTerm}
                        onChange={e => setShopperFilters({ searchTerm: e.target.value })}
                        className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="space-y-3">
                {sortedShoppers.length > 0 ? sortedShoppers.map(shopper => (
                    <ShopperCard
                        key={shopper.id}
                        shopper={shopper}
                        dealershipName={shopper.dealershipIds ? dealershipMap.get(shopper.dealershipIds[0]) : undefined}
                        onClick={() => onShopperClick(shopper)}
                        onEdit={() => onEditShopperClick(shopper)}
                        onDelete={() => onDeleteShopper(shopper.id)}
                        onToggleFavorite={() => handleToggleFavorite(shopper.id)}
                        showToast={showToast}
                    />
                )) : (
                    <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800">No shoppers found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or create a new shopper.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ShoppersView;