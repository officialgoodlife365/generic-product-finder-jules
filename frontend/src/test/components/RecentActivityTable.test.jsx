import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecentActivityTable from '../../components/dashboard/RecentActivityTable';

describe('RecentActivityTable Component', () => {
  it('renders an empty state when no runs are provided', () => {
    render(<RecentActivityTable runs={[]} />);
    expect(screen.getByText('No recent discovery runs found.')).toBeInTheDocument();
  });

  it('renders a table with run data correctly', () => {
    const mockRuns = [
      { id: '1', status: 'completed', source: 'reddit_api', items_discovered: 45, timestamp: '2024-04-19T10:00:00.000Z' }
    ];

    render(<RecentActivityTable runs={mockRuns} />);

    expect(screen.getByText('reddit_api')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });
});
