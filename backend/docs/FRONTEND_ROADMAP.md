# Frontend Integration Roadmap (Iterations 12-16)

Now that the backend is fully operational and the NPM workspace monorepo is established (Iteration 11), the focus shifts to building the **Intelligence Dashboard** (Product 1 UI) described in `11_intelligence_dashboard.md`.

This roadmap breaks down the frontend development into 5 discrete iterations. Each iteration will follow a strict `Research -> Build -> Test -> QA Audit` cycle.

---

## Iteration 12: Core Routing & API Interceptors
**Goal:** Establish the foundational architecture for the React application, client-side routing, and backend communication.

**Deliverables:**
1. **Routing Setup:** Implement `react-router-dom` with a base layout wrapper (`Sidebar`, `Header`, `MainContent`).
2. **API Client:** Create an Axios instance (`frontend/src/api/client.js`) configured to communicate with the `backend` running on `localhost:8000`. Include interceptors for error handling and potential auth tokens.
3. **State Management:** Set up a lightweight global state management solution (e.g., React Context or Zustand) if deemed necessary, or rely on a data-fetching library like `React Query` or `SWR`.
4. **Base Views:** Create placeholder views for the main application routes:
    * `/dashboard` (Overview)
    * `/opportunities` (Product Blueprints)
    * `/leads` (Warm Lead CRM)
    * `/runs` (System Logs/Activity)
5. **Testing:** Write basic unit tests (React Testing Library) asserting the router renders the correct placeholders.

---

## Iteration 13: The Intelligence Dashboard (Overview)
**Goal:** Build the high-level system overview, fetching and displaying aggregate statistics.

**Deliverables:**
1. **API Integration:** Connect the frontend to the backend analytics/runs endpoints to fetch system status (e.g., last run time, total opportunities discovered, total leads).
2. **UI Components:**
    * Build `StatCard` components to display high-level metrics.
    * Build a `RecentActivityTable` showing the latest Discovery runs and their outcomes.
3. **Styling:** Implement the initial design system using Tailwind CSS, ensuring a clean, modern, and responsive layout.
4. **Mock Data:** If specific endpoints lack robust data locally, utilize the existing backend seeding scripts or interceptors to inject realistic mock data for UI development.

---

## Iteration 14: Opportunity Blueprints View
**Goal:** Create the detailed view for viewing scored and validated digital product opportunities.

**Deliverables:**
1. **List View (`/opportunities`):**
    * Fetch data from the `GET /api/opportunities` endpoint.
    * Build a responsive data table or card grid displaying the opportunities.
    * Include filtering and sorting capabilities (e.g., sort by score, filter by category/moat).
2. **Detail View (`/opportunities/:id`):**
    * Fetch detailed data for a specific opportunity, including its generated `blueprint`.
    * Build a comprehensive detail page showing the pain points, target audience, scoring breakdown, and the actionable digital product blueprint.
3. **UI Components:** Implement progress bars (for scores), badges (for status/tags), and clear typographic hierarchy for the blueprint text.

---

## Iteration 15: Warm Lead CRM View
**Goal:** Build the interface for managing the extracted warm leads associated with opportunities.

**Deliverables:**
1. **Lead List (`/leads`):**
    * Fetch data from the `GET /api/leads` endpoint.
    * Build a table displaying leads, their source URL, associated pain point, and "temperature" score.
2. **Opportunity Integration:** Link leads to their corresponding opportunities so users can see *who* to sell the product to.
3. **Action Triggers:** Implement UI buttons/actions that simulate CRM workflows (e.g., "Mark Contacted", "View Source"). Note: These might just call placeholder endpoints or update local state if full CRM integration isn't in scope for the MVP.

---

## Iteration 16: Frontend QA Audit & End-to-End Polish
**Goal:** Conduct a comprehensive review of the entire frontend application against the architecture specs and ensure smooth integration with the backend.

**Deliverables:**
1. **Architectural Review:** Verify all implemented views align with the user journeys described in `11_intelligence_dashboard.md`.
2. **E2E Testing:** Implement critical End-to-End tests using Playwright.
    * **Target CUJ:** User logs in, navigates to opportunities, clicks an opportunity to view the blueprint, and navigates to the associated leads.
3. **Polish:** Fix UI inconsistencies, ensure robust error states (loading spinners, empty states, error boundaries), and finalize responsive design.
4. **Documentation:** Update `README.md` and `DEVELOPER_ONBOARDING.md` with instructions on how to run both the backend and frontend concurrently for local development.
