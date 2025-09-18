import React, { useState } from 'react';
// FIX: Changed import path for RoadmapLane to the centralized types file.
import { Project, FeatureAnnouncement, Ticket, RoadmapLane } from '../types.ts';
import { WorkspaceIcon } from './icons/WorkspaceIcon.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { ReceiptLongIcon } from './icons/ReceiptLongIcon.tsx';

type RoadmapItem = (Project | FeatureAnnouncement | Ticket) & { itemType: 'project' | 'feature' | 'ticket' };

interface RoadmapViewProps {
  items: RoadmapItem[];
  onUpdateLane: (itemType: 'project' | 'feature' | 'ticket', itemId: string, newLane: RoadmapLane) => void;
  onItemClick: (itemType: 'project' | 'feature' | 'ticket', itemId: string) => void;
}

const itemIcons: Record<RoadmapItem['itemType'], React.ReactNode> = {
  project: <WorkspaceIcon className="w-4 h-4 text-red-600" />,
  feature: <SparklesIcon className="w-4 h-4 text-pink-600" />,
  ticket: <ReceiptLongIcon className="w-4 h-4 text-yellow-600" />,
};

const RoadmapCard: React.FC<{ item: RoadmapItem, onDragStart: (e: React.DragEvent<HTMLDivElement>) => void, onClick: () => void }> = ({ item, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab hover:shadow-md hover:border-blue-400 transition-all"
    >
      <div className="flex items-center gap-2">
        {itemIcons[item.itemType]}
        {/* FIX: Use type assertion to correctly access 'title' or 'name' properties on the union type. */}
        <p className="text-sm font-semibold text-gray-800 truncate">{(item as FeatureAnnouncement | Ticket).title || (item as Project).name}</p>
      </div>
      <p className="text-xs text-gray-500 mt-1 capitalize">{item.itemType}</p>
    </div>
  );
};

const RoadmapLaneColumn: React.FC<{
  lane: RoadmapLane;
  items: RoadmapItem[];
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (item: RoadmapItem) => (e: React.DragEvent<HTMLDivElement>) => void;
  onItemClick: (item: RoadmapItem) => void;
}> = ({ lane, items, onDrop, onDragStart, onItemClick }) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { onDrop(e); setIsOver(false); }}
      className={`bg-gray-100 rounded-lg p-3 flex-1 transition-colors ${isOver ? 'bg-blue-100' : ''}`}
    >
      <h2 className="text-lg font-bold text-gray-700 mb-4 px-2">{lane}</h2>
      <div className="space-y-3 min-h-[60vh]">
        {items.map(item => (
          <RoadmapCard key={`${item.itemType}-${item.id}`} item={item} onDragStart={onDragStart(item)} onClick={() => onItemClick(item)} />
        ))}
      </div>
    </div>
  );
};


const RoadmapView: React.FC<RoadmapViewProps> = ({ items, onUpdateLane, onItemClick }) => {

  const handleDragStart = (item: RoadmapItem) => (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (lane: RoadmapLane) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('application/json')) as RoadmapItem;
    // FIX: Assert 'item' as any to access the 'roadmapLane' property. This is now fixed in types.ts so the cast is removed.
    if (item.roadmapLane !== lane) {
      onUpdateLane(item.itemType, item.id, lane);
    }
  };
  
  const handleItemClick = (item: RoadmapItem) => {
    onItemClick(item.itemType, item.id);
  }

  const lanes: RoadmapLane[] = [RoadmapLane.Now, RoadmapLane.Next, RoadmapLane.Later];
  const itemsByLane = lanes.reduce((acc, lane) => {
    // FIX: Assert 'item' as any to access the 'roadmapLane' property. This is now fixed in types.ts so the cast is removed.
    acc[lane] = items.filter(item => item.roadmapLane === lane);
    return acc;
  }, {} as Record<RoadmapLane, RoadmapItem[]>);

  return (
    <div className="flex gap-6 h-full">
      {lanes.map(lane => (
        <RoadmapLaneColumn
          key={lane}
          lane={lane}
          items={itemsByLane[lane]}
          onDrop={handleDrop(lane)}
          onDragStart={handleDragStart}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
};

export default RoadmapView;