import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api"; // Assuming your axios instance is here
import "../styles/department.css";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [institutes, setInstitutes] = useState([]); // For the dropdown
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    DepartmentName: "",
    InstituteID: "",
    Status: "Active",
  });

  useEffect(() => {
    fetchDepartments();
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      const res = await API.get("/institutes");
      if (res.data.success) setInstitutes(res.data.data);
    } catch (err) {
      console.error("Error fetching institutes", err);
    }
  };

  const fetchDepartments = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      const res = await API.get(
        `/departments?page=${page}&search=${search}&limit=5`,
      );
      if (res.data.success) {
        setDepartments(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setCurrentPage(res.data.pagination.page);
      }
    } catch (err) {
      console.error("Error fetching departments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchDepartments(1, value);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({ DepartmentName: "", InstituteID: "", Status: "Active" });
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditMode(true);
    setSelectedId(dept._id);
    setFormData({
      DepartmentName: dept.DepartmentName,
      InstituteID: dept.InstituteID?._id || "",
      Status: dept.Status || "Active",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await API.patch(`/departments/${selectedId}`, formData);
      } else {
        await API.post("/departments", formData);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await API.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <Navbar pageTitle={"Departments"} />

      <main className="content-wrapper">
        <div className="card border-0 shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Department List</h4>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                <i className="fas fa-plus me-2"></i>Add Department
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover custom-table align-middle">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Institute</th>
                  <th>Status</th>
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
                ) : departments.length > 0 ? (
                  departments.map((dept) => (
                    <tr key={dept._id}>
                      <td className="fw-bold">{dept.DepartmentName}</td>
                      <td>{dept.InstituteID?.InstituteName || "N/A"}</td>
                      <td>
                        <span
                          className={`badge-status ${dept.Status === "Active" ? "success" : "danger"}`}
                        >
                          {dept.Status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-info me-2"
                          onClick={() => handleOpenEdit(dept)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(dept._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No departments found matching "{searchTerm}"
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
                      onClick={() =>
                        fetchDepartments(currentPage - 1, searchTerm)
                      }
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
                        onClick={() => fetchDepartments(num + 1, searchTerm)}
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
                      onClick={() =>
                        fetchDepartments(currentPage + 1, searchTerm)
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {showModal && (
          <div
            className="modal d-block"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEditMode ? "Edit Department" : "Add Department"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Department Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.DepartmentName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            DepartmentName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Select Institute</label>
                      <select
                        className="form-select"
                        required
                        value={formData.InstituteID}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            InstituteID: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Choose Institute --</option>
                        {institutes.map((inst) => (
                          <option key={inst._id} value={inst._id}>
                            {inst.InstituteName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.Status}
                        onChange={(e) =>
                          setFormData({ ...formData, Status: e.target.value })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditMode ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Departments;
