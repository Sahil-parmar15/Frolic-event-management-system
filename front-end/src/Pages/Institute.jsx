import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API, { BASE_URL } from "../services/api";

function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editFormData, setEditFormData] = useState({
    InstituteName: "",
    InsituteDescription: "",
    InsituteCoOrdinatorID: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        if (res.data.success) {
          setAllUsers(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching users for dropdown:", err);
      }
    };
    fetchUsers();
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const res = await API.get(`/institutes?page=${page}&search=${search}`);
      if (res.data.success) {
        setInstitutes(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setCurrentPage(res.data.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching institutes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchInstitutes(value);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setEditFormData({
      InstituteName: "",
      InsituteDescription: "",
      InsituteCoOrdinatorID: "",
    });
    setPreviewUrl(null);
    setSelectedFile(null);
    setShowEditModal(true);
  };

  const handleEditClick = (inst) => {
    setIsEditMode(true);
    setSelectedId(inst._id);
    setEditFormData({
      InstituteName: inst.InstituteName,
      InsituteDescription: inst.InsituteDescription,
      InsituteCoOrdinatorID: inst.InsituteCoOrdinatorID?._id || "",
    });
    setPreviewUrl(`${BASE_URL}/${inst.InsituteImage}`);
    setSelectedFile(null);
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("InstituteName", editFormData.InstituteName);
    data.append("InsituteDescription", editFormData.InsituteDescription);
    data.append("InsituteCoOrdinatorID", editFormData.InsituteCoOrdinatorID);

    if (selectedFile) {
      data.append("InsituteImage", selectedFile);
    }

    try {
      let res;
      if (selectedId) {
        res = await API.patch(`/institutes/${selectedId}`, data);
      } else {
        if (!selectedFile)
          return alert("Please upload a logo for the new institute");

        res = await API.post("/institutes", data);
      }

      if (res.data.success) {
        alert(selectedId ? "Updated!" : "Added successfully!");
        setShowEditModal(false);
        fetchInstitutes();
      }
    } catch (err) {
      console.error("API Error:", err.response);
      alert(err.response?.data?.message || "Error: Resource not found (404)");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this institute? This action cannot be undone.",
      )
    ) {
      try {
        const res = await API.delete(`/institutes/${id}`);

        if (res.data.success) {
          setInstitutes(institutes.filter((inst) => inst._id !== id));
          alert("Institute deleted successfully!");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Failed to delete institute");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle="Institutes" />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Institute List</h4>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddClick}
              >
                Add Institute
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover custom-table align-middle">
              <thead>
                <tr>
                  <th>Institute Name</th>
                  <th>Coordinator</th>
                  <th>Contact</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : institutes.length > 0 ? (
                  institutes.map((inst) => (
                    <tr key={inst._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={`${BASE_URL}/${inst.InsituteImage?.replace(/\\/g, "/")}`}
                            alt="Institute Logo"
                            className="rounded shadow-sm"
                            style={{
                              width: "45px",
                              height: "45px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://ui-avatars.com/api/?name=I&background=random";
                            }}
                          />
                          <div>
                            <div className="fw-bold">{inst.InstituteName}</div>
                            <small className="text-muted">
                              {inst.InsituteDescription?.substring(0, 40)}...
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{inst.InsituteCoOrdinatorID?.UserName || "N/A"}</td>
                      <td>
                        <div className="small">
                          {inst.InsituteCoOrdinatorID?.EmailAddress}
                        </div>
                        <div className="smaller text-muted">
                          {inst.InsituteCoOrdinatorID?.PhoneNumber}
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-info me-2"
                          onClick={() => handleEditClick(inst)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(inst._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No institutes found matching "{searchTerm}"
                    </td>
                  </tr>
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
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => fetchInstitutes(currentPage - 1)}
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
                        onClick={() => fetchInstitutes(num + 1)}
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
                      onClick={() => fetchInstitutes(currentPage + 1)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="fw-bold">
                  {isEditMode ? "Update Institute" : "Register New Institute"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Institute Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editFormData.InstituteName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          InstituteName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editFormData.InsituteDescription}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          InsituteDescription: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Select Coordinator
                    </label>
                    <select
                      className="form-select shadow-sm"
                      value={editFormData.InsituteCoOrdinatorID}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          InsituteCoOrdinatorID: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Choose a Coordinator --</option>
                      {allUsers
                        .filter((user) => user.IsAdmin === false)
                        .map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.UserName} ({user.EmailAddress})
                          </option>
                        ))}
                    </select>
                    {allUsers.filter((u) => !u.IsAdmin).length === 0 && (
                      <small className="text-danger">
                        No coordinators found in the system.
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Institute Logo</label>
                    <div className="mb-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="rounded border"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                    </div>

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
                    <small className="text-muted">
                      Leave blank to keep the current image.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? "Save Changes" : "Create Institute"}
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

export default Institutes;
