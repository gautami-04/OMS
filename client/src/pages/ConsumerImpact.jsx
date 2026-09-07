import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  Zap,
  Activity,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import {
  outagesApi,
  feedersApi,
  transformersApi,
  consumerImpactApi,
} from "../services/api";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/DataTable";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

export default function ConsumerImpact() {
  const navigate = useNavigate();

  const [outages, setOutages] = useState([]);
  const [feeders, setFeeders] = useState([]);
  const [transformers, setTransformers] = useState([]);

  const [selectedOutageId, setSelectedOutageId] = useState("");

  const [impactData, setImpactData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [impactLoading, setImpactLoading] = useState(false);
  const [error, setError] = useState(null);
  const [impactError, setImpactError] = useState(null);

  // Load outages, feeders and transformers
  const fetchBaseData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [outageData, feederData, transformerData] =
        await Promise.all([
          outagesApi.getAll(),
          feedersApi.getAll(),
          transformersApi.getAll(),
        ]);

      const loadedOutages = outageData || [];

      setOutages(loadedOutages);
      setFeeders(feederData || []);
      setTransformers(transformerData || []);

      // Automatically select the first active outage
      const activeOutage = loadedOutages.find(
        (outage) => outage.status !== "Restored"
      );

      if (activeOutage) {
        setSelectedOutageId(activeOutage._id);
      } else if (loadedOutages.length > 0) {
        setSelectedOutageId(loadedOutages[0]._id);
      } else {
        setSelectedOutageId("");
      }

      setLoading(false);
    } catch (err) {
      console.error("Consumer impact base data error:", err);

      setError(
        "Failed to load outage and grid asset data from backend"
      );

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBaseData();
  }, [fetchBaseData]);

  // Fetch calculated impact for selected outage
  const fetchImpact = useCallback(async () => {
    if (!selectedOutageId) {
      setImpactData(null);
      return;
    }

    setImpactLoading(true);
    setImpactError(null);

    try {
      const data = await consumerImpactApi.getByOutage(
        selectedOutageId
      );

      setImpactData(data);
      setImpactLoading(false);
    } catch (err) {
      console.error("Consumer impact calculation error:", err);

      setImpactError(
        err.message || "Failed to calculate consumer impact"
      );

      setImpactData(null);
      setImpactLoading(false);
    }
  }, [selectedOutageId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchImpact();
  }, [fetchImpact]);

  const handleRefresh = async () => {
    await fetchBaseData();
  };

  const handleViewMap = () => {
    if (!selectedOutageId) return;

    navigate(`/map?outage=${selectedOutageId}`);
  };

  if (loading) {
    return (
      <LoadingState message="Loading Consumer Impact Analysis..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchBaseData}
      />
    );
  }

  const selectedOutage = outages.find(
    (outage) => outage._id === selectedOutageId
  );

  const affectedConsumers =
    impactData?.affectedConsumers || [];

  const affectedFeeders =
    impactData?.affectedFeeders || [];

  const affectedTransformers =
    impactData?.affectedTransformers || [];

  const consumerColumns = [
    {
      header: "CONSUMER NAME",
      key: "name",
      render: (row) => (
        <strong>{row.name}</strong>
      ),
    },

    {
      header: "METER / ACC NO.",
      key: "consumerNumber",
    },

    {
      header: "TRANSFORMER LINK",
      key: "transformer",
      render: (row) => {
        const transformer = row.transformer;

        return transformer
          ? `${transformer.name} (${transformer.code || ""})`
          : "Grid Transformer";
      },
    },

    {
      header: "IMPACT STATUS",
      key: "status",
      render: () => (
        <StatusBadge
          status="In Progress"
          label="Power Interrupted"
        />
      ),
    },
  ];

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
          <h1>Consumer Impact Analysis</h1>

          <p>
            Identify consumers and grid assets affected by
            planned outages
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={impactLoading}
          >
            <RefreshCw
              size={12}
              className={
                impactLoading ? "spin-animation" : ""
              }
            />

            Recalculate Impact
          </button>
        </div>
      </div>

      {/* OUTAGE SELECTOR */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "7px",
          }}
        >
          Select Outage
        </div>

        <div style={{ position: "relative" }}>
          <select
            className="form-control"
            value={selectedOutageId}
            onChange={(e) =>
              setSelectedOutageId(e.target.value)
            }
            style={{
              width: "100%",
              appearance: "none",
              paddingRight: "35px",
            }}
          >
            <option value="">
              Select an outage to analyse
            </option>

            {outages.map((outage) => (
              <option
                key={outage._id}
                value={outage._id}
              >
                {outage.title} — {outage.status}
              </option>
            ))}
          </select>

          <ChevronDown
            size={15}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "var(--text-muted)",
            }}
          />
        </div>
      </div>

      {/* SELECTED OUTAGE INFO */}
      {selectedOutage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "12px 16px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginBottom: "3px",
              }}
            >
              ANALYSING OUTAGE
            </div>

            <strong
              style={{
                fontSize: "14px",
              }}
            >
              {selectedOutage.title}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <StatusBadge
              status={selectedOutage.status}
            />

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleViewMap}
            >
              View Impact on Map
            </button>
          </div>
        </div>
      )}

      {/* IMPACT ERROR */}
      {impactError && (
        <ErrorState
          message={impactError}
          onRetry={fetchImpact}
        />
      )}

      {/* IMPACT LOADING */}
      {impactLoading && !impactData && (
        <LoadingState
          message="Calculating affected consumers and grid assets..."
        />
      )}

      {/* METRIC CARDS */}
      {impactData && !impactLoading && (
        <>
          <div className="stat-cards-grid">
            <StatCard
              label="Affected Consumers"
              value={impactData.consumerCount || 0}
              subtext="Consumers impacted by selected outage"
              icon={Users}
              badge={
                <StatusBadge
                  status={
                    impactData.consumerCount > 0
                      ? "In Progress"
                      : "Optimal"
                  }
                  label={
                    impactData.consumerCount > 0
                      ? "Power Interrupted"
                      : "No Impact"
                  }
                />
              }
            />

            <StatCard
              label="Affected Feeders"
              value={affectedFeeders.length}
              subtext={`Out of ${feeders.length} Total Feeders`}
              icon={Zap}
            />

            <StatCard
              label="Affected Transformers"
              value={affectedTransformers.length}
              subtext={`Out of ${transformers.length} Total Transformers`}
              icon={Activity}
            />

            <StatCard
              label="Outage Status"
              value={selectedOutage?.status || "—"}
              subtext="Current outage state"
              icon={AlertTriangle}
            />
          </div>

          {/* AFFECTED FEEDERS */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-main)",
                marginBottom: "12px",
              }}
            >
              Affected Feeders
            </div>

            {affectedFeeders.length === 0 ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                No affected feeders identified.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {affectedFeeders.map((feeder) => (
                  <div
                    key={feeder.id}
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "13px",
                      }}
                    >
                      {feeder.name}
                    </strong>

                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {feeder.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AFFECTED TRANSFORMERS */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-main)",
                marginBottom: "12px",
              }}
            >
              Affected Transformers
            </div>

            {affectedTransformers.length === 0 ? (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                No affected transformers identified.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {affectedTransformers.map(
                  (transformer) => (
                    <div
                      key={transformer.id}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "13px",
                          }}
                        >
                          {transformer.name}
                        </strong>

                        {transformer.feeder && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                              marginTop: "2px",
                            }}
                          >
                            Feeder:{" "}
                            {transformer.feeder.name}
                          </div>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {transformer.code}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* AFFECTED CONSUMERS */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-main)",
                marginBottom: "8px",
              }}
            >
              Affected Consumers
            </div>

            <DataTable
              columns={consumerColumns}
              data={affectedConsumers}
              searchKey="name"
              placeholder="Search affected consumers..."
              emptyMessage="No affected consumers identified for this outage."
            />
          </div>
        </>
      )}

      {/* NO OUTAGES */}
      {!selectedOutageId && outages.length === 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <AlertTriangle
            size={30}
            style={{ marginBottom: "10px" }}
          />

          <div
            style={{
              fontWeight: 600,
              color: "var(--text-main)",
              marginBottom: "4px",
            }}
          >
            No Outages Available
          </div>

          <div style={{ fontSize: "12px" }}>
            Create a planned outage to perform consumer
            impact analysis.
          </div>
        </div>
      )}
    </div>
  );
}