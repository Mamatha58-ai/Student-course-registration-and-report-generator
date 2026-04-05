import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/users/forgot-password", formData);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (resetError) {
      if (resetError.response?.status === 404) {
        setError("Reset password module is not ready yet. Restart the app once and try again.");
      } else {
        setError(resetError.response?.data?.message || "Unable to reset password.");
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
            <span className="eyebrow mb-3">Account Recovery</span>
            <h2 className="mb-3">Reset your password</h2>
            <p className="mb-0 text-white-50">
              Enter your registered email and choose a new password to regain access quickly.
            </p>
          </div>

          <div className="col-lg-7 auth-form">
            <h3 className="mb-3">Forgot Password</h3>
            <p className="text-muted mb-4">
              Use the same email you registered with and set a new password with at least 6
              characters.
            </p>

            {message ? <div className="alert alert-success rounded-4">{message}</div> : null}
            {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  className="form-control"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New password</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Confirm password</label>
                <input
                  className="form-control"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <p className="text-muted mt-4 mb-0">
              Remembered it? <Link to="/login">Go back to login</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
