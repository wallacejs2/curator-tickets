import React, { useState, useMemo } from 'react';
import { FeatureAnnouncement, FeatureStatus, Platform, FeatureAnnouncementFilterState } from '../types.ts';
import { PLATFORM_OPTIONS } from '../constants.ts';
import { TicketIcon } from './icons/TicketIcon.tsx';
import { ClipboardListIcon } from './icons/ClipboardListIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';

interface FeatureListProps {
  features: FeatureAnnouncement[];
  onDelete: (featureId: string) => void;
  onFeatureClick: (feature: FeatureAnnouncement) => void;
  filters: FeatureAnnouncementFilterState;
  setFilters: React.Dispatch<React.SetStateAction<FeatureAnnouncementFilterState>>;
  allCategories: string[];
}

const platformColors: Record<Platform, string> = {
    [Platform.Curator]: 'bg-pink-600 text-white',
    [Platform.UCP]: 'bg-sky-600 text-white',
    [Platform.FOCUS]: 'bg-orange-500 text-white',
};

const FeatureCard: React.FC<{ feature: FeatureAnnouncement, onClick: () => void }> = ({ feature, onClick }) => {
    return (
        <div 
            className="bg-white rounded-md shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all space-y-3" 
            onClick={onClick}
        >
            <div className="flex justify-between items-start gap-3">
                <p className="font-semibold text-gray-800 flex-1">{feature.title}</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${platformColors[feature.platform]}`}>
                    {feature.platform}
                </span>
            </div>
             <p className="text-xs text-gray-500">Launch: {new Date(feature.launchDate).toLocaleDateString()}</p>
            <div className="flex flex-wrap gap-1.5">
                {(feature.categories || []).slice(0, 3).map(cat => (
                    <span key={cat} className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                        {cat}
                    </span>
                ))}
            </div>
             <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100 mt-3">
                 {(feature.ticketIds?.length || 0) > 0 && <span title={`${feature.ticketIds?.length} linked ticket(s)`} className="flex items-center gap-1"><TicketIcon className="w-3.5 h-3.5" /><span className="font-medium">{feature.ticketIds?.length}</span></span>}
                 {(feature.projectIds?.length || 0) > 0 && <span title={`${feature.projectIds?.length} linked project(s)`} className="flex items-center gap-1"><ClipboardListIcon className="w-3.5 h-3.5" /><span className="font-medium">{feature.projectIds?.length}</span></span>}
                 {(feature.linkedFeatureIds?.length || 0) > 0 && <span title={`${feature.linkedFeatureIds?.length} linked feature(s)`} className="flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5" /><span className="font-medium">{feature.linkedFeatureIds?.length}</span></span>}
             </div>
        </div>
    );
};

type FeatureView = 'active' | 'planned' | 'launched';

const FeatureList: React.FC<FeatureListProps> = ({ features, onFeatureClick, filters, setFilters, allCategories }) => {
  const [featureView, setFeatureView] = useState<FeatureView>('active');

  const { activeFeatures, plannedFeatures, launchedFeatures } = useMemo(() => {
    const active: FeatureAnnouncement[] = [];
    const planned: FeatureAnnouncement[] = [];
    const launched: FeatureAnnouncement[] = [];

    const activeStatuses = [FeatureStatus.InDiscovery, FeatureStatus.InDevelopment, FeatureStatus.Testing];
    const plannedStatuses = [FeatureStatus.Backlog, FeatureStatus.Upcoming];

    for (const feature of features) {
        if (activeStatuses.includes(feature.status)) {
            active.push(feature);
        } else if (plannedStatuses.includes(feature.status)) {
            planned.push(feature);
        } else if (feature.status === FeatureStatus.Launched) {
            launched.push(feature);
        }
    }
    
    const sortByLaunchDate = (a: FeatureAnnouncement, b: FeatureAnnouncement) => new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
    active.sort(sortByLaunchDate);
    planned.sort(sortByLaunchDate);
    launched.sort(sortByLaunchDate);
    
    return { activeFeatures: active, plannedFeatures: planned, launchedFeatures: launched };
  }, [features]);

  const featuresToShow = 
      featureView === 'active' ? activeFeatures :
      featureView === 'planned' ? plannedFeatures :
      launchedFeatures;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const inputClasses = "w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const selectClasses = `${inputClasses}`;

  return (
    <div>
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        name="searchTerm"
                        value={filters.searchTerm}
                        onChange={handleFilterChange}
                        placeholder="Search features..."
                        className="w-full p-2 pl-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select name="platform" value={filters.platform} onChange={handleFilterChange} className={selectClasses}>
                    <option value="all">All Platforms</option>
                    {PLATFORM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <select name="category" value={filters.category} onChange={handleFilterChange} className={selectClasses}>
                    <option value="all">All Categories</option>
                    {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
        </div>
        
        <div className="mb-4 flex border-b border-gray-200">
            <button
              onClick={() => setFeatureView('active')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                featureView === 'active'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={featureView === 'active'}
            >
              Active ({activeFeatures.length})
            </button>
            <button
              onClick={() => setFeatureView('planned')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                featureView === 'planned'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={featureView === 'planned'}
            >
              Planned ({plannedFeatures.length})
            </button>
            <button
              onClick={() => setFeatureView('launched')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                featureView === 'launched'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={featureView === 'launched'}
            >
              Launched ({launchedFeatures.length})
            </button>
        </div>
        
        {featuresToShow.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">No {featureView} features found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new feature announcement.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {featuresToShow.map(feature => (
                    <FeatureCard key={feature.id} feature={feature} onClick={() => onFeatureClick(feature)} />
                ))}
            </div>
        )}
    </div>
  );
};

export default FeatureList;
