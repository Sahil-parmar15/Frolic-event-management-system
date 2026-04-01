import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/winner.css";

function Winners() {
  const [winners, setWinners] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterEventId, setFilterEventId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editFormData, setEditFormData] = useState({
    EventID: "",
    GroupID: "",
    Sequence: 1,
  });

  useEffect(() => {
    fetchEvents();
    fetchGroups();
    fetchWinners();
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

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups?limit=500");
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchWinners = async (page = 1, eventId = filterEventId) => {
    try {
      setLoading(true);
      let url = `/winners?page=${page}`;
      if (eventId) url += `&eventId=${eventId}`;
      
      const res = await API.get(url);
      if (res.data.success) {
        setWinners(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setCurrentPage(res.data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterEventId(value);
    fetchWinners(1, value);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setEditFormData({
      EventID: "",
      GroupID: "",
      Sequence: 1,
    });
    setShowEditModal(true);
  };

  const handleEditClick = (winner) => {
    setIsEditMode(true);
    setSelectedId(winner._id);
    setEditFormData({
      EventID: winner.EventID?._id || "",
      GroupID: winner.GroupID?._id || "",
      Sequence: winner.Sequence || 1,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this winner?")) {
      try {
        const res = await API.delete(`/winners/${id}`);
        if (res.data.success) {
          fetchWinners(currentPage);
          alert("Winner removed successfully!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Failed to delete winner");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isEditMode) {
        res = await API.patch(`/winners/${selectedId}`, editFormData);
      } else {
        res = await API.post("/winners", editFormData);
      }

      if (res.data.success) {
        alert(isEditMode ? "Winner Updated!" : "Winner Added!");
        setShowEditModal(false);
        fetchWinners(currentPage);
      }
    } catch (err) {
      console.error("API Error:", err.response);
      alert(err.response?.data?.message || "Error submitting form. May be duplicate sequence or invalid data.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Derived groups based on selected event in form
  const availableGroups = groups.filter(g => g.EventID?._id === editFormData.EventID || g.EventID === editFormData.EventID);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle="Hall of Fame" />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Event Winners List</h4>
            <div className="d-flex gap-2">
              <select className="form-select form-select-sm" value={filterEventId} onChange={handleFilterChange}>
                <option value="">All Events</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.EventName}</option>
                ))}
              </select>
              <button className="btn btn-primary btn-sm text-nowrap" onClick={handleAddClick}>
                <i className="fas fa-plus me-1"></i> Add Winner
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle custom-table">
              <thead className="bg-light">
                <tr>
                  <th>Rank / Sequence</th>
                  <th>Event Name</th>
                  <th>Winning Group</th>
                  <th>Award Level</th>
                  <th className="text-end">Manage</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                ) : winners.length > 0 ? (
                  winners.map(w => (
                    <tr key={w._id}>
                      <td>
                        <span className={`badge ${w.Sequence === 1 ? 'bg-warning text-dark' : w.Sequence === 2 ? 'bg-secondary' : w.Sequence === 3 ? 'bg-danger' : 'bg-primary'}`}>
                          Rank {w.Sequence}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-primary">{w.EventID?.EventName || "N/A"}</div>
                      </td>
                      <td>
                        <div className="fw-bold">{w.GroupID?.GroupName || "N/A"}</div>
                        <small className="text-muted">Group ID: {w.GroupID?._id?.substring(0,6)}</small>
                      </td>
                      <td>
                        <div className="small text-muted">
                          {w.Sequence === 1 ? "1st Prize Winner" : w.Sequence === 2 ? "1st Runner Up" : w.Sequence === 3 ? "2nd Runner Up" : "Consolation"}
                        </div>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditClick(w)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(w._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4">No winners recorded</td></tr>
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
                    <button className="page-link" onClick={() => fetchWinners(currentPage - 1)}>Previous</button>
                  </li>
                  {[...Array(totalPages).keys()].map((num) => (
                    <li key={num + 1} className={`page-item ${currentPage === num + 1 ? "active" : ""}`}>
                      <button className="page-link" onClick={() => fetchWinners(num + 1)}>{num + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => fetchWinners(currentPage + 1)}>Next</button>
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
                <h5 className="fw-bold">{isEditMode ? "Update Winner" : "Declare Winner"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Event <span className="text-danger">*</span></label>
                    <select className="form-select" name="EventID" value={editFormData.EventID} onChange={handleInputChange} required disabled={isEditMode}>
                      <option value="">-- Select Event --</option>
                      {events.map((ev) => (
                        <option key={ev._id} value={ev._id}>{ev.EventName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Winning Group <span className="text-danger">*</span></label>
                    <select className="form-select" name="GroupID" value={editFormData.GroupID} onChange={handleInputChange} required disabled={!editFormData.EventID}>
                      <option value="">-- Select Group --</option>
                      {availableGroups.map((g) => (
                        <option key={g._id} value={g._id}>{g.GroupName}</option>
                      ))}
                    </select>
                    {!editFormData.EventID && <small className="text-muted">Select an event first to see its participating groups.</small>}
                    {editFormData.EventID && availableGroups.length === 0 && <small className="text-danger">No groups found for this event.</small>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sequence / Rank <span className="text-danger">*</span></label>
                    <select className="form-select" name="Sequence" value={editFormData.Sequence} onChange={handleInputChange} required>
                      <option value="1">1 - Winner / 1st Prize</option>
                      <option value="2">2 - 1st Runner Up / 2nd Prize</option>
                      <option value="3">3 - 2nd Runner Up / 3rd Prize</option>
                      <option value="4">4 - Consolation</option>
                      <option value="5">5 - Special Mention</option>
                    </select>
                    <small className="text-muted">Rankings must not be duplicated for the same event.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditMode ? "Save Changes" : "Save Winner"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Winners;