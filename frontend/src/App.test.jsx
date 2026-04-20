import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Routing', () => {
  it('renders the Dashboard page by default (redirect from /)', async () => {
    render(<App />);
    expect(screen.getByText('GP Finder')).toBeInTheDocument();
    expect(await screen.findByText('Intelligence Dashboard')).toBeInTheDocument();
  });

  it('navigates to the Opportunities page when clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for initial render
    await screen.findByText('Intelligence Dashboard');

    const opsLink = screen.getByRole('link', { name: /opportunities/i });
    await act(async () => {
      await user.click(opsLink);
    });

    expect(await screen.findByText('Product Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Blueprints Drilldown Ready')).toBeInTheDocument();
  });
});
