import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar shadow-lg">
      <div className="sidebar-brand text-center py-4 border-bottom border-secondary border-opacity-25">
        <h3 className="fw-bold text-white mb-0">FROLIC</h3>
        <span className="text-white-50 small">Event Management</span>
      </div>
      <nav className="nav flex-column mt-3 flex-grow-1">
        <NavLink className="nav-link" to="/admin/dashboard">
          <i className="fas fa-chart-line me-3"></i>Dashboard
        </NavLink>

        <NavLink className="nav-link" to="/admin/institutes">
          <i className="fas fa-university me-3"></i>Institutes
        </NavLink>

        <NavLink className="nav-link" to="/admin/departments">
          <i className="fas fa-building me-3"></i>Departments
        </NavLink>

        <NavLink className="nav-link" to="/admin/events">
          <i className="fas fa-calendar-alt me-3"></i>Events
        </NavLink>

        <NavLink className="nav-link" to="/admin/users">
          <i className="fa-regular fa-user me-3"></i>Users
        </NavLink>

        <NavLink className="nav-link" to="/admin/groups">
          <i className="fas fa-users me-3"></i>Groups
        </NavLink>

        <NavLink className="nav-link" to="/admin/participants">
          <i className="fas fa-user-graduate me-3"></i>Participants
        </NavLink>

        <NavLink className="nav-link" to="/admin/winners">
          <i className="fas fa-trophy me-3"></i>Winners
        </NavLink>

        <div className="mt-auto mb-4 px-3">
          <button
            onClick={handleLogout}
            className="nav-link text-danger border-0 bg-transparent w-100 text-start">
            <i className="fas fa-power-off me-3"></i>Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
