import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API, { BASE_URL } from '../../services/api';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events/${id}`);
      setEvent(res.data.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="spinner-border text-primary mx-auto mb-3" style={{ width: '3rem', height: '3rem' }}></div>
        <h4 className="text-muted">Loading event details...</h4>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="display-1 text-muted mb-4"><i className="fas fa-exclamation-circle"></i></div>
        <h2>Event Not Found</h2>
        <p className="text-muted">The event you are looking for might have been removed or does not exist.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/events')}>Back to Catalog</button>
      </div>
    );
  }

  return (
    <>
      {/* Event Header Banner */}
      <div className="position-relative bg-dark text-white" style={{ minHeight: '400px' }}>
        <div 
          className="position-absolute w-100 h-100 top-0 start-0" 
          style={{ 
            backgroundImage: `url(${event.EventImage ? `${BASE_URL}/${event.EventImage.replace(/\\/g, "/")}` : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.3'
          }}
        ></div>
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{ background: 'linear-gradient(to top, #1a1a2e 0%, transparent 100%)' }}></div>
        
        <div className="container position-relative h-100 d-flex flex-column justify-content-end pb-5" style={{ zIndex: 2, minHeight: '400px' }}>
          <div className="row align-items-end">
            <div className="col-lg-8">
              <span className="badge bg-primary mb-3 py-2 px-3 fw-bold fs-6 shadow">
                {event.DepartmentID?.DepartmentName || "Institute Event"}
              </span>
              <h1 className="display-3 fw-bold mb-3">{event.EventName}</h1>
              <p className="lead text-white-50 mb-4" style={{ maxWidth: '800px' }}>
                {event.EventTagline || event.EventDescription}
              </p>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <div className="d-flex align-items-center bg-white bg-opacity-10 rounded px-3 py-2 border border-white border-opacity-10">
                  <i className="far fa-calendar-alt text-primary fs-4 me-3"></i>
                  <div>
                    <div className="small text-white-50">Date</div>
                    <div className="fw-bold">{event.EventDate ? new Date(event.EventDate).toLocaleDateString() : 'TBA'}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-white bg-opacity-10 rounded px-3 py-2 border border-white border-opacity-10">
                  <i className="far fa-clock text-info fs-4 me-3"></i>
                  <div>
                    <div className="small text-white-50">Time</div>
                    <div className="fw-bold">{event.EventTime || 'TBA'}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center bg-white bg-opacity-10 rounded px-3 py-2 border border-white border-opacity-10">
                  <i className="fas fa-map-marker-alt text-danger fs-4 me-3"></i>
                  <div>
                    <div className="small text-white-50">Location</div>
                    <div className="fw-bold">{event.EventLocation || 'TBA'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Left Column - Details */}
          <div className="col-lg-8">
            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 mb-4 border">
              <h3 className="fw-bold mb-4 border-bottom pb-3">About The Event</h3>
              <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                {event.EventDescription || "Join us for an exciting experience where teams will compete, collaborate, and showcase their talents."}
              </p>
              
              <h4 className="fw-bold mt-5 mb-3 border-bottom pb-2">Rules & Guidelines</h4>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: '#555' }}>
                {event.EventRules || "Standard college event guidelines apply. Please refer to the coordinator for specific instructions."}
              </p>
            </div>

            <div className="bg-primary-soft rounded-4 p-4 border border-primary border-opacity-25 shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <h4 className="fw-bold text-primary mb-1">Have Questions?</h4>
                <p className="text-muted mb-0">Reach out to our event coordinator.</p>
              </div>
              <div className="text-end text-start-md">
                <div className="fw-bold fs-5"><i className="fas fa-user-tie me-2"></i>{event.EventMainStudentCoOrdinatorName || "TBA"}</div>
                <div className="text-muted">{event.EventMainStudentCoOrdinatorPhone || "Contact Info Unavailable"}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Sidebar */}
          <div className="col-lg-4">
            <div className="position-sticky" style={{ top: '100px' }}>
              <div className="glass-panel p-4 bg-white border shadow-lg text-center">
                <h3 className="fw-bold mb-4">Registration</h3>
                
                <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-3 rounded">
                  <span className="text-muted fw-semibold">Entry Fee</span>
                  <span className="fs-3 fw-bold text-success">{event.EventFees === 0 ? "FREE" : `₹${event.EventFees}`}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded">
                  <span className="text-muted fw-semibold">Team Size</span>
                  <span className="fs-5 fw-bold">
                    {event.GroupMinParticipants === event.GroupMaxParticipants 
                      ? event.GroupMaxParticipants 
                      : `${event.GroupMinParticipants} - ${event.GroupMaxParticipants}`}
                  </span>
                </div>

                <Link to={`/events/${event._id}/register`} className="btn btn-gradient btn-lg w-100 py-3 mb-3 fw-bold shadow">
                  Register Your Team Now <i className="fas fa-arrow-right ms-2"></i>
                </Link>

                <p className="small text-muted mb-0">
                  <i className="fas fa-shield-alt me-1 text-primary"></i> Registration is completely secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EventDetails;
