import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';

function RegisterEvent() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registration State
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events/${id}`);
      const evt = res.data.data;
      setEvent(evt);

      // Initialize participant arrays based on min participants required
      const min = evt.GroupMinParticipants || 1;
      const initialParticipants = Array.from({ length: min }, (_, i) => ({
        ParticipantName: '',
        ParticipantEmail: '',
        ParticipantContactNo: '',
        ParticipantEnrollmentNo: '',
        ParticipantInsituteName: '',
        IsGroupLeader: i === 0,
      }));
      setParticipants(initialParticipants);
    } catch (error) {
      console.error('Error fetching event:', error);
      setErrorMsg('Failed to load event data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipantField = () => {
    if (participants.length < event.GroupMaxParticipants) {
      setParticipants([...participants, {
        ParticipantName: '',
        ParticipantEmail: '',
        ParticipantContactNo: '',
        ParticipantEnrollmentNo: '',
        ParticipantInsituteName: '',
        IsGroupLeader: false,
      }]);
    }
  };

  const removeParticipantField = (index) => {
    if (participants.length > event.GroupMinParticipants) {
      const updated = participants.filter((_, i) => i !== index);
      setParticipants(updated);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMsg('Group / Team Name is required.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const validateParticipants = () => {
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const label = i === 0 ? 'Team Leader' : `Participant ${i + 1}`;
      if (!p.ParticipantName.trim()) return `${label}: Full Name is required.`;
      if (!p.ParticipantEmail.trim()) return `${label}: Email is required.`;
      if (!p.ParticipantContactNo.trim()) return `${label}: Contact Number is required.`;
      if (!p.ParticipantEnrollmentNo.trim()) return `${label}: Enrollment No. is required.`;
      if (!p.ParticipantInsituteName.trim()) return `${label}: Institute Name is required.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateParticipants();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the Group
      const groupRes = await API.post('/groups/public/create', {
        GroupName: groupName,
        EventID: id,
      });

      const createdGroup = groupRes.data.data;

      // 2. Create Participants one by one (to get meaningful error messages)
      for (const p of participants) {
        await API.post('/participants/public/create', {
          ...p,
          GroupID: createdGroup._id,
        });
      }

      // 3. Success
      setSuccessData(createdGroup);
      setShowPopup(true);
      setStep(3);
      // Auto-close popup after 6 seconds
      setTimeout(() => setShowPopup(false), 6000);
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.message || 'Something went wrong during registration.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5 text-center mt-5">
        <h3>Event not found.</h3>
        <Link to="/events" className="btn btn-primary mt-3">Back to Events</Link>
      </div>
    );
  }

  // Progress width
  const progressWidth = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">

          <div className="text-center mb-5">
            <span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill mb-2 border border-primary border-opacity-25">
              Registration Wizard
            </span>
            <h1 className="fw-bold mb-3">Join {event.EventName}</h1>
            <p className="text-muted">Complete the steps below to secure your team's spot.</p>
          </div>

          <div className="card shadow-lg border-0 rounded-4 overflow-hidden mb-5">
            {/* Progress Bar Header */}
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4 px-md-5">
              <div className="position-relative m-4">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: progressWidth, transition: 'width 0.4s ease' }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between position-absolute w-100 top-50 translate-middle-y">
                  <div
                    className={`btn btn-sm rounded-circle fw-bold ${step >= 1 ? 'btn-primary' : 'btn-light border'} shadow-sm`}
                    style={{ width: '32px', height: '32px', lineHeight: '1.2' }}
                  >1</div>
                  <div
                    className={`btn btn-sm rounded-circle fw-bold ${step >= 2 ? 'btn-primary' : 'btn-light border'} shadow-sm`}
                    style={{ width: '32px', height: '32px', lineHeight: '1.2' }}
                  >2</div>
                  <div
                    className={`btn btn-sm rounded-circle fw-bold ${step === 3 ? 'btn-success' : 'btn-light border'} shadow-sm`}
                    style={{ width: '32px', height: '32px', lineHeight: '1.2' }}
                  ><i className="fas fa-check"></i></div>
                </div>
              </div>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              {errorMsg && (
                <div className="alert alert-danger rounded-3">
                  <i className="fas fa-exclamation-triangle me-2"></i>{errorMsg}
                </div>
              )}

              {/* ── STEP 1: Group Name ── */}
              {step === 1 && (
                <form onSubmit={handleNextStep}>
                  <h4 className="fw-bold mb-4">Step 1: Define Your Group</h4>
                  <div className="mb-4">
                    <label className="form-label text-muted fw-semibold mb-2">
                      Group / Team Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="e.g. Code Ninjas, The Innovators"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                    <div className="form-text mt-2">
                      <i className="fas fa-info-circle me-1"></i> Make it catchy! This will be your identity.
                    </div>
                  </div>

                  {/* Event info summary */}
                  <div className="bg-light rounded-3 p-3 mb-4 border">
                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <div className="small text-muted">Entry Fee</div>
                        <div className="fw-bold text-success">{event.EventFees === 0 ? 'FREE' : `₹${event.EventFees}`}</div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">Team Size</div>
                        <div className="fw-bold">
                          {event.GroupMinParticipants === event.GroupMaxParticipants
                            ? event.GroupMaxParticipants
                            : `${event.GroupMinParticipants} – ${event.GroupMaxParticipants}`}
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">Location</div>
                        <div className="fw-bold">{event.EventLocation || 'TBA'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                    <Link to={`/events/${event._id}`} className="btn btn-outline-secondary rounded-pill px-4">
                      Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">
                      Next Step <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 2: Participants ── */}
              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Step 2: Team Members</h4>
                    <span className="badge bg-light text-dark border">
                      Min: {event.GroupMinParticipants} | Max: {event.GroupMaxParticipants}
                    </span>
                  </div>

                  {/* Participant cards — all visible at once */}
                  <div className="d-flex flex-column gap-3">
                    {participants.map((p, index) => (
                      <div
                        key={index}
                        className="border rounded-4 overflow-hidden shadow-sm"
                        style={{ borderColor: p.IsGroupLeader ? '#0d6efd' : '#dee2e6' }}
                      >
                        {/* Card header */}
                        <div
                          className={`d-flex align-items-center justify-content-between px-4 py-3 ${p.IsGroupLeader ? 'bg-primary text-white' : 'bg-light'}`}
                        >
                          <div className="fw-bold d-flex align-items-center gap-2">
                            <i className={`fas ${p.IsGroupLeader ? 'fa-star' : 'fa-user'}`}></i>
                            {p.ParticipantName
                              ? p.ParticipantName
                              : p.IsGroupLeader ? 'Team Leader' : `Participant ${index + 1}`}
                            {p.IsGroupLeader && (
                              <span className={`badge ${p.IsGroupLeader ? 'bg-white text-primary' : 'bg-warning text-dark'} ms-1`}>
                                Leader
                              </span>
                            )}
                          </div>
                          {!p.IsGroupLeader && index >= event.GroupMinParticipants && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => removeParticipantField(index)}
                              title="Remove member"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>

                        {/* Fields */}
                        <div className="p-4 bg-white">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold text-muted mb-1">
                                Full Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter full name"
                                value={p.ParticipantName}
                                onChange={(e) => handleParticipantChange(index, 'ParticipantName', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold text-muted mb-1">
                                Email Address <span className="text-danger">*</span>
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email"
                                value={p.ParticipantEmail}
                                onChange={(e) => handleParticipantChange(index, 'ParticipantEmail', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold text-muted mb-1">
                                Contact Number <span className="text-danger">*</span>
                              </label>
                              <input
                                type="tel"
                                className="form-control"
                                placeholder="Enter mobile number"
                                value={p.ParticipantContactNo}
                                onChange={(e) => handleParticipantChange(index, 'ParticipantContactNo', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold text-muted mb-1">
                                Enrollment No. <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter enrollment number"
                                value={p.ParticipantEnrollmentNo}
                                onChange={(e) => handleParticipantChange(index, 'ParticipantEnrollmentNo', e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label small fw-semibold text-muted mb-1">
                                Institute Name <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter institute / college name"
                                value={p.ParticipantInsituteName}
                                onChange={(e) => handleParticipantChange(index, 'ParticipantInsituteName', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Member Button */}
                  {participants.length < event.GroupMaxParticipants && (
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill px-4"
                        onClick={addParticipantField}
                      >
                        <i className="fas fa-plus me-2"></i>Add Another Member
                      </button>
                    </div>
                  )}

                  {/* Fee summary */}
                  <div className="bg-light p-3 rounded-3 mt-4 mb-4 border d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted fw-semibold">Total Entry Fee:</div>
                      <div className="fw-bold fs-5 text-success">
                        {event.EventFees === 0 ? 'FREE' : `₹${event.EventFees}`}
                      </div>
                    </div>
                    {event.EventFees > 0 && (
                      <div className="small text-muted text-end">
                        <i className="fas fa-info-circle me-1"></i> Payment to be collected<br />at the event desk.
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => { setStep(1); setErrorMsg(''); }}
                    >
                      <i className="fas fa-arrow-left me-2"></i>Go Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                        : <><i className="fas fa-paper-plane me-2"></i>Confirm &amp; Submit</>
                      }
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: Success ── */}
              {step === 3 && successData && (
                <div className="text-center py-5">
                  <div className="d-inline-flex bg-success bg-opacity-10 text-success rounded-circle p-4 mb-4">
                    <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="fw-bold mb-3">Registration Successful! 🎉</h2>
                  <p className="lead text-muted mb-1">
                    Your team <strong>{successData.GroupName}</strong> is officially registered.
                  </p>
                  <p className="text-muted mb-4 pb-3 border-bottom d-inline-block px-5">
                    Group ID: <span className="fw-bold text-dark font-monospace">{successData._id}</span>
                  </p>

                  <div className="bg-light p-4 rounded-4 text-start mx-auto mb-4" style={{ maxWidth: '420px' }}>
                    <h6 className="fw-bold mb-3">
                      <i className="fas fa-clipboard-list me-2 text-primary"></i>Next Steps:
                    </h6>
                    <ul className="small text-muted mb-0 ps-3" style={{ lineHeight: '1.9' }}>
                      <li>Save your <strong>Group ID</strong> for future reference.</li>
                      {event.EventFees > 0 ? (
                        <li>
                          Contact coordinator <strong>{event.EventMainStudentCoOrdinatorName || 'the event desk'}</strong>
                          {event.EventMainStudentCoOrdinatorPhone ? ` at ${event.EventMainStudentCoOrdinatorPhone}` : ''} to pay the entry fee.
                        </li>
                      ) : (
                        <li>Be present at the venue 30 minutes before the scheduled time.</li>
                      )}
                      <li>All team members must carry their College ID card.</li>
                    </ul>
                  </div>

                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link to="/" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">
                      <i className="fas fa-home me-2"></i>Return to Home
                    </Link>
                    <Link to="/events" className="btn btn-outline-secondary rounded-pill px-4">
                      Browse More Events
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {showPopup && successData && (
        <div
          onClick={() => setShowPopup(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            animation: 'fadeInBg 0.3s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              maxWidth: '480px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
              animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Confetti top stripe */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
              background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #22c55e, #f59e0b, #ef4444)',
            }} />

            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', color: '#64748b',
              }}
            >✕</button>

            {/* Animated check icon */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 0 12px rgba(34,197,94,0.15)',
              animation: 'pulse 2s infinite',
            }}>
              <i className="fas fa-check" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
            </div>

            <h2 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#1e293b', marginBottom: '0.5rem' }}>
              🎉 You're In!
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Your team has been successfully registered!
            </p>

            {/* Team info card */}
            <div style={{
              background: '#f8fafc', borderRadius: '16px',
              padding: '1.25rem', marginBottom: '1.5rem',
              border: '1px solid #e2e8f0', textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{
                  background: '#eff6ff', borderRadius: '8px', padding: '6px 8px',
                  fontSize: '20px',
                }}>🏆</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>
                    {successData.GroupName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Team Name</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Event</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{event.EventName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Members</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{participants.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Entry Fee</span>
                  <span style={{ fontWeight: 700, color: event.EventFees === 0 ? '#22c55e' : '#f59e0b' }}>
                    {event.EventFees === 0 ? 'FREE ✓' : `₹${event.EventFees} – Pay at desk`}
                  </span>
                </div>
                <div style={{
                  marginTop: '6px', padding: '8px', background: '#f1f5f9',
                  borderRadius: '8px', fontSize: '0.78rem',
                  fontFamily: 'monospace', color: '#475569', textAlign: 'center',
                }}>
                  Group ID: <strong style={{ color: '#1e293b' }}>{successData._id}</strong>
                </div>
              </div>
            </div>

            {event.EventMainStudentCoOrdinatorName && (
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                <i className="fas fa-phone-alt me-1 text-primary"></i>
                For queries, contact <strong style={{ color: '#475569' }}>{event.EventMainStudentCoOrdinatorName}</strong>
                {event.EventMainStudentCoOrdinatorPhone && (
                  <> · <a href={`tel:${event.EventMainStudentCoOrdinatorPhone}`} style={{ color: '#4f46e5' }}>
                    {event.EventMainStudentCoOrdinatorPhone}
                  </a></>
                )}
              </p>
            )}

            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', border: 'none', borderRadius: '50px',
                padding: '12px 40px', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', width: '100%',
                boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Awesome, Got It! 🚀
            </button>

            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '12px', marginBottom: 0 }}>
              This popup closes automatically in 6 seconds · Click anywhere outside to dismiss
            </p>
          </div>

          {/* Keyframe styles injected inline */}
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.7); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeInBg {
              from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 0 12px rgba(34,197,94,0.15); }
              50% { box-shadow: 0 0 0 20px rgba(34,197,94,0.08); }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}

export default RegisterEvent;
