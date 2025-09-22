import React, { useState } from 'react';
import { QuarterPlan } from '../types.ts';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';

interface QuartersViewProps {
  quarters: QuarterPlan[];
  onQuarterClick: (quarter: QuarterPlan) => void;
  onNewQuarterClick: () => void;
  onEditQuarterClick: (quarter: QuarterPlan) => void;
  onDeleteQuarterClick: (quarter: QuarterPlan) => void;
}

const QuarterCard: React.FC<{ quarter: QuarterPlan; onCardClick: () => void; onEditClick: () => void; onDeleteClick: () => void; }> = ({ quarter, onCardClick, onEditClick, onDeleteClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ExpandedContent: React.FC = () => (
    <div className="p-5 bg-gray-50 space-y-6">
      {quarter.salesPlan && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sales Plan</h4>
          <div className="text-sm text-gray-700 rich-text-content" dangerouslySetInnerHTML={{ __html: quarter.salesPlan }} />
        </div>
      )}
      {quarter.supportPlan && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Support Plan</h4>
          <div className="text-sm text-gray-700 rich-text-content" dangerouslySetInnerHTML={{ __html: quarter.supportPlan }} />
        </div>
      )}
      {quarter.developmentPlan && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Development Plan</h4>
          <div className="text-sm text-gray-700 rich-text-content" dangerouslySetInnerHTML={{ __html: quarter.developmentPlan }} />
        </div>
      )}
      {quarter.productPlan && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product Plan</h4>
          <div className="text-sm text-gray-700 rich-text-content" dangerouslySetInnerHTML={{ __html: quarter.productPlan }} />
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200 flex flex-col">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 cursor-pointer" onClick={onCardClick}>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">{quarter.name}</h3>
          </div>
          <div className="flex items-center">
            <button
                onClick={(e) => { e.stopPropagation(); onEditClick(); }}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-full"
                aria-label={`Edit ${quarter.name}`}
            >
                <EditIcon className="w-5 h-5" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
                className="p-2 text-gray-400 hover:text-red-600 rounded-full"
                aria-label={`Delete ${quarter.name}`}
            >
                <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 space-y-1 cursor-pointer" onClick={onCardClick}>
           <p>Features: <span className="font-medium text-gray-800">{quarter.featureIds?.length || 0}</span></p>
           <p>Tickets: <span className="font-medium text-gray-800">{quarter.ticketIds?.length || 0}</span></p>
           <p>Projects: <span className="font-medium text-gray-800">{quarter.projectIds?.length || 0}</span></p>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-auto">
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-between items-center p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none rounded-b-lg"
            aria-expanded={isExpanded}
        >
            <span>View Plan Details</span>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        {isExpanded && <ExpandedContent />}
      </div>
    </div>
  );
};


const QuartersView: React.FC<QuartersViewProps> = ({ quarters, onQuarterClick, onNewQuarterClick, onEditQuarterClick, onDeleteQuarterClick }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // FIX: Explicitly type sort callback parameters to fix arithmetic operation error.
  const years = Array.from(new Set(quarters.map(q => q.year))).sort((a: number, b: number) => b - a);
  if (!years.includes(selectedYear) && years.length > 0) {
      setSelectedYear(years[0]);
  } else if (years.length === 0 && !years.includes(new Date().getFullYear())) {
      years.unshift(new Date().getFullYear());
  }

  const quartersForYear = quarters.filter(q => q.year === selectedYear).sort((a,b) => a.quarter - b.quarter);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">Quarterly Planning</h2>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="year-select" className="text-sm font-medium text-gray-700">Year:</label>
                <select
                    id="year-select"
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
                    className="p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
            </div>
             <button onClick={onNewQuarterClick} className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-3 py-2 rounded-md text-sm hover:bg-blue-100">
                <PlusIcon className="w-4 h-4" /> New Plan
            </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {quartersForYear.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quartersForYear.map(quarter => (
                <QuarterCard
                    key={quarter.id}
                    quarter={quarter}
                    onCardClick={() => onQuarterClick(quarter)}
                    onEditClick={() => onEditQuarterClick(quarter)}
                    onDeleteClick={() => onDeleteQuarterClick(quarter)}
                />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
              <div>
                  <h3 className="text-xl font-semibold text-gray-800">No plans for {selectedYear}</h3>
                  <p className="text-gray-500 mt-2">Click "New Plan" to create one for this year.</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuartersView;