import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentNumber: "",
    department: "",
    semester: "",
    academicYear: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const payload =
        formData.role === "student"
          ? formData
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
              role: formData.role
            };

      const response = await api.post("/users/register", payload);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (registerError) {
      setError(registerError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="container">
        <div className="auth-card row g-0 mx-auto">
          <div className="col-lg-5 auth-aside d-flex flex-column justify-content-center">
            <span className="eyebrow mb-3">New Profile</span>
            <h2 className="mb-3">Create a professional record</h2>
            <p className="mb-0 text-white-50">
              Student accounts now capture academic and contact details so reports can be generated
              directly from the database.
            </p>
          </div>

          <div className="col-lg-7 auth-form">
            <h3 className="mb-3">Register</h3>
            <p className="text-muted mb-4">
              Fill in the profile information below. Student accounts require the extra academic
              details shown here.
            </p>

            {message ? <div className="alert alert-success rounded-4">{message}</div> : null}
            {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-control"
                    name="name"
                    placeholder="Aarav Gupta"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    name="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Password</label>
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

                {formData.role === "student" ? (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        name="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Student number</label>
                      <input
                        className="form-control"
                        name="studentNumber"
                        placeholder="STU2026001"
                        value={formData.studentNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input
                        className="form-control"
                        name="department"
                        placeholder="Computer Science"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Semester</label>
                      <input
                        className="form-control"
                        name="semester"
                        placeholder="6"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Academic year</label>
                      <input
                        className="form-control"
                        name="academicYear"
                        placeholder="2026-2027"
                        value={formData.academicYear}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <button className="btn btn-success w-100 mt-4" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <p className="text-muted mt-4 mb-0">
              Already registered? <Link to="/login">Login here</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
