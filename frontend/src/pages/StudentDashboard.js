import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import { getStoredUser, updateStoredUser } from "../utils/session";

function StudentDashboard() {
  const [profile, setProfile] = useState(getStoredUser());
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    studentNumber: "",
    department: "",
    semester: "",
    academicYear: "",
    phone: ""
  });
  const userId = localStorage.getItem("userId");

  const formatRegistrationDate = (registration) => {
    const fallbackDate = registration?.createdAt || registration?.registeredAt;

    if (fallbackDate && !Number.isNaN(new Date(fallbackDate).getTime())) {
      return new Date(fallbackDate).toLocaleDateString();
    }

    if (registration?._id) {
      return new Date(parseInt(registration._id.substring(0, 8), 16) * 1000).toLocaleDateString();
    }

    return "N/A";
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileResponse, registrationsResponse] = await Promise.all([
          api.get(`/users/profile/${userId}`),
          api.get(`/registrations/my/${userId}`)
        ]);

        setProfile(profileResponse.data);
        setRegistrations(registrationsResponse.data);
        updateStoredUser(profileResponse.data);
        setFormData({
          name: profileResponse.data?.name || "",
          studentNumber: profileResponse.data?.studentProfile?.studentNumber || "",
          department: profileResponse.data?.studentProfile?.department || "",
          semester: profileResponse.data?.studentProfile?.semester || "",
          academicYear: profileResponse.data?.studentProfile?.academicYear || "",
          phone: profileResponse.data?.studentProfile?.phone || ""
        });
      } catch (dashboardError) {
        setError("Unable to load the student dashboard.");
      }
    };

    if (userId) {
      loadDashboard();
    }
  }, [userId]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await api.put(`/users/profile/${userId}`, formData);
      setProfile(response.data.user);
      updateStoredUser(response.data.user);
      setMessage(response.data.message);
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to update the student profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <div className="dashboard-shell">
        <Sidebar />

        <div className="content-shell">
          <div className="page-heading">
            <div>
              <h2 className="page-title">Student Overview</h2>
              <p className="page-copy">
                Your profile is now stored with academic details so course registrations and
                reports stay complete.
              </p>
            </div>
          </div>

          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-label">Registered Courses</div>
                <div className="stat-value">{registrations.length}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-label">Department</div>
                <div className="stat-value fs-3">{profile?.studentProfile?.department || "N/A"}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-label">Semester</div>
                <div className="stat-value">{profile?.studentProfile?.semester || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="panel-card mb-4">
            <div className="page-heading mb-3">
              <div>
                <h3 className="page-title">Student Profile</h3>
                <p className="page-copy mb-0">Details used in registration reports and records.</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-tile">
                <div className="info-label">Name</div>
                <div className="info-value">{profile?.name || "N/A"}</div>
              </div>
              <div className="info-tile">
                <div className="info-label">Email</div>
                <div className="info-value">{profile?.email || "N/A"}</div>
              </div>
              <div className="info-tile">
                <div className="info-label">Student Number</div>
                <div className="info-value">{profile?.studentProfile?.studentNumber || "N/A"}</div>
              </div>
              <div className="info-tile">
                <div className="info-label">Academic Year</div>
                <div className="info-value">{profile?.studentProfile?.academicYear || "N/A"}</div>
              </div>
              <div className="info-tile">
                <div className="info-label">Phone</div>
                <div className="info-value">{profile?.studentProfile?.phone || "N/A"}</div>
              </div>
            </div>
          </div>

          <div className="panel-card mb-4">
            <div className="page-heading mb-3">
              <div>
                <h3 className="page-title">Update Student Details</h3>
                <p className="page-copy mb-0">
                  Complete any missing fields so the admin registration report stays accurate.
                </p>
              </div>
            </div>

            {message ? <div className="alert alert-success rounded-4">{message}</div> : null}

            <form onSubmit={handleProfileSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Student number</label>
                  <input
                    className="form-control"
                    name="studentNumber"
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
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button className="btn btn-primary mt-4" disabled={saving}>
                {saving ? "Saving..." : "Save Details"}
              </button>
            </form>
          </div>

          <div className="table-card">
            <div className="page-heading mb-3">
              <div>
                <h3 className="page-title">Recent Registrations</h3>
                <p className="page-copy mb-0">
                  A quick look at the courses linked to your student record.
                </p>
              </div>
            </div>

            {registrations.length === 0 ? (
              <div className="empty-state">
                No course registrations found yet. Use the Available Courses page to enroll.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Code</th>
                      <th>Instructor</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.slice(0, 5).map((registration) => (
                      <tr key={registration._id}>
                        <td>{registration.courseId.courseName}</td>
                        <td>{registration.courseId.courseCode}</td>
                        <td>{registration.courseId.instructor}</td>
                        <td>{formatRegistrationDate(registration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
