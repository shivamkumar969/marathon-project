import { useEffect, useState } from "react";
import axios from "axios";
import { markWinner } from "../services/winnerApi";
import { updateEvent } from "../services/eventApi";

function CoordinatorRegistrations() {
  const [data, setData] = useState([]);
  const [winnersList, setWinnersList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("ALL");
  const [viewMode, setViewMode] = useState("all"); // "all" | "winners"
  
  // Winner Modal State
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [winnerCandidate, setWinnerCandidate] = useState(null);
  const [winnerPosition, setWinnerPosition] = useState("1st");

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactUser, setContactUser] = useState(null);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const openContactModal = (userObj) => {
    setContactUser(userObj);
    setIsContactModalOpen(true);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/registrations");
      const assignedRegistrations = res.data.filter(reg => 
        reg.eventId?.coordinators?.includes(user._id) || user.role === "admin"
      );
      setData(assignedRegistrations);

      const winnersRes = await axios.get("http://localhost:5000/api/winners");
      setWinnersList(winnersRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openWinnerModal = (item) => {
    if (!item.isPresent) {
      alert("Cannot mark an absent student as a winner.");
      return;
    }
    setWinnerCandidate(item);
    setIsWinnerModalOpen(true);
  };

  const confirmWinner = async () => {
    if (!winnerCandidate) return;

    try {
      await markWinner({
        userId: winnerCandidate.userId?._id,
        eventId: winnerCandidate.eventId?._id,
        position: winnerPosition
      });
      alert(`Success! Marked as ${winnerPosition} Place Winner!`);
      setIsWinnerModalOpen(false);
      setWinnerCandidate(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark winner");
    }
  };

  const handleConfirmResults = async () => {
    if (selectedEventId === "ALL") {
      alert("Please select a specific event to confirm results.");
      return;
    }

    if (window.confirm("Are you sure you want to officially confirm the results for this event? Once confirmed, participants will be able to download their certificates.")) {
      try {
        await updateEvent(selectedEventId, { resultsDeclared: true });
        alert("Results Confirmed! Certificates are now available to participants.");
        fetchData();
      } catch (error) {
        alert("Failed to confirm results.");
      }
    }
  };

  const handleToggleAttendance = async (id, memberId = null) => {
    if (user.role === "admin") {
      alert("Admins are not allowed to mark attendance. Only coordinators can perform this action.");
      return;
    }

    try {
      const payload = memberId ? { memberId } : {};
      const token = sessionStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/registrations/${id}/attendance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(data.map(reg => reg._id === id ? { ...reg, presentMembers: res.data.presentMembers, isPresent: res.data.isPresent } : reg));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update attendance.");
    }
  };

  const handleDownloadReport = () => {
    if (selectedEventId === "ALL") {
      alert("Please select a specific event to download the report.");
      return;
    }

    const eventName = uniqueEvents.find(ev => ev._id === selectedEventId)?.title || "Event";
    
    // Flatten data for the report (handling team members)
    const reportRows = [];
    filteredData.forEach(reg => {
      // Main Participant
      reportRows.push({
        name: reg.userId?.name || "N/A",
        email: reg.userId?.email || "N/A",
        mobile: reg.userId?.mobileNo || "N/A"
      });
      
      // Team Members (if any)
      if (reg.teamMembers && reg.teamMembers.length > 0) {
        reg.teamMembers.forEach(member => {
          reportRows.push({
            name: member.name || "N/A",
            email: member.email || "N/A",
            mobile: member.mobileNo || "N/A"
          });
        });
      }
    });

    if (reportRows.length === 0) {
      alert("No participants found for this event.");
      return;
    }

    // Create a print-friendly window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to download the report.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${eventName} - Participant Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
            h1 { color: #4338ca; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
            .subtitle { color: #666; font-size: 18px; margin-top: 10px; }
            .meta { margin-bottom: 20px; font-size: 14px; color: #666; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
            th { background-color: #6366f1; color: white; padding: 15px 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
            td { border: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; font-size: 12px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .blank-col { width: 150px; }
            @media print {
              body { padding: 20px; }
              .header { border-bottom-color: #000; }
              h1 { color: #000; }
              th { background-color: #eee !important; color: #000 !important; border: 1px solid #000; }
              td { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SMARTEvent Dashboard</h1>
            <div class="subtitle">Official Participant Enrollment Report</div>
          </div>
          <div class="meta">
            <span><strong>Event:</strong> ${eventName}</span>
            <span><strong>Generated On:</strong> ${new Date().toLocaleString()}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px">No.</th>
                <th>Participant Name</th>
                <th>Email ID</th>
                <th>Mobile Number</th>
                <th class="blank-col">Signature / Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${reportRows.map((row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${row.name}</strong></td>
                  <td>${row.email}</td>
                  <td>${row.mobile}</td>
                  <td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Extract unique events for the filter dropdown
  const uniqueEvents = [];
  const eventMap = new Map();
  data.forEach(reg => {
    if (reg.eventId && !eventMap.has(reg.eventId._id)) {
      eventMap.set(reg.eventId._id, true);
      uniqueEvents.push(reg.eventId);
    }
  });

  // Filter data based on selected event
  let filteredData = selectedEventId === "ALL" 
    ? data 
    : data.filter(reg => reg.eventId?._id === selectedEventId);

  if (viewMode === "winners") {
    filteredData = filteredData.filter(item => 
      winnersList.some(w => w.userId?._id === item.userId?._id && w.eventId?._id === item.eventId?._id)
    );
  }

  const totalRegistered = filteredData.reduce((total, reg) => {
    return total + 1 + (reg.teamMembers?.length || 0);
  }, 0);
  
  const totalPresent = filteredData.reduce((total, reg) => {
    return total + (reg.presentMembers?.length || (reg.isPresent ? 1 : 0));
  }, 0);
  
  const attendancePercentage = totalRegistered === 0 ? 0 : Math.round((totalPresent / totalRegistered) * 100);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <span>🎯</span> Manage Event Data
        </h4>
        <select 
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 block w-full sm:w-64 p-2.5 outline-none"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="ALL">All Assigned Events</option>
          {uniqueEvents.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>

        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
              viewMode === "all" ? "bg-fuchsia-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            All Participants
          </button>
          <button
            onClick={() => setViewMode("winners")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-1 ${
              viewMode === "winners" ? "bg-amber-500 text-slate-900 shadow" : "text-slate-400 hover:text-amber-400"
            }`}
          >
            <span>🏆</span> Winners Only
          </button>
        </div>
        
        {selectedEventId !== "ALL" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <span>📥</span> Download Report
            </button>
            <button
              onClick={handleConfirmResults}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-2.5 px-6 rounded-lg shadow-[0_0_15px_rgba(192,38,211,0.4)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Confirm & Publish Results
            </button>
          </div>
        )}
      </div>

      {/* Mini Stats Feature */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h4 className="text-slate-400 font-semibold text-sm uppercase tracking-wider mb-1">Live Attendance Tracking</h4>
            <div className="text-2xl font-black text-white">
              {totalPresent} <span className="text-slate-500 text-lg font-medium">/ {totalRegistered} Checked In</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{attendancePercentage}%</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            style={{ width: `${attendancePercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-xl shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-white/10 text-slate-300">
              <th className="p-4 font-semibold">Event Name</th>
            <th className="p-4 font-semibold">Participant</th>
            <th className="p-4 font-semibold">Registration Date</th>
            <th className="p-4 font-semibold text-center">Attendance</th>
            <th className="p-4 font-semibold text-center">Action / Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-center text-slate-500">No registrations found for this selection.</td>
            </tr>
          )}
          {filteredData.map((item) => {
            const userWinnerRecord = winnersList.find(w => w.userId?._id === item.userId?._id && w.eventId?._id === item.eventId?._id);

            return (
              <tr key={item._id} className="border-b border-slate-700 hover:bg-slate-700/20 transition-colors">
                <td className="p-4">
                  <span className="font-medium text-white">{item.eventId?.title || "Unknown Event"}</span>
                </td>
                <td className="p-4 text-slate-300">
                  <div className="flex flex-col items-start gap-1">
                    <span 
                      className="font-bold text-white cursor-pointer hover:text-fuchsia-400 underline decoration-fuchsia-500/30 underline-offset-4 transition-colors"
                      onClick={() => openContactModal(item.userId)}
                    >
                      {item.userId?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-slate-500">{item.userId?.email}</span>
                    {item.teamName && (
                      <span className="mt-1 px-2 py-0.5 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 text-[10px] uppercase font-bold rounded">
                        Team: {item.teamName}
                      </span>
                    )}
                    {/* Render the other team members */}
                    {item.teamMembers && item.teamMembers.length > 0 && (
                      <div className="mt-2 pl-2 border-l-2 border-slate-700 space-y-1 w-full">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Team Roster:</span>
                        {item.teamMembers.map(member => (
                          <div key={member._id} className="flex flex-col text-slate-400">
                            <span 
                              className="text-sm font-semibold cursor-pointer hover:text-fuchsia-400 transition-colors"
                              onClick={() => openContactModal(member)}
                            >
                              ↳ {member.name}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-4">{member.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {new Date(item.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    {/* Primary User Attendance */}
                    <button
                      onClick={() => handleToggleAttendance(item._id)}
                      disabled={user.role === "admin"}
                      className={`py-1 px-2 rounded shadow transition-all duration-200 text-xs font-semibold flex items-center justify-center w-24 gap-1 ${
                        user.role === "admin" 
                        ? "bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed"
                        : (item.presentMembers?.includes(item.userId?._id) || item.isPresent)
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30" 
                          : "bg-slate-800 border border-slate-600 text-slate-400 hover:text-white"
                      }`}
                    >
                      {(item.presentMembers?.includes(item.userId?._id) || item.isPresent) ? "✓ Present" : "✕ Absent"}
                    </button>
                    
                    {/* Team Members Attendance */}
                    {item.teamMembers && item.teamMembers.length > 0 && item.teamMembers.map(member => (
                      <button
                        key={member._id}
                        onClick={() => handleToggleAttendance(item._id, member._id)}
                        disabled={user.role === "admin"}
                        className={`py-1 px-2 rounded shadow transition-all duration-200 text-[10px] font-semibold flex items-center justify-center w-20 gap-1 ${
                          user.role === "admin"
                          ? "bg-slate-800/50 border border-slate-700 text-slate-600 cursor-not-allowed"
                          : item.presentMembers?.includes(member._id)
                            ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30" 
                            : "bg-slate-800 border border-slate-600 text-slate-400 hover:text-white"
                        }`}
                        title={user.role === "admin" ? "Admins cannot mark attendance" : `Mark ${member.name}`}
                      >
                        {item.presentMembers?.includes(member._id) ? "✓ Pres." : "✕ Abs."}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-center">
                  {userWinnerRecord ? (
                    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/50 text-amber-400 font-bold py-1.5 px-4 rounded shadow-sm text-sm">
                      <span>🏆</span> {userWinnerRecord.position} Place
                    </div>
                  ) : (
                    <button
                      onClick={() => openWinnerModal(item)}
                      disabled={!item.isPresent}
                      className={`font-bold py-1.5 px-4 rounded shadow transition-all text-sm ${
                        item.isPresent 
                        ? "bg-amber-500 hover:bg-amber-400 text-amber-950" 
                        : "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                      }`}
                      title={!item.isPresent ? "Mark student 'Present' first to allocate a win." : "Allocate Winner"}
                    >
                      Allocate Winner
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

      {/* Winner Modal */}
      {isWinnerModalOpen && winnerCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e162b] border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => { setIsWinnerModalOpen(false); setWinnerCandidate(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >✕</button>
            
            <h2 className="text-2xl font-bold text-white mb-2">Mark Winner</h2>
            <p className="text-slate-400 mb-6 text-sm">
              Event: <span className="text-white font-medium">{winnerCandidate.eventId?.title}</span><br/>
              Participant: <span className="text-white font-medium">{winnerCandidate.userId?.name} {winnerCandidate.teamName ? `(Team: ${winnerCandidate.teamName})` : ''}</span>
            </p>

            <label className="block text-slate-300 text-sm mb-2 font-semibold">Select Position</label>
            <select
              value={winnerPosition}
              onChange={(e) => setWinnerPosition(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white mb-6 focus:ring-fuchsia-500 focus:border-fuchsia-500"
            >
              {[...Array(winnerCandidate.eventId?.maxWinners || 3)].map((_, i) => {
                const pos = i + 1;
                let suffix = "th";
                let emoji = "🏅";
                if (pos === 1) { suffix = "st"; emoji = "🥇"; }
                else if (pos === 2) { suffix = "nd"; emoji = "🥈"; }
                else if (pos === 3) { suffix = "rd"; emoji = "🥉"; }
                const label = `${pos}${suffix} Place`;
                return <option key={pos} value={`${pos}${suffix}`}>{emoji} {label}</option>;
              })}
            </select>

            <button
              onClick={confirmWinner}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"
            >
              Confirm Award
            </button>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {isContactModalOpen && contactUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e162b] border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => { setIsContactModalOpen(false); setContactUser(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >✕</button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {contactUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{contactUser.name}</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Participant Profile
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Email Address</span>
                <a href={`mailto:${contactUser.email}`} className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
                  ✉️ {contactUser.email}
                </a>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Mobile Number</span>
                {contactUser.mobileNo ? (
                  <a href={`tel:${contactUser.mobileNo}`} className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2">
                    📞 {contactUser.mobileNo}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Institute</span>
                  <span className="text-white font-medium">{contactUser.instituteType || "Unknown"}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Course</span>
                  <span className="text-white font-medium">{contactUser.course || "Unknown"}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => { setIsContactModalOpen(false); setContactUser(null); }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoordinatorRegistrations;