import React from "react";
import { Link } from "react-router-dom";

function Navbar({ pageTitle }) {
  return (
    <header className="top-navbar fixed-top d-flex align-items-center px-4 shadow-sm">
      <div className="breadcrumb-container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/admin/dashboard" className="text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item active">{pageTitle}</li>
          </ol>
        </nav>
      </div>
      <div className="ms-auto d-flex align-items-center dropdown">
        <div 
          className="d-flex align-items-center" 
          role="button" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
          style={{ cursor: "pointer" }}
        >
          <span className="me-3 d-none d-md-block fw-semibold text-dark">
            Welcome, Admin <i className="fas fa-chevron-down ms-1 small opacity-50"></i>
          </span>
          <img 
            src="https://ui-avatars.com/api/?name=Admin&background=6a11cb&color=fff" 
            className="rounded-circle shadow-sm" 
            width="35" 
            alt="Admin Profile" 
          />
        </div>
        <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3" style={{ minWidth: '220px' }}>
          <li className="px-3 py-2 text-center border-bottom mb-2 bg-light rounded-top">
            <img 
              src="https://ui-avatars.com/api/?name=Admin&background=6a11cb&color=fff" 
              className="rounded-circle mb-2 shadow-sm" 
              width="50" 
              alt="Admin" 
            />
            <div className="fw-bold">Admin User</div>
            <div className="small text-muted">admin@frolic.com</div>
            <span className="badge bg-primary mt-1">Super Admin</span>
          </li>
          <li><Link className="dropdown-item py-2" to="/admin/dashboard"><i className="fas fa-user-circle me-3 text-muted"></i>My Profile</Link></li>
          <li><Link className="dropdown-item py-2" to="/admin/settings"><i className="fas fa-cog me-3 text-muted"></i>Settings</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item py-2 text-danger fw-semibold" onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("token");
                window.location.href = "/";
              }
            }}>
              <i className="fas fa-sign-out-alt me-3"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Navbar;