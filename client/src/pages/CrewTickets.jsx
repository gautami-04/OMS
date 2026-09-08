import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Eye, RefreshCw } from "lucide-react";
import { ticketsApi, outagesApi, authApi } from "../services/api";

import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Modal, { ConfirmDialog } from "../components/Modal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function CrewTickets() {
  const [tickets, setTickets] = useState([]);
  const [outages, setOutages] = useState([]);
  const [fieldEngineers, setFieldEngineers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  const [formOutageId, setFormOutageId] = useState("");
  const [formEngineerId, setFormEngineerId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("Open");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View Details Modal state
  const [viewingTicket, setViewingTicket] = useState(null);

  const fetchCrewAndTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tkRes, oRes, uRes] = await Promise.allSettled([
        ticketsApi.getAll(),
        outagesApi.getAll(),
        authApi.getUsers(),
      ]);

      if (tkRes.status === "fulfilled") setTickets(tkRes.value || []);
      if (oRes.status === "fulfilled") setOutages(oRes.value || []);
      if (uRes.status === "fulfilled") {
        const users = uRes.value || [];
        const engineers = users.filter(
          (u) => u.role === "Field Engineer" || u.role === "Operator"
        );
        setFieldEngineers(engineers.length > 0 ? engineers : users);
      }
      setLoading(false);
    } catch (err) {
      console.error("Crew load error:", err);
      setError("Failed to synchronize crew & ticket operations");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCrewAndTickets();
  }, [fetchCrewAndTickets]);

  const handleOpenCreateForm = () => {
    setEditingTicket(null);
    setFormOutageId(outages[0]?._id || "");
    setFormEngineerId(fieldEngineers[0]?._id || "");
    setFormDescription("");
    setFormStatus("Open");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (ticket) => {
    setEditingTicket(ticket);
    setFormOutageId(ticket.outage?._id || ticket.outage || "");
    setFormEngineerId(ticket.fieldEngineer?._id || ticket.fieldEngineer || "");
    setFormDescription(ticket.description || "");
    setFormStatus(ticket.status || "Open");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!formOutageId || !formDescription) {
      setFormError("Outage and Description are required");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const payload = {
      outage: formOutageId,
      fieldEngineer: formEngineerId || undefined,
      description: formDescription,
      status: formStatus,
    };

    try {
      if (editingTicket) {
        await ticketsApi.update(editingTicket._id, payload);
      } else {
        await ticketsApi.create(payload);
      }
      setFormLoading(false);
      setIsFormOpen(false);
      fetchCrewAndTickets();
    } catch (err) {
      setFormError(err.message || "Failed to save ticket");
      setFormLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await ticketsApi.delete(deleteTarget._id);
      setDeleteLoading(false);
      setDeleteTarget(null);
      fetchCrewAndTickets();
    } catch (err) {
      alert("Failed to delete ticket: " + err.message);
      setDeleteLoading(false);
    }
  };

  const ticketColumns = [
    {
      header: "TICKET ID",
      key: "_id",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 600 }}>
          #{row._id ? row._id.slice(-6).toUpperCase() : "TK-01"}
        </span>
      ),
    },
    {
      header: "ASSOCIATED OUTAGE",
      key: "outage",
      render: (row) => (
        <div>
          <strong style={{ color: "var(--text-main)" }}>
            {row.outage?.title || "Outage Event"}
          </strong>
          {row.outage?.feeder?.name && (
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Feeder: {row.outage.feeder.name}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "ASSIGNED ENGINEER",
      key: "fieldEngineer",
      render: (row) => (
        <span>
          {row.fieldEngineer?.name
            ? `${row.fieldEngineer.name}`
            : "Unassigned"}
        </span>
      ),
    },
    {
      header: "WORK DESCRIPTION",
      key: "description",
      render: (row) => <span>{row.description}</span>,
    },
    {
      header: "STATUS",
      key: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "ACTIONS",
      key: "actions",
      style: { width: "120px", textAlign: "right" },
      render: (row) => (
        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
          <button
            className="icon-btn"
            title="View Ticket"
            onClick={() => setViewingTicket(row)}
            style={{ width: "26px", height: "26px" }}
          >
            <Eye size={13} />
          </button>
          <button
            className="icon-btn"
            title="Edit / Update Status"
            onClick={() => handleOpenEditForm(row)}
            style={{ width: "26px", height: "26px" }}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="icon-btn"
            title="Delete Ticket"
            onClick={() => setDeleteTarget(row)}
            style={{ width: "26px", height: "26px", color: "#DC2626" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading Field Engineers Roster & Tickets..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCrewAndTickets} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Crew Assignment & Field Operations</h1>
          <p>Manage field dispatch tickets and field engineer roster</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchCrewAndTickets}>
            <RefreshCw size={12} /> Refresh Roster
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreateForm}>
            <Plus size={14} /> Create Dispatch Ticket
          </button>
        </div>
      </div>

      {/* FIELD ENGINEERS ROSTER PANEL */}
      <div className="table-card" style={{ padding: "14px 18px" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>
          Field Engineers Roster ({fieldEngineers.length})
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          {fieldEngineers.map((eng) => {
            const assignedCount = tickets.filter(
              (t) => (t.fieldEngineer?._id || t.fieldEngineer) === eng._id && t.status !== "Closed"
            ).length;
            return (
              <div
                key={eng._id}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  background: "#FAFBF9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ fontSize: "13px" }}>{eng.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Role: {eng.role} • {eng.email}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <StatusBadge status={assignedCount > 0 ? "In Progress" : "Optimal"} label={assignedCount > 0 ? `${assignedCount} Active` : "Available"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TICKETS DATATABLE */}
      <DataTable
        columns={ticketColumns}
        data={tickets}
        searchKey="description"
        placeholder="Filter tickets..."
        emptyMessage="No dispatch tickets issued."
      />

      {/* CREATE / EDIT TICKET MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTicket ? "Update Ticket Status & Assignment" : "Issue New Field Dispatch Ticket"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={formLoading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveTicket} disabled={formLoading}>
              {formLoading ? "Saving..." : editingTicket ? "Update Ticket" : "Issue Ticket"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTicket}>
          {formError && (
            <div style={{ color: "#DC2626", fontSize: "12px", marginBottom: "10px", fontWeight: 600 }}>
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Associated Outage Event *</label>
            <select
              className="form-control"
              value={formOutageId}
              onChange={(e) => setFormOutageId(e.target.value)}
              required
            >
              <option value="">Select Outage Event</option>
              {outages.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.title} ({o.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Field Engineer</label>
            <select
              className="form-control"
              value={formEngineerId}
              onChange={(e) => setFormEngineerId(e.target.value)}
            >
              <option value="">Unassigned / Pool</option>
              {fieldEngineers.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ticket Status *</label>
            <select
              className="form-control"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Work Instructions / Description *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Detail required repair or inspection..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
            ></textarea>
          </div>
        </form>
      </Modal>

      {/* VIEW TICKET DETAILS */}
      {viewingTicket && (
        <Modal
          isOpen={!!viewingTicket}
          onClose={() => setViewingTicket(null)}
          title="Dispatch Ticket Card"
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingTicket(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div>
              <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                Outage Incident
              </strong>
              <div style={{ fontWeight: 700 }}>{viewingTicket.outage?.title || "Outage Event"}</div>
            </div>
            <div>
              <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                Assigned Engineer
              </strong>
              <div>{viewingTicket.fieldEngineer?.name || "Unassigned"}</div>
            </div>
            <div>
              <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                Status
              </strong>
              <div style={{ marginTop: "4px" }}>
                <StatusBadge status={viewingTicket.status} />
              </div>
            </div>
            <div>
              <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                Work Instructions
              </strong>
              <div style={{ background: "#F8FAF7", padding: "8px", borderRadius: "4px" }}>
                {viewingTicket.description}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTicket}
        title="Delete Ticket"
        message="Are you sure you want to remove this dispatch ticket?"
        loading={deleteLoading}
      />
    </div>
  );
}
