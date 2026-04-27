import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { Suspense, lazy } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Registar";
import Navbar from "./pages/Navbar";
import EditEvent from "./pages/EditEvent";

const AdminDashboard = lazy(() => import("./dashboard/admin/AdminDashboard"));
const CoordinatorDashboard = lazy(() => import("./dashboard/coordinator/CoordinatorDashboard"));
const ParticipantDashboard = lazy(() => import("./dashboard/participant/ParticipantDashboard"));

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = ["/admin", "/coordinator", "/participant"].some(path => location.pathname.startsWith(path)) || location.pathname.startsWith("/edit");

  return (
    <div className={`min-h-screen relative overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-200 ${isDashboardRoute ? 'bg-[#0f0a19]' : 'bg-slate-950 text-slate-200'}`}>
      {/* Animated Background Orbs for Public Routes Only */}
      {!isDashboardRoute && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
          <div className="fixed top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }}></div>
          <Navbar />
        </>
      )}

      <div className={isDashboardRoute ? "" : "relative z-10"}>
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="text-fuchsia-400 text-xl font-bold animate-pulse">Loading Application Module...</div>
          </div>
        }>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <DashboardLayout role="admin">
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute role={["admin", "coordinator"]}>
                  <DashboardLayout role={JSON.parse(sessionStorage.getItem("user") || "{}").role}>
                    <EditEvent />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Coordinator */}
            <Route
              path="/coordinator"
              element={
                <ProtectedRoute role="coordinator">
                  <DashboardLayout role="coordinator">
                    <CoordinatorDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Participant */}
            <Route
              path="/participant"
              element={
                <ProtectedRoute role="participant">
                  <DashboardLayout role="participant">
                    <ParticipantDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;