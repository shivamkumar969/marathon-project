import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import config from "../config";

// Helper component for counting numbers up
const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart easing
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}</>;
};

function Home() {
  const [stats, setStats] = useState({
    events: 0,
    participants: 0,
    completedEvents: 0,
    boysEvents: 0,
    girlsEvents: 0
  });
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const fetchStats = async () => {
      try {
        const [eventsRes, usersRes, regRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/events`),
        axios.get(`${config.API_BASE_URL}/api/users`),
        axios.get(`${config.API_BASE_URL}/api/registrations`)
        ]);

        const totalEvents = eventsRes.data.length;
        // Specifically filter out admins and coordinators
        const participantUsers = usersRes.data.filter(u => u.role !== "admin" && u.role !== "coordinator");
        const totalParticipants = participantUsers.length;
        
        // Calculate completed events
        const completedCount = eventsRes.data.filter(e => e.resultsDeclared).length;
        
        // Calculate gender specific events
        const boysCount = eventsRes.data.filter(e => e.genderParticipation === "male").length;
        const girlsCount = eventsRes.data.filter(e => e.genderParticipation === "female").length;

        setStats({
          events: totalEvents,
          participants: totalParticipants,
          completedEvents: completedCount,
          boysEvents: boysCount,
          girlsEvents: girlsCount
        });
        
        // Save the latest 3 events for the Featured section
        setFeaturedEvents(eventsRes.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load platform statistics", error);
      }
    };

    fetchStats();
  }, []);
  return (
    <div className="min-h-screen bg-[#05050f] flex flex-col relative overflow-hidden">
      {/* Background decorations - Enhanced with floating elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      
      {/* Floating Decorative Icons in Background */}
      <div className="absolute top-[20%] left-[10%] text-6xl opacity-10 animate-bounce" style={{ animationDuration: '4s' }}>🏆</div>
      <div className="absolute bottom-[30%] right-[15%] text-6xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>📅</div>
      <div className="absolute top-[40%] right-[10%] w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] animate-pulse"></div>

      <main className="flex-grow flex flex-col items-center p-6 relative z-10 pt-16">
        <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] transition-shadow cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            <span className="text-sm font-medium text-slate-300">Smart Event Manager 2.0 is live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 tracking-tight leading-tight mb-6">
            The Future of <br className="hidden md:block" />
            <span className="bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Academic Events</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive web platform for seamless event data collection, advanced analytics, and dynamic participant management. Designed specifically for academic excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-lg transition-all duration-300 hover:border-slate-500"
            >
              Sign In
            </Link>
          </div>

          {/* Dynamic Statistics Bar with Counting Effect */}
          <div className={`flex flex-wrap justify-center gap-6 md:gap-12 py-8 border-y border-slate-800/60 bg-slate-900/30 backdrop-blur-sm rounded-3xl mx-auto max-w-3xl mb-20 shadow-[0_0_40px_rgba(79,70,229,0.05)] hover:shadow-[0_0_60px_rgba(79,70,229,0.1)] transition-shadow duration-500`}>
            <div className="text-center px-4 transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-1 filter drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                <CountUp end={stats.events} />+
              </div>
              <div className="text-slate-400 text-sm md:text-base font-semibold uppercase tracking-widest">Active Events</div>
            </div>
            
            <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
            
            <div className="text-center px-4 transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300 mb-1 filter drop-shadow-[0_0_10px_rgba(192,38,211,0.3)]">
                <CountUp end={stats.participants} />+
              </div>
              <div className="text-slate-400 text-sm md:text-base font-semibold uppercase tracking-widest">Global Participants</div>
            </div>
            
            <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
            
            <div className="text-center px-4 transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-1 filter drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <CountUp end={stats.completedEvents} />+
              </div>
              <div className="text-slate-400 text-sm md:text-base font-semibold uppercase tracking-widest">Completed Events</div>
            </div>
          </div>

          {/* Gender Specific Events Counting */}
          <div className={`flex flex-wrap justify-center gap-6 md:gap-16 mb-20 transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
                <div className="text-4xl">👦</div>
                <div className="text-left">
                  <div className="text-3xl font-black text-white"><CountUp end={stats.boysEvents} /></div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-tighter">Boys Events</div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
                <div className="text-4xl">👧</div>
                <div className="text-left">
                  <div className="text-3xl font-black text-white"><CountUp end={stats.girlsEvents} /></div>
                  <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-tighter">Girls Events</div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Upcoming Events Section */}
          <div className="w-full max-w-5xl mx-auto mb-20 text-left">
            <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
              <span className="text-fuchsia-500">⚡</span> Live & Upcoming Events
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                  <p className="text-slate-400">Loading live events...</p>
                </div>
              ) : (
                featuredEvents.map((event, index) => (
                  <div key={event._id || index} className="group bg-slate-900/80 backdrop-blur-sm border border-slate-700 hover:border-fuchsia-500/50 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(192,38,211,0.15)] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                          {event.type === 'team' ? 'Team Event' : 'Individual'}
                        </span>
                        {event.status === 'open' && (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-3">{event.description}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        🗓️ {event.date ? new Date(event.date).toLocaleDateString("en-GB").replace(/\//g, "-") : 'TBD'}
                      </span>
                      <Link to="/register" className="text-fuchsia-400 font-bold group-hover:text-fuchsia-300 transition-colors">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-center mt-8">
              <Link to="/register" className="inline-block border border-slate-700 hover:bg-slate-800 text-slate-300 px-6 py-2 rounded-full font-medium transition-colors">
                Explore all events
              </Link>
            </div>
          </div>
          
          {/* Features Grid with Enhanced Hover Transitions */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md hover:bg-slate-800/60 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">📊</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Deep Analytics</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">Visualize event success with real-time data stats and comprehensive reporting dashboards.</p>
            </div>
            
            <div className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md hover:bg-slate-800/60 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">👥</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Smart Teams</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">Configure complex individual or team participation rules, including gender-specific requirements.</p>
            </div>
            
            <div className="group p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">🏆</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">Auto Certificates</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">Instantly generate and distribute participation and achievement certificates to attendees.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;