import { useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import AllEvents from "../../pages/AllEvents";
import MyRegistrations from "../../pages/MyRegistrations";
import Certificates from "../../pages/Certificates";
import ParticipantProfile from "../../components/ParticipantProfile";

function ParticipantDashboard() {
  const location = useLocation();
  const hash = location.hash || "#dashboard";
  
  // Re-read user from sessionStorage on every render to ensure it's in sync after profile updates
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    certificatesCount: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [regRes, certRes, eventRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/api/registrations/user/${user._id}`),
          axios.get(`${config.API_BASE_URL}/api/winners`),
          axios.get(`${config.API_BASE_URL}/api/events`)
        ]);

        const userWinners = certRes.data.filter(w => w.userId?._id === user._id);
        const activeEvents = eventRes.data.filter(e => e.isFinalized && new Date(e.date) >= new Date());

        setStats({
          totalRegistrations: regRes.data.length,
          certificatesCount: userWinners.length,
          upcomingEvents: activeEvents.length
        });
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };
    fetchStats();
  }, [user._id]);

  const renderContent = () => {
    switch (hash) {
      case "#profile":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-6">Profile Settings</h2>
            <p className="text-slate-400 mb-8">Manage your personal information and contact details.</p>
            <ParticipantProfile />
          </div>
        );
      case "#registrations":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-6">My Registrations</h2>
            <p className="text-slate-400 mb-8">Manage your event participations and team details.</p>
            <MyRegistrations />
          </div>
        );
      case "#certificates":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-white mb-6">My Certificates</h2>
            <p className="text-slate-400 mb-8">View and download your official participation and achievement certificates.</p>
            <Certificates />
          </div>
        );
      case "#dashboard":
      default:
        return (
          <div className="animate-fadeIn space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all"></div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Registrations</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-black text-white">{stats.totalRegistrations}</h3>
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Wins & Certificates</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-black text-white">{stats.certificatesCount}</h3>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Active Events</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-black text-white">{stats.upcomingEvents}</h3>
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-[#1a1325] border border-fuchsia-500/30 p-8 md:p-10 shadow-[0_0_40px_rgba(147,51,234,0.15)]">
              <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-fuchsia-500/10 blur-[100px] pointer-events-none rounded-full transform rotate-45"></div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-400 mb-4 tracking-tight">
                    Welcome Back, {user.name?.split(" ")[0]}!
                  </h1>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    Explore upcoming competitions, join forces with top talent using our AI matching system, and showcase your skills to the world.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/participant#registrations" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 px-6 rounded-xl backdrop-blur-md transition-all flex items-center gap-2">
                      <span>📝</span> My Events
                    </Link>
                    <Link to="/participant#profile" className="bg-fuchsia-600/20 hover:bg-fuchsia-600/40 text-fuchsia-300 border border-fuchsia-500/30 font-bold py-3 px-6 rounded-xl backdrop-blur-md transition-all flex items-center gap-2">
                      <span>👤</span> Edit Profile
                    </Link>
                  </div>
                </div>
                
                <div className="hidden md:flex justify-end relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-fuchsia-500/20 to-transparent blur-3xl rounded-full"></div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-fuchsia-500/20 blur-2xl rounded-full animate-pulse"></div>
                    {user.profileImage ? (
                      <img 
                        src={config.getImageUrl(user.profileImage)} 
                        alt="Profile" 
                        className="w-48 h-48 rounded-[2rem] object-cover border-4 border-white/10 shadow-2xl relative z-10 transform rotate-3 hover:rotate-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-7xl font-black shadow-2xl relative z-10 transform rotate-3 hover:rotate-0 transition-all duration-500 border-4 border-white/10">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                      <span className="text-2xl">🚀</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Events Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-8 border-b border-fuchsia-900/30 pb-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span className="text-fuchsia-400">⚡</span> Available Events
                </h2>
                <Link to="/participant#registrations" className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-bold transition-all">View All Your Registrations →</Link>
              </div>
              <AllEvents />
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

export default ParticipantDashboard;