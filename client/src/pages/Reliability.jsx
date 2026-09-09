import { useState, useEffect, useCallback } from "react";
import { BarChart2, Clock, Activity, RefreshCw, Users, AlertTriangle } from "lucide-react";
import { outagesApi, feedersApi, reportsApi } from "../services/api";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/DataTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function Reliability() {
  const [outages, setOutages] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [reliability, setReliability] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReliabilityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oRes, fRes, saidiRes, saifiRes] = await Promise.all([
        outagesApi.getAll(),
        feedersApi.getAll(),
        reportsApi.getSaidi(),
        reportsApi.getSaifi(),
      ]);

      setOutages(oRes || []);
      setFeeders(fRes || []);
      setReliability({ ...saidiRes, ...saifiRes });
      setLoading(false);
    } catch (err) {
      console.error("Reliability calculation error:", err);
      setError("Failed to calculate grid reliability indices");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReliabilityData();
  }, [fetchReliabilityData]);

  // Feeder Outage Breakdown
  const feederAnalytics = feeders.map((feeder) => {
    const feederOutages = outages.filter(
      (o) => (o.feeder?._id || o.feeder) === feeder._id
    );
    return {
      id: feeder._id,
      name: feeder.name,
      code: feeder.code,
      outageCount: feederOutages.length,
      activeCount: feederOutages.filter((o) => o.status !== "Restored").length,
    };
  });

  const feederColumns = [
    {
      header: "FEEDER NAME",
      key: "name",
      render: (r) => <strong>{r.name}</strong>,
    },
    { header: "FEEDER CODE", key: "code" },
    { header: "TOTAL OUTAGES", key: "outageCount" },
    {
      header: "ACTIVE UNRESOLVED",
      key: "activeCount",
      render: (r) => (
        <StatusBadge
          status={r.activeCount > 0 ? "In Progress" : "Optimal"}
          label={r.activeCount > 0 ? `${r.activeCount} Active` : "Normal"}
        />
      ),
    },
  ];

  if (loading) return <LoadingState message="Calculating Grid Reliability Performance (IEEE 1366 Indices)..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReliabilityData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Reliability Performance Analytics</h1>
          <p>IEEE 1366 Standard Grid Reliability Indices (SAIFI and SAIDI)</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchReliabilityData}>
            <RefreshCw size={12} /> Recalculate Indices
          </button>
        </div>
      </div>

      {/* IEEE 1366 KPI CARDS */}
      <div className="stat-cards-grid">
        <StatCard
          label="SAIFI (Frequency)"
          value={reliability.saifi.toFixed(3)}
          subtext="Interruptions per Consumer"
          icon={BarChart2}
        />
        <StatCard
          label="SAIDI (Duration)"
          value={`${reliability.saidi.toFixed(3)} hr`}
          subtext="Interruption Hours per Consumer"
          icon={Clock}
        />
        <StatCard
          label="Total Consumers"
          value={reliability.totalConsumers}
          subtext="Consumers in the database"
          icon={Users}
        />
        <StatCard
          label="Affected Interruptions"
          value={reliability.affectedConsumerInterruptions}
          subtext="Consumer interruptions counted"
          icon={Activity}
        />
        <StatCard
          label="Valid Outages"
          value={reliability.outageCount}
          subtext="Outages with valid duration"
          icon={AlertTriangle}
        />
      </div>

      {/* FEEDER OUTAGE FREQUENCY TABLE */}
      <DataTable
        columns={feederColumns}
        data={feederAnalytics}
        searchKey="name"
        placeholder="Filter feeders by reliability..."
        emptyMessage="No feeder data available."
      />
    </div>
  );
}
