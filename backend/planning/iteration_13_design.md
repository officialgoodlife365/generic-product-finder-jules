# Iteration 13 Design: Intelligence Dashboard (Overview)

## Objective
Build the high-level system overview for the frontend application. This dashboard will consume data from the backend to present aggregate statistics regarding the product discovery engine's performance, including total opportunities, leads generated, and recent background run activities.

## Architectural Adherence (Ref: `11_intelligence_dashboard.md`)
The specification requires the primary dashboard to serve as the "mission control" for the user. It must quickly convey:
1. High-level system health and metrics.
2. The latest active processes/runs from the discovery engine.

## Scope & Implementation Plan

### 1. API Integration (`frontend/src/api/services/analytics.js`)
*   Create a dedicated service file to encapsulate analytics and runs data fetching.
*   **Endpoints to consume:**
    *   `GET /api/intelligence/metrics` (or aggregate counts from `/opportunities`, `/leads`).
    *   `GET /api/runs?limit=5` (for recent activity).
*   Implement data fetching hooks in the React components utilizing the Axios client from Iteration 12.

### 2. UI Components
*   **`StatCard.jsx`**: A reusable component to display a single metric (e.g., "Total Opportunities", "New Leads"). It should accept props for title, value, an icon, and a trend indicator (e.g., "+5%").
*   **`RecentActivityTable.jsx`**: A component to render the latest `runs`. Columns should include: Date/Time, Status (Running, Completed, Failed), Source Module triggered, and Items Discovered.

### 3. Dashboard Page Update
*   Update `frontend/src/pages/DashboardPage.jsx`.
*   Implement a grid layout (Tailwind CSS) at the top for 3-4 `StatCard`s.
*   Implement a section below the cards for the `RecentActivityTable`.
*   Handle loading states (spinners or skeleton loaders) and error states (e.g., if the backend is down).

### 4. Data Mocking (If needed)
*   If the backend endpoints are not fully populated with realistic data during development, the `analytics.js` service will be configured to either fetch real data or return a robust set of mock data to ensure the UI can be styled and tested effectively.

### 5. Testing Strategy
*   **Unit Tests:** Test that `StatCard` renders its props correctly. Test that `RecentActivityTable` renders rows based on an array of mock runs. Test that `DashboardPage` handles loading states.

## Execution Sequence
1.  Create the API service `analytics.js`.
2.  Build the reusable `StatCard` and `RecentActivityTable` components.
3.  Integrate the components and API calls into `DashboardPage.jsx`.
4.  Write Vitest unit tests for the new components.
5.  Run Playwright frontend verification to ensure visual compliance.
