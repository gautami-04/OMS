import { useState, useEffect, useCallback } from "react";
import { Download, Play } from "lucide-react";
import { outagesApi, consumersApi, reportsApi } from "../services/api";

import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/DataTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Reports() {
  const [reportType, setReportType] = useState("Outage Summary");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-30");

  const [outages, setOutages] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [reliability, setReliability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [generatedMessage, setGeneratedMessage] = useState(null);

  const [reportsList, setReportsList] = useState([
    {
      id: "REP-2026-08",
      name: "Monthly Outage Analysis - August 2026",
      type: "Outage Summary",
      date: "2026-08-15",
      status: "Ready",
    },
    {
      id: "REP-2026-07",
      name: "Grid Reliability Index (SAIFI/SAIDI)",
      type: "Reliability Performance",
      date: "2026-08-01",
      status: "Ready",
    },
  ]);

  const fetchReportContext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oRes, cRes, saidiRes, saifiRes] = await Promise.all([
        outagesApi.getAll(),
        consumersApi.getAll(),
        reportsApi.getSaidi(),
        reportsApi.getSaifi(),
      ]);
      setOutages(oRes || []);
      setConsumers(cRes || []);
      setReliability({ ...saidiRes, ...saifiRes });
      setLoading(false);
    } catch {
      setError("Failed to load operational report metrics");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportContext();
  }, [fetchReportContext]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const newRep = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${reportType} (${startDate} to ${endDate})`,
      type: reportType,
      date: new Date().toISOString().slice(0, 10),
      status: "Export Preview Ready",
    };
    setReportsList([newRep, ...reportsList]);
    setGeneratedMessage(`Report "${newRep.name}" compiled successfully based on database records.`);
  };

  const columns = [
    { header: "REPORT ID", key: "id", render: (r) => <strong>{r.id}</strong> },
    { header: "REPORT NAME", key: "name" },
    { header: "TYPE", key: "type" },
    { header: "GENERATED DATE", key: "date" },
    {
      header: "STATUS",
      key: "status",
      render: (r) => <StatusBadge status="Restored" label={r.status} />,
    },
    {
      header: "ACTION",
      key: "action",
      style: { width: "100px", textAlign: "right" },
      render: (r) => (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => alert(`Exporting data file for ${r.name}...`)}
        >
          <Download size={12} /> Export CSV
        </button>
      ),
    },
  ];

  if (loading) return <LoadingState message="Preparing Operational Analytics & Reports..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReportContext} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Reports & Analytics Hub</h1>
          <p>Generate grid performance, reliability, and outage reports</p>
        </div>
      </div>

      {/* GENERATE REPORT & RELIABILITY PREVIEW SPLIT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* GENERATE FORM */}
        <div className="table-card" style={{ padding: "18px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700, textTransform: "uppercase" }}>
            Generate Operational Report
          </h3>
          {generatedMessage && (
            <div
              style={{
                padding: "8px 12px",
                background: "#EEF3E3",
                color: "#3A5400",
                fontSize: "12px",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            >
              {generatedMessage}
            </div>
          )}
          <form onSubmit={handleGenerateReport}>
            <div className="form-group">
              <label>Report Type *</label>
              <select
                className="form-control"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Outage Summary">Outage Summary Report</option>
                <option value="Reliability Performance">Reliability Indices (SAIFI / SAIDI)</option>
                <option value="Asset Utilization">Asset Registry Inventory</option>
                <option value="Consumer Disruption">Consumer Disruption Log</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "6px" }}>
              <Play size={14} /> Generate Report Summary
            </button>
          </form>
        </div>

        {/* RELIABILITY PREVIEW CARD */}
        <div className="table-card" style={{ padding: "18px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700, textTransform: "uppercase" }}>
            Grid Reliability Preview
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8ECE7", paddingBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Outage Records</span>
              <strong style={{ fontSize: "14px" }}>{outages.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8ECE7", paddingBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Monitored Smart Meters</span>
              <strong style={{ fontSize: "14px" }}>{consumers.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #E8ECE7", paddingBottom: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>SAIFI Index</span>
              <strong style={{ fontSize: "14px", color: "#587900" }}>
                {reliability.saifi.toFixed(3)} interrupts/cust
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>SAIDI Index</span>
              <strong style={{ fontSize: "14px", color: "#587900" }}>
                {reliability.saidi.toFixed(3)} hours/cust
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT REPORTS DATATABLE */}
      <DataTable
        columns={columns}
        data={reportsList}
        searchKey="name"
        placeholder="Search compiled reports..."
        emptyMessage="No reports compiled yet."
      />
    </div>
  );
}
