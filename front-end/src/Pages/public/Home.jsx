import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { BASE_URL } from '../../services/api';

function Home() {
  const [stats, setStats] = useState({ events: 0, participants: 0, institutes: 0 });
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // Fetch stats and latest 3 events in parallel
      const [eventRes, partRes, instRes, latestEventsRes] = await Promise.all([
        API.get("/events?limit=1"),
        API.get("/participants?limit=1"),
        API.get("/institutes?limit=1"),
        API.get("/events?limit=3")
      ]);

      setStats({
        events: eventRes.data.pagination?.total || eventRes.data.count || 0,
        participants: partRes.data.pagination?.total || partRes.data.count || 0,
        institutes: instRes.data.pagination?.total || instRes.data.count || 0,
      });

      setFeaturedEvents(latestEventsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section text-center d-flex align-items-center" style={{ minHeight: '80vh' }}>
        <div className="hero-shape hero-shape-1"></div>
        <div className="hero-shape hero-shape-2"></div>
        <div className="container hero-content">
          <div className="badge bg-primary-soft text-primary mb-3 px-3 py-2 rounded-pill fw-bold border border-primary border-opacity-25 shadow-sm">
            <i className="fas fa-calendar-alt me-2"></i> Official TechFest 2026
          </div>
          <h1 className="display-3 fw-bold mb-4" style={{ letterSpacing: '-1px' }}>
            Experience the <span className="text-gradient">Ultimate Fest</span>
          </h1>
          <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '600px', lineHeight: '1.8' }}>
            Join thousands of students across multiple institutes. Compete in breathtaking technical, cultural, and sports events all tracked in one central hub.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/events" className="btn btn-gradient btn-lg px-5 shadow-sm">Explore Events</Link>
            <Link to="/hall-of-fame" className="btn btn-light btn-lg px-4 shadow-sm border text-dark fw-semibold">View Winners</Link>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="py-5 bg-dark text-white position-relative">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h2 className="display-4 fw-bold text-gradient mb-0">{loading ? "..." : stats.events}+</h2>
                <div className="text-uppercase tracking-wide small text-muted mt-2 fw-semibold">Events Organized</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h2 className="display-4 fw-bold text-gradient mb-0">{loading ? "..." : stats.participants}+</h2>
                <div className="text-uppercase tracking-wide small text-muted mt-2 fw-semibold">Participants</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h2 className="display-4 fw-bold text-gradient mb-0">{loading ? "..." : stats.institutes}+</h2>
                <div className="text-uppercase tracking-wide small text-muted mt-2 fw-semibold">Institutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-5" style={{ background: '#f8f9fa' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold h1">Featured Events</h2>
            <p className="text-muted">Register before the seats fill up!</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Loading breathtaking events...</p>
              </div>
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <div key={event._id} className="col-12 col-md-6 col-lg-4">
                  <div className="public-event-card">
                    <div className="public-event-img-wrapper">
                      <img 
                        src={event.EventImage ? `${BASE_URL}/${event.EventImage.replace(/\\/g, "/")}` : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80"}
                        alt={event.EventName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80";
                        }}
                      />
                      <div className="event-badge">
                        <i className="fas fa-sitemap text-primary me-1"></i>
                        {event.DepartmentID?.DepartmentName || "Event"}
                      </div>
                    </div>
                    <div className="card-body p-4 d-flex flex-column text-start">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h4 className="fw-bold mb-0 text-dark text-truncate" style={{ maxWidth: '75%' }}>{event.EventName}</h4>
                        <span className="text-success fw-bold bg-success-subtle px-2 py-1 rounded small">
                          {event.EventFees === 0 ? "FREE" : `₹${event.EventFees}`}
                        </span>
                      </div>
                      <p className="text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.EventDescription || event.EventTagline || "No description provided."}
                      </p>
                      <hr className="my-0 mb-3 opacity-10" />
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted fw-semibold">
                          <i className="far fa-calendar-alt text-secondary me-2"></i>
                          {event.EventDate ? new Date(event.EventDate).toLocaleDateString() : 'TBA'}
                        </span>
                        <Link to={`/events/${event._id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
                          View details <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted">No events currently scheduled.</div>
            )}
          </div>
          
          <div className="text-center mt-5">
            <Link to="/events" className="btn btn-dark btn-lg px-5 rounded-pill shadow-sm">View All Events</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
