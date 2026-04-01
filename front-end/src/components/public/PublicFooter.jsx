import React from 'react';
import { Link } from 'react-router-dom';

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h5 className="d-flex align-items-center">
              <div className="bg-primary text-white rounded p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                <i className="fas fa-bolt fa-sm"></i>
              </div>
              Frolic Events
            </h5>
            <p className="mt-3 text-muted" style={{ lineHeight: '1.6' }}>
              The ultimate college festival management and registration portal. Seamlessly discover, manage, and participate in technical, cultural, and sports events.
            </p>
          </div>
          <div className="col-6 col-md-2 mt-4 mt-md-0">
            <h5>Explore</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/">Home</Link></li>
              <li className="mb-2"><Link to="/events">Events</Link></li>
              <li className="mb-2"><Link to="/hall-of-fame">Hall of Fame</Link></li>
              <li className="mb-2"><Link to="/login">Admin Login</Link></li>
            </ul>
          </div>
          <div className="col-6 col-md-3">
            <h5>Categories</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/events">Technical Events</Link></li>
              <li className="mb-2"><Link to="/events">Non-Technical</Link></li>
              <li className="mb-2"><Link to="/events">Sports & eSports</Link></li>
              <li className="mb-2"><Link to="/events">Workshops</Link></li>
            </ul>
          </div>
          <div className="col-12 col-md-3">
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-white fs-5"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-white fs-5"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-white fs-5"><i className="fab fa-facebook"></i></a>
              <a href="#" className="text-white fs-5"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
        </div>
        <hr className="my-4 border-secondary opacity-25" />
        <div className="text-center text-muted small">
          &copy; {new Date().getFullYear()} Frolic Event Management System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
