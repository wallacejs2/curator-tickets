import React from 'react';
import { Shopper, Dealership } from '../types.ts';
import { ContentCopyIcon } from './icons/ContentCopyIcon.tsx';

interface ShopperListProps {
  shoppers: Shopper[];
  onShopperClick: (shopper: Shopper) => void;
  allDealerships: Dealership[];
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ShopperCard: React.FC<{ shopper: Shopper, dealershipName: string | undefined, onClick: () => void, showToast: (message: string, type: 'success' | 'error') => void; }> = ({ shopper, dealershipName, onClick, showToast }) => {

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors flex flex-col">
        <div onClick={onClick} className="p-4 cursor-pointer flex-grow">
            <div className="flex justify-between items-start gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{shopper.customerName}</h3>
                <button onClick={handleCopyInfo} className="p-2 text-gray-500 hover:text-blue-600 rounded-full flex-shrink-0" title="Copy Info">
                    <ContentCopyIcon className="w-5 h-5" />
                </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Curator ID: <span className="font-medium">{shopper.curatorId}</span></p>
            {dealershipName && <p className="text-sm text-gray-600">Dealership: <span className="font-medium">{dealershipName}</span></p>}
            <p className="text-sm text-gray-600 mt-3 italic line-clamp-2">Issue: {shopper.uniqueIssue}</p>
        </div>
    </div>
  );
};

const ShopperList: React.FC<ShopperListProps> = ({ shoppers, onShopperClick, allDealerships, showToast }) => {
  const dealershipMap = new Map(allDealerships.map(d => [d.id, d.name]));

  if (shoppers.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">No shoppers found</h3>
        <p className="text-gray-500 mt-2">Click the 'New Shopper' button to add one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {shoppers.map(shopper => (
        <ShopperCard
          key={shopper.id}
          shopper={shopper}
          dealershipName={shopper.dealershipIds ? dealershipMap.get(shopper.dealershipIds[0]) : undefined}
          onClick={() => onShopperClick(shopper)}
          showToast={showToast}
        />
      ))}
    </div>
  );
};

export default ShopperList;
