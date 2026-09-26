import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  MapPin,
  AlertTriangle,
  Database,
  Users,
  Activity,
  FileText,
  BarChart2,
  Shield,
  ArrowRight,
  Check,
  Calendar,
  Layers,
  Cpu,
  Clock,
  Menu,
  X,
  Lock,
  Radio,
} from "lucide-react";
import "./Landing.css";

export default function Landing({ user }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">
      {/* 1. HEADER */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand" onClick={() => navigate("/")}>
            <div className="landing-brand-icon">
              <Zap size={18} fill="#ffffff" color="#ffffff" />
            </div>
            <div className="landing-brand-text">
              <span className="brand-company">Eficaa</span>
              <span className="brand-app">Smart Grid OMS</span>
            </div>
          </div>

          <nav className={`landing-nav ${mobileMenuOpen ? "open" : ""}`}>
            <button className="nav-link-btn" onClick={() => scrollToSection("platform")}>
              Platform
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection("workflow")}>
              Workflow
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection("gis-section")}>
              GIS Map
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection("impact-section")}>
              Impact
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection("reliability-section")}>
              Reliability
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection("modules-section")}>
              Modules
            </button>
            <button className="nav-link-btn" onClick={() => scrollToSection("security-section")}>
              Security
            </button>

            {mobileMenuOpen && (
              <button className="btn-landing-primary mobile-login-btn" onClick={handleLoginClick}>
                {user ? "Go to Dashboard" : "Login to OMS"}
              </button>
            )}
          </nav>

          <div className="landing-header-actions">
            <button className="btn-landing-primary" onClick={handleLoginClick}>
              {user ? "Go to Dashboard" : "Login to OMS"}
            </button>
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO */}
      <section id="hero" className="landing-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <Zap size={13} className="eyebrow-icon" />
              <span>GIS-BASED OUTAGE MONITORING & RELIABILITY ANALYSIS</span>
            </div>

            <h1 className="hero-title">Smart Grid Outage Management System</h1>

            <p className="hero-description">
              Manage planned outages, visualize grid assets, analyze consumer impact, and monitor
              grid reliability through a unified GIS-based platform.
            </p>

            <div className="hero-actions">
              <button className="btn-landing-primary btn-large" onClick={handleLoginClick}>
                {user ? "Go to Dashboard" : "Login to OMS"}
                <ArrowRight size={16} />
              </button>
              <button
                className="btn-landing-secondary btn-large"
                onClick={() => scrollToSection("platform")}
              >
                Explore Platform
              </button>
            </div>

            <div className="hero-trust-badges">
              <span className="trust-item">
                <Check size={14} /> Utility Grid Topology
              </span>
              <span className="trust-item">
                <Check size={14} /> IEEE 1366 Reliability Indices
              </span>
              <span className="trust-item">
                <Check size={14} /> Socket.IO Event Broadcasting
              </span>
            </div>
          </div>

          {/* HERO VISUAL / TOPOLOGY PREVIEW */}
          <div className="hero-visual-card">
            <div className="visual-card-header">
              <div className="visual-card-title">
                <Layers size={14} />
                <span>GIS Network Topology Preview</span>
              </div>
              <span className="preview-badge">Product Preview</span>
            </div>

            <div className="topology-canvas">
              <svg className="topology-svg" viewBox="0 0 500 240">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4A7C59" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#84A98C" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="alertLine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E53E3E" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#DD6B20" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                <path d="M 0,60 L 500,60 M 0,120 L 500,120 M 0,180 L 500,180" stroke="#E2E7DF" strokeDasharray="4 4" strokeWidth="1" />
                <path d="M 120,0 L 120,240 M 260,0 L 260,240 M 400,0 L 400,240" stroke="#E2E7DF" strokeDasharray="4 4" strokeWidth="1" />

                <path d="M 80,120 L 200,60" stroke="url(#lineGrad)" strokeWidth="3" fill="none" />
                <path d="M 80,120 L 200,180" stroke="url(#alertLine)" strokeWidth="3" fill="none" strokeDasharray="6 3" />

                <path d="M 200,60 L 330,40" stroke="url(#lineGrad)" strokeWidth="2.5" fill="none" />
                <path d="M 200,60 L 330,90" stroke="url(#lineGrad)" strokeWidth="2.5" fill="none" />
                <path d="M 200,180 L 330,160" stroke="url(#alertLine)" strokeWidth="2.5" fill="none" />
                <path d="M 200,180 L 330,205" stroke="url(#alertLine)" strokeWidth="2.5" fill="none" />

                <path d="M 330,40 L 430,30" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
                <path d="M 330,40 L 430,55" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
                <path d="M 330,160 L 430,145" stroke="url(#alertLine)" strokeWidth="2" fill="none" />
                <path d="M 330,160 L 430,175" stroke="url(#alertLine)" strokeWidth="2" fill="none" />
              </svg>

              <div className="topology-node node-substation" style={{ left: "14%", top: "50%" }}>
                <div className="node-icon-wrapper">
                  <Zap size={18} />
                </div>
                <div className="node-label">
                  <strong>SUBSTATION</strong>
                  <span>Illustrative network node</span>
                </div>
              </div>

              <div className="topology-node node-feeder" style={{ left: "40%", top: "25%" }}>
                <div className="node-dot normal"></div>
                <div className="node-label">
                  <strong>FEEDER</strong>
                  <span className="status-text-normal">Normal Operation</span>
                </div>
              </div>

              <div className="topology-node node-feeder" style={{ left: "40%", top: "75%" }}>
                <div className="node-dot alert"></div>
                <div className="node-label">
                  <strong>AFFECTED FEEDER</strong>
                  <span className="status-text-alert">Impact Highlighted</span>
                </div>
              </div>

              <div className="topology-node node-transformer" style={{ left: "66%", top: "67%" }}>
                <div className="node-dot alert"></div>
                <div className="node-label">
                  <strong>TRANSFORMER</strong>
                  <span>Capacity: illustrative</span>
                </div>
              </div>

              <div className="topology-node node-consumer" style={{ left: "86%", top: "60%" }}>
                <div className="node-dot alert"></div>
                <div className="node-label">
                  <strong>CONSUMERS</strong>
                  <span>Recorded readings</span>
                </div>
              </div>
            </div>

            <div className="visual-card-footer">
              <span className="flow-step">Substation</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">Feeder</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">Transformer</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">Consumers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ONE PLATFORM FOR GRID OPERATIONS */}
      <section id="platform" className="landing-platform-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">INTEGRATED SOLUTION</span>
            <h2 className="section-title">One Platform for Grid Operations</h2>
            <p className="section-subtitle">
              Comprehensive distribution grid monitoring and outage response tools in a unified enterprise application.
            </p>
          </div>

          {/* Core Capability Cards */}
          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon-wrapper">
                <Calendar size={22} />
              </div>
              <h3>1. Planned Outage Management</h3>
              <p>Create, monitor, update, and restore planned outages.</p>
            </div>

            <div className="capability-card">
              <div className="capability-icon-wrapper">
                <MapPin size={22} />
              </div>
              <h3>2. GIS Network Visualization</h3>
              <p>Visualize substations, feeders, transformers, consumers, and outage areas.</p>
            </div>

            <div className="capability-card">
              <div className="capability-icon-wrapper">
                <Activity size={22} />
              </div>
              <h3>3. Consumer Impact Analysis</h3>
              <p>Identify affected consumers and trace feeder and transformer impact.</p>
            </div>

            <div className="capability-card">
              <div className="capability-icon-wrapper">
                <BarChart2 size={22} />
              </div>
              <h3>4. Reliability Analysis</h3>
              <p>Analyze SAIDI and SAIFI using outage and consumer impact data.</p>
            </div>
          </div>

          {/* Product Preview Cards */}
          <div className="previews-grid" style={{ marginTop: "32px" }}>
            {/* Card A: Planned Outage */}
            <div className="preview-card">
              <div className="preview-card-header">
                <div className="preview-card-title">
                  <Calendar size={16} className="card-icon" />
                  <span>A. Planned Outage</span>
                </div>
                <span className="preview-indicator">Product preview</span>
              </div>
              <div className="preview-card-body">
                <div className="preview-item-row">
                  <span className="item-label">Outage Name</span>
                  <span className="item-value font-semibold">Scheduled Maintenance</span>
                </div>
                <div className="preview-item-row">
                  <span className="item-label">Status</span>
                  <span className="badge-scheduled">Scheduled</span>
                </div>
                <div className="preview-item-row">
                  <span className="item-label">Feeder</span>
                  <span className="item-value">Feeder Line</span>
                </div>
                <div className="preview-item-row">
                  <span className="item-label">Window</span>
                  <span className="item-value">Execution window</span>
                </div>
              </div>
            </div>

            {/* Card B: Consumer Impact */}
            <div className="preview-card">
              <div className="preview-card-header">
                <div className="preview-card-title">
                  <Activity size={16} className="card-icon" />
                  <span>B. Consumer Impact</span>
                </div>
                <span className="preview-indicator">Product preview</span>
              </div>
              <div className="preview-card-body">
                <div className="impact-metrics-row">
                  <div className="impact-metric-box">
                    <span className="metric-num">Affected</span>
                    <span className="metric-label">Consumers</span>
                  </div>
                  <div className="impact-metric-box">
                    <span className="metric-num">Affected</span>
                    <span className="metric-label">Feeders</span>
                  </div>
                  <div className="impact-metric-box">
                    <span className="metric-num">Affected</span>
                    <span className="metric-label">Transformers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card C: Reliability */}
            <div className="preview-card">
              <div className="preview-card-header">
                <div className="preview-card-title">
                  <BarChart2 size={16} className="card-icon" />
                  <span>C. Reliability</span>
                </div>
                <span className="preview-indicator">Product preview</span>
              </div>
              <div className="preview-card-body">
                <div className="reliability-metrics-row">
                  <div className="reliability-box">
                    <span className="rel-code">SAIDI</span>
                    <span className="rel-val">Duration Index</span>
                    <span className="rel-desc">IEEE 1366 standard</span>
                  </div>
                  <div className="reliability-box">
                    <span className="rel-code">SAIFI</span>
                    <span className="rel-val">Frequency Index</span>
                    <span className="rel-desc">IEEE 1366 standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FROM OUTAGE TO INSIGHT */}
      <section id="workflow" className="landing-workflow-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">OPERATIONAL LIFECYCLE</span>
            <h2 className="section-title">From Outage to Insight</h2>
            <p className="section-subtitle">
              A structured 5-step operational workflow for grid reliability.
            </p>
          </div>

          <div className="workflow-steps-container">
            <div className="workflow-step-card">
              <div className="step-num-badge">01</div>
              <div className="step-content">
                <h4>Plan Outage</h4>
                <p>Create and schedule planned maintenance windows with defined scope.</p>
                <div className="step-visual-fragment">
                  <Calendar size={14} /> Schedule Window
                </div>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-num-badge">02</div>
              <div className="step-content">
                <h4>Visualize Network</h4>
                <p>Visualize substations, feeders, transformers, and affected outage areas.</p>
                <div className="step-visual-fragment">
                  <MapPin size={14} /> GIS Topology
                </div>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-num-badge">03</div>
              <div className="step-content">
                <h4>Analyze Consumer Impact</h4>
                <p>Identify affected consumers and trace feeder and transformer impact.</p>
                <div className="step-visual-fragment">
                  <Activity size={14} /> Impact Tracing
                </div>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-num-badge">04</div>
              <div className="step-content">
                <h4>Track Restoration</h4>
                <p>Track repair progress, work tickets, and crew dispatch status.</p>
                <div className="step-visual-fragment">
                  <Clock size={14} /> Restoration Progress
                </div>
              </div>
            </div>

            <div className="workflow-step-card">
              <div className="step-num-badge">05</div>
              <div className="step-content">
                <h4>Monitor Reliability</h4>
                <p>Analyze SAIDI and SAIFI using outage and consumer impact data.</p>
                <div className="step-visual-fragment">
                  <BarChart2 size={14} /> SAIDI / SAIFI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE GIS DISTRIBUTION TOPOLOGY */}
      <section id="gis-section" className="landing-gis-section">
        <div className="section-container">
          <div className="gis-layout-wrapper">
            <div className="gis-text-content">
              <span className="section-badge">SPATIAL VISUALIZATION</span>
              <h2 className="section-title">Interactive GIS Distribution Topology</h2>
              <p className="gis-description">
                Visualize substations, feeders, transformers, consumers, and outage areas through intuitive, high-resolution GIS map overlays.
              </p>
              <ul className="gis-feature-list">
                <li>
                  <Check size={16} className="list-check" /> <strong>Substation & Feeder Mapping:</strong> Distribution line overlays and asset relationships.
                </li>
                <li>
                  <Check size={16} className="list-check" /> <strong>Transformer Assets:</strong> Step-down transformer zones linked to consumer groups.
                </li>
                <li>
                  <Check size={16} className="list-check" /> <strong>Smart Meters:</strong> Smart meter status and recorded electrical readings.
                </li>
                <li>
                  <Check size={16} className="list-check" /> <strong>Outage Event Broadcasting:</strong> Outage event broadcasting using Socket.IO.
                </li>
              </ul>
            </div>

            <div className="gis-map-preview-box">
              <div className="map-preview-topbar">
                <div className="map-top-left">
                  <MapPin size={14} /> GIS Grid Map Preview
                </div>
                <span className="map-status-pill">Product preview</span>
              </div>
              <div className="map-schematic-canvas">
                <svg className="map-svg" viewBox="0 0 600 320">
                  <rect width="600" height="320" fill="#EBF0E8" />

                  <line x1="0" y1="80" x2="600" y2="80" stroke="#D8E2D5" strokeWidth="1" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="#D8E2D5" strokeWidth="1" />
                  <line x1="0" y1="240" x2="600" y2="240" stroke="#D8E2D5" strokeWidth="1" />
                  <line x1="150" y1="0" x2="150" y2="320" stroke="#D8E2D5" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="320" stroke="#D8E2D5" strokeWidth="1" />
                  <line x1="450" y1="0" x2="450" y2="320" stroke="#D8E2D5" strokeWidth="1" />

                  <path d="M 80,160 L 220,90 L 380,90 L 500,140" fill="none" stroke="#4A7C59" strokeWidth="4" />
                  <path d="M 80,160 L 220,230 L 400,230 L 520,270" fill="none" stroke="#E53E3E" strokeWidth="4" strokeDasharray="8 4" />

                  <polygon points="190,190 430,190 450,290 170,290" fill="rgba(229, 62, 62, 0.12)" stroke="#E53E3E" strokeWidth="1.5" strokeDasharray="4 2" />

                  <circle cx="80" cy="160" r="14" fill="#3B6243" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="80" y="164" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">SS</text>
                  <text x="80" y="186" fill="#2D3748" fontSize="10" fontWeight="600" textAnchor="middle">Substation</text>

                  <circle cx="220" cy="90" r="8" fill="#4A7C59" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="380" cy="90" r="8" fill="#4A7C59" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="300" y="80" fill="#4A7C59" fontSize="10" fontWeight="bold" textAnchor="middle">Feeder (Active)</text>

                  <circle cx="220" cy="230" r="9" fill="#E53E3E" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="400" cy="230" r="9" fill="#E53E3E" stroke="#FFFFFF" strokeWidth="2" />
                  <text x="310" y="220" fill="#E53E3E" fontSize="10" fontWeight="bold" textAnchor="middle">Affected Feeder</text>

                  <rect x="490" y="260" width="16" height="16" rx="3" fill="#E53E3E" />
                  <text x="498" y="272" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">M</text>

                  <rect x="470" y="130" width="16" height="16" rx="3" fill="#4A7C59" />
                  <text x="478" y="142" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">M</text>
                </svg>

                <div className="map-overlay-legend">
                  <span className="legend-item"><span className="dot dot-ss"></span> Substation</span>
                  <span className="legend-item"><span className="dot dot-fdr"></span> Feeder</span>
                  <span className="legend-item"><span className="dot dot-alert"></span> Affected Area</span>
                  <span className="legend-item"><span className="dot dot-meter"></span> Smart Meter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRACE IMPACT DOWN TO THE METER */}
      <section id="impact-section" className="landing-impact-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">IMPACT ANALYSIS</span>
            <h2 className="section-title">Trace Impact Down to the Meter</h2>
            <p className="section-subtitle">
              Trace affected consumers through feeder and transformer relationships to understand outage impact.
            </p>
          </div>

          <div className="impact-canvas-card">
            <div className="impact-canvas-topbar">
              <div className="canvas-title-group">
                <Activity size={14} className="icon-green" />
                <span>Downstream Topology Tracing</span>
              </div>
              <span className="preview-indicator-badge">Illustrative product preview</span>
            </div>

            <div className="impact-topology-layout">
              {/* TOPOLOGY TREE AREA */}
              <div className="topology-tree-container">
                {/* Subtle GIS map vector background overlay */}
                <svg className="gis-faint-bg-svg" viewBox="0 0 600 420" preserveAspectRatio="none">
                  <path d="M0 60 Q 150 80 300 50 T 600 70" stroke="#E5E9E2" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
                  <path d="M0 190 Q 200 160 400 210 T 600 180" stroke="#E5E9E2" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
                  <path d="M0 330 Q 250 300 450 350 T 600 310" stroke="#E5E9E2" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
                  <line x1="150" y1="0" x2="150" y2="420" stroke="#ECEEE5" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="300" y1="0" x2="300" y2="420" stroke="#ECEEE5" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="450" y1="0" x2="450" y2="420" stroke="#ECEEE5" strokeWidth="1" strokeDasharray="3 3" />
                </svg>

                {/* Substation (Root Node) */}
                <div className="top-root-wrapper">
                  <div className="oms-node-card node-substation">
                    <div className="node-card-icon root-icon">
                      <Zap size={16} />
                    </div>
                    <div className="node-card-text">
                      <strong>Substation</strong>
                      <small>Main distribution station</small>
                    </div>
                  </div>
                </div>

                {/* Branch Lines SVG Connector */}
                <div className="connector-svg-wrapper">
                  <svg viewBox="0 0 400 50" className="connector-svg">
                    <line x1="200" y1="0" x2="200" y2="20" stroke="#B0C792" strokeWidth="2" />
                    <line x1="90" y1="20" x2="310" y2="20" stroke="#B0C792" strokeWidth="2" />
                    <line x1="90" y1="20" x2="90" y2="50" stroke="#4A7C59" strokeWidth="2" />
                    <line x1="310" y1="20" x2="310" y2="50" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="4 2" />
                    <circle cx="200" cy="20" r="3" fill="#4A7C59" />
                    <circle cx="90" cy="50" r="3" fill="#4A7C59" />
                    <circle cx="310" cy="50" r="3" fill="#EF4444" />
                  </svg>
                </div>

                {/* Two Branches Grid */}
                <div className="branches-grid">
                  {/* Branch 1: Normal Branch */}
                  <div className="branch-col normal-branch-col">
                    <div className="oms-node-card node-feeder-normal">
                      <div className="node-card-icon normal-icon">
                        <Activity size={15} />
                      </div>
                      <div className="node-card-text">
                        <strong>Feeder</strong>
                        <span className="status-pill-normal">● Normal · No active outage</span>
                      </div>
                    </div>
                  </div>

                  {/* Branch 2: Affected Branch */}
                  <div className="branch-col affected-branch-col">
                    <div className="oms-node-card node-feeder-affected">
                      <div className="node-card-icon affected-icon">
                        <AlertTriangle size={15} />
                      </div>
                      <div className="node-card-text">
                        <strong>Affected Feeder</strong>
                        <span className="status-pill-affected">▲ Impact area highlighted</span>
                      </div>
                    </div>

                    <div className="vertical-connector-line"></div>

                    <div className="oms-node-card node-affected-child">
                      <div className="node-card-icon affected-icon">
                        <Cpu size={15} />
                      </div>
                      <div className="node-card-text">
                        <strong>Transformer</strong>
                        <small>Capacity: illustrative</small>
                      </div>
                    </div>

                    <div className="vertical-connector-line"></div>

                    <div className="oms-node-card node-affected-child">
                      <div className="node-card-icon affected-icon">
                        <Users size={15} />
                      </div>
                      <div className="node-card-text">
                        <strong>Consumer Cluster</strong>
                        <small>Affected consumers</small>
                      </div>
                    </div>

                    <div className="vertical-connector-line"></div>

                    <div className="oms-node-card node-affected-child">
                      <div className="node-card-icon affected-icon">
                        <Radio size={15} />
                      </div>
                      <div className="node-card-text">
                        <strong>Smart Meter</strong>
                        <small>Recorded electrical readings</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIDE IMPACT SUMMARY CARD */}
              <div className="impact-summary-side-card">
                <div className="summary-card-header">
                  <div className="summary-title-row">
                    <Layers size={14} className="icon-green" />
                    <strong>IMPACT SUMMARY</strong>
                  </div>
                  <span className="summary-subtag">Illustrative product preview</span>
                </div>

                <div className="summary-metrics-list">
                  <div className="summary-metric-row">
                    <span className="summary-label">Affected Consumers</span>
                    <span className="summary-badge-value">Illustrative</span>
                  </div>
                  <div className="summary-metric-row">
                    <span className="summary-label">Affected Feeders</span>
                    <span className="summary-badge-value">Illustrative</span>
                  </div>
                  <div className="summary-metric-row">
                    <span className="summary-label">Affected Transformers</span>
                    <span className="summary-badge-value">Illustrative</span>
                  </div>
                </div>

                <div className="summary-card-footer">
                  <span>Trace feeder and transformer relationships to understand outage impact.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RELIABILITY ANALYSIS — IEEE 1366 STANDARDS */}
      <section id="reliability-section" className="landing-reliability-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">IEEE 1366 STANDARDS</span>
            <h2 className="section-title">Reliability Analysis — IEEE 1366 Standards</h2>
            <p className="section-subtitle">
              Analyze SAIDI and SAIFI using outage and consumer impact data.
            </p>
          </div>

          <div className="reliability-formula-grid">
            {/* SAIDI Card */}
            <div className="formula-card">
              <div className="formula-card-header">
                <h3>SAIDI Formula</h3>
                <span className="formula-code">System Average Interruption Duration Index</span>
              </div>
              <div className="formula-body">
                <div className="math-expression">
                  <span className="eq-label">SAIDI =</span>
                  <div className="fraction font-mono">
                    <span className="numerator">Σ ( Nᵢ × Uᵢ )</span>
                    <span className="denominator">Nₜ</span>
                  </div>
                </div>
                <div className="formula-definitions">
                  <p><strong>Nᵢ:</strong> Number of affected consumers in interruption i</p>
                  <p><strong>Uᵢ:</strong> Total restoration duration for interruption i</p>
                  <p><strong>Nₜ:</strong> Total number of served grid consumers</p>
                </div>
              </div>
              <div className="formula-footer">
                <span className="preview-tag">Illustrative preview</span>
                <span className="sample-stat">Calculated via outage logs</span>
              </div>
            </div>

            {/* SAIFI Card */}
            <div className="formula-card">
              <div className="formula-card-header">
                <h3>SAIFI Formula</h3>
                <span className="formula-code">System Average Interruption Frequency Index</span>
              </div>
              <div className="formula-body">
                <div className="math-expression">
                  <span className="eq-label">SAIFI =</span>
                  <div className="fraction font-mono">
                    <span className="numerator">Σ Nᵢ</span>
                    <span className="denominator">Nₜ</span>
                  </div>
                </div>
                <div className="formula-definitions">
                  <p><strong>Nᵢ:</strong> Number of affected consumers in interruption i</p>
                  <p><strong>Nₜ:</strong> Total number of served grid consumers</p>
                  <p><strong>Metric:</strong> Measures average interruption frequency per customer.</p>
                </div>
              </div>
              <div className="formula-footer">
                <span className="preview-tag">Illustrative preview</span>
                <span className="sample-stat">Calculated via outage logs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SYSTEM MODULES */}
      <section id="modules-section" className="landing-modules-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-badge">OMS MODULES</span>
            <h2 className="section-title">System Modules</h2>
            <p className="section-subtitle">
              Integrated operational modules built for utility grid operators, engineers, and administrators.
            </p>
          </div>

          <div className="modules-grid">
            <div className="module-card">
              <MapPin size={22} className="module-icon" />
              <h4>GIS Grid Map</h4>
              <p>Spatial asset topology with layer toggles, feeder routes, and outage overlays.</p>
            </div>

            <div className="module-card">
              <AlertTriangle size={22} className="module-icon" />
              <h4>Outage Logs</h4>
              <p>Comprehensive logging for active, planned, and restored outage incidents.</p>
            </div>

            <div className="module-card">
              <Database size={22} className="module-icon" />
              <h4>Asset Registry</h4>
              <p>Inventory management for substations, feeders, transformers, and smart meters.</p>
            </div>

            <div className="module-card">
              <Users size={22} className="module-icon" />
              <h4>Crew & Tickets</h4>
              <p>Work ticket dispatching, crew assignments, and restoration tracking.</p>
            </div>

            <div className="module-card">
              <Activity size={22} className="module-icon" />
              <h4>Consumer Impact</h4>
              <p>Downstream connectivity tracing from substations to individual meters.</p>
            </div>

            <div className="module-card">
              <BarChart2 size={22} className="module-icon" />
              <h4>Reliability</h4>
              <p>IEEE 1366 benchmark calculations for SAIDI, SAIFI, and historical trends.</p>
            </div>

            <div className="module-card">
              <FileText size={22} className="module-icon" />
              <h4>Reports</h4>
              <p>PDF and tabular export generation for regulatory compliance and audit logs.</p>
            </div>

            <div className="module-card">
              <Shield size={22} className="module-icon" />
              <h4>User Management</h4>
              <p>Role-based access control (RBAC), operator permissions, and administrator controls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. AUTHORIZED OMS ACCESS */}
      <section id="security-section" className="landing-security-section">
        <div className="section-container">
          <div className="security-card">
            <div className="security-content">
              <div className="security-badge-top">
                <Lock size={14} /> ENTERPRISE SECURITY
              </div>
              <h2 className="security-title">Authorized OMS Access</h2>
              <p className="security-description">
                The Eficaa Smart Grid OMS employs strict security protocols to protect utility operational assets and customer data.
              </p>
              <div className="security-features-grid">
                <div className="sec-feature-item">
                  <Check size={16} className="sec-icon" />
                  <span>JWT Authentication</span>
                </div>
                <div className="sec-feature-item">
                  <Check size={16} className="sec-icon" />
                  <span>Role-Based Access</span>
                </div>
                <div className="sec-feature-item">
                  <Check size={16} className="sec-icon" />
                  <span>Administrator Controls</span>
                </div>
                <div className="sec-feature-item">
                  <Check size={16} className="sec-icon" />
                  <span>Protected Operational Data</span>
                </div>
              </div>
            </div>
            <div className="security-badge-illustration">
              <Shield size={72} color="#4A7C59" />
              <span className="sec-label">Authorized Personnel Only</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="landing-cta-section">
        <div className="section-container">
          <div className="cta-box">
            <h2>Eficaa Smart Grid OMS</h2>
            <p>From planned outages to reliability insights.</p>
            <button className="btn-landing-primary btn-large" onClick={handleLoginClick}>
              {user ? "Go to Dashboard" : "Login to OMS"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Zap size={16} fill="#4A7C59" color="#4A7C59" />
            <span>Eficaa Smart Grid Outage Management System</span>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Eficaa. All rights reserved. Authorized Utility Operations Center.
          </div>
        </div>
      </footer>
    </div>
  );
}
