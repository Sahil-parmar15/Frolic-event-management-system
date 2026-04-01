import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { BASE_URL } from '../../services/api';

function EventsCatalog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  useEffect(() => {
    fetchEvents(currentPage, searchTerm);
  }, [currentPage]);

  const fetchEvents = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await API.get(`/events?page=${page}&limit=${limit}&search=${search}`);
      setEvents(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching catalog events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents(1, searchTerm);
  };

  return (
    <>
      {/* Directory Header */}
      <div className="bg-dark text-white py-5 position-relative overflow-hidden">
        <div className="container position-relative z-1">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Explore Events</h1>
              <p className="lead text-white-50 mb-4">
                Discover technical hackathons, cultural spectacles, e-sports arenas, and much more. Find your stage.
              </p>
              
              <form onSubmit={handleSearch} className="position-relative max-w-lg mx-auto" style={{ maxWidth: '600px' }}>
                <input 
                  type="text" 
                  className="form-control form-control-lg rounded-pill ps-4 pe-5 shadow border-0" 
                  placeholder="Search events by name or tagline..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary rounded-circle position-absolute" style={{ top: '6px', right: '8px', width: '36px', height: '36px', padding: '0' }}>
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5 my-4">
        {loading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <p className="mt-3 text-muted">Curating events...</p>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="row g-4">
              {events.map((event) => (
                <div key={event._id} className="col-12 col-md-6 col-lg-4">
                  <div className="public-event-card border">
                    <div className="public-event-img-wrapper" style={{ height: '200px' }}>
                      <img 
                        src={event.EventImage ? `${BASE_URL}/${event.EventImage.replace(/\\/g, "/")}` : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80"}
                        alt={event.EventName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80";
                        }}
                      />
                      <div className="event-badge">
                        <i className="fas fa-layer-group text-primary me-1"></i>
                        {event.DepartmentID?.DepartmentName || "Open"}
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
                        {event.EventDescription || event.EventTagline || "Join us for this amazing event."}
                      </p>
                      
                      <div className="small text-muted mb-3 d-flex flex-wrap gap-2">
                        <span className="badge bg-light text-dark border"><i className="far fa-calendar-alt me-1 text-primary"></i> {event.EventDate ? new Date(event.EventDate).toLocaleDateString() : 'TBA'}</span>
                        <span className="badge bg-light text-dark border"><i className="far fa-clock me-1 text-primary"></i> {event.EventTime || 'TBA'}</span>
                        <span className="badge bg-light text-dark border"><i className="fas fa-users me-1 text-primary"></i> Team: {event.GroupMinParticipants}-{event.GroupMaxParticipants}</span>
                      </div>

                      <hr className="my-0 mb-3 opacity-10" />
                      
                      <Link to={`/events/${event._id}`} className="btn btn-outline-primary w-100 rounded-pill fw-bold">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Logic */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav>
                  <ul className="pagination pagination-lg">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => fetchEvents(currentPage - 1, searchTerm)}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(totalPages).keys()].map((num) => (
                      <li key={num + 1} className={`page-item ${currentPage === num + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => fetchEvents(num + 1, searchTerm)}>
                          {num + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => fetchEvents(currentPage + 1, searchTerm)}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 my-5">
            <div className="display-1 text-muted opacity-25 mb-3"><i className="fas fa-search-minus"></i></div>
            <h3 className="fw-bold">No Events Found</h3>
            <p className="text-muted">We couldn't find any events matching "{searchTerm}".</p>
            <button className="btn btn-outline-primary mt-3 rounded-pill" onClick={() => { setSearchTerm(''); fetchEvents(1, ''); }}>Clear Search</button>
          </div>
        )}
      </div>
    </>
  );
}

export default EventsCatalog;
