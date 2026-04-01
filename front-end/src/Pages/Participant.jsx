import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/participant.css";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroupId, setFilterGroupId] = useState("");
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editFormData, setEditFormData] = useState({
    ParticipantName: "",
    ParticipantEnrollmentNumber: "",
    ParticipantInsituteName: "",
    ParticipantCIty: "",
    ParticipantMobile: "",
    ParticipantEmail: "",
    IsGroupLeader: false,
    GroupID: "",
  });

  useEffect(() => {
    fetchGroups();
    fetchParticipants();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups?limit=100");
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchParticipants = async (page = 1, search = searchTerm, groupId = filterGroupId) => {
    try {
      setLoading(true);
      let url = `/participants?page=${page}&search=${search}`;
      if (groupId) url += `&groupId=${groupId}`;
      
      const res = await API.get(url);
      if (res.data.success) {
        setParticipants(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setCurrentPage(res.data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchParticipants(1, value, filterGroupId);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterGroupId(value);
    fetchParticipants(1, searchTerm, value);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setEditFormData({
      ParticipantName: "",
      ParticipantEnrollmentNumber: "",
      ParticipantInsituteName: "",
      ParticipantCIty: "",
      ParticipantMobile: "",
      ParticipantEmail: "",
      IsGroupLeader: false,
      GroupID: "",
    });
    setShowEditModal(true);
  };

  const handleEditClick = (participant) => {
    setIsEditMode(true);
    setSelectedId(participant._id);
    setEditFormData({
      ParticipantName: participant.ParticipantName || "",
      ParticipantEnrollmentNumber: participant.ParticipantEnrollmentNumber || "",
      ParticipantInsituteName: participant.ParticipantInsituteName || "",
      ParticipantCIty: participant.ParticipantCIty || "",
      ParticipantMobile: participant.ParticipantMobile || "",
      ParticipantEmail: participant.ParticipantEmail || "",
      IsGroupLeader: participant.IsGroupLeader || false,
      GroupID: participant.GroupID?._id || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      try {
        const res = await API.delete(`/participants/${id}`);
        if (res.data.success) {
          fetchParticipants(currentPage);
          alert("Participant deleted successfully!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Failed to delete participant");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditMode) {
        res = await API.patch(`/participants/${selectedId}`, editFormData);
      } else {
        res = await API.post("/participants", editFormData);
      }

      if (res.data.success) {
        alert(isEditMode ? "Participant Updated!" : "Participant Created!");
        setShowEditModal(false);
        fetchParticipants(currentPage);
      }
    } catch (err) {
      console.error("API Error:", err.response);
      alert(err.response?.data?.message || "Error submitting form");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle="Participant Directory" />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Participant List</h4>
            <div className="d-flex gap-2">
              <select className="form-select form-select-sm" value={filterGroupId} onChange={handleFilterChange}>
                <option value="">All Groups</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.GroupName}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn btn-primary btn-sm text-nowrap" onClick={handleAddClick}>
                <i className="fas fa-plus me-1"></i> Add Participant
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle custom-table">
              <thead className="bg-light">
                <tr>
                  <th>Participant Details</th>
                  <th>Contact Info</th>
                  <th>Institute / City</th>
                  <th>Group</th>
                  <th className="text-end">Manage</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                ) : participants.length > 0 ? (
                  participants.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${p.ParticipantName}&background=random`} 
                            className="rounded-circle me-3" 
                            style={{width: '40px', height: '40px'}}
                            alt="User" 
                          />
                          <div>
                            <div className="fw-bold">{p.ParticipantName} {p.IsGroupLeader && <span className="badge bg-warning text-dark ms-1">Leader</span>}</div>
                            <small className="text-muted">Enroll: {p.ParticipantEnrollmentNumber}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div><i className="fas fa-envelope text-muted"></i> {p.ParticipantEmail}</div>
                          <div><i className="fas fa-phone text-muted"></i> {p.ParticipantMobile}</div>
                        </div>
                      </td>
                      <td>
                        <div className="small fw-semibold">{p.ParticipantInsituteName}</div>
                        <div className="text-muted smaller">{p.ParticipantCIty || "N/A"}</div>
                      </td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                          {p.GroupID?.GroupName || "No Group"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditClick(p)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4">No participants found</td></tr>
                )}
              </tbody>
            </table>
            
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="small text-muted">
                Showing Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </div>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => fetchParticipants(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages).keys()].map((num) => (
                    <li key={num + 1} className={`page-item ${currentPage === num + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => fetchParticipants(num + 1)}>{num + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => fetchParticipants(currentPage + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="fw-bold">{isEditMode ? "Update Participant" : "Register Participant"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="ParticipantName" value={editFormData.ParticipantName} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Enrollment Number <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="ParticipantEnrollmentNumber" value={editFormData.ParticipantEnrollmentNumber} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Institute Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="ParticipantInsituteName" value={editFormData.ParticipantInsituteName} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" name="ParticipantCIty" value={editFormData.ParticipantCIty} onChange={handleInputChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address <span className="text-danger">*</span></label>
                      <input type="email" className="form-control" name="ParticipantEmail" value={editFormData.ParticipantEmail} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="ParticipantMobile" value={editFormData.ParticipantMobile} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Group <span className="text-danger">*</span></label>
                      <select className="form-select" name="GroupID" value={editFormData.GroupID} onChange={handleInputChange} required>
                        <option value="">-- Select Group --</option>
                        {groups.map((g) => (
                          <option key={g._id} value={g._id}>{g.GroupName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" name="IsGroupLeader" checked={editFormData.IsGroupLeader} onChange={handleInputChange} id="leaderSwitch" />
                        <label className="form-check-label fw-bold" htmlFor="leaderSwitch">Is Group Leader</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditMode ? "Save Changes" : "Register Participant"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Participants;