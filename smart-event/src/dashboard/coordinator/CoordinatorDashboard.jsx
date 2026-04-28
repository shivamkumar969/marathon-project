import { useLocation, Link } from "react-router-dom";
import CoordinatorRegistrations from "../../pages/CoordinatorRegistrations";
import AllEvents from "../../pages/AllEvents";
import PaymentHistory from "../../pages/PaymentHistory";
import Analytics from "../../pages/Analytics";
import ParticipantProfile from "../../components/ParticipantProfile";
import config from "../../config";

function CoordinatorDashboard() {
  const location = useLocation();
  const hash = location.hash || "#dashboard";

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const renderContent = () => {
    switch (hash) {
      case "#profile":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-6">Profile Settings</h2>
            <p className="text-slate-400 mb-8">Manage your personal information and coordinator profile.</p>
            <ParticipantProfile />
          </div>
        );
      case "#events":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-6">My Assigned Events</h2>
            <p className="text-slate-400 mb-8">View the status of events you are coordinating. Ensure details are up to date.</p>
            <AllEvents />
          </div>
        );
      case "#registrations":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-6">Registrations & Results</h2>
            <p className="text-slate-400 mb-8">Manage participant attendance, verify teams, and finalize the official winners.</p>
            <CoordinatorRegistrations />
          </div>
        );
      case "#payments":
        return (
          <PaymentHistory />
        );
      case "#analytics":
        return (
          <Analytics />
        );
      case "#dashboard":
      default:
        return (
          <div className="animate-fadeIn space-y-8">
            {/* Premium Coordinator Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-[#1a1325] border border-blue-500/30 p-8 md:p-10 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[150%] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full transform -rotate-12"></div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400 mb-4 tracking-tight">
                    Welcome, {user.name?.split(" ")[0]}!
                  </h1>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    You are at the helm. Manage your assigned events, verify participant attendance in real-time, and officially crown the champions.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/coordinator#events" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2">
                      <span>📅</span> View Events
                    </Link>
                    <Link to="/coordinator#profile" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 px-6 rounded-xl backdrop-blur-md transition-all flex items-center gap-2">
                      <span>👤</span> My Profile
                    </Link>
                  </div>
                </div>
                
                <div className="hidden md:flex justify-end relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-blue-500/20 to-transparent blur-3xl rounded-full"></div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
                    {user.profileImage ? (
                      <img 
                        src={config.getImageUrl(user.profileImage)} 
                        alt="Profile" 
                        className="w-48 h-48 rounded-[2rem] object-cover border-4 border-white/10 shadow-2xl relative z-10 transform -rotate-3 hover:rotate-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-7xl font-black shadow-2xl relative z-10 transform -rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-white/10">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '4s' }}>
                      <span className="text-2xl">🛡️</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 mt-12">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <Link to="/coordinator#events" className="bg-[#1a1325]/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-fuchsia-900/30 flex flex-col items-center justify-center text-center hover:bg-blue-500/10 hover:border-blue-500/50 transition-all group cursor-pointer">
                <div className="bg-blue-500/20 text-blue-400 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Event Management</h3>
                <p className="text-slate-400 text-sm mt-2">Monitor the details of the competitions you are hosting</p>
              </Link>

              <Link to="/coordinator#registrations" className="bg-[#1a1325]/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-fuchsia-900/30 flex flex-col items-center justify-center text-center hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group cursor-pointer">
                <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Participant Records</h3>
                <p className="text-slate-400 text-sm mt-2">Mark attendance and award certificates to winners</p>
              </Link>
            </div>

            {/* Extra Premium Feature: Coordinator Guidelines Widget */}
            <div className="mt-12 bg-slate-900/50 border border-slate-700 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-400">⚡</span> Coordinator Guidelines
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex gap-3">
                  <span className="text-emerald-400">✓</span> 
                  <span><strong>Step 1:</strong> Always mark individual team members as 'Present' before the event concludes to ensure they receive Participation Certificates.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400">✓</span> 
                  <span><strong>Step 2:</strong> Declare the 1st, 2nd, and 3rd place winners accurately. This is a permanent record.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-rose-400">!</span> 
                  <span><strong>Final Step:</strong> Clicking the "Confirm & Publish Results" button will instantly generate and email digital certificates to all attendees. This action cannot be undone.</span>
                </li>
              </ul>
            </div>

          </div>
        );
    }
  };

  return (
    <div className="font-sans min-h-[70vh]">
      {renderContent()}
    </div>
  );
}

export default CoordinatorDashboard;