import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from '../../components/dashboard/StatCard';
import { Target } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders title and value correctly', () => {
    render(
      <StatCard
        title="Total Opportunities"
        value="142"
        trend="+12%"
        trendLabel="from last week"
        icon={Target}
        colorClass="bg-indigo-500"
      />
    );

    expect(screen.getByText('Total Opportunities')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('from last week')).toBeInTheDocument();
  });
});
