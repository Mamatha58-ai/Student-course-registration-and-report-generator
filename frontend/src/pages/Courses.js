import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [registeredCourseIds, setRegisteredCourseIds] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const studentId = localStorage.getItem("userId");

  const fetchCourses = async () => {
    const res = await api.get("/courses");
    setCourses(res.data);
  };

  const fetchRegistrations = async () => {
    if (!studentId) {
      return;
    }

    const res = await api.get(`/registrations/my/${studentId}`);
    setRegisteredCourseIds(res.data.map((registration) => registration.courseId._id));
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        await Promise.all([fetchCourses(), fetchRegistrations()]);
      } catch (loadError) {
        setError("Unable to load courses right now.");
      }
    };

    loadPage();
  }, [studentId]);

  const registerCourse = async (courseId) => {
    setMessage("");
    setError("");

    try {
      await api.post("/registrations/register", { courseId });
      setMessage("Course registered successfully.");
      await fetchRegistrations();
    } catch (registerError) {
      setError(registerError.response?.data?.message || "Unable to register for this course.");
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
              <h2 className="page-title">Available Courses</h2>
              <p className="page-copy">
                Review the current catalog and register while keeping your student record linked
                to each enrollment.
              </p>
            </div>
          </div>

          {message ? <div className="alert alert-success rounded-4">{message}</div> : null}
          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

          <div className="row g-4">
            {courses.map((course) => {
              const isRegistered = registeredCourseIds.includes(course._id);

              return (
                <div className="col-md-6 col-xl-4" key={course._id}>
                  <div className="course-card">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">{course.courseName}</h5>
                        <div className="course-meta">{course.courseCode}</div>
                      </div>
                      <span className={`status-pill ${isRegistered ? "success" : "warning"}`}>
                        {isRegistered ? "Registered" : "Open"}
                      </span>
                    </div>

                    <p className="course-meta">Credits: {course.credits}</p>
                    <p className="course-meta">Instructor: {course.instructor}</p>

                    <button
                      className="btn btn-success w-100 mt-3"
                      onClick={() => registerCourse(course._id)}
                      disabled={isRegistered}
                    >
                      {isRegistered ? "Already Registered" : "Register Course"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
