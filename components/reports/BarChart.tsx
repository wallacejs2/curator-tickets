import React from 'react';

interface BarChartProps {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
  yAxisLabel?: string;
  // FIX: Added stackedData prop to support stacked bar charts.
  stackedData?: { data: number[]; color: string; label: string }[];
}

const BarChart: React.FC<BarChartProps> = ({ title, data, color = 'bg-blue-500', yAxisLabel, stackedData }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);
  if (maxValue === 0) {
     return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
            <h3 className="text-md font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center text-sm text-gray-500">No data available.</div>
        </div>
    );
  }

  const yAxisMarkers = Array.from({ length: 5 }, (_, i) => Math.round((maxValue / 4) * i)).reverse();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
        <h3 className="text-md font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex-grow flex gap-4">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between text-xs text-gray-500 text-right">
                {yAxisMarkers.map(marker => <span key={marker}>{marker}</span>)}
            </div>
            {/* Chart Area */}
            <div className="flex-grow flex border-l border-b border-gray-200 justify-around items-end gap-2 pr-2">
                {data.map((item, index) => (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end pb-2">
                        <div
                            className="w-full flex flex-col-reverse rounded-t-sm"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={`${item.label}: ${item.value}`}
                        >
                        {stackedData ? (
                            stackedData.map(stack => (
                                <div
                                    key={stack.label}
                                    className={`w-full hover:opacity-80 transition-opacity`}
                                    style={{
                                        height: `${(stack.data[index] / item.value) * 100}%`,
                                        backgroundColor: stack.color,
                                    }}
                                    title={`${item.label} - ${stack.label}: ${stack.data[index]}`}
                                ></div>
                            ))
                        ) : (
                            <div
                                className={`w-full h-full rounded-t-sm hover:opacity-80 transition-opacity ${color}`}
                                title={`${item.label}: ${item.value}`}
                            ></div>
                        )}
                        </div>
                        <span className="text-xs text-gray-600 truncate">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
         {stackedData && (
            <div className="flex justify-center flex-wrap items-center gap-4 mt-4 text-xs">
                {stackedData.map(stack => (
                    <div key={stack.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stack.color }}></div>
                        <span>{stack.label}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default BarChart;