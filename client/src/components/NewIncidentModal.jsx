import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { feedersApi, transformersApi, outagesApi } from "../services/api";

export default function NewIncidentModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [feederId, setFeederId] = useState("");
  const [transformerId, setTransformerId] = useState("");
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [status, setStatus] = useState("Scheduled");

  const [feeders, setFeeders] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [fData, tData] = await Promise.all([feedersApi.getAll(), transformersApi.getAll()]);
      setFeeders(fData);
      setTransformers(tData);
      if (fData.length > 0) setFeederId(fData[0]._id);
    } catch (err) {
      console.error("Failed to load feeders/transformers", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !feederId) {
      setError("Title and Feeder are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await outagesApi.create({
        title,
        description,
        feeder: feederId,
        transformer: transformerId || undefined,
        startTime,
        endTime,
        status,
      });
      setLoading(false);
      setTitle("");
      setDescription("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create outage incident");
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report New Incident / Outage"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Incident"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: "#DC2626", fontSize: "12px", marginBottom: "10px", fontWeight: 600 }}>
            {error}
          </div>
        )}
        <div className="form-group">
          <label>Incident Title *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Feeder Tripping at Sub-01"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Affected Feeder *</label>
          <select
            className="form-control"
            value={feederId}
            onChange={(e) => setFeederId(e.target.value)}
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
          <label>Affected Transformer (Optional)</label>
          <select
            className="form-control"
            value={transformerId}
            onChange={(e) => setTransformerId(e.target.value)}
          >
            <option value="">None / Entire Feeder</option>
            {transformers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div className="form-group">
            <label>Start Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Est. End Time *</label>
            <input
              type="datetime-local"
              className="form-control"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Status *</label>
          <select
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Restored">Restored</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description / Root Cause</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Operational notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
      </form>
    </Modal>
  );
}
