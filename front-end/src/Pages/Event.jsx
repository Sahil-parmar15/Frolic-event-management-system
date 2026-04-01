import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API, { BASE_URL } from "../services/api";

function Events() {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editFormData, setEditFormData] = useState({
    EventName: "",
    EventTagline: "",
    EventDescription: "",
    GroupMinParticipants: 1,
    GroupMaxParticipants: 1,
    EventFees: 0,
    EventFirstPrice: "",
    EventSecondPrice: "",
    EventThirdPrice: "",
    DepartmentID: "",
    EventCoOrdinatorID: "",
    EventMainStudentCoOrdinatorName: "",
    EventMainStudentCoOrdinatorPhone: "",
    EventMainStudentCoOrdinatorEmail: "",
    EventLocation: "",
    MaxGroupsAllowed: 1,
  });

  useEffect(() => {
    fetchEvents();
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const deptRes = await API.get("/departments");
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
      
      const userRes = await API.get("/users");
      if (userRes.data.success) {
        setCoordinators(userRes.data.data.filter(u => !u.IsAdmin));
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchEvents = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const res = await API.get(`/events?page=${page}&search=${search}`);
      if (res.data.success) {
        setEvents(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setCurrentPage(res.data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchEvents(1, value);
  };

  const clearForm = () => {
    setEditFormData({
      EventName: "",
      EventTagline: "",
      EventDescription: "",
      GroupMinParticipants: 1,
      GroupMaxParticipants: 1,
      EventFees: 0,
      EventFirstPrice: "",
      EventSecondPrice: "",
      EventThirdPrice: "",
      DepartmentID: "",
      EventCoOrdinatorID: "",
      EventMainStudentCoOrdinatorName: "",
      EventMainStudentCoOrdinatorPhone: "",
      EventMainStudentCoOrdinatorEmail: "",
      EventLocation: "",
      MaxGroupsAllowed: 1,
    });
    setPreviewUrl(null);
    setSelectedFile(null);
  }

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedId(null);
    clearForm();
    setShowEditModal(true);
  };

  const handleEditClick = (event) => {
    setIsEditMode(true);
    setSelectedId(event._id);
    setEditFormData({
      EventName: event.EventName || "",
      EventTagline: event.EventTagline || "",
      EventDescription: event.EventDescription || "",
      GroupMinParticipants: event.GroupMinParticipants || 1,
      GroupMaxParticipants: event.GroupMaxParticipants || 1,
      EventFees: event.EventFees || 0,
      EventFirstPrice: event.EventFirstPrice || "",
      EventSecondPrice: event.EventSecondPrice || "",
      EventThirdPrice: event.EventThirdPrice || "",
      DepartmentID: event.DepartmentID?._id || "",
      EventCoOrdinatorID: event.EventCoOrdinatorID?._id || "",
      EventMainStudentCoOrdinatorName: event.EventMainStudentCoOrdinatorName || "",
      EventMainStudentCoOrdinatorPhone: event.EventMainStudentCoOrdinatorPhone || "",
      EventMainStudentCoOrdinatorEmail: event.EventMainStudentCoOrdinatorEmail || "",
      EventLocation: event.EventLocation || "",
      MaxGroupsAllowed: event.MaxGroupsAllowed || 1,
    });
    if (event.EventImage) {
      setPreviewUrl(`${BASE_URL}/${event.EventImage.replace(/\\/g, "/")}`);
    } else {
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await API.delete(`/events/${id}`);
        if (res.data.success) {
          fetchEvents();
          alert("Event deleted successfully!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Failed to delete event");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(editFormData).forEach(key => {
      data.append(key, editFormData[key]);
    });

    if (selectedFile) {
      data.append("EventImage", selectedFile);
    }

    try {
      let res;
      if (isEditMode) {
        res = await API.patch(`/events/${selectedId}`, data);
      } else {
        res = await API.post("/events", data);
      }

      if (res.data.success) {
        alert(isEditMode ? "Event Updated!" : "Event Created!");
        setShowEditModal(false);
        fetchEvents(currentPage);
      }
    } catch (err) {
      console.error("API Error:", err.response);
      alert(err.response?.data?.message || "Error submitting form");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle="Events" />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Event List</h4>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button
                className="btn btn-primary btn-sm text-nowrap"
                onClick={handleAddClick}
              >
                <i className="fas fa-plus me-1"></i> Add Event
              </button>
            </div>
          </div>

          <div className="row g-4">
            {loading ? (
              <div className="col-12 text-center py-5">
                <p>Loading events...</p>
              </div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="col-12 col-md-6 col-lg-4">
                  <div className="card event-card shadow-sm h-100 border-0" style={{ borderRadius: '15px' }}>
                    <div className="event-img-container position-relative" style={{ height: '180px', overflow: 'hidden', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                      <img 
                        src={event.EventImage ? `${BASE_URL}/${event.EventImage.replace(/\\/g, "/")}` : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80"}
                        className="card-img-top h-100 w-100 object-fit-cover" 
                        alt={event.EventName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80";
                        }}
                      />
                      <span className="badge bg-primary position-absolute shadow-sm" style={{ top: '15px', right: '15px' }}>
                        {event.DepartmentID?.DepartmentName || "Event"}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0 text-truncate" style={{ maxWidth: '75%' }}>{event.EventName}</h5>
                        <span className="text-success fw-bold bg-success-subtle px-2 py-1 rounded small">₹{event.EventFees}</span>
                      </div>
                      <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.EventDescription || event.EventTagline || "No description provided."}
                      </p>
                      
                      <div className="d-flex align-items-center text-muted small mb-2 text-truncate">
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i> {event.EventLocation || "Location TBA"}
                      </div>
                      <div className="d-flex align-items-center text-muted small mb-3">
                        <i className="fas fa-user-tie me-2 text-info"></i> {event.EventMainStudentCoOrdinatorName || "TBA"}
                      </div>
                      
                      <hr className="my-3"/>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted fw-semibold">
                          <i className="fas fa-users me-1 text-primary"></i> Team: {event.GroupMinParticipants}-{event.GroupMaxParticipants}
                        </span>
                        <div className="btn-group">
                          <button 
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handleEditClick(event)}
                            title="Edit Event"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(event._id)}
                            title="Delete Event"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                No events found matching "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="small text-muted">
              Showing Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => fetchEvents(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>

                {[...Array(totalPages).keys()].map((num) => (
                  <li
                    key={num + 1}
                    className={`page-item ${currentPage === num + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => fetchEvents(num + 1)}
                    >
                      {num + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => fetchEvents(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="fw-bold">
                  {isEditMode ? "Update Event" : "Create New Event"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Event Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="EventName" value={editFormData.EventName} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Event Tagline</label>
                      <input type="text" className="form-control" name="EventTagline" value={editFormData.EventTagline} onChange={handleInputChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows="2" name="EventDescription" value={editFormData.EventDescription} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department <span className="text-danger">*</span></label>
                      <select className="form-select" name="DepartmentID" value={editFormData.DepartmentID} onChange={handleInputChange} required>
                        <option value="">-- Choose Department --</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>{dept.DepartmentName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Event Coordinator (Faculty) <span className="text-danger">*</span></label>
                      <select className="form-select" name="EventCoOrdinatorID" value={editFormData.EventCoOrdinatorID} onChange={handleInputChange} required>
                        <option value="">-- Choose Coordinator --</option>
                        {coordinators.map((user) => (
                          <option key={user._id} value={user._id}>{user.UserName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Min Participants <span className="text-danger">*</span></label>
                      <input type="number" min="1" className="form-control" name="GroupMinParticipants" value={editFormData.GroupMinParticipants} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Max Participants <span className="text-danger">*</span></label>
                      <input type="number" min="1" className="form-control" name="GroupMaxParticipants" value={editFormData.GroupMaxParticipants} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Max Groups Allowed <span className="text-danger">*</span></label>
                      <input type="number" min="1" className="form-control" name="MaxGroupsAllowed" value={editFormData.MaxGroupsAllowed} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Event Fees (₹) <span className="text-danger">*</span></label>
                      <input type="number" min="0" className="form-control" name="EventFees" value={editFormData.EventFees} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input type="text" className="form-control" name="EventLocation" value={editFormData.EventLocation} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Student Coordinator</label>
                      <input type="text" className="form-control form-control-sm" name="EventMainStudentCoOrdinatorName" value={editFormData.EventMainStudentCoOrdinatorName} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Student Phone</label>
                      <input type="text" className="form-control form-control-sm" name="EventMainStudentCoOrdinatorPhone" value={editFormData.EventMainStudentCoOrdinatorPhone} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Student Email</label>
                      <input type="email" className="form-control form-control-sm" name="EventMainStudentCoOrdinatorEmail" value={editFormData.EventMainStudentCoOrdinatorEmail} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">1st Prize</label>
                      <input type="text" className="form-control form-control-sm" name="EventFirstPrice" value={editFormData.EventFirstPrice} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">2nd Prize</label>
                      <input type="text" className="form-control form-control-sm" name="EventSecondPrice" value={editFormData.EventSecondPrice} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">3rd Prize</label>
                      <input type="text" className="form-control form-control-sm" name="EventThirdPrice" value={editFormData.EventThirdPrice} onChange={handleInputChange} />
                    </div>
                    <div className="col-12 mt-3">
                      <label className="form-label fw-bold">Event Image</label>
                      {previewUrl && (
                        <div className="mb-2">
                          <img src={previewUrl} alt="Preview" className="rounded border" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                        </div>
                      )}
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setSelectedFile(file);
                          setPreviewUrl(URL.createObjectURL(file));
                        }}
                      />
                      <small className="text-muted">Leave blank to keep the current image.</small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditMode ? "Save Changes" : "Create Event"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;