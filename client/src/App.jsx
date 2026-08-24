import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Layout from "./components/Layout";

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
        {/* PUBLIC AUTH ROUTE */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={setUser} />
            )
          }
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