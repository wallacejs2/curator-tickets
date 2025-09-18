import React, { useMemo } from 'react';
import { Ticket, Dealership, Status, Priority, DealershipStatus, FeatureRequestTicket, ProductArea, FeatureAnnouncement, FeatureStatus } from '../types.ts';
import PieChart from './reports/PieChart.tsx';
import BarChart from './reports/BarChart.tsx';

interface ReportsViewProps {
  tickets: Ticket[];
  dealerships: Dealership[];
  features: FeatureAnnouncement[];
}

const CHART_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#64748b', '#38bdf8'];
const PRODUCT_AREA_COLORS: Record<ProductArea, string> = {
    [ProductArea.Reynolds]: '#10437C',
    [ProductArea.Fullpath]: '#8b5cf6',
};

const ReportsView: React.FC<ReportsViewProps> = ({ tickets, dealerships, features }) => {

    const ticketStatusData = useMemo(() => {
// FIX: Changed the initial value type for reduce to Record<string, number>
// to avoid potential type errors with enum keys.
        const counts = tickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([label, value], index) => ({
            label,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        })).sort((a,b) => b.value - a.value);
    }, [tickets]);

    const ticketPriorityData = useMemo(() => {
// FIX: Changed the initial value type for reduce to Record<string, number>
// to avoid potential type errors with enum keys.
        const counts = tickets.reduce((acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([label, value], index) => ({
            label,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        })).sort((a, b) => (a.label > b.label ? 1 : -1));
    }, [tickets]);

    const dealershipStatusData = useMemo(() => {
// FIX: Changed the initial value type for reduce from Record<DealershipStatus, number> to Record<string, number>
// to avoid potential type errors with enum keys.
        const counts = dealerships.reduce((acc, dealership) => {
            acc[dealership.status] = (acc[dealership.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([label, value]) => ({
            label,
            value
        })).sort((a,b) => b.value - a.value);
    }, [dealerships]);
    
    // PM Chart: Feature Velocity
    const featureVelocityData = useMemo(() => {
        const counts: Record<string, number> = {};
        features
            .filter(f => f.status === FeatureStatus.Launched)
            .forEach(f => {
                const date = new Date(f.launchDate);
                const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} '${String(date.getFullYear()).slice(-2)}`;
                counts[quarter] = (counts[quarter] || 0) + 1;
            });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [features]);
    
    // PM Chart: Feature Request Trends
    const featureRequestTrendsData = useMemo(() => {
        const months: Record<string, Record<ProductArea, number>> = {};
        tickets
            .filter((t): t is FeatureRequestTicket => t.type === 'Feature Request')
            .forEach(t => {
                const date = new Date(t.submissionDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!months[monthKey]) {
                    months[monthKey] = { [ProductArea.Reynolds]: 0, [ProductArea.Fullpath]: 0 };
                }
                months[monthKey][t.productArea]++;
            });
        
        const sortedKeys = Object.keys(months).sort().slice(-12);
        
// FIX: The spread operator (`...`) with an indexed type can lead to poor type inference.
// Creating the object with explicit properties ensures TypeScript correctly understands the shape of `d`
// in later `.map()` calls, resolving the arithmetic operation error.
        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`);
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            const data = months[key];
            return {
                label,
                [ProductArea.Reynolds]: data[ProductArea.Reynolds],
                [ProductArea.Fullpath]: data[ProductArea.Fullpath]
            };
        });
    }, [tickets]);

    // PM Chart: Top Requesting Dealerships
    const topRequestingDealershipsData = useMemo(() => {
        const counts: Record<string, number> = {};
        tickets
            .filter(t => t.type === 'Feature Request' && t.dealershipIds)
            .forEach(t => {
                t.dealershipIds?.forEach(dealershipId => {
                    counts[dealershipId] = (counts[dealershipId] || 0) + 1;
                });
            });
        
        const dealershipMap = new Map(dealerships.map(d => [d.id, d.name]));
        
        return Object.entries(counts)
            .map(([dealershipId, value]) => ({ label: dealershipMap.get(dealershipId) || 'Unknown', value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [tickets, dealerships]);


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Reporting Dashboard</h1>
            
            {/* PM Reports */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Management Insights</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gridAutoRows: 'minmax(300px, auto)'}}>
                    <BarChart title="Feature Velocity by Quarter" data={featureVelocityData} color="bg-purple-500" />
                    <BarChart title="Top Requesting Dealerships" data={topRequestingDealershipsData} color="bg-pink-500" />
                     <div className="lg:col-span-2">
                        <BarChart
                            title="Feature Requests by Product Area (Last 12 Months)"
                            // FIX: Replaced `(d as any)` casting with type-safe bracket notation using the enum.
                            data={featureRequestTrendsData.map(d => ({ label: d.label, value: d[ProductArea.Reynolds] + d[ProductArea.Fullpath] }))}
                            stackedData={[
                                // FIX: Replaced `(d as any)` casting with type-safe bracket notation using the enum.
                                { data: featureRequestTrendsData.map(d => d[ProductArea.Reynolds]), color: PRODUCT_AREA_COLORS.Reynolds, label: 'Reynolds' },
                                { data: featureRequestTrendsData.map(d => d[ProductArea.Fullpath]), color: PRODUCT_AREA_COLORS.Fullpath, label: 'Fullpath' },
                            ]}
                        />
                    </div>
                 </div>
            </div>

            {/* General Reports */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">General Insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gridAutoRows: 'minmax(300px, auto)'}}>
                    <PieChart title="Tickets by Status" data={ticketStatusData} />
                    <PieChart title="Tickets by Priority" data={ticketPriorityData} />
                    <div className="lg:col-span-2">
                        <BarChart title="Dealerships by Status" data={dealershipStatusData} color="bg-green-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;