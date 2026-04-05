import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../utils/session";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const user = getStoredUser();

  const logout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <nav className="topbar">
      <div className="container-fluid d-flex justify-content-between align-items-center gap-3">
        <div>
          <Link className="brand-link" to={role === "admin" ? "/admin" : "/student"}>
            Campus Registration Hub
          </Link>
          <div className="small text-muted">
            Streamlined student onboarding, course enrollment, and reporting
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-semibold">{user?.name || "Authenticated user"}</div>
            <div className="small text-muted text-capitalize">{role || "guest"}</div>
          </div>
          <button className="btn btn-outline-dark btn-sm rounded-pill px-3" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
