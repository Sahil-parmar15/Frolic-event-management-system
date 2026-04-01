import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

function HallOfFame() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWinners(searchTerm);
  }, []);

  const fetchWinners = async (search = "") => {
    try {
      setLoading(true);
      // Fetch up to 50 latest winners for the public showcase
      const res = await API.get(`/winners?limit=50&search=${search}`);
      
      // We will group the winners by EventID for a beautiful UI display
      const data = res.data.data || [];
      const groupedByEvent = data.reduce((acc, winner) => {
        const eventId = winner.EventID?._id;
        const eventName = winner.EventID?.EventName || "Unknown Event";
        
        if (!acc[eventId]) {
          acc[eventId] = { eventName, winners: [] };
        }
        acc[eventId].winners.push(winner);
        return acc;
      }, {});

      setWinners(Object.values(groupedByEvent));
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWinners(searchTerm);
  };

  const getTrophyColor = (sequence) => {
    switch(sequence) {
      case 1: return { icon: 'fa-trophy', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.1)', label: '1st Prize' };
      case 2: return { icon: 'fa-medal', color: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.1)', label: 'Runner Up' };
      case 3: return { icon: 'fa-award', color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)', label: '2nd Runner Up' };
      default: return { icon: 'fa-star', color: '#6a11cb', bg: 'rgba(106, 17, 203, 0.1)', label: 'Special Mention' };
    }
  };

  return (
    <>
      <div className="bg-dark text-white py-5 position-relative overflow-hidden">
        <div className="position-absolute w-100 h-100 top-0 start-0" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', zIndex: 0 }}></div>
        <div className="container position-relative z-1 py-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="d-inline-flex bg-warning bg-opacity-10 text-warning rounded-circle p-3 mb-3">
                <i className="fas fa-trophy fs-1"></i>
              </div>
              <h1 className="display-4 fw-bold mb-3 text-gradient" style={{ backgroundImage: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}>Hall of Fame</h1>
              <p className="lead text-white-50 mb-4">
                Celebrating the brilliant minds and outstanding performers who conquered the challenges across all events.
              </p>
              
              <form onSubmit={handleSearch} className="position-relative max-w-lg mx-auto" style={{ maxWidth: '500px' }}>
                <input 
                  type="text" 
                  className="form-control rounded-pill ps-4 pe-5 border-0 shadow-sm bg-white bg-opacity-10 text-white placeholder-white-50" 
                  placeholder="Search by event or group name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ backdropFilter: 'blur(5px)' }}
                />
                <button type="submit" className="btn btn-warning rounded-circle position-absolute" style={{ top: '3px', right: '4px', width: '32px', height: '32px', padding: '0' }}>
                  <i className="fas fa-search text-dark"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5 my-4">
        {loading ? (
          <div className="text-center py-5 my-5">
            <div className="spinner-grow text-warning mb-3" role="status"></div>
            <p className="text-muted">Loading the champions...</p>
          </div>
        ) : winners.length > 0 ? (
          <div className="row g-5">
            {winners.map((group, idx) => (
              <div className="col-12" key={idx}>
                <div className="d-flex align-items-center mb-4">
                  <h3 className="fw-bold mb-0 me-3">{group.eventName}</h3>
                  <div className="flex-grow-1 border-bottom border-2 opacity-25"></div>
                </div>

                <div className="row g-4">
                  {/* Sort winners by sequence (1st, 2nd, 3rd) */}
                  {group.winners.sort((a, b) => a.Sequence - b.Sequence).map(winner => {
                    const trophy = getTrophyColor(winner.Sequence);
                    
                    return (
                      <div className="col-12 col-md-6 col-lg-4" key={winner._id}>
                        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative hover-lift transition-all" style={{ borderTop: `4px solid ${trophy.color}` }}>
                          <div className="card-body p-4 text-center">
                            <div className="d-inline-flex rounded-circle mb-3 align-items-center justify-content-center" style={{ width: '70px', height: '70px', backgroundColor: trophy.bg, color: trophy.color, border: `2px solid ${trophy.color}40` }}>
                              <i className={`fas ${trophy.icon} fs-2`}></i>
                            </div>
                            <h5 className="fw-bold mb-1 text-dark">{winner.GroupID?.GroupName || "Unknown Team"}</h5>
                            <span className="badge mt-2 fw-semibold px-3 py-2" style={{ backgroundColor: trophy.color, color: winner.Sequence === 1 ? '#000' : '#fff' }}>
                              {trophy.label}
                            </span>
                          </div>
                          <div className="card-footer bg-light border-0 py-3 text-center text-muted small">
                            Officially declared by Admin
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 my-5">
            <div className="display-1 text-muted opacity-25 mb-3"><i className="fas fa-medal"></i></div>
            <h3 className="fw-bold">No Records Yet</h3>
            <p className="text-muted">Once events conclude and winners are declared, they will be immortalized here.</p>
            {searchTerm && (
              <button className="btn btn-outline-primary mt-3 rounded-pill" onClick={() => { setSearchTerm(''); fetchWinners(''); }}>Clear Search</button>
            )}
            {!searchTerm && (
              <Link to="/events" className="btn btn-primary mt-3 rounded-pill px-4 shadow-sm">Explore Events</Link>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .placeholder-white-50::placeholder { color: rgba(255,255,255,0.6) !important; }
      `}} />
    </>
  );
}

export default HallOfFame;
