import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const studentId = localStorage.getItem("userId");

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

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/registrations/my/${studentId}`);
      setCourses(res.data);
    } catch (loadError) {
      setError("Unable to load your registered courses.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [studentId]);

  const dropCourse = async (id) => {
    setMessage("");
    setError("");

    try {
      await api.delete(`/registrations/drop/${id}`);
      setMessage("Course dropped successfully.");
      fetchCourses();
    } catch (dropError) {
      setError(dropError.response?.data?.message || "Unable to drop the course.");
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
              <h2 className="page-title">My Courses</h2>
              <p className="page-copy">
                Review your current registrations, including course details and registration date.
              </p>
            </div>
          </div>

          {message ? <div className="alert alert-success rounded-4">{message}</div> : null}
          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

          <div className="table-card">
            {courses.length === 0 ? (
              <div className="empty-state">
                You have not registered for any courses yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Credits</th>
                      <th>Instructor</th>
                      <th>Registered On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((reg) => (
                      <tr key={reg._id}>
                        <td>{reg.courseId.courseName}</td>
                        <td>{reg.courseId.courseCode}</td>
                        <td>{reg.courseId.credits}</td>
                        <td>{reg.courseId.instructor}</td>
                        <td>{formatRegistrationDate(reg)}</td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => dropCourse(reg._id)}
                          >
                            Drop
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

export default MyCourses;
