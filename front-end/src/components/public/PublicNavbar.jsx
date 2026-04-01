import React from 'react';
import { NavLink, Link } from 'react-router-dom';

function PublicNavbar() {
  return (
    <nav className="navbar navbar-expand-lg fixed-top public-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="bg-primary text-white rounded p-2 me-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <i className="fas fa-bolt"></i>
          </div>
          <span className="text-gradient">Frolic</span>
        </Link>
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#publicNavbarContent" 
          aria-controls="publicNavbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="publicNavbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/events">Events</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/hall-of-fame">Hall of Fame</NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <Link to="/login" className="btn btn-gradient px-4">Admin Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
