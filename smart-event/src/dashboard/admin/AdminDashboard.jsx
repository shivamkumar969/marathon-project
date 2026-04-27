import CreateEvent from "../../pages/CreateEvent";
import AllEvents from "../../pages/AllEvents";
import Analytics from "../../pages/Analytics";
import ManageUsers from "../../pages/ManageUsers";
import CoordinatorAllocations from "../../pages/CoordinatorAllocations";
import PaymentHistory from "../../pages/PaymentHistory";
import ManageCourses from "../../pages/ManageCourses";
import CoordinatorRegistrations from "../../pages/CoordinatorRegistrations";
import ParticipantProfile from "../../components/ParticipantProfile";
import ReportManagement from "../../components/ReportManagement";

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function AdminDashboard() {
  const location = useLocation();
  const currentHash = location.hash || "#analytics";

  // When changing tabs, ensure we scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentHash]);
  return (
    <div className="font-sans">
      <div className="w-full">
        {currentHash === "#create-event" && (
          <div className="animate-fadeIn">
            <CreateEvent />
          </div>
        )}

        {currentHash === "#analytics" && (
          <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-fuchsia-900/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">Analytics Overview</h2>
            <Analytics />
          </div>
        )}

        {currentHash === "#manage-events" && (
          <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-fuchsia-900/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Events</h2>
            <AllEvents />
          </div>
        )}

        {currentHash === "#results" && (
          <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-fuchsia-900/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">Event Results & Winners</h2>
            <CoordinatorRegistrations />
          </div>
        )}

        {currentHash === "#manage-users" && (
          <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-fuchsia-900/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">Manage System Users</h2>
            <ManageUsers />
          </div>
        )}

        {currentHash === "#allocations" && (
          <CoordinatorAllocations />
        )}

        {currentHash === "#payments" && (
          <PaymentHistory />
        )}

        {currentHash === "#courses" && (
          <ManageCourses />
        )}

        {currentHash === "#reports" && (
          <ReportManagement />
        )}

        {currentHash === "#profile" && (
          <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-fuchsia-900/30 animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
            <ParticipantProfile />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;