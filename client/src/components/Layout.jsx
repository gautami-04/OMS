import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  AlertTriangle,
  Database,
  Users,
  Activity,
  FileText,
  BarChart2,
  Shield,
  Search,
  Bell,
  LogOut,
  Plus,
  Zap,
} from "lucide-react";
import NewIncidentModal from "./NewIncidentModal";

export default function Layout({ user, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Grid Map", path: "/map", icon: MapPin },
    { name: "Outage Logs", path: "/outages", icon: AlertTriangle },
    { name: "Asset Registry", path: "/assets", icon: Database },
    { name: "Crew & Tickets", path: "/crew", icon: Users },
    { name: "Consumer Impact", path: "/consumer-impact", icon: Activity },
    { name: "Reports", path: "/reports", icon: FileText },
    { name: "Reliability", path: "/reliability", icon: BarChart2 },
  ];

  if (user?.role === "Administrator") {
    navItems.push({
      name: "User Management",
      path: "/users",
      icon: Shield,
    });
  }

  const handleGlobalSearchKeyDown = (e) => {
    if (e.key === "Enter" && globalSearch.trim()) {
      navigate(`/map?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-icon">
            <Zap size={18} fill="#fff" />
          </div>
          <div className="brand-text">
            <strong>GridControl OMS</strong>
            <small>Operations Center</small>
          </div>
        </div>

        <div className="sidebar-action">
          <button className="btn-new-incident" onClick={() => setIsIncidentModalOpen(true)}>
            <Plus size={15} /> + New Incident
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status-indicator">
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="status-dot"></span> Grid System: Normal
            </span>
            <span style={{ fontSize: "10px", color: "#6D746D" }}>v2.4</span>
          </div>

          <div className="user-profile-card">
            <div className="user-info">
              <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
              <div className="user-details">
                <strong>{user?.name || "Operator"}</strong>
                <small>{user?.role || "User"}</small>
              </div>
            </div>
            <button className="btn-logout-icon" title="Logout" onClick={handleLogout}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        <header className="topbar">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search assets, outages, feeders (press Enter)..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={handleGlobalSearchKeyDown}
            />
          </div>

          <div className="topbar-actions">
            <div className="grid-status-pill">
              <span className="status-dot" style={{ width: "6px", height: "6px" }}></span>
              System Status: Optimal
            </div>

            <button className="icon-btn" title="Notifications">
              <Bell size={16} />
            </button>

            <div className="topbar-user-badge">
              <span>Connected as</span>
              <strong>{user?.name}</strong> ({user?.role})
            </div>
          </div>
        </header>

        <div className="page-container">{children}</div>
      </main>

      {/* QUICK NEW INCIDENT MODAL */}
      <NewIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSuccess={() => {
          if (location.pathname === "/outages" || location.pathname === "/dashboard") {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}