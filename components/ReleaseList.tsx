import React from 'react';
import { Release, ReleaseStatus } from '../types.ts';

interface ReleaseListProps {
  releases: Release[];
  onReleaseClick: (release: Release) => void;
}

const statusColors: Record<ReleaseStatus, string> = {
  [ReleaseStatus.Planned]: 'bg-gray-200 text-gray-800',
  [ReleaseStatus.InProgress]: 'bg-blue-200 text-blue-800',
  [ReleaseStatus.Released]: 'bg-green-200 text-green-800',
  [ReleaseStatus.Cancelled]: 'bg-red-200 text-red-800',
};

const ReleaseCard: React.FC<{ release: Release, onClick: () => void }> = ({ release, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-500">{release.version}</p>
          <h3 className="text-lg font-bold text-gray-900">{release.name}</h3>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[release.status]}`}>
          {release.status}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
        <span className="text-gray-600">
          Target Date: <span className="font-semibold text-gray-800">{new Date(release.releaseDate).toLocaleDateString()}</span>
        </span>
        <span className="text-gray-600">
          {release.featureIds?.length || 0} Features, {release.ticketIds?.length || 0} Tickets
        </span>
      </div>
    </div>
  );
};


const ReleaseList: React.FC<ReleaseListProps> = ({ releases, onReleaseClick }) => {
  return (
    <div className="space-y-4">
      {releases.length > 0 ? (
        releases.map(release => (
          <ReleaseCard key={release.id} release={release} onClick={() => onReleaseClick(release)} />
        ))
      ) : (
        <div className="text-center py-20 px-6 bg-white rounded-md shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">No Releases Found</h3>
          <p className="text-gray-500 mt-2">Create a new release to start planning.</p>
        </div>
      )}
    </div>
  );
};

export default ReleaseList;
