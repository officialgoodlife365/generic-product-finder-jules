import React from 'react';

const RunsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">System Logs</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-lg font-medium text-gray-600">Background Processes Ready</h2>
        <p className="text-sm text-gray-500 mt-2">Discovery engine execution logs will be visible here.</p>
      </div>
    </div>
  );
};

export default RunsPage;
