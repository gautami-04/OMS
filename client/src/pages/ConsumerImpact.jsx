import { useState, useEffect, useCallback } from "react";
import { Users, AlertTriangle, Zap, Activity, RefreshCw } from "lucide-react";
import {
  outagesApi,
  consumersApi,
  transformersApi,
  feedersApi,
} from "../services/api";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/DataTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function ConsumerImpact() {
  const [outages, setOutages] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [feeders, setFeeders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImpactData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oRes, cRes, tRes, fRes] = await Promise.all([
        outagesApi.getAll(),
        consumersApi.getAll(),
        transformersApi.getAll(),
        feedersApi.getAll(),
      ]);

      setOutages(oRes || []);
      setConsumers(cRes || []);
      setTransformers(tRes || []);
      setFeeders(fRes || []);
      setLoading(false);
    } catch (err) {
      console.error("Impact calculation error:", err);
      setError("Failed to load consumer impact data from backend");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  // Derive active affected feeders and transformers
  const activeOutages = outages.filter((o) => o.status !== "Restored");
  const affectedFeederIds = new Set(
    activeOutages.map((o) => (o.feeder?._id || o.feeder)).filter(Boolean)
  );

  const affectedTransformerIds = new Set(
    activeOutages.map((o) => (o.transformer?._id || o.transformer)).filter(Boolean)
  );

  // Affected consumers list based on affected transformers or feeders
  const affectedConsumers = consumers.filter((c) => {
    const tId = c.transformer?._id || c.transformer;
    if (affectedTransformerIds.has(tId)) return true;
    const trans = transformers.find((t) => t._id === tId);
    if (trans) {
      const fId = trans.feeder?._id || trans.feeder;
      if (affectedFeederIds.has(fId)) return true;
    }
    return false;
  });

  const columns = [
    {
      header: "CONSUMER NAME",
      key: "name",
      render: (row) => <strong>{row.name}</strong>,
    },
    { header: "METER / ACC NO.", key: "consumerNumber" },
    {
      header: "TRANSFORMER LINK",
      key: "transformer",
      render: (row) => {
        const t = typeof row.transformer === "object" ? row.transformer : transformers.find((tr) => tr._id === row.transformer);
        return t ? `${t.name} (${t.code || ""})` : "Grid Transformer";
      },
    },
    {
      header: "IMPACT STATUS",
      key: "status",
      render: (row) => {
        const isAffected = affectedConsumers.some((ac) => ac._id === row._id);
        return isAffected ? (
          <StatusBadge status="In Progress" label="Power Interrupted" />
        ) : (
          <StatusBadge status="Optimal" label="Normal Service" />
        );
      },
    },
  ];

  if (loading) return <LoadingState message="Calculating Consumer Impact Analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchImpactData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* HEADER */}
      <div className="page-header">
        <div className="page-title">
          <h1>Consumer Impact Analysis</h1>
          <p>Real-time calculation of consumers affected by active grid outages</p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchImpactData}>
            <RefreshCw size={12} /> Recalculate Impact
          </button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="stat-cards-grid">
        <StatCard
          label="Total Consumers Affected"
          value={activeOutages.length > 0 ? affectedConsumers.length : "0"}
          subtext={activeOutages.length > 0 ? "Impacted by Active Outages" : "No active impact"}
          icon={Users}
          badge={<StatusBadge status={affectedConsumers.length > 0 ? "In Progress" : "Optimal"} />}
        />
        <StatCard
          label="Affected Feeders"
          value={affectedFeederIds.size}
          subtext={`Out of ${feeders.length} Total Feeders`}
          icon={Zap}
        />
        <StatCard
          label="Affected Transformers"
          value={affectedTransformerIds.size}
          subtext={`Out of ${transformers.length} Total Transformers`}
          icon={Activity}
        />
        <StatCard
          label="Active Outage Events"
          value={activeOutages.length}
          subtext="Under Investigation / Repair"
          icon={AlertTriangle}
        />
      </div>

      {/* CONSUMER IMPACT TABLE */}
      <DataTable
        columns={columns}
        data={consumers}
        searchKey="name"
        placeholder="Search consumer impact list..."
        emptyMessage="No consumer impact data available."
      />
    </div>
  );
}
