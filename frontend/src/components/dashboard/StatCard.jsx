import React from 'react';

const StatCard = ({ title, value, trend, trendLabel, icon: Icon, colorClass }) => {
  const isPositive = trend && trend.startsWith('+');

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          {Icon && <Icon className="h-6 w-6 text-white" />}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-gray-500 ml-2">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
