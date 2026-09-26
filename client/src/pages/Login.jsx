import { useState } from "react";
import { Zap, Lock, Mail, AlertCircle, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authApi } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotNotice, setForgotNotice] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stitch-login-page">
      <div className="login-split-container">
        {/* LEFT COLUMN: GIS / NETWORK GRAPHIC */}
        <div className="login-visual-side">
          <button className="back-to-landing-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} /> Back to Landing Page
          </button>

          <div className="visual-brand">
            <div className="visual-brand-icon">
              <Zap size={22} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <div>
              <h2>Eficaa Smart Grid OMS</h2>
              <p>GIS-Based Utility Outage Operations</p>
            </div>
          </div>

          <div className="visual-diagram-card">
            <div className="diagram-header">
              <span className="diagram-title">DISTRIBUTION NETWORK PREVIEW</span>
              <span className="diagram-status-pill">OMS NETWORK VIEW</span>
            </div>
            <div className="diagram-body">
              <svg className="diagram-svg" viewBox="0 0 440 200">
                {/* Background Grid Lines */}
                <line x1="0" y1="50" x2="440" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="440" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="440" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="110" y1="0" x2="110" y2="200" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="220" y1="0" x2="220" y2="200" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                <line x1="330" y1="0" x2="330" y2="200" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                {/* Normal Branch (Top) */}
                <path d="M 64,100 L 130,50 L 220,50 L 310,50 L 390,50" stroke="#84A98C" strokeWidth="2" fill="none" />

                {/* Affected Branch (Bottom) */}
                <path d="M 64,100 L 130,150 L 220,150 L 310,150 L 390,150" stroke="#E53E3E" strokeWidth="2" strokeDasharray="6 3" fill="none" />

                {/* Level 1: Substation SUB-01 */}
                <circle cx="50" cy="100" r="14" fill="#3B5E45" stroke="#84A98C" strokeWidth="2" />
                <text x="50" y="104" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">SS</text>
                <text x="50" y="128" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">Substation SUB-01</text>

                {/* Level 2: Feeders */}
                {/* Feeder FDR-01 (Normal) */}
                <circle cx="130" cy="50" r="6" fill="#84A98C" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="130" y="38" fill="#CAD2C5" fontSize="8" fontWeight="600" textAnchor="middle">Feeder FDR-01</text>

                {/* Feeder FDR-04 (Affected) */}
                <circle cx="130" cy="150" r="6" fill="#E53E3E" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="130" y="168" fill="#FCA5A5" fontSize="8" fontWeight="600" textAnchor="middle">Feeder FDR-04</text>

                {/* Level 3: Transformers */}
                {/* Transformer (Normal) */}
                <circle cx="220" cy="50" r="6" fill="#84A98C" stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Transformer XFR-104 (Affected) */}
                <circle cx="220" cy="150" r="6" fill="#E53E3E" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="220" y="168" fill="#FCA5A5" fontSize="8" fontWeight="600" textAnchor="middle">Transformer XFR-104</text>

                {/* Level 4: Consumers */}
                {/* Consumers (Normal) */}
                <circle cx="310" cy="50" r="5" fill="#84A98C" />
                <text x="310" y="38" fill="#CAD2C5" fontSize="8" textAnchor="middle">Consumers</text>

                {/* Consumers (Affected) */}
                <circle cx="310" cy="150" r="5" fill="#E53E3E" />
                <text x="310" y="168" fill="#FCA5A5" fontSize="8" textAnchor="middle">Consumers</text>

                {/* Level 5: Smart Meters */}
                {/* Smart Meters (Normal) */}
                <rect x="384" y="44" width="12" height="12" rx="2" fill="#84A98C" />
                <text x="390" y="38" fill="#CAD2C5" fontSize="8" textAnchor="middle">Smart Meters</text>

                {/* Smart Meters (Affected) */}
                <rect x="384" y="144" width="12" height="12" rx="2" fill="#E53E3E" />
                <text x="390" y="168" fill="#FCA5A5" fontSize="8" textAnchor="middle">Smart Meters</text>
              </svg>

              {/* Compact Legend */}
              <div className="diagram-legend-bar">
                <span className="legend-item"><span className="legend-dot ss-dot"></span> Substation</span>
                <span className="legend-item"><span className="legend-dot fdr-dot"></span> Feeder</span>
                <span className="legend-item"><span className="legend-dot xfr-dot"></span> Transformer</span>
                <span className="legend-item"><span className="legend-dot cons-dot"></span> Consumer</span>
                <span className="legend-item"><span className="legend-dot meter-dot"></span> Smart Meter</span>
                <span className="legend-item"><span className="legend-dot alert-dot"></span> Affected branch</span>
              </div>
            </div>
          </div>

          <div className="visual-features">
            <span className="feat-item"><CheckCircle2 size={14} /> IEEE 1366 Reliability Metrics</span>
            <span className="feat-item"><CheckCircle2 size={14} /> GIS Asset Spatial Mapping</span>
            <span className="feat-item"><CheckCircle2 size={14} /> Real-time Outage Tracking</span>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN FORM CARD */}
        <div className="login-form-side">
          <div className="login-card-stitch">
            <div className="login-header-stitch">
              <div className="stitch-brand-logo">
                <Zap size={20} fill="#4A7C59" color="#4A7C59" />
              </div>
              <h1 className="login-title-stitch">Welcome Back</h1>
              <p className="login-subtitle-stitch">Sign in to access Smart Grid OMS</p>
            </div>

            {error && (
              <div className="login-error-alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {forgotNotice && (
              <div className="login-info-alert">
                <Shield size={16} />
                <span>Contact your utility system administrator to reset your credentials.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form-element">
              <div className="form-group-stitch">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={15} className="field-icon" />
                  <input
                    type="email"
                    className="input-control-stitch"
                    placeholder="admin@oms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group-stitch">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={15} className="field-icon" />
                  <input
                    type="password"
                    className="input-control-stitch"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-utility">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-label">Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setForgotNotice(!forgotNotice)}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="btn-signin-primary"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="login-credentials-hint">
              <span className="hint-title">Quick Demo Credentials:</span>
              <div className="hint-row"><strong>Admin:</strong> admin@oms.com / Admin@123</div>
              <div className="hint-row"><strong>Engineer:</strong> engineer@oms.com / Engineer@123</div>
            </div>

            <div className="login-footer-security">
              <Shield size={13} />
              <span>Authorized OMS users only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}