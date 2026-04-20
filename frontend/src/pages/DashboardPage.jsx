import React, { useState, useEffect } from 'react';
import { Target, Users, Zap, AlertCircle } from 'lucide-react';
import { AnalyticsService } from '../api/services/analytics';
import StatCard from '../components/dashboard/StatCard';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, runsData] = await Promise.all([
          AnalyticsService.getDashboardMetrics(),
          AnalyticsService.getRecentRuns()
        ]);

        setMetrics(metricsData);
        setRuns(runsData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-lg font-medium">Loading Intelligence...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl flex items-center shadow-sm border border-red-100">
        <AlertCircle className="h-6 w-6 mr-3" />
        <span className="font-medium text-lg">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time product discovery and lead generation metrics.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          System Healthy
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Opportunities"
          value={metrics.totalOpportunities}
          trend="+12%"
          trendLabel="from last week"
          icon={Target}
          colorClass="bg-indigo-500"
        />
        <StatCard
          title="Warm Leads Extracted"
          value={metrics.totalLeads}
          trend="+34"
          trendLabel="today"
          icon={Users}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Avg. Blueprint Score"
          value="84.5"
          trend="+2.1"
          trendLabel="from last run"
          icon={Zap}
          colorClass="bg-amber-500"
        />
        <StatCard
          title="Active Sources"
          value="7"
          trend="Stable"
          trendLabel="All modules running"
          icon={Activity}
          colorClass="bg-blue-500"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="mt-8">
        <RecentActivityTable runs={runs} />
      </div>
    </div>
  );
};

// Activity icon for the 4th stat card
const Activity = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default DashboardPage;
