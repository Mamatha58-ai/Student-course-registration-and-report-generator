import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRegistrations: 0
  });
  const [reportRows, setReportRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const nextRows = reportRows.filter((row) => {
      const matchesCourse =
        !courseFilter ||
        row.courseName.toLowerCase().includes(courseFilter.toLowerCase()) ||
        row.courseCode.toLowerCase().includes(courseFilter.toLowerCase());

      const matchesStudent =
        !studentFilter ||
        row.studentName.toLowerCase().includes(studentFilter.toLowerCase()) ||
        row.studentEmail.toLowerCase().includes(studentFilter.toLowerCase()) ||
        row.studentNumber.toLowerCase().includes(studentFilter.toLowerCase());

      return matchesCourse && matchesStudent;
    });

    setFilteredRows(nextRows);
  }, [courseFilter, studentFilter, reportRows]);

  const fetchReport = async () => {
    try {
      setError("");
      const response = await api.get("/registrations/report");
      setSummary(response.data.summary);
      setReportRows(response.data.rows);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load the report.");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await api.get("/registrations/report/download", {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "student-registration-report.csv";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError("Report download failed. Please try again.");
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    const confirmed = window.confirm("Delete this student registration?");
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setDeletingId(registrationId);
      await api.delete(`/registrations/drop/${registrationId}`);
      await fetchReport();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Failed to delete registration.");
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div className="dashboard-shell">
          <Sidebar />
          <div className="content-shell">
            <div className="panel-card">
              <h2 className="page-title">Preparing report</h2>
              <p className="page-copy mb-0">Loading student registrations and report metrics.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <div className="dashboard-shell">
        <Sidebar />

        <div className="content-shell">
          <div className="page-heading">
            <div>
              <h2 className="page-title">Registration Report</h2>
              <p className="page-copy">
                Generate a cleaner administrative report with complete student details stored in
                the database and course registrations tracked by date.
              </p>
            </div>
            <button className="btn btn-primary" onClick={exportToCSV}>
              Download CSV Report
            </button>
          </div>

          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-label">Tracked Courses</div>
                <div className="stat-value">{summary.totalCourses}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-label">Registered Students</div>
                <div className="stat-value">{summary.totalStudents}</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card">
                <div className="stat-label">Total Registrations</div>
                <div className="stat-value">{summary.totalRegistrations}</div>
              </div>
            </div>
          </div>

          <div className="table-card">
            <div className="page-heading mb-3">
              <div>
                <h3 className="page-title">Student Registration Details</h3>
                <p className="page-copy mb-0">
                  Search by course, student name, email, or student number.
                </p>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by course name or code"
                  value={courseFilter}
                  onChange={(event) => setCourseFilter(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by student name, email, or number"
                  value={studentFilter}
                  onChange={(event) => setStudentFilter(event.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button className="btn btn-outline-dark w-100" onClick={fetchReport}>
                  Refresh Report
                </button>
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div className="empty-state">No registrations match the current filters yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student Number</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Course</th>
                      <th>Instructor</th>
                      <th>Registered</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <div className="fw-semibold">{row.studentName}</div>
                          <div className="text-muted small">{row.studentEmail}</div>
                          <div className="text-muted small">{row.phone || "No phone"}</div>
                        </td>
                        <td>{row.studentNumber || "N/A"}</td>
                        <td>
                          <div>{row.department || "N/A"}</div>
                          <div className="text-muted small">{row.academicYear || "Academic year N/A"}</div>
                        </td>
                        <td>{row.semester || "N/A"}</td>
                        <td>
                          <div className="fw-semibold">{row.courseName}</div>
                          <div className="text-muted small">{row.courseCode}</div>
                        </td>
                        <td>{row.instructor}</td>
                        <td>{new Date(row.registeredAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteRegistration(row.id)}
                            disabled={deletingId === row.id}
                          >
                            {deletingId === row.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
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

export default AdminDashboard;
