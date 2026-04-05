import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    credits: "",
    instructor: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    const res = await api.get("/courses");
    setCourses(res.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const addCourse = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/courses/add", {
        ...formData,
        credits: Number(formData.credits)
      });

      setMessage("Course added successfully.");
      setFormData({
        courseName: "",
        courseCode: "",
        credits: "",
        instructor: ""
      });
      fetchCourses();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Unable to add course.");
    }
  };

  const deleteCourse = async (id) => {
    setMessage("");
    setError("");

    try {
      await api.delete(`/courses/${id}`);
      setMessage("Course deleted successfully.");
      fetchCourses();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete course.");
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
              <h2 className="page-title">Manage Courses</h2>
              <p className="page-copy">
                Maintain a cleaner catalog with unique course codes and structured course details.
              </p>
            </div>
          </div>

          {message ? <div className="alert alert-success rounded-4">{message}</div> : null}
          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

          <div className="panel-card mb-4">
            <form className="row g-3" onSubmit={addCourse}>
              <div className="col-md-3">
                <label className="form-label">Course name</label>
                <input
                  className="form-control"
                  name="courseName"
                  placeholder="Business Analytics"
                  value={formData.courseName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Course code</label>
                <input
                  className="form-control"
                  name="courseCode"
                  placeholder="CSE401"
                  value={formData.courseCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Credits</label>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  name="credits"
                  placeholder="3"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Instructor</label>
                <input
                  className="form-control"
                  name="instructor"
                  placeholder="Dr. Sharma"
                  value={formData.instructor}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-primary w-100">Add Course</button>
              </div>
            </form>
          </div>

          <div className="table-card">
            <div className="page-heading mb-3">
              <div>
                <h3 className="page-title">Current Catalog</h3>
                <p className="page-copy mb-0">
                  Courses are sorted by code so the catalog stays easy to manage.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Credits</th>
                    <th>Instructor</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.courseName}</td>
                      <td>{course.courseCode}</td>
                      <td>{course.credits}</td>
                      <td>{course.instructor}</td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteCourse(course._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageCourses;
