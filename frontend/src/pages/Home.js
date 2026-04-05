import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="hero-shell">
      <div className="container">
        <div className="hero-card row g-0">
          <div className="col-lg-7 hero-banner">
            <span className="eyebrow mb-3">Academic Operations</span>
            <h1 className="display-5 mb-3">Student Course Registration System</h1>
            <p className="lead mb-4">
              A cleaner campus workflow for storing student details, managing courses, and
              generating registration reports from the database.
            </p>

            <div className="row g-3">
              <div className="col-sm-6">
                <div className="info-tile bg-transparent border border-light-subtle text-white">
                  <div className="info-label text-white-50">Student Records</div>
                  <div className="info-value">Department, semester, academic year, and phone</div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="info-tile bg-transparent border border-light-subtle text-white">
                  <div className="info-label text-white-50">Admin Reports</div>
                  <div className="info-value">CSV downloads with complete registration details</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 hero-side d-flex flex-column justify-content-center">
            <h3 className="mb-3">Get started</h3>
            <p className="text-muted mb-4">
              Choose your portal entry point and move directly into enrollment or administration.
            </p>

            <div className="d-grid gap-3">
              <Link to="/login?role=admin" className="btn btn-primary btn-lg">
                Login as Admin
              </Link>
              <Link to="/login?role=student" className="btn btn-success btn-lg">
                Login as Student
              </Link>
              <Link to="/register" className="btn btn-outline-dark btn-lg">
                Create Account
              </Link>
            </div>

            <p className="text-muted mt-4 mb-0">
              Both admins and students can be created here, and student records are now captured
              with richer academic details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
