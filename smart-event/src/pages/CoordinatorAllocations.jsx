import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../services/userApi";
import { getEvents, updateEvent } from "../services/eventApi";
import Toast from "../components/Toast";
import config from "../config";

function CoordinatorAllocations() {
  const [coordinators, setCoordinators] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [assigningId, setAssigningId] = useState(null); // ID of coordinator currently picking an event

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([getAllUsers(), getEvents()]);
      const allCoordinators = usersRes.data.filter(u => u.role === "coordinator");
      setCoordinators(allCoordinators);
      setEvents(eventsRes.data);
      setLoading(false);
    } catch (error) {
      setNotification({ message: "Failed to load data", type: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteCoordinator = async (id, name) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to completely remove ${name} from the system? All their event assignments will be cleared.`)) return;

    try {
      await deleteUser(id);
      setNotification({ message: `${name} has been removed from the system`, type: "success" });
      fetchData();
    } catch (error) {
      setNotification({ message: "Failed to remove coordinator", type: "error" });
    }
  };

  const handleAssign = async (coordinatorId, eventId) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const newCoordinators = [...(event.coordinators || []), coordinatorId];
    
    try {
      await updateEvent(eventId, { coordinators: newCoordinators });
      setNotification({ message: `Assigned to ${event.title}`, type: "success" });
      setAssigningId(null);
      fetchData(); // Refresh data
    } catch (error) {
      setNotification({ message: "Assignment failed", type: "error" });
    }
  };

  const handleDeassign = async (coordinatorId, eventId) => {
    if (!window.confirm("Are you sure you want to deassign this coordinator?")) return;
    
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const newCoordinators = (event.coordinators || []).filter(id => id !== coordinatorId);
    
    try {
      await updateEvent(eventId, { coordinators: newCoordinators });
      setNotification({ message: `Deassigned from ${event.title}`, type: "info" });
      fetchData(); // Refresh data
    } catch (error) {
      setNotification({ message: "Deassignment failed", type: "error" });
    }
  };

  const isRegistrationOpen = (event) => {
    const now = new Date();
    if (event.registrationOpenDate && now < new Date(event.registrationOpenDate)) return false;
    if (event.registrationCloseDate && now > new Date(event.registrationCloseDate)) return false;
    return true;
  };

  if (loading) {
    return <div className="text-slate-400 p-6 text-center animate-pulse">Synchronizing assignments...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-0">
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-fuchsia-900/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
              <span className="text-4xl">🏷️</span> Allocation <span className="text-fuchsia-500">Center</span>
            </h2>
            <p className="text-slate-400 mt-1 font-medium">Control center for event management and coordinator responsibilities.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-fuchsia-500/10 rounded-full border border-fuchsia-500/20">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
            <span className="text-xs font-black text-fuchsia-400 uppercase tracking-widest">{coordinators.length} Live Managers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coordinators.map((coordinator) => {
            const assignedEvents = events.filter(e => e.coordinators && e.coordinators.includes(coordinator._id));
            const availableEvents = events.filter(e => !e.coordinators || !e.coordinators.includes(coordinator._id));
            
            return (
              <div key={coordinator._id} className="group relative bg-[#0f0a19]/60 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-fuchsia-500/40 transition-all duration-500 backdrop-blur-xl">
                {/* Header Section */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4 relative">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-fuchsia-600/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {coordinator.profileImage ? (
                      <img 
                        src={config.getImageUrl(coordinator.profileImage)} 
                        alt={coordinator.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerText = coordinator.name.charAt(0).toUpperCase();
                        }}
                      />
                    ) : (
                      coordinator.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-black text-lg leading-tight truncate tracking-tight">{coordinator.name}</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">{coordinator.email}</p>
                  </div>
                  
                  {/* Remove Coordinator Button */}
                  <button 
                    onClick={() => handleDeleteCoordinator(coordinator._id, coordinator.name)}
                    className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all duration-300"
                    title="Remove Coordinator from System"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                
                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Assignments</span>
                      <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded-md text-[10px] font-black ring-1 ring-fuchsia-500/20">
                        {assignedEvents.length} ACTIVE
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => setAssigningId(assigningId === coordinator._id ? null : coordinator._id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${assigningId === coordinator._id ? "bg-rose-500 text-white rotate-45" : "bg-white/5 text-slate-400 hover:bg-fuchsia-500 hover:text-white"}`}
                      title="Assign New Event"
                    >
                      <span className="text-xl font-bold">+</span>
                    </button>
                  </div>

                  {/* Quick Assign Dropdown */}
                  {assigningId === coordinator._id && (
                    <div className="mb-6 animate-slideDown overflow-hidden bg-white/5 rounded-2xl border border-white/10">
                      <div className="p-2 border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Available Events</div>
                      <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {availableEvents.length > 0 ? availableEvents.map(event => (
                          <button 
                            key={event._id}
                            onClick={() => handleAssign(coordinator._id, event._id)}
                            className="w-full text-left p-3 hover:bg-fuchsia-500 text-slate-300 hover:text-white text-xs font-bold transition-all border-b border-white/[0.02]"
                          >
                            {event.title}
                          </button>
                        )) : (
                          <div className="p-4 text-center text-[10px] text-slate-500 italic">All events already assigned</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {assignedEvents.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                      {assignedEvents.map(event => (
                        <div key={event._id} className="group/item relative bg-white/[0.03] p-4 rounded-2xl border border-white/5 border-l-4 border-l-fuchsia-500 hover:bg-white/[0.05] transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-slate-100 font-bold text-sm tracking-tight pr-6">{event.title}</h4>
                            <button 
                              onClick={() => handleDeassign(coordinator._id, event._id)}
                              className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-[9px] font-black transition-all border border-rose-500/20"
                              title="Remove Coordinator from this event"
                            >
                              <span>DEASSIGN</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase text-slate-500 font-black tracking-widest">{event.type}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest ${isRegistrationOpen(event) ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"}`}>
                              {isRegistrationOpen(event) ? "REG OPEN" : "REG CLOSED"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white/[0.01] rounded-3xl border border-dashed border-white/10 group-hover:border-fuchsia-500/20 transition-colors">
                      <span className="text-3xl mb-3 block opacity-30">📂</span>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No allocations found</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {coordinators.length === 0 && (
          <div className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
            <p className="text-slate-500 font-bold uppercase tracking-widest">System Query: No active coordinators found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoordinatorAllocations;
