import React from 'react';

interface PieChartProps {
  title: string;
  data: { label: string; value: number; color: string }[];
}

const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
            <h3 className="text-md font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="flex-grow flex items-center justify-center text-sm text-gray-500">No data available.</div>
        </div>
    );
  }

  let cumulativePercentage = 0;
  const gradientParts = data.map(item => {
    const percentage = (item.value / total) * 100;
    const part = `${item.color} ${cumulativePercentage}% ${cumulativePercentage + percentage}%`;
    cumulativePercentage += percentage;
    return part;
  }).join(', ');

  const conicGradient = `conic-gradient(${gradientParts})`;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
        <h3 className="text-md font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex-grow flex items-center gap-6">
            <div 
                className="w-32 h-32 rounded-full"
                style={{ background: conicGradient }}
                role="img"
                aria-label={`Pie chart for ${title}`}
            ></div>
            <div className="text-sm space-y-2">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-700">{item.label}:</span>
                        <span className="font-semibold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default PieChart;
