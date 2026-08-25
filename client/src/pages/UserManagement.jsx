import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Lock } from "lucide-react";
import { authApi } from "../services/api";

import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function UserManagement({ user: currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.getUsers();
      setUsers(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load user registry from database");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (currentUser?.role !== "Administrator") {
    return (
      <div className="table-card" style={{ padding: "40px", textAlign: "center" }}>
        <Lock size={32} style={{ color: "#DC2626", marginBottom: "10px" }} />
        <h2 style={{ margin: 0, fontSize: "16px" }}>Access Restricted</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>
          User Management is restricted strictly to System Administrators.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "All") return true;
    return u.role === roleFilter;
  });

  const columns = [
    {
      header: "USER NAME",
      key: "name",
      render: (row) => (
        <div>
          <strong style={{ color: "var(--text-main)" }}>{row.name}</strong>
        </div>
      ),
    },
    { header: "EMAIL ADDRESS", key: "email" },
    {
      header: "ROLE",
      key: "role",
      render: (row) => (
        <span
          className="status-badge"
          style={{
            background:
              row.role === "Administrator"
                ? "#FEE2E2"
                : row.role === "Operator"
                ? "#EEF3E3"
                : "#E0F2FE",
            color:
              row.role === "Administrator"
                ? "#991B1B"
                : row.role === "Operator"
                ? "#3A5400"
                : "#0369A1",
          }}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: "ACCOUNT STATUS",
      key: "status",
      render: () => <StatusBadge status="Optimal" label="Active" />,
    },
    {
      header: "CREATED DATE",
      key: "createdAt",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"),
    },
  ];

  if (loading) return <LoadingState message="Loading System Users Roster..." />;
  if (error) return <ErrorState message={error} onRetry={fetchUsers} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>User Management & Access Control</h1>
          <p>System Administrator user accounts and role assignments</p>
        </div>

        <div className="header-actions">
          <select
            className="form-control"
            style={{ width: "160px", padding: "5px 8px" }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Operator">Operator</option>
            <option value="Field Engineer">Field Engineer</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>
            <RefreshCw size={12} /> Refresh Users
          </button>
        </div>
      </div>

      {/* USERS DATATABLE */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        searchKey="name"
        placeholder="Filter users by name..."
        emptyMessage="No matching user accounts found."
      />
    </div>
  );
}
