import { useEffect, useState } from "react";
import { getMyRegistrations } from "../services/registrationApi";
import { getWinners } from "../services/winnerApi";

function Certificates() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const name = user?.name || "Participant";

  const [registrations, setRegistrations] = useState([]);
  const [wonEvents, setWonEvents] = useState([]);
  const [allWinnersList, setAllWinnersList] = useState([]);

  const isEventEnded = (event, eventId) => {
    if (!event) return false;
    
    // Explicit confirmation
    if (event.resultsDeclared === true) return true;
    
    // Check if the event has winners declared
    const hasWinners = allWinnersList.some(w => w.eventId?._id === eventId);
    
    return hasWinners; 
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regRes = await getMyRegistrations(user._id);
        const winRes = await getWinners();
        
        setAllWinnersList(winRes.data);

        // Check which registrations are winners
        const winningRegistrations = regRes.data.filter(reg => reg.isWinner);
        const winnerEventIds = winningRegistrations.map(reg => reg.eventId?._id);

        // For the won events, find the corresponding Winner record to get the position
        const userWins = winningRegistrations.map(reg => {
          // Both winData.userId and reg.userId represent the registration leader.
          // In team events, even if the current user is a team member, reg.userId points to the leader.
          const leaderId = reg.userId?._id || reg.userId;
          const winData = winRes.data.find(w => {
            const wLeaderId = w.userId?._id || w.userId;
            const wEventId = w.eventId?._id || w.eventId;
            const rEventId = reg.eventId?._id || reg.eventId;
            return wEventId === rEventId && wLeaderId === leaderId;
          });
          
          return {
            _id: reg._id, // use registration ID as key
            eventId: reg.eventId,
            position: winData ? winData.position : "1st" // fallback
          };
        });

        // Participation only (exclude won events)
        const participationOnly = regRes.data.filter(reg => !winnerEventIds.includes(reg.eventId?._id));

        setRegistrations(participationOnly);
        setWonEvents(userWins);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [user._id]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 font-sans">
      {/* Participation Certificates */}
      <div className="bg-[#1a1325]/80 backdrop-blur-md border border-fuchsia-900/30 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📜</span> Participation Certificates
        </h3>
        
        {registrations.length === 0 ? (
          <p className="text-slate-400 text-sm">No participation certificates available.</p>
        ) : (
          <ul className="space-y-3">
            {registrations.map(reg => {
              const ended = isEventEnded(reg.eventId, reg.eventId?._id);
              const canDownload = reg.isPresent && ended;
              
              return (
                <li key={reg._id} className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl shadow-sm">
                  <span className="text-slate-200 font-medium truncate pr-4">{reg.eventId?.title}</span>
                  {canDownload ? (
                    <a
                      href={`http://localhost:5000/api/certificates/participation/${user._id}/${reg.eventId?._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(192,38,211,0.4)] transition-all transform hover:-translate-y-0.5"
                    >
                      Download
                    </a>
                  ) : (
                    <span 
                      className="shrink-0 bg-slate-800 border border-slate-700 text-slate-500 text-xs font-bold py-2 px-4 rounded-lg cursor-not-allowed" 
                      title={!reg.isPresent ? "You must be marked 'Present' by a coordinator." : "Certificate will be available after the coordinator confirms the results."}
                    >
                      {!reg.isPresent ? "Pending Attendance" : "Results Pending"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Winner Certificates */}
      <div className="bg-[#1a1325]/80 backdrop-blur-md border border-fuchsia-900/30 p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏆</span> Achievement Certificates
        </h3>
        
        {wonEvents.length === 0 ? (
          <p className="text-slate-400 text-sm">No achievements unlocked yet.</p>
        ) : (
          <ul className="space-y-3">
            {wonEvents.map(win => {
              const ended = isEventEnded(win.eventId, win.eventId?._id);
              
              return (
                <li key={win._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-amber-500/20 to-fuchsia-500/10 p-4 rounded-xl border border-amber-500/30 shadow-sm">
                  <div className="mb-3 sm:mb-0">
                    <span className="text-amber-400 font-black text-lg block">{win.position} Place</span>
                    <span className="text-slate-200 font-medium truncate block">{win.eventId?.title}</span>
                  </div>
                  {ended ? (
                    <a
                      href={`http://localhost:5000/api/certificates/winner/${user._id}/${win.eventId?._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-amber-950 text-xs font-black py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 text-center"
                    >
                      Download Award
                    </a>
                  ) : (
                    <span className="shrink-0 bg-slate-800 border border-slate-700 text-slate-500 text-xs font-bold py-2 px-4 rounded-lg cursor-not-allowed" title="Certificate will be available after the event ends.">
                      Event Ongoing
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Certificates;