import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Dashboard from "./Pages/Dashboard";
import Institute from "./Pages/Institute";
import Department from "./Pages/Department";
import Event from "./Pages/Event";
import Group from "./Pages/Group";
import Participant from "./Pages/Participant";
import Winner from "./Pages/Winner";
import User from "./Pages/User";

// Public Imports
import PublicLayout from "./components/public/PublicLayout";
import Home from "./Pages/public/Home";
import EventsCatalog from "./Pages/public/EventsCatalog";
import EventDetails from "./Pages/public/EventDetails";
import RegisterEvent from "./Pages/public/RegisterEvent";
import HallOfFame from "./Pages/public/HallOfFame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portal Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<EventsCatalog />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="events/:id/register" element={<RegisterEvent />} />
          <Route path="hall-of-fame" element={<HallOfFame />} />
        </Route>

        {/* Admin Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="institutes" element={<Institute />} />
          <Route path="departments" element={<Department />} />
          <Route path="events" element={<Event />} />
          <Route path="users" element={<User />} />
          <Route path="groups" element={<Group />} />
          <Route path="participants" element={<Participant />} />
          <Route path="winners" element={<Winner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;