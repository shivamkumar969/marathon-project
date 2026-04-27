import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
                <span className="text-white font-bold text-lg sm:text-xl">S</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-colors duration-300 whitespace-nowrap">
                SMART<span className="font-light hidden sm:inline">Event</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 mr-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <span className="text-slate-300 text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{user.name}</span>
                </div>
                
                <Link
                  to={`/${user.role}`}
                  className="text-slate-300 hover:text-white px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-rose-600 hover:border-rose-500 text-slate-300 hover:text-white border border-slate-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;