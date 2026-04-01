import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/user.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    UserName: "",
    EmailAddress: "",
    PhoneNumber: "",
    UserPassword: "", 
    IsAdmin: false    
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.patch(`/users/${selectedId}`, formData);
      } else {
        await API.post("/users", formData);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) { console.error(err); }
    }
  };

  const handleEditClick = (user) => {
    setEditMode(true);
    setSelectedId(user._id);
    setFormData({
      UserName: user.UserName,
      EmailAddress: user.EmailAddress,
      PhoneNumber: user.PhoneNumber,
      IsAdmin: user.IsAdmin,
      UserPassword: "" 
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ UserName: "", EmailAddress: "", PhoneNumber: "", UserPassword: "", IsAdmin: false });
    setEditMode(false);
    setSelectedId(null);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle="User Management" />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">System Users</h4>
            <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowModal(true); }}>
              <i className="fas fa-plus me-2"></i>Add User
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Phone</th>
                  <th>Access Level</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                ) : users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="fw-bold text-dark">{user.UserName}</div>
                      <div className="small text-muted">{user.EmailAddress}</div>
                    </td>
                    <td><span className="small">{user.PhoneNumber}</span></td>
                    <td>
                      {user.IsAdmin ? (
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-3">Administrator</span>
                      ) : (
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3">Coordinator</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-light me-2" onClick={() => handleEditClick(user)}>
                        <i className="fas fa-edit text-info"></i>
                      </button>
                      <button className="btn btn-sm btn-light" onClick={() => handleDelete(user._id)}>
                        <i className="fas fa-trash text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">{editMode ? "Update User" : "New User Account"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body pt-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">User Name</label>
                    <input type="text" className="form-control bg-light border-0" name="UserName" value={formData.UserName} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input type="email" className="form-control bg-light border-0" name="EmailAddress" value={formData.EmailAddress} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input type="text" className="form-control bg-light border-0" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} required />
                  </div>
                  {!editMode && (
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Password</label>
                      <input type="password" className="form-control bg-light border-0" name="UserPassword" value={formData.UserPassword} onChange={handleChange} required />
                    </div>
                  )}
                  <div className="form-check form-switch mt-4">
                    <input className="form-check-input" type="checkbox" name="IsAdmin" checked={formData.IsAdmin} onChange={handleChange} id="adminSwitch" />
                    <label className="form-check-label fw-bold" htmlFor="adminSwitch">Grant Admin Privileges</label>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                    {editMode ? "Update Details" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;