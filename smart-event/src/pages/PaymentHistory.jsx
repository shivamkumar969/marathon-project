import React, { useState, useEffect } from "react";
import { getAllRegistrations } from "../services/registrationApi";
import { getEvents } from "../services/eventApi";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const [regRes, eventRes] = await Promise.all([
           getAllRegistrations(),
           getEvents()
        ]);
        
        let allRegs = regRes.data.filter(r => r.amountPaid > 0);

        if (user.role === "coordinator") {
           // filter events coordinated by this user
           const coordinatedEvents = eventRes.data.filter(e => e.coordinators?.some(c => c._id === user._id || c === user._id)).map(e => e._id.toString());
           allRegs = allRegs.filter(r => {
             const evId = (r.eventId?._id || r.eventId).toString();
             return coordinatedEvents.includes(evId);
           });
        }

        setPayments(allRegs);
        
        // Populate events list for dropdown based on payments
        const uniqueEventsMap = {};
        allRegs.forEach(reg => {
          if (reg.eventId) {
            uniqueEventsMap[reg.eventId._id || reg.eventId] = reg.eventId.title || "Unknown Event";
          }
        });
        
        setEventsList(Object.keys(uniqueEventsMap).map(id => ({ _id: id, title: uniqueEventsMap[id] })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user.role, user._id]);

  if (loading) {
    return <div className="text-slate-400 p-6 text-center animate-pulse">Loading financial records...</div>;
  }

  const displayedPayments = selectedEventId === "all" 
     ? payments 
     : payments.filter(p => (p.eventId?._id || p.eventId) === selectedEventId);

  const displayedRevenue = displayedPayments.reduce((sum, reg) => sum + reg.amountPaid, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Dropdown Filter */}
        <div className="w-full md:w-1/3 bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-fuchsia-900/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🔍</span> Filter by Event
          </h3>
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl text-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all cursor-pointer"
          >
            <option value="all">All Events</option>
            {eventsList.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
        </div>

        {/* Hero Stats */}
        <div className="w-full md:w-2/3 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-lg border border-emerald-500/30 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-emerald-400 mb-2 uppercase tracking-widest">
            {selectedEventId === "all" ? "Total Platform Revenue" : "Selected Event Revenue"}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mt-2">
            <span className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200 tracking-tight">
              ₹{displayedRevenue.toLocaleString()}
            </span>
            <span className="text-emerald-200/60 font-medium text-lg sm:pb-2 tracking-wide">
              Across {displayedPayments.length} successful transactions
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#1a1325]/80 backdrop-blur-md rounded-2xl shadow-lg border border-fuchsia-900/30 overflow-hidden">
        <div className="p-6 border-b border-fuchsia-900/30">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>💳</span> Transaction History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Participant / Team</th>
                <th className="p-4 font-semibold">Event</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedPayments.map(payment => (
                <tr key={payment._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(payment.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{payment.teamName || payment.userId?.name || "Unknown User"}</div>
                    <div className="text-xs text-slate-500">{payment.userId?.email}</div>
                  </td>
                  <td className="p-4 text-slate-300 font-medium">
                    {payment.eventId?.title || "Unknown Event"}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-lg uppercase">
                      {payment.teamName ? "Team" : "Individual"}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-400">
                    ₹{payment.amountPaid}
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      {payment.paymentStatus || "Paid"}
                    </span>
                  </td>
                </tr>
              ))}
              {displayedPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    <div className="text-4xl mb-2">💸</div>
                    No paid registrations found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentHistory;
