import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/navbar.css";
import "../styles/group.css";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEventId, setFilterEventId] = useState("");
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editFormData, setEditFormData] = useState({
    GroupName: "",
    EventID: "",
    IsPaymentDone: false,
    IsPresent: false,
  });

  useEffect(() => {
    fetchEvents();
    fetchGroups();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events?limit=100");
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchGroups = async (page = 1, search = searchTerm, eventId = filterEventId) => {
    try {
      setLoading(true);
      let url = `/groups?page=${page}&search=${search}`;
      if (eventId) url += `&eventId=${eventId}`;
      
      const res = await API.get(url);
      if (res.data.success) {
        setGroups(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setCurrentPage(res.data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchGroups(1, value, filterEventId);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterEventId(value);
    fetchGroups(1, searchTerm, value);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setEditFormData({
      GroupName: "",
      EventID: "",
      IsPaymentDone: false,
      IsPresent: false,
    });
    setShowEditModal(true);
  };

  const handleEditClick = (group) => {
    setIsEditMode(true);
    setSelectedId(group._id);
    setEditFormData({
      GroupName: group.GroupName || "",
      EventID: group.EventID?._id || "",
      IsPaymentDone: group.IsPaymentDone || false,
      IsPresent: group.IsPresent || false,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        const res = await API.delete(`/groups/${id}`);
        if (res.data.success) {
          fetchGroups();
          alert("Group deleted successfully!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Failed to delete group");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditMode) {
        res = await API.patch(`/groups/${selectedId}`, editFormData);
      } else {
        res = await API.post("/groups", editFormData);
      }

      if (res.data.success) {
        alert(isEditMode ? "Group Updated!" : "Group Created!");
        setShowEditModal(false);
        fetchGroups(currentPage);
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
      <Navbar pageTitle="Group Registrations" />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Group List</h4>
            <div className="d-flex gap-2">
              <select className="form-select form-select-sm" value={filterEventId} onChange={handleFilterChange}>
                <option value="">All Events</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.EventName}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn btn-primary btn-sm text-nowrap" onClick={handleAddClick}>
                <i className="fas fa-plus me-1"></i> Add Group
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle custom-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Registered Event</th>
                  <th>Payment</th>
                  <th>Attendance</th>
                  <th className="text-end">Manage</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                ) : groups.length > 0 ? (
                  groups.map(group => (
                    <tr key={group._id}>
                      <td>
                        <div className="fw-bold">{group.GroupName}</div>
                        <small className="text-muted">ID: {group._id.substring(0, 8)}</small>
                      </td>
                      <td>
                        <span className="text-primary fw-semibold">{group.EventID?.EventName || "N/A"}</span>
                      </td>
                      <td>
                        {group.IsPaymentDone ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                            Paid
                          </span>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2">
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        {group.IsPresent ? (
                          <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2">Present</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2">Absent</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditClick(group)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(group._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4">No groups found</td></tr>
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
                    <button className="page-link" onClick={() => fetchGroups(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages).keys()].map((num) => (
                    <li key={num + 1} className={`page-item ${currentPage === num + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => fetchGroups(num + 1)}>{num + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => fetchGroups(currentPage + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="fw-bold">{isEditMode ? "Update Group" : "Create Group"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Group Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="GroupName" value={editFormData.GroupName} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Event <span className="text-danger">*</span></label>
                    <select className="form-select" name="EventID" value={editFormData.EventID} onChange={handleInputChange} required>
                      <option value="">-- Select Event --</option>
                      {events.map((ev) => (
                        <option key={ev._id} value={ev._id}>{ev.EventName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" name="IsPaymentDone" checked={editFormData.IsPaymentDone} onChange={handleInputChange} id="paymentSwitch" />
                    <label className="form-check-label fw-bold" htmlFor="paymentSwitch">Payment Completed</label>
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" name="IsPresent" checked={editFormData.IsPresent} onChange={handleInputChange} id="presentSwitch" />
                    <label className="form-check-label fw-bold" htmlFor="presentSwitch">Mark Present</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditMode ? "Save Changes" : "Create Group"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;