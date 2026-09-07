import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Eye, RefreshCw, Plus, Edit2, Trash2 } from "lucide-react";
import {
  substationsApi,
  feedersApi,
  transformersApi,
  consumersApi,
  smartMetersApi,
} from "../services/api";

import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Modal, { ConfirmDialog } from "../components/Modal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Assets() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("substations");

  const [substations, setSubstations] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [smartMeters, setSmartMeters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Asset detail modal
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Smart meter form modal state
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [meterNumber, setMeterNumber] = useState("");
  const [meterConsumer, setMeterConsumer] = useState("");
  const [meterStatus, setMeterStatus] = useState("Online");
  const [meterVoltage, setMeterVoltage] = useState("230");
  const [meterCurrent, setMeterCurrent] = useState("10");
  const [meterPower, setMeterPower] = useState("2.3");
  const [meterLastReading, setMeterLastReading] = useState("");
  const [meterFormLoading, setMeterFormLoading] = useState(false);
  const [meterFormError, setMeterFormError] = useState(null);

  // Delete smart meter confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAllAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sData, fData, tData, cData, mData] = await Promise.all([
        substationsApi.getAll(),
        feedersApi.getAll(),
        transformersApi.getAll(),
        consumersApi.getAll(),
        smartMetersApi.getAll(),
      ]);
      setSubstations(sData || []);
      setFeeders(fData || []);
      setTransformers(tData || []);
      setConsumers(cData || []);
      setSmartMeters(mData || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch assets error:", err);
      setError("Failed to load asset registry from backend database");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllAssets();
  }, [fetchAllAssets]);

  const handleFocusOnMap = (name) => {
    navigate(`/map?q=${encodeURIComponent(name)}`);
  };

  const handleOpenCreateMeter = () => {
    setEditingMeter(null);
    setMeterNumber("");
    setMeterConsumer(consumers[0]?._id || "");
    setMeterStatus("Online");
    setMeterVoltage("230");
    setMeterCurrent("10");
    setMeterPower("2.3");
    setMeterLastReading(new Date().toISOString().slice(0, 16));
    setMeterFormError(null);
    setIsMeterModalOpen(true);
  };

  const handleOpenEditMeter = (meter) => {
    setEditingMeter(meter);
    setMeterNumber(meter.meterNumber || "");
    setMeterConsumer(meter.consumer?._id || meter.consumer || "");
    setMeterStatus(meter.status || "Online");
    setMeterVoltage(meter.voltage != null ? String(meter.voltage) : "230");
    setMeterCurrent(meter.current != null ? String(meter.current) : "0");
    setMeterPower(meter.power != null ? String(meter.power) : "0");
    setMeterLastReading(
      meter.lastReading ? new Date(meter.lastReading).toISOString().slice(0, 16) : ""
    );
    setMeterFormError(null);
    setIsMeterModalOpen(true);
  };

  const handleSaveMeter = async (e) => {
    e.preventDefault();
    if (!meterNumber.trim() || !meterConsumer) {
      setMeterFormError("Meter Number and Consumer selection are required.");
      return;
    }

    setMeterFormLoading(true);
    setMeterFormError(null);

    const payload = {
      meterNumber: meterNumber.trim(),
      consumer: meterConsumer,
      status: meterStatus,
      voltage: Number(meterVoltage) || 0,
      current: Number(meterCurrent) || 0,
      power: Number(meterPower) || 0,
      lastReading: meterLastReading ? new Date(meterLastReading) : new Date(),
    };

    try {
      if (editingMeter) {
        await smartMetersApi.update(editingMeter._id, payload);
      } else {
        await smartMetersApi.create(payload);
      }
      setMeterFormLoading(false);
      setIsMeterModalOpen(false);
      fetchAllAssets();
    } catch (err) {
      setMeterFormError(err.message || "Failed to save smart meter");
      setMeterFormLoading(false);
    }
  };

  const handleDeleteMeter = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await smartMetersApi.delete(deleteTarget._id);
      setDeleteLoading(false);
      setDeleteTarget(null);
      fetchAllAssets();
    } catch (err) {
      alert("Failed to delete smart meter: " + err.message);
      setDeleteLoading(false);
    }
  };

  const getColumns = () => {
    if (activeTab === "substations") {
      return [
        {
          header: "SUBSTATION NAME",
          key: "name",
          render: (row) => (
            <div>
              <strong style={{ color: "var(--text-main)" }}>{row.name}</strong>
            </div>
          ),
        },
        { header: "CODE", key: "code" },
        {
          header: "COORDINATES",
          key: "location",
          render: (row) =>
            row.location ? `${row.location.latitude}, ${row.location.longitude}` : "—",
        },
        {
          header: "STATUS",
          key: "status",
          render: () => <StatusBadge status="Optimal" label="Connected" />,
        },
        {
          header: "ACTIONS",
          key: "actions",
          style: { width: "100px", textAlign: "right" },
          render: (row) => (
            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
              <button
                className="icon-btn"
                title="Focus on GIS Map"
                onClick={() => handleFocusOnMap(row.name)}
                style={{ width: "26px", height: "26px" }}
              >
                <MapPin size={13} />
              </button>
              <button
                className="icon-btn"
                title="View Details"
                onClick={() => setSelectedAsset({ ...row, assetType: "Substation" })}
                style={{ width: "26px", height: "26px" }}
              >
                <Eye size={13} />
              </button>
            </div>
          ),
        },
      ];
    }

    if (activeTab === "feeders") {
      return [
        {
          header: "FEEDER NAME",
          key: "name",
          render: (row) => <strong>{row.name}</strong>,
        },
        { header: "FEEDER CODE", key: "code" },
        {
          header: "CONNECTED SUBSTATION",
          key: "substation",
          render: (row) => {
            const sub = typeof row.substation === "object" ? row.substation : substations.find((s) => s._id === row.substation);
            return sub ? `${sub.name} (${sub.code})` : "Standard Grid";
          },
        },
        {
          header: "STATUS",
          key: "status",
          render: () => <StatusBadge status="Optimal" label="Active Line" />,
        },
        {
          header: "ACTIONS",
          key: "actions",
          style: { width: "100px", textAlign: "right" },
          render: (row) => (
            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
              <button
                className="icon-btn"
                title="Focus on GIS Map"
                onClick={() => handleFocusOnMap(row.name)}
                style={{ width: "26px", height: "26px" }}
              >
                <MapPin size={13} />
              </button>
              <button
                className="icon-btn"
                title="View Details"
                onClick={() => setSelectedAsset({ ...row, assetType: "Feeder" })}
                style={{ width: "26px", height: "26px" }}
              >
                <Eye size={13} />
              </button>
            </div>
          ),
        },
      ];
    }

    if (activeTab === "transformers") {
      return [
        {
          header: "TRANSFORMER NAME",
          key: "name",
          render: (row) => <strong>{row.name}</strong>,
        },
        { header: "ASSET CODE", key: "code" },
        {
          header: "FEEDER",
          key: "feeder",
          render: (row) => {
            const feeder = typeof row.feeder === "object" ? row.feeder : feeders.find((f) => f._id === row.feeder);
            return feeder ? feeder.name : "Connected Feeder";
          },
        },
        {
          header: "LOCATION",
          key: "location",
          render: (row) =>
            row.location ? `${row.location.latitude}, ${row.location.longitude}` : "—",
        },
        {
          header: "STATUS",
          key: "status",
          render: () => <StatusBadge status="Optimal" label="Normal Load" />,
        },
        {
          header: "ACTIONS",
          key: "actions",
          style: { width: "100px", textAlign: "right" },
          render: (row) => (
            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
              <button
                className="icon-btn"
                title="Focus on GIS Map"
                onClick={() => handleFocusOnMap(row.name)}
                style={{ width: "26px", height: "26px" }}
              >
                <MapPin size={13} />
              </button>
              <button
                className="icon-btn"
                title="View Details"
                onClick={() => setSelectedAsset({ ...row, assetType: "Transformer" })}
                style={{ width: "26px", height: "26px" }}
              >
                <Eye size={13} />
              </button>
            </div>
          ),
        },
      ];
    }

    if (activeTab === "consumers") {
      return [
        {
          header: "CONSUMER NAME",
          key: "name",
          render: (row) => <strong>{row.name}</strong>,
        },
        { header: "CONSUMER / METER NO.", key: "consumerNumber" },
        {
          header: "TRANSFORMER",
          key: "transformer",
          render: (row) => {
            const trans = typeof row.transformer === "object" ? row.transformer : transformers.find((t) => t._id === row.transformer);
            return trans ? trans.name : "Grid Transformer";
          },
        },
        {
          header: "LOCATION",
          key: "location",
          render: (row) =>
            row.location ? `${row.location.latitude}, ${row.location.longitude}` : "—",
        },
        {
          header: "METER STATUS",
          key: "status",
          render: () => <StatusBadge status="Optimal" label="Online" />,
        },
        {
          header: "ACTIONS",
          key: "actions",
          style: { width: "100px", textAlign: "right" },
          render: (row) => (
            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
              <button
                className="icon-btn"
                title="Focus on GIS Map"
                onClick={() => handleFocusOnMap(row.name)}
                style={{ width: "26px", height: "26px" }}
              >
                <MapPin size={13} />
              </button>
              <button
                className="icon-btn"
                title="View Details"
                onClick={() => setSelectedAsset({ ...row, assetType: "Consumer" })}
                style={{ width: "26px", height: "26px" }}
              >
                <Eye size={13} />
              </button>
            </div>
          ),
        },
      ];
    }

    // SMART METERS TAB
    return [
      {
        header: "METER NUMBER",
        key: "meterNumber",
        render: (row) => (
          <div>
            <strong style={{ color: "var(--text-main)" }}>{row.meterNumber}</strong>
          </div>
        ),
      },
      {
        header: "CONSUMER",
        key: "consumer",
        render: (row) => {
          const c = row.consumer;
          return c ? (
            <div>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
              <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px" }}>
                {c.consumerNumber}
              </small>
            </div>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>Unassigned</span>
          );
        },
      },
      {
        header: "STATUS",
        key: "status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        header: "VOLTAGE",
        key: "voltage",
        render: (row) => (row.voltage != null ? `${row.voltage} V` : "—"),
      },
      {
        header: "CURRENT",
        key: "current",
        render: (row) => (row.current != null ? `${row.current} A` : "—"),
      },
      {
        header: "POWER",
        key: "power",
        render: (row) => (row.power != null ? `${row.power} kW` : "—"),
      },
      {
        header: "LAST READING",
        key: "lastReading",
        render: (row) =>
          row.lastReading ? new Date(row.lastReading).toLocaleString() : "—",
      },
      {
        header: "ACTIONS",
        key: "actions",
        style: { width: "130px", textAlign: "right" },
        render: (row) => (
          <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
            <button
              className="icon-btn"
              title="Focus on GIS Map"
              onClick={() => handleFocusOnMap(row.consumer?.name || row.meterNumber)}
              style={{ width: "26px", height: "26px" }}
            >
              <MapPin size={13} />
            </button>
            <button
              className="icon-btn"
              title="View Details"
              onClick={() => setSelectedAsset({ ...row, assetType: "SmartMeter" })}
              style={{ width: "26px", height: "26px" }}
            >
              <Eye size={13} />
            </button>
            <button
              className="icon-btn"
              title="Edit Smart Meter"
              onClick={() => handleOpenEditMeter(row)}
              style={{ width: "26px", height: "26px" }}
            >
              <Edit2 size={13} />
            </button>
            <button
              className="icon-btn"
              title="Delete Smart Meter"
              onClick={() => setDeleteTarget(row)}
              style={{ width: "26px", height: "26px", color: "#DC2626" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ),
      },
    ];
  };

  const getActiveData = () => {
    if (activeTab === "substations") return substations;
    if (activeTab === "feeders") return feeders;
    if (activeTab === "transformers") return transformers;
    if (activeTab === "consumers") return consumers;
    return smartMeters;
  };

  const getSearchKey = () => {
    if (activeTab === "smartMeters") return "meterNumber";
    return "name";
  };

  if (loading) return <LoadingState message="Loading Grid Asset Registry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAllAssets} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Smart Grid Asset Registry</h1>
          <p>Inventory of Substations, Feeders, Transformers, Consumers, and Smart Meters</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchAllAssets}>
            <RefreshCw size={12} /> Refresh Assets
          </button>
          {activeTab === "smartMeters" && (
            <button className="btn btn-primary btn-sm" onClick={handleOpenCreateMeter}>
              <Plus size={14} /> Create Smart Meter
            </button>
          )}
        </div>
      </div>

      {/* ASSET TAB NAVIGATION */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "substations" ? "active" : ""}`}
          onClick={() => setActiveTab("substations")}
        >
          Substations ({substations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "feeders" ? "active" : ""}`}
          onClick={() => setActiveTab("feeders")}
        >
          Feeders ({feeders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "transformers" ? "active" : ""}`}
          onClick={() => setActiveTab("transformers")}
        >
          Transformers ({transformers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "consumers" ? "active" : ""}`}
          onClick={() => setActiveTab("consumers")}
        >
          Consumers ({consumers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "smartMeters" ? "active" : ""}`}
          onClick={() => setActiveTab("smartMeters")}
        >
          Smart Meters ({smartMeters.length})
        </button>
      </div>

      {/* ASSET DATA TABLE */}
      <DataTable
        columns={getColumns()}
        data={getActiveData()}
        searchKey={getSearchKey()}
        placeholder={`Search ${activeTab === "smartMeters" ? "smart meters..." : activeTab + "..."}`}
        emptyMessage={`No ${activeTab === "smartMeters" ? "smart meters" : activeTab} registered in database.`}
      />

      {/* CREATE / EDIT SMART METER MODAL */}
      <Modal
        isOpen={isMeterModalOpen}
        onClose={() => setIsMeterModalOpen(false)}
        title={editingMeter ? `Edit Smart Meter: ${editingMeter.meterNumber}` : "Create Smart Meter"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsMeterModalOpen(false)}
              disabled={meterFormLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveMeter}
              disabled={meterFormLoading}
            >
              {meterFormLoading
                ? "Saving..."
                : editingMeter
                ? "Update Smart Meter"
                : "Create Smart Meter"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveMeter}>
          {meterFormError && (
            <div style={{ color: "#DC2626", fontSize: "12px", marginBottom: "10px", fontWeight: 600 }}>
              {meterFormError}
            </div>
          )}

          <div className="form-group">
            <label>Meter Number *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SM-1005"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Consumer *</label>
            <select
              className="form-control"
              value={meterConsumer}
              onChange={(e) => setMeterConsumer(e.target.value)}
              required
            >
              <option value="">Select Consumer</option>
              {consumers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.consumerNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              className="form-control"
              value={meterStatus}
              onChange={(e) => setMeterStatus(e.target.value)}
            >
              <option value="Online">Online</option>
              <option value="Warning">Warning</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div className="form-group">
              <label>Voltage (V)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="230"
                value={meterVoltage}
                onChange={(e) => setMeterVoltage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Current (A)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                placeholder="10"
                value={meterCurrent}
                onChange={(e) => setMeterCurrent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Power (kW)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="2.3"
                value={meterPower}
                onChange={(e) => setMeterPower(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Last Reading Date/Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={meterLastReading}
              onChange={(e) => setMeterLastReading(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      {selectedAsset && (
        <Modal
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          title={
            selectedAsset.assetType === "SmartMeter"
              ? `Smart Meter Details: ${selectedAsset.meterNumber}`
              : `${selectedAsset.assetType} Asset Card`
          }
          footer={
            <>
              <button
                className="btn btn-primary"
                onClick={() =>
                  handleFocusOnMap(
                    selectedAsset.name ||
                      selectedAsset.consumer?.name ||
                      selectedAsset.meterNumber
                  )
                }
              >
                <MapPin size={13} /> View on Map
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedAsset(null)}>
                Close
              </button>
            </>
          }
        >
          {selectedAsset.assetType === "SmartMeter" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                    Meter Number
                  </strong>
                  <div style={{ fontWeight: 700, fontSize: "16px" }}>{selectedAsset.meterNumber}</div>
                </div>
                <div>
                  <StatusBadge status={selectedAsset.status} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                    Connected Consumer
                  </strong>
                  <div>{selectedAsset.consumer?.name || "—"}</div>
                </div>
                <div>
                  <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                    Consumer Account No.
                  </strong>
                  <div>{selectedAsset.consumer?.consumerNumber || "—"}</div>
                </div>
              </div>

              <div style={{ background: "#F8FAF7", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
                <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Live Telemetry Metrics
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Voltage</span>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1A2318" }}>
                      {selectedAsset.voltage != null ? `${selectedAsset.voltage} V` : "—"}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Current</span>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1A2318" }}>
                      {selectedAsset.current != null ? `${selectedAsset.current} A` : "—"}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Power</span>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#1A2318" }}>
                      {selectedAsset.power != null ? `${selectedAsset.power} kW` : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                    Last Reading
                  </strong>
                  <div>
                    {selectedAsset.lastReading
                      ? new Date(selectedAsset.lastReading).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div>
                  <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                    GIS Coordinates
                  </strong>
                  <div>
                    {selectedAsset.consumer?.location
                      ? `${selectedAsset.consumer.location.latitude}, ${selectedAsset.consumer.location.longitude}`
                      : "—"}
                  </div>
                </div>
              </div>

              <div>
                <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                  System ID
                </strong>
                <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{selectedAsset._id}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div>
                <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                  Name
                </strong>
                <div style={{ fontWeight: 700, fontSize: "15px" }}>{selectedAsset.name}</div>
              </div>
              <div>
                <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                  Code / ID
                </strong>
                <div>{selectedAsset.code || selectedAsset.consumerNumber || "—"}</div>
              </div>
              {selectedAsset.location && (
                <div>
                  <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                    GIS Location Coordinates
                  </strong>
                  <div>
                    Lat: {selectedAsset.location.latitude}, Lng: {selectedAsset.location.longitude}
                  </div>
                </div>
              )}
              <div>
                <strong style={{ color: "#6D746D", fontSize: "11px", textTransform: "uppercase" }}>
                  System ID
                </strong>
                <div style={{ fontFamily: "monospace", fontSize: "12px" }}>{selectedAsset._id}</div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteMeter}
        title="Delete Smart Meter"
        message={`Are you sure you want to permanently delete Smart Meter "${deleteTarget?.meterNumber}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}
