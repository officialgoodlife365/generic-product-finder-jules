import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // We will proxy this in vite
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock Data
export const mockOpportunities = [
  {
    id: '1',
    name: 'Tax Compliance Tool for Solopreneurs',
    score: 85,
    phase: 'Scored',
    evidence: ['Reddit complaint: Taxes are confusing', 'HackerNews: High demand'],
    competitors: [{ name: 'TaxEasy', price: '$49/mo' }],
    leadCount: 15,
    velocity: 'Accelerating',
    formatCount: 3,
  },
  {
    id: '2',
    name: 'AI Lead Scraper for Agencies',
    score: 92,
    phase: 'Validated',
    evidence: ['Twitter thread with 1k likes', 'High search volume'],
    competitors: [{ name: 'ScrapeIt', price: '$99/mo' }],
    leadCount: 42,
    velocity: 'Stable',
    formatCount: 2,
  },
  {
    id: '3',
    name: 'E-commerce Inventory Predictor',
    score: 78,
    phase: 'Discovery',
    evidence: ['Shopify forum feature request', 'Amazon seller complaints'],
    competitors: [],
    leadCount: 5,
    velocity: 'Accelerating',
    formatCount: 1,
  },
  {
    id: '4',
    name: 'Fitness Creator Blueprint',
    score: 65,
    phase: 'Blueprint',
    evidence: ['Instagram poll results', 'Patreon requests'],
    competitors: [{ name: 'FitPlan', price: '$29/mo' }],
    leadCount: 120,
    velocity: 'Stable',
    formatCount: 4,
  }
];

export const mockLeads = [
  { id: '1', name: 'Alice Smith', email: 'alice@example.com', temperature: 'Hot', contactedAt: '2023-10-25T10:00:00Z', opportunityId: '1' },
  { id: '2', name: 'Bob Jones', email: 'bob@example.com', temperature: 'Warm', contactedAt: '2023-10-24T14:30:00Z', opportunityId: '2' },
  { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', temperature: 'Cold', contactedAt: '2023-10-20T09:15:00Z', opportunityId: '1' },
  { id: '4', name: 'Diana Prince', email: 'diana@example.com', temperature: 'Converted', contactedAt: '2023-10-15T11:45:00Z', opportunityId: '4' },
];

export const mockCalendar = [
  { id: '1', title: 'FinCEN BOI Deadline', date: '2024-01-01', urgency: 'Urgent', niche: 'Tax' },
  { id: '2', title: 'New EU Privacy Law', date: '2024-03-15', urgency: 'Upcoming', niche: 'E-commerce' },
  { id: '3', title: 'FDA Labeling Update', date: '2024-08-01', urgency: 'Horizon', niche: 'Health' },
];

export const mockMetrics = {
  totalOpportunities: 12,
  avgScore: 72,
  bestSource: 'gov_reg',
  activeSignals: 24,
};

// Mock Interceptor for returning mock data when 501 is hit
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    // We provide mock data if the backend is not implemented yet
    if (error.response && error.response.status === 501 || error.response && error.response.status === 404 || !error.response) {
      if (config.url.includes('/auth/login')) {
        return Promise.resolve({ data: { token: 'mock-jwt-token' }, status: 200, statusText: 'OK', headers: {}, config: config });
      }
      if (config.url.includes('/opportunities/metrics')) {
        return Promise.resolve({ data: mockMetrics, status: 200, statusText: 'OK', headers: {}, config: config });
      }
      if (config.url.includes('/opportunities')) {
        const idMatch = config.url.match(/\/opportunities\/(\d+)/);
        if (idMatch) {
            const opp = mockOpportunities.find(o => o.id === idMatch[1]);
            return Promise.resolve({ data: opp || null, status: 200, statusText: 'OK', headers: {}, config: config });
        }
        return Promise.resolve({ data: mockOpportunities, status: 200, statusText: 'OK', headers: {}, config: config });
      }
      if (config.url.includes('/leads')) {
        const idMatch = config.url.match(/\/leads\/(\d+)/);
        if (idMatch) {
            const lead = mockLeads.find(l => l.id === idMatch[1]);
            return Promise.resolve({ data: lead || null, status: 200, statusText: 'OK', headers: {}, config: config });
        }
        return Promise.resolve({ data: mockLeads, status: 200, statusText: 'OK', headers: {}, config: config });
      }
      if (config.url.includes('/calendar')) {
        return Promise.resolve({ data: mockCalendar, status: 200, statusText: 'OK', headers: {}, config: config });
      }
    }

    return Promise.reject(error);
  }
);

export const fetcher = (url: string) => api.get(url).then(res => res.data);

export default api;
