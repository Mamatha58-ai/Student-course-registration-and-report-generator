import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { saveSession } from "../utils/session";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const roleHint = new URLSearchParams(location.search).get("role");
  const normalizedRoleHint =
    roleHint === "admin" || roleHint === "student" ? roleHint : "";

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = normalizedRoleHint
        ? { ...formData, role: normalizedRoleHint }
        : formData;
      const res = await api.post("/users/login", payload);
      saveSession(res.data);

      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (loginError) {
      if (loginError.response?.data?.message) {
        setError(loginError.response.data.message);
      } else {
        setError("Cannot reach the server. Make sure the backend is running on http://localhost:5000.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="container">
        <div className="auth-card row g-0 mx-auto">
          <div className="col-lg-5 auth-aside d-flex flex-column justify-content-center">
            <span className="eyebrow mb-3">Secure Access</span>
            <h2 className="mb-3">Welcome back</h2>
            <p className="mb-0 text-white-50">
              Sign in to access the {roleHint || "portal"} workspace and continue with course
              operations.
            </p>
          </div>

          <div className="col-lg-7 auth-form">
            <h3 className="mb-3">Login</h3>
            <p className="text-muted mb-4">
              Use the same credentials you created during registration.
              {normalizedRoleHint ? ` Only ${normalizedRoleHint} accounts can sign in here.` : ""}
            </p>

            {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  className="form-control"
                  name="email"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="text-muted mt-4 mb-0">
              Need an account? <Link to="/register">Create one here</Link>.
            </p>
            <p className="text-muted mt-2 mb-0">
              Forgot your password? <Link to="/forgot-password">Reset it here</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
