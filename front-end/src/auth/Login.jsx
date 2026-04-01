import React, { useState } from "react";
import { data, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/login.css"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await API.post("/auth/login", {
      EmailAddress: email,
      UserPassword: password,
    });

    if (res.data.success && res.data.data.token) {
      localStorage.setItem("token", res.data.data.token);
      
      localStorage.setItem("isAdmin", res.data.data.user.IsAdmin);
      
      navigate("/admin/dashboard");
    }
  } catch (err) {
    if (err.response && err.response.data) {
      setError(err.response.data.message || "Invalid email or password");
    } else {
      setError("Server connection failed. Is your backend running?");
    }
  }
};

  return (
    <div className="login-page-bg">
      <div className="container d-flex align-items-center min-vh-100">
        <div className="row justify-content-center w-100">
          <div className="col-12 col-md-8 col-lg-4">
            <div className="card login-card shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="fw-bold frolic-logo">Frolic</h1>
                  <p className="text-muted">Welcome back! Please login.</p>
                </div>

                {error && (
                  <div className="alert alert-danger">{error}</div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="admin@frolic.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                  >
                    SIGN IN
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="small mb-0">
                    Don't have an account?{" "}
                    <a href="#" className="fw-bold">
                      Register
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;