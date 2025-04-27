import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout Components
import Layout from "./components/layout/Layout";

// Page Components
import Dashboard from "./pages/Dashboard";
import DataUpload from "./pages/DataUpload";
import DataViewer from "./pages/DataViewer";
import DataCleaner from "./pages/DataCleaner";
import Visualizations from "./pages/Visualizations";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import ReportView from "./pages/ReportView";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { DatasetProvider } from "./context/DatasetContext";

function App() {
  const url = "http://localhost:5000/";
  return (
    <AuthProvider>
      <DatasetProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login url={url} />} />
            <Route path="/register" element={<Register url={url} />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard url={url} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <DataUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datasets/:id"
              element={
                <ProtectedRoute>
                  <DataViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datasets/:id/clean"
              element={
                <ProtectedRoute>
                  <DataCleaner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datasets/:id/visualize"
              element={
                <ProtectedRoute>
                  <Visualizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/datasets/:id/insights"
              element={
                <ProtectedRoute>
                  <AIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <ProtectedRoute>
                  <ReportView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "rounded-md shadow-md",
            duration: 5000,
            style: {
              background: "#fff",
              color: "#333",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </DatasetProvider>
    </AuthProvider>
  );
}

export default App;
