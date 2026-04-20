import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import LeadsPage from './pages/LeadsPage';
import RunsPage from './pages/RunsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Main Navigation Routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="runs" element={<RunsPage />} />

          {/* Fallback 404 Route */}
          <Route path="*" element={
            <div className="flex items-center justify-center h-full">
              <h2 className="text-xl text-gray-500">404 - View Not Found</h2>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
