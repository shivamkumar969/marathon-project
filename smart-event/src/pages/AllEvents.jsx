import { useEffect, useState } from "react";
import { getEvents, deleteEvent } from "../services/eventApi";
import { registerEvent, getMyRegistrations } from "../services/registrationApi";
import { useNavigate } from "react-router-dom";
import config from "../config";
import TeamRegistrationModal from "../components/TeamRegistrationModal";
import PaymentModal from "../components/PaymentModal";

function AllEvents() {
  const [events, setEvents] = useState([]);
  const [selectedTeamEvent, setSelectedTeamEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [maxFee, setMaxFee] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      const now = new Date();
      
      if (user.role === "coordinator") {
        const assigned = res.data.filter(ev => ev.coordinators?.includes(user._id));
        setEvents(assigned);
      } else if (user.role === "participant") {
        // Filter events based on registration window
        const visibleEvents = res.data.filter(ev => {
          if (!ev.registrationOpenDate || !ev.registrationCloseDate) return true;
          const open = new Date(ev.registrationOpenDate);
          const close = new Date(ev.registrationCloseDate);
          return now >= open && now <= close;
        });
        setEvents(visibleEvents);
      } else {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserRegistrations = async () => {
    if (user.role === "participant") {
      try {
        const res = await getMyRegistrations(user._id);
        const ids = new Set(res.data.map(reg => reg.eventId?._id));
        setRegisteredEventIds(ids);
      } catch (err) {
        console.error("Failed to fetch user registrations", err);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUserRegistrations();
  }, []);

  const handleRegister = async (event) => {
    if (!isInstituteAllowed(event)) {
      alert(`Access Denied: This event is exclusively for ${event.allowedInstitutes} students.`);
      return;
    }
    
    if (!isCourseAllowed(event)) {
      alert(`Access Denied: Your course (${user.course}) is not eligible for this event.`);
      return;
    }

    if (event.type === "team") {
      setSelectedTeamEvent(event);
      setIsModalOpen(true);
      return;
    }

    if (event.fee && event.fee > 0) {
      setPaymentAmount(event.fee);
      setPendingRegistrationData({
        userId: user._id,
        eventId: event._id,
        amountPaid: event.fee,
        paymentStatus: "paid"
      });
      setPaymentModalOpen(true);
      return;
    }

    executeRegistration({
        userId: user._id,
        eventId: event._id,
        amountPaid: 0,
        paymentStatus: "free"
    }, false);
  };

  const handleTeamSubmit = async (teamData) => {
    if (teamData.amountPaid > 0) {
      setPaymentAmount(teamData.amountPaid);
      setPendingRegistrationData({
        userId: user._id,
        eventId: selectedTeamEvent._id,
        teamName: teamData.teamName,
        teamMembers: teamData.teamMembers,
        amountPaid: teamData.amountPaid,
        paymentStatus: "paid"
      });
      setIsModalOpen(false);
      setPaymentModalOpen(true);
      return;
    }

    executeRegistration({
        userId: user._id,
        eventId: selectedTeamEvent._id,
        teamName: teamData.teamName,
        teamMembers: teamData.teamMembers,
        amountPaid: 0,
        paymentStatus: "free"
    }, true);
  };

  const executeRegistration = async (data, isTeam) => {
    try {
      await registerEvent(data);
      if (!isTeam) {
          alert(data.amountPaid > 0 ? "Payment Successful! Registered Successfully" : "Registered Successfully");
          setRegisteredEventIds(new Set([...registeredEventIds, data.eventId]));
      } else {
          setRegisteredEventIds(new Set([...registeredEventIds, data.eventId]));
          setSelectedTeamEvent(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Already Registered or Error occurred");
    }
  };

  const handlePaymentSuccess = () => {
     if (pendingRegistrationData) {
         executeRegistration(pendingRegistrationData, !!pendingRegistrationData.teamName);
         setPendingRegistrationData(null);
     }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteEvent(eventId);
        setEvents(events.filter(e => e._id !== eventId));
      } catch (err) {
        alert("Failed to delete event");
      }
    }
  };

  const isRegistrationOpen = (event) => {
    if (event.isFinalized === false) return false;
    const now = new Date();
    if (event.registrationOpenDate && now < new Date(event.registrationOpenDate)) return false;
    if (event.registrationCloseDate && now > new Date(event.registrationCloseDate)) return false;
    return true;
  };

  const isGenderAllowed = (event) => {
    if (!event.genderParticipation || event.genderParticipation === "any") return true;
    return user.gender === event.genderParticipation;
  };

  const isInstituteAllowed = (event) => {
    if (!event.allowedInstitutes || event.allowedInstitutes === "any") return true;
    return user.instituteType === event.allowedInstitutes;
  };

  const isCourseAllowed = (event) => {
    if (!event.allowedCourses || event.allowedCourses.length === 0) return true;
    return event.allowedCourses.includes(user.course);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" ? true : event.type === filterType;
    const matchesFee = !maxFee || event.fee <= Number(maxFee);
    
    let matchesDate = true;
    if (eventDate) {
      const eDate = event.date ? new Date(event.date).toISOString().split('T')[0] : null;
      matchesDate = eDate === eventDate;
    }

    return matchesSearch && matchesType && matchesFee && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setMaxFee("");
    setEventDate("");
  };

  return (
    <div className="mt-4">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 mb-10 bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 shadow-inner">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <span className="text-slate-500">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search events by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all duration-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Participation</option>
              <option value="individual">Individual Only</option>
              <option value="team">Team Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Max Budget (₹)</label>
            <input
              type="number"
              placeholder="Any price"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Specific Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-xl font-bold transition-all text-sm uppercase tracking-widest"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-slate-400 text-lg">No events found matching your search.</p>
          </div>
        )}
        {filteredEvents.map((event) => (
        <div
          key={event._id}
          className="relative group bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:border-fuchsia-500/30 flex flex-col md:flex-row h-auto md:h-56 mb-4"
        >
          {/* Compact Left Banner Thumbnail */}
          <div 
            className="w-full md:w-64 h-48 md:h-full relative overflow-hidden shrink-0 cursor-zoom-in"
            onClick={() => event.eventBanner && setPreviewImage(config.getImageUrl(event.eventBanner))}
          >
            {event.eventBanner ? (
              <img 
                src={config.getImageUrl(event.eventBanner)} 
                alt={event.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-fuchsia-600/20 to-purple-600/20 flex items-center justify-center">
                <span className="text-4xl opacity-30">📅</span>
              </div>
            )}
            
            {/* Status Badge Over Thumbnail */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
              <span className="px-3 py-1 bg-fuchsia-600/80 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                {event.type}
              </span>
              {user.role === "participant" && (
                <span className={`px-2 py-1 backdrop-blur-md text-white text-[8px] font-bold rounded-md uppercase tracking-tighter shadow-lg ${
                  !event.registrationOpenDate ? "bg-emerald-500/80" :
                  new Date() < new Date(event.registrationOpenDate) ? "bg-amber-500/80" :
                  new Date() > new Date(event.registrationCloseDate) ? "bg-rose-500/80" :
                  "bg-emerald-500/80"
                }`}>
                  {!event.registrationOpenDate ? "Open" :
                   new Date() < new Date(event.registrationOpenDate) ? "Upcoming" :
                   new Date() > new Date(event.registrationCloseDate) ? "Closed" :
                   "Active"}
                </span>
              )}
            </div>
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
               <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full backdrop-blur-md">🔍</span>
            </div>
          </div>

          {/* User-Friendly Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                  {event.title}
                </h3>
                <span className="text-amber-400 font-black text-sm">
                  {event.fee > 0 ? `₹${event.fee}` : "FREE"}
                </span>
              </div>
              
              <p className="text-slate-400 text-xs line-clamp-1 mb-4">
                {event.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Date</span>
                  <span className="text-white text-sm font-semibold">{event.date ? new Date(event.date).toLocaleDateString("en-GB").replace(/\//g, "-") : "TBD"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Venue</span>
                  <span className="text-white text-sm font-semibold truncate">{event.venue || "TBD"}</span>
                </div>
                {event.type === "team" && (
                  <div className="flex flex-col hidden md:flex">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Team Size</span>
                    <span className="text-white text-sm font-semibold">Max {event.teamSize}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
              {user.role === "participant" && (
                <button
                  onClick={() => handleRegister(event)}
                  disabled={
                    event.isFinalized === false || 
                    !isRegistrationOpen(event) || 
                    !isGenderAllowed(event) || 
                    !isInstituteAllowed(event) || 
                    !isCourseAllowed(event) || 
                    registeredEventIds.has(event._id)
                  }
                  className={`flex-1 py-2.5 px-4 text-xs rounded-xl font-black transition-all duration-300 ${
                    registeredEventIds.has(event._id)
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : event.isFinalized !== false && isRegistrationOpen(event)
                    ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/20" 
                    : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {registeredEventIds.has(event._id) ? "✓ REGISTERED" : "REGISTER NOW"}
                </button>
              )}

              {(user.role === "admin" || user.role === "coordinator") && (
                <button
                  onClick={() => navigate(`/edit/${event._id}`)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-2.5 text-[10px] rounded-xl transition-all uppercase tracking-widest"
                >
                  Edit
                </button>
              )}
              {user.role === "admin" && (
                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 font-bold py-2.5 px-4 text-[10px] rounded-xl transition-all uppercase tracking-widest"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      </div>

      {/* Full-Screen Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fadeIn p-4 sm:p-10"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center p-4">
             <button 
                className="absolute top-0 right-0 sm:-top-10 sm:-right-10 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-2xl transition-all z-[110]"
                onClick={() => setPreviewImage(null)}
             >
                ✕
             </button>
             <img 
               src={previewImage} 
               alt="Event Banner Preview" 
               className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(168,85,247,0.3)] border border-white/10 animate-zoomIn"
               onClick={(e) => e.stopPropagation()}
             />
          </div>
        </div>
      )}

      <TeamRegistrationModal 
        event={selectedTeamEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTeamSubmit}
      />

      <PaymentModal 
        amount={paymentAmount} 
        isOpen={paymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
}

export default AllEvents;