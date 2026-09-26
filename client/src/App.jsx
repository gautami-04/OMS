import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Layout from "./components/Layout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GridMap from "./pages/GridMap";
import Outages from "./pages/Outages";
import Assets from "./pages/Assets";
import CrewTickets from "./pages/CrewTickets";
import ConsumerImpact from "./pages/ConsumerImpact";
import Reports from "./pages/Reports";
import Reliability from "./pages/Reliability";
import UserManagement from "./pages/UserManagement";

function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC LANDING & AUTH ROUTES */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Landing user={user} />
            )
          }
        />

        <Route
          path="/landing"
          element={<Landing user={user} />}
        />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={setUser} />
            )
          }
        />

        {/* COMPATIBILITY ALIAS ROUTES */}
        <Route path="/grid-map" element={<Navigate to="/map" replace />} />
        <Route path="/crew-tickets" element={<Navigate to="/crew" replace />} />
        <Route path="/user-management" element={<Navigate to="/users" replace />} />

        {/* PROTECTED APP ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <Dashboard user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <GridMap user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/outages"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <Outages user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assets"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <Assets user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/crew"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <CrewTickets user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/consumer-impact"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <ConsumerImpact user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <Reports user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reliability"
          element={
            <ProtectedRoute user={user}>
              <Layout user={user}>
                <Reliability user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ROLE PROTECTED USER MANAGEMENT */}
        <Route
          path="/users"
          element={
            <ProtectedRoute user={user} allowedRoles={["Administrator"]}>
              <Layout user={user}>
                <UserManagement user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* FALLBACK CATCH-ALL */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;