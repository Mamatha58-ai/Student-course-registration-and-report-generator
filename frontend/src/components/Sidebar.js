import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const role = localStorage.getItem("role");
  const getLinkClass = ({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link");

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-title">Workspace</div>
      <div className="sidebar-subtitle">Navigate the portal</div>

      <div className="nav flex-column gap-2 mt-4">
        {role === "admin" && (
          <>
            <NavLink className={getLinkClass} to="/admin">
              Registration Report
            </NavLink>
            <NavLink className={getLinkClass} to="/manage-courses">
              Manage Courses
            </NavLink>
          </>
        )}

        {role === "student" && (
          <>
            <NavLink className={getLinkClass} to="/student">
              Overview
            </NavLink>
            <NavLink className={getLinkClass} to="/courses">
              Available Courses
            </NavLink>
            <NavLink className={getLinkClass} to="/my-courses">
              My Courses
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
