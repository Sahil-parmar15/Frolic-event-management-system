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
  const [errorMsg, setErrorMsg] = useState("");

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
      const initialParticipants = Array.from({ length: evt.GroupMinParticipants }, (_, i) => ({
        ParticipantName: '',
        ParticipantEmail: '',
        ParticipantContactNo: '',
        ParticipantEnrollmentNo: '',
        ParticipantInsituteName: '',
        ParticipantDepartmentName: '',
        ParticipantSemester: '',
        IsGroupLeader: i === 0,
      }));
      setParticipants(initialParticipants);
    } catch (error) {
      console.error("Error fetching event:", error);
      setErrorMsg("Failed to load event data. Please try again.");
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
        ParticipantDepartmentName: '',
        ParticipantSemester: '',
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
    if (step === 1 && !groupName.trim()) {
      setErrorMsg("Group Name is required.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      // 1. Create the Group
      const groupRes = await API.post('/groups', {
        GroupName: groupName,
        EventID: id
      });
      
      const createdGroup = groupRes.data.data;

      // 2. Create the Participants
      const participantPromises = participants.map((p) => {
        return API.post('/participants', {
          ...p,
          GroupID: createdGroup._id
        });
      });

      await Promise.all(participantPromises);

      // 3. Success state
      setSuccessData(createdGroup);
      setStep(3);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMsg(error.response?.data?.message || "Something went wrong during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!event) return null;

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
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4 px-md-5">
              {/* Progress Bar */}
              <div className="position-relative m-4">
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-primary transition-all" role="progressbar" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
                </div>
                <div className="d-flex justify-content-between position-absolute w-100 top-50 translate-middle-y">
                  <div className={`btn btn-sm rounded-circle fw-bold ${step >= 1 ? 'btn-primary' : 'btn-light border'} shadow-sm`} style={{ width: '32px', height: '32px' }}>1</div>
                  <div className={`btn btn-sm rounded-circle fw-bold ${step >= 2 ? 'btn-primary' : 'btn-light border'} shadow-sm`} style={{ width: '32px', height: '32px' }}>2</div>
                  <div className={`btn btn-sm rounded-circle fw-bold ${step === 3 ? 'btn-success' : 'btn-light border'} shadow-sm`} style={{ width: '32px', height: '32px' }}><i className="fas fa-check"></i></div>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4 p-md-5 bg-white">
              {errorMsg && <div className="alert alert-danger shadow-sm rounded-3"><i className="fas fa-exclamation-triangle me-2"></i>{errorMsg}</div>}

              {/* Step 1: Group Name */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="animate__animated animate__fadeIn">
                  <h4 className="fw-bold mb-4">Step 1: Define Your Group</h4>
                  <div className="mb-4">
                    <label className="form-label text-muted fw-semibold mb-2">Group / Team Name <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control public-form-control" 
                      placeholder="e.g. Code Ninjas, The Innovators"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                    <div className="form-text mt-2"><i className="fas fa-info-circle me-1"></i> Make it catchy! This will be your identity.</div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                    <Link to={`/events/${event._id}`} className="btn btn-outline-secondary rounded-pill px-4">Cancel</Link>
                    <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">Next Step <i className="fas fa-arrow-right ms-2"></i></button>
                  </div>
                </form>
              )}

              {/* Step 2: Participants */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Step 2: Team Members</h4>
                    <span className="badge bg-light text-dark border">
                      Min: {event.GroupMinParticipants} | Max: {event.GroupMaxParticipants}
                    </span>
                  </div>

                  <div className="accordion" id="participantsAccordion">
                    {participants.map((p, index) => (
                      <div className="accordion-item border-0 mb-3 shadow-sm rounded-4 overflow-hidden" key={index}>
                        <h2 className="accordion-header">
                          <button className="accordion-button fw-bold bg-light" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`}>
                            <i className={`fas ${p.IsGroupLeader ? 'fa-star text-warning' : 'fa-user text-muted'} me-2`}></i>
                            {p.ParticipantName || `Participant ${index + 1}`} {p.IsGroupLeader ? "(Team Leader)" : ""}
                          </button>
                        </h2>
                        <div id={`collapse${index}`} className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} data-bs-parent="#participantsAccordion">
                          <div className="accordion-body bg-white border border-top-0 rounded-bottom-4">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Full Name *</label>
                                <input type="text" className="form-control form-control-sm" required value={p.ParticipantName} onChange={(e) => handleParticipantChange(index, 'ParticipantName', e.target.value)} />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Email Address *</label>
                                <input type="email" className="form-control form-control-sm" required value={p.ParticipantEmail} onChange={(e) => handleParticipantChange(index, 'ParticipantEmail', e.target.value)} />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Contact Number *</label>
                                <input type="tel" className="form-control form-control-sm" required value={p.ParticipantContactNo} onChange={(e) => handleParticipantChange(index, 'ParticipantContactNo', e.target.value)} />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Enrollment No. *</label>
                                <input type="text" className="form-control form-control-sm" required value={p.ParticipantEnrollmentNo} onChange={(e) => handleParticipantChange(index, 'ParticipantEnrollmentNo', e.target.value)} />
                              </div>
                              <div className="col-12">
                                <label className="form-label small text-muted mb-1">Institute Name *</label>
                                <input type="text" className="form-control form-control-sm" required value={p.ParticipantInsituteName} onChange={(e) => handleParticipantChange(index, 'ParticipantInsituteName', e.target.value)} />
                              </div>
                            </div>
                            
                            {!p.IsGroupLeader && index >= event.GroupMinParticipants && (
                              <div className="text-end mt-3 border-top pt-3">
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeParticipantField(index)}>
                                  <i className="fas fa-trash me-1"></i> Remove Member
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {participants.length < event.GroupMaxParticipants && (
                    <div className="text-center mt-4">
                      <button type="button" className="btn btn-outline-primary border-dashed rounded-pill px-4" onClick={addParticipantField}>
                        <i className="fas fa-plus me-2"></i> Add Another Member
                      </button>
                    </div>
                  )}

                  <div className="bg-light p-3 rounded-3 mt-4 mb-4 border d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted fw-semibold">Total Entry Fee:</div>
                      <div className="fw-bold fs-5 text-success">{event.EventFees === 0 ? "FREE" : `₹${event.EventFees}`}</div>
                    </div>
                    {event.EventFees > 0 && (
                      <div className="small text-muted text-end">
                        <i className="fas fa-info-circle me-1"></i> Payment to be collected<br/>at the event desk.
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setStep(1)}>Go Back</button>
                    <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm" disabled={isSubmitting}>
                      {isSubmitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-paper-plane me-2"></i>}
                      Confirm & Submit
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && successData && (
                <div className="text-center py-5 animate__animated animate__zoomIn">
                  <div className="d-inline-flex bg-success bg-opacity-10 text-success rounded-circle p-4 mb-4">
                    <i className="fas fa-check-circle" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="fw-bold mb-3">Registration Successful!</h2>
                  <p className="lead text-muted mb-1">Your team <strong>{successData.GroupName}</strong> is officially registered.</p>
                  <p className="text-muted mb-4 pb-3 border-bottom d-inline-block px-5">Your Group ID: <span className="fw-bold text-dark">{successData._id}</span></p>
                  
                  <div className="bg-light p-4 rounded-4 text-start mx-auto mb-4" style={{ maxWidth: '400px' }}>
                    <h6 className="fw-bold mb-3"><i className="fas fa-clipboard-list me-2 text-primary"></i>Next Steps:</h6>
                    <ul className="small text-muted mb-0 ps-3" style={{ lineHeight: '1.8' }}>
                      <li>Save your Group ID for future reference.</li>
                      {event.EventFees > 0 ? (
                        <li>Contact the event coordinator <strong>{event.EventMainStudentCoOrdinatorName}</strong> to finalize your payment.</li>
                      ) : (
                        <li>Be present at the venue 30 minutes before the scheduled time.</li>
                      )}
                      <li>Ensure all team members bring their College ID cards.</li>
                    </ul>
                  </div>

                  <Link to="/" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">Return to Home</Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterEvent;
