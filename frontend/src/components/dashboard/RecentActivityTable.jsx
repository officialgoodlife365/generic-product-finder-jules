import React from 'react';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
    case 'running': return <Activity className="h-5 w-5 text-blue-500 animate-spin" />;
    default: return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
};

const RecentActivityTable = ({ runs }) => {
  if (!runs || runs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        No recent discovery runs found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          Recent Discovery Engine Runs
        </h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          View All Logs &rarr;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-sm font-medium text-gray-500 bg-white">
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Source Module</th>
              <th className="px-6 py-4">Items Discovered</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {runs.map((run) => (
              <tr key={run.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                  {getStatusIcon(run.status)}
                  <span className="capitalize text-gray-700 text-sm font-medium">
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  {run.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {run.items_discovered} <span className="text-gray-400 font-normal">signals</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(run.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivityTable;
