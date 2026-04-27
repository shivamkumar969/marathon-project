import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function DashboardLayout({ children, role }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const adminLinks = [
    { name: "Analytics Overview", path: "/admin#analytics", icon: "📊" },
    { name: "Create Event", path: "/admin#create-event", icon: "📝" },
    { name: "Manage Events", path: "/admin#manage-events", icon: "🗓️" },
    { name: "Event Results & Winners", path: "/admin#results", icon: "🏆" },
    { name: "Manage Courses", path: "/admin#courses", icon: "📚" },
    { name: "Manage Users", path: "/admin#manage-users", icon: "👥" },
    { name: "Reports & Downloads", path: "/admin#reports", icon: "📄" },
    { name: "Coordinator Allocations", path: "/admin#allocations", icon: "📋" },
    { name: "Payments & Revenue", path: "/admin#payments", icon: "💳" },
    { name: "Profile Settings", path: "/admin#profile", icon: "👤" },
  ];

  const coordinatorLinks = [
    { name: "Dashboard", path: "/coordinator", icon: "📊" },
    { name: "My Assigned Events", path: "/coordinator#events", icon: "📅" },
    { name: "Registrations & Results", path: "/coordinator#registrations", icon: "👥" },
    { name: "Payments & Revenue", path: "/coordinator#payments", icon: "💳" },
    { name: "Analytics Overview", path: "/coordinator#analytics", icon: "📊" },
    { name: "Profile Settings", path: "/coordinator#profile", icon: "👤" },
  ];

  const participantLinks = [
    { name: "Dashboard", path: "/participant", icon: "📊" },
    { name: "My Registrations", path: "/participant#registrations", icon: "📝" },
    { name: "Certificates", path: "/participant#certificates", icon: "🎓" },
    { name: "Profile Settings", path: "/participant#profile", icon: "👤" },
  ];

  const links = role === "admin" ? adminLinks : role === "coordinator" ? coordinatorLinks : participantLinks;

  return (
    <div className="flex h-screen bg-[#0f0a19] text-white overflow-hidden font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1a1325] border-r border-fuchsia-900/30 transition-all duration-300">
        <div className="h-20 flex items-center px-8 border-b border-fuchsia-900/30">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 tracking-tight">
              SMART<span className="font-light text-white">Event</span>
            </span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {links.map((link) => {
            const isActive = location.pathname + location.hash === link.path || (location.pathname === link.path && location.hash === "" && (link.path === "/admin" || link.path === "/participant" || link.path === "/coordinator" || link.path.includes("#analytics")));
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                  ? "bg-fuchsia-600 shadow-[0_0_15px_rgba(192,38,211,0.4)] text-white font-semibold" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-fuchsia-900/30 space-y-4">
          <div className="flex items-center gap-3 px-2">
            {user.profileImage ? (
              <img 
                src={`http://localhost:5000${user.profileImage}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover border border-fuchsia-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-500/20"
          >
            <span className="text-lg">🚪</span>
            <span className="font-semibold text-sm">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Gradients for Main Content */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-[#1a1325]/80 backdrop-blur-md border-b border-fuchsia-900/30 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white hidden sm:block">
              Welcome Back, {user.name?.split(" ")[0]}!
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 bg-[#0f0a19] py-1.5 px-3 rounded-full border border-fuchsia-900/30 cursor-pointer hover:border-fuchsia-500/50 transition-colors">
              {user.profileImage ? (
                <img 
                  src={`http://localhost:5000${user.profileImage}`} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-fuchsia-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium hidden md:block text-slate-300 pr-2">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="w-64 bg-[#1a1325] h-full relative z-10 flex flex-col border-r border-fuchsia-900/30">
            <div className="h-20 flex items-center justify-between px-6 border-b border-fuchsia-900/30">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500">
                SMARTEvent
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {links.map((link) => {
                const isActive = location.pathname + location.hash === link.path || (location.pathname === link.path && location.hash === "" && (link.path === "/admin" || link.path === "/participant" || link.path === "/coordinator" || link.path.includes("#analytics")));

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                      ? "bg-fuchsia-600 text-white font-semibold shadow-lg shadow-fuchsia-600/30" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
