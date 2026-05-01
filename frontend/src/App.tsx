import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import OpportunityDetail from "./pages/OpportunityDetail";
import LeadDetail from "./pages/LeadDetail";
import Calendar from "./pages/Calendar";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="leads" element={<Leads />} />
          <Route path="opportunities/:id" element={<OpportunityDetail />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
