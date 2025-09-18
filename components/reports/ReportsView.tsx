import React, { useMemo } from 'react';
import { Ticket, Dealership, Status, Priority, DealershipStatus, FeatureRequestTicket, ProductArea, FeatureAnnouncement, FeatureStatus, TicketType } from '../types.ts';
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
        // FIX: Corrected the accumulator type in the reduce function for better type safety.
        const counts = tickets.reduce((acc: Record<Status, number>, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {} as Record<Status, number>);
        return Object.entries(counts).map(([label, value], index) => ({
            label,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        })).sort((a,b) => b.value - a.value);
    }, [tickets]);

    const ticketPriorityData = useMemo(() => {
        // FIX: Corrected the accumulator type in the reduce function for better type safety.
        const counts = tickets.reduce((acc: Record<Priority, number>, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
        }, {} as Record<Priority, number>);
        return Object.entries(counts).map(([label, value], index) => ({
            label,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        })).sort((a, b) => (a.label > b.label ? 1 : -1));
    }, [tickets]);

    const dealershipStatusData = useMemo(() => {
        // FIX: Corrected the accumulator type in the reduce function for better type safety.
        const counts = dealerships.reduce((acc: Record<DealershipStatus, number>, dealership) => {
            acc[dealership.status] = (acc[dealership.status] || 0) + 1;
            return acc;
        }, {} as Record<DealershipStatus, number>);
        return Object.entries(counts).map(([label, value], index) => ({
            label,
            value,
            color: CHART_COLORS[index % CHART_COLORS.length]
        })).sort((a,b) => b.value - a.value);
    }, [dealerships]);
    
    const newSignupsData = useMemo(() => {
        const counts: Record<string, number> = {};
        dealerships
            .filter(d => d.orderReceivedDate)
            .forEach(d => {
                const date = new Date(d.orderReceivedDate!);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                counts[monthKey] = (counts[monthKey] || 0) + 1;
            });
        
        const sortedKeys = Object.keys(counts).sort();

        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`); // Use day 2 to avoid timezone issues
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            return {
                label,
                value: counts[key]
            };
        });
    }, [dealerships]);

    const cancellationsData = useMemo(() => {
        const counts: Record<string, number> = {};
        dealerships
            .filter(d => d.status === DealershipStatus.Cancelled && d.termDate)
            .forEach(d => {
                const date = new Date(d.termDate!);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                counts[monthKey] = (counts[monthKey] || 0) + 1;
            });

        const sortedKeys = Object.keys(counts).sort();
        
        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`);
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            return {
                label,
                value: counts[key]
            };
        });
    }, [dealerships]);

    const newLiveAccountsData = useMemo(() => {
        const counts: Record<string, number> = {};
        dealerships
            .filter(d => d.goLiveDate)
            .forEach(d => {
                const date = new Date(d.goLiveDate!);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                counts[monthKey] = (counts[monthKey] || 0) + 1;
            });
        
        const sortedKeys = Object.keys(counts).sort();

        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`); // Use day 2 to avoid timezone issues
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            return {
                label,
                value: counts[key]
            };
        });
    }, [dealerships]);

    const featuresLaunchedByMonthData = useMemo(() => {
        const counts: Record<string, number> = {};
        features
            .filter(f => f.status === FeatureStatus.Launched && f.launchDate)
            .forEach(f => {
                const date = new Date(f.launchDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                counts[monthKey] = (counts[monthKey] || 0) + 1;
            });
        const sortedKeys = Object.keys(counts).sort();
        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`);
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            return { label, value: counts[key] };
        });
    }, [features]);
    
    // FIX: Changed the explicit return type of useMemo to a more specific type to avoid a conflict between the `label` property and the index signature from `Record`.
    const featureRequestTrendsData = useMemo((): ({ label: string; [ProductArea.Reynolds]: number; [ProductArea.Fullpath]: number; })[] => {
        const months: Record<string, Record<ProductArea, number>> = {};
        tickets
            .filter((t): t is FeatureRequestTicket => t.type === TicketType.FeatureRequest)
            .forEach(t => {
                const date = new Date(t.submissionDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (!months[monthKey]) {
                    months[monthKey] = { [ProductArea.Reynolds]: 0, [ProductArea.Fullpath]: 0 };
                }
                months[monthKey][t.productArea]++;
            });
        
        const sortedKeys = Object.keys(months).sort().slice(-12);
        
        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`);
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            const data = months[key];
            // FIX: Replaced object spread with explicit properties to avoid "computed property name" error.
            return {
                label,
                [ProductArea.Reynolds]: data[ProductArea.Reynolds],
                [ProductArea.Fullpath]: data[ProductArea.Fullpath]
            };
        });
    }, [tickets]);
    
    const monthlyFeatureRequestsData = useMemo(() => {
        const counts: Record<string, number> = {};
        tickets
            .filter((t): t is FeatureRequestTicket => t.type === TicketType.FeatureRequest)
            .forEach(t => {
                const date = new Date(t.submissionDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                counts[monthKey] = (counts[monthKey] || 0) + 1;
            });
        
        const sortedKeys = Object.keys(counts).sort();

        return sortedKeys.map(key => {
            const date = new Date(`${key}-02`);
            const label = date.toLocaleString('default', { month: 'short', year: '2-digit'});
            return {
                label,
                value: counts[key]
            };
        });
    }, [tickets]);


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Reporting Dashboard</h1>

            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales & Onboarding Insights</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gridAutoRows: 'minmax(300px, auto)'}}>
                    <BarChart title="New Orders by Month" data={newSignupsData} color="bg-green-500" />
                    <BarChart title="Cancellations by Month" data={cancellationsData} color="bg-red-500" />
                    <div className="lg:col-span-2">
                        <BarChart title="New Live Accounts by Month" data={newLiveAccountsData} color="bg-indigo-500" />
                    </div>
                 </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Management Insights</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ gridAutoRows: 'minmax(300px, auto)'}}>
                    <BarChart title="Features Launched by Month" data={featuresLaunchedByMonthData} color="bg-purple-500" />
                    <BarChart title="Feature Requests Submitted by Month" data={monthlyFeatureRequestsData} color="bg-pink-500" />
                     <div className="lg:col-span-2">
                        <BarChart
                            title="Feature Requests by Product Area (Last 12 Months)"
                            data={featureRequestTrendsData.map(d => ({ label: d.label, value: d[ProductArea.Reynolds] + d[ProductArea.Fullpath] }))}
                            stackedData={[
                                { data: featureRequestTrendsData.map(d => d[ProductArea.Reynolds]), color: PRODUCT_AREA_COLORS.Reynolds, label: 'Reynolds' },
                                { data: featureRequestTrendsData.map(d => d[ProductArea.Fullpath]), color: PRODUCT_AREA_COLORS.Fullpath, label: 'Fullpath' },
                            ]}
                        />
                    </div>
                 </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">General Status Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ gridAutoRows: 'minmax(300px, auto)'}}>
                    <PieChart title="Tickets by Status" data={ticketStatusData} />
                    <PieChart title="Tickets by Priority" data={ticketPriorityData} />
                    <PieChart title="Dealerships by Status" data={dealershipStatusData} />
                </div>
            </div>
        </div>
    );
};

export default ReportsView;