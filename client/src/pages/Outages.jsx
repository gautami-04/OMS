import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Eye, RefreshCw, Check } from "lucide-react";
import { outagesApi, feedersApi, transformersApi } from "../services/api";

import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Modal, { ConfirmDialog } from "../components/Modal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Outages() {
  const [outages, setOutages] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [transformers, setTransformers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOutage, setEditingOutage] = useState(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFeeder, setFormFeeder] = useState("");
  const [formTransformer, setFormTransformer] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formStatus, setFormStatus] = useState("Scheduled");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Confirm Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Restore Confirm Dialog state
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // View Details Modal state
  const [viewingOutage, setViewingOutage] = useState(null);

  const fetchOutagesAndAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [oData, fData, tData] = await Promise.all([
        outagesApi.getAll(),
        feedersApi.getAll(),
        transformersApi.getAll(),
      ]);

      setOutages(oData || []);
      setFeeders(fData || []);
      setTransformers(tData || []);
      setLoading(false);
    } catch (err) {
      console.error("Outage load error:", err);
      setError("Failed to load outage records from server");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    fetchOutagesAndAssets();
  }, 0);

  return () => clearTimeout(timer);
}, [fetchOutagesAndAssets]);

  const handleOpenCreateForm = () => {
    setEditingOutage(null);
    setFormTitle("");
    setFormDescription("");
    setFormFeeder(feeders[0]?._id || "");
    setFormTransformer("");
    setFormStartTime(new Date().toISOString().slice(0, 16));
    setFormEndTime(
      new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16)
    );
    setFormStatus("Scheduled");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (outage) => {
    setEditingOutage(outage);
    setFormTitle(outage.title || "");
    setFormDescription(outage.description || "");
    setFormFeeder(outage.feeder?._id || outage.feeder || "");
    setFormTransformer(outage.transformer?._id || outage.transformer || "");

    setFormStartTime(
      outage.startTime
        ? new Date(outage.startTime).toISOString().slice(0, 16)
        : ""
    );

    setFormEndTime(
      outage.endTime
        ? new Date(outage.endTime).toISOString().slice(0, 16)
        : ""
    );

    setFormStatus(outage.status || "Scheduled");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSaveOutage = async (e) => {
    e.preventDefault();

    if (!formTitle || !formFeeder || !formStartTime || !formEndTime) {
      setFormError(
        "Title, Feeder, Start Time, and End Time are required"
      );
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const payload = {
      title: formTitle,
      description: formDescription,
      feeder: formFeeder,
      transformer: formTransformer || undefined,
      startTime: formStartTime,
      endTime: formEndTime,
      status: formStatus,
    };

    try {
      if (editingOutage) {
        await outagesApi.update(editingOutage._id, payload);
      } else {
        await outagesApi.create(payload);
      }

      setFormLoading(false);
      setIsFormOpen(false);
      fetchOutagesAndAssets();
    } catch (err) {
      setFormError(err.message || "Failed to save outage record");
      setFormLoading(false);
    }
  };

  const handleRestoreOutage = async () => {
    if (!restoreTarget) return;

    setRestoreLoading(true);

    try {
      await outagesApi.update(restoreTarget._id, {
        status: "Restored",
      });

      setRestoreLoading(false);
      setRestoreTarget(null);

      await fetchOutagesAndAssets();
    } catch (err) {
      alert("Failed to restore outage: " + err.message);
      setRestoreLoading(false);
    }
  };

  const handleDeleteOutage = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);

    try {
      await outagesApi.delete(deleteTarget._id);

      setDeleteLoading(false);
      setDeleteTarget(null);

      fetchOutagesAndAssets();
    } catch (err) {
      alert("Failed to delete outage: " + err.message);
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: "OUTAGE TITLE",
      key: "title",
      render: (row) => (
        <div>
          <strong
            style={{
              color: "var(--text-main)",
              fontSize: "13px",
            }}
          >
            {row.title}
          </strong>

          {row.description && (
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {row.description}
            </div>
          )}
        </div>
      ),
    },

    {
      header: "FEEDER",
      key: "feeder",
      render: (row) => (
        <span style={{ fontWeight: 500 }}>
          {row.feeder?.name
            ? `${row.feeder.name} (${row.feeder.code || ""})`
            : "—"}
        </span>
      ),
    },

    {
      header: "TRANSFORMER",
      key: "transformer",
      render: (row) => (
        <span>
          {row.transformer?.name
            ? `${row.transformer.name} (${row.transformer.code || ""})`
            : "All Feeder"}
        </span>
      ),
    },

    {
      header: "START TIME",
      key: "startTime",
      render: (row) =>
        row.startTime
          ? new Date(row.startTime).toLocaleString()
          : "—",
    },

    {
      header: "EST. END TIME",
      key: "endTime",
      render: (row) =>
        row.endTime
          ? new Date(row.endTime).toLocaleString()
          : "—",
    },

    {
      header: "STATUS",
      key: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },

    {
      header: "ACTIONS",
      key: "actions",
      style: {
        width: "150px",
        textAlign: "right",
      },

      render: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "6px",
          }}
        >
          {/* View */}
          <button
            className="icon-btn"
            title="View Details"
            onClick={() => setViewingOutage(row)}
            style={{
              width: "26px",
              height: "26px",
            }}
          >
            <Eye size={13} />
          </button>

          {/* Edit */}
          <button
            className="icon-btn"
            title="Edit Outage"
            onClick={() => handleOpenEditForm(row)}
            style={{
              width: "26px",
              height: "26px",
            }}
          >
            <Edit2 size={13} />
          </button>

          {/* Restore / Close */}
          {row.status !== "Restored" && (
            <button
              className="icon-btn"
              title="Restore / Close Outage"
              onClick={() => setRestoreTarget(row)}
              style={{
                width: "26px",
                height: "26px",
                color: "#16A34A",
              }}
            >
              <Check size={13} />
            </button>
          )}

          {/* Delete */}
          <button
            className="icon-btn"
            title="Delete Outage"
            onClick={() => setDeleteTarget(row)}
            style={{
              width: "26px",
              height: "26px",
              color: "#DC2626",
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <LoadingState message="Loading Outage Management Records..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchOutagesAndAssets}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Outage Management Hub</h1>
          <p>
            Schedule, monitor, and update planned and active grid outages
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchOutagesAndAssets}
          >
            <RefreshCw size={12} /> Refresh List
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateForm}
          >
            <Plus size={14} /> Schedule New Outage
          </button>
        </div>
      </div>

      {/* OUTAGES DATATABLE */}
      <DataTable
        columns={columns}
        data={outages}
        searchKey="title"
        placeholder="Filter outages by title..."
        emptyMessage="No planned or active outages recorded."
      />

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          editingOutage
            ? "Edit Outage Record"
            : "Schedule New Outage"
        }
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSaveOutage}
              disabled={formLoading}
            >
              {formLoading
                ? "Saving..."
                : editingOutage
                ? "Update Outage"
                : "Create Outage"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveOutage}>
          {formError && (
            <div
              style={{
                color: "#DC2626",
                fontSize: "12px",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              {formError}
            </div>
          )}

          <div className="form-group">
            <label>Outage Title *</label>

            <input
              type="text"
              className="form-control"
              placeholder="e.g. Substation Transformer Overhaul"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Feeder *</label>

            <select
              className="form-control"
              value={formFeeder}
              onChange={(e) => setFormFeeder(e.target.value)}
              required
            >
              <option value="">Select Feeder</option>

              {feeders.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Transformer (Optional)</label>

            <select
              className="form-control"
              value={formTransformer}
              onChange={(e) => setFormTransformer(e.target.value)}
            >
              <option value="">Entire Feeder Scope</option>

              {transformers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div className="form-group">
              <label>Start Time *</label>

              <input
                type="datetime-local"
                className="form-control"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>

              <input
                type="datetime-local"
                className="form-control"
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Outage Status *</label>

            <select
              className="form-control"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              disabled={editingOutage?.status === "Restored"}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Restored">Restored</option>
            </select>

            {editingOutage?.status === "Restored" && (
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "5px",
                }}
              >
                Restored outages cannot be reopened.
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description / Reason</label>

            <textarea
              className="form-control"
              rows="3"
              placeholder="Provide context or outage details..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      {viewingOutage && (
        <Modal
          isOpen={!!viewingOutage}
          onClose={() => setViewingOutage(null)}
          title="Outage Technical Details"
          footer={
            <button
              className="btn btn-secondary"
              onClick={() => setViewingOutage(null)}
            >
              Close
            </button>
          }
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <div>
              <strong
                style={{
                  color: "#6D746D",
                  fontSize: "11px",
                  textTransform: "uppercase",
                }}
              >
                Title
              </strong>

              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                {viewingOutage.title}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <strong
                  style={{
                    color: "#6D746D",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Feeder
                </strong>

                <div>
                  {viewingOutage.feeder?.name || "N/A"}
                </div>
              </div>

              <div>
                <strong
                  style={{
                    color: "#6D746D",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Transformer
                </strong>

                <div>
                  {viewingOutage.transformer?.name ||
                    "Entire Feeder"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <div>
                <strong
                  style={{
                    color: "#6D746D",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Start Time
                </strong>

                <div>
                  {new Date(
                    viewingOutage.startTime
                  ).toLocaleString()}
                </div>
              </div>

              <div>
                <strong
                  style={{
                    color: "#6D746D",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Est. End Time
                </strong>

                <div>
                  {new Date(
                    viewingOutage.endTime
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <strong
                style={{
                  color: "#6D746D",
                  fontSize: "11px",
                  textTransform: "uppercase",
                }}
              >
                Status
              </strong>

              <div style={{ marginTop: "4px" }}>
                <StatusBadge status={viewingOutage.status} />
              </div>
            </div>

            {viewingOutage.description && (
              <div>
                <strong
                  style={{
                    color: "#6D746D",
                    fontSize: "11px",
                    textTransform: "uppercase",
                  }}
                >
                  Notes / Description
                </strong>

                <div
                  style={{
                    background: "#F8FAF7",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  {viewingOutage.description}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* RESTORE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestoreOutage}
        title="Restore Outage"
        message={`Are you sure you want to mark "${restoreTarget?.title}" as restored? The outage record will remain in the system for historical records.`}
        loading={restoreLoading}
      />

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOutage}
        title="Delete Outage Record"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}