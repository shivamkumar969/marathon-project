import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Toast from "./Toast";
import config from "../config";

function ReportManagement() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [reportType, setReportType] = useState("events");
  const [previewData, setPreviewData] = useState([]);
  
  // Options for Dropdowns
  const [options, setOptions] = useState({ venues: [], events: [] });

  // Filter States
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
    institute: "",
    search: "",
    venue: "",
    gender: "",
    regStatus: "",
    eventId: ""
  });

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      type: "",
      institute: "",
      search: "",
      venue: "",
      gender: "",
      regStatus: "",
      eventId: ""
    });
    setNotification({ message: "Filters reset to default", type: "info" });
  };

  const fetchOptions = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${config.API_BASE_URL}/api/reports/options`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOptions(res.data);
    } catch (error) {
      console.error("Failed to fetch options", error);
    }
  };

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);
      if (filters.eventId) params.append("eventId", filters.eventId);
      
      if (reportType === "events") {
        if (filters.type) params.append("type", filters.type);
        if (filters.venue) params.append("venue", filters.venue);
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.regStatus) params.append("regStatus", filters.regStatus);
      } else if (reportType === "participants") {
        if (filters.institute) params.append("institute", filters.institute);
      }

      const res = await axios.get(`${config.API_BASE_URL}/api/reports/${reportType}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewData(res.data);
    } catch (error) {
      setNotification({ message: "Failed to fetch report preview", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [reportType, filters]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPreview();
    }, 500); 
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  const downloadExcel = () => {
    if (!previewData || previewData.length === 0) {
      setNotification({ message: "No data available to download", type: "info" });
      return;
    }

    try {
      // Use the SheetJS (XLSX) library added via CDN
      const XLSX = window.XLSX;
      if (!XLSX) {
        setNotification({ message: "Export library not loaded. Please refresh.", type: "error" });
        return;
      }

      // 1. Create a new Workbook
      const wb = XLSX.utils.book_new();

      // 2. Convert JSON data to Worksheet
      const ws = XLSX.utils.json_to_sheet(previewData);

      // 3. Add Worksheet to Workbook
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // 4. Generate XLSX file and trigger download
      const fileName = `${reportType}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setNotification({ message: "Report downloaded successfully in Excel format!", type: "success" });
    } catch (error) {
      console.error("Excel Export Error:", error);
      setNotification({ message: "Failed to generate Excel report", type: "error" });
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const totalRevenue = previewData.reduce((acc, curr) => acc + (curr.totalRevenue || curr.amount || curr.totalPaid || 0), 0);
  const totalCount = previewData.length;

  return (
    <div className="p-4 sm:p-8 animate-fadeIn max-w-[1600px] mx-auto min-h-screen">
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      {/* Header */}
      <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Auditor</span>
          </h1>
          <p className="text-slate-400 font-medium">Deep-dive analytics, financial auditing, and automated reporting.</p>
        </div>
        
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          <button 
            onClick={() => { setReportType("events"); resetFilters(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all ${reportType === "events" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-400 hover:text-white"}`}
          >
            <span>📅</span> Events
          </button>
          <button 
            onClick={() => { setReportType("participants"); resetFilters(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all ${reportType === "participants" ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" : "text-slate-400 hover:text-white"}`}
          >
            <span>👥</span> Members
          </button>
          <button 
            onClick={() => { setReportType("payments"); resetFilters(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition-all ${reportType === "payments" ? "bg-fuchsia-600 text-white shadow-xl shadow-fuchsia-600/20" : "text-slate-400 hover:text-white"}`}
          >
            <span>💰</span> Payments
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
          <h4 className="text-3xl font-black text-white">{totalCount} Records</h4>
        </div>
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Volume Metric (INR)</p>
          <h4 className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString()}</h4>
        </div>
      </div>

      {/* Filter Control Center */}
      <div className="bg-[#161121]/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl mb-12 ring-1 ring-white/5">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <span className="text-indigo-400">🎛️</span> {reportType.toUpperCase()} Filter Logic
          </h2>
          <button onClick={resetFilters} className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">
            Clear Filters ↺
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          <div className="lg:col-span-1 space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Basis Filter</label>
            <select name="eventId" value={filters.eventId} onChange={handleFilterChange}
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
            >
              <option value="">All Events</option>
              {options.events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">From Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">To Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
            />
          </div>

          {reportType === "events" && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Venue</label>
              <select name="venue" value={filters.venue} onChange={handleFilterChange}
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
              >
                <option value="">All Venues</option>
                {options.venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          )}

          {reportType === "participants" && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Institute</label>
              <select name="institute" value={filters.institute} onChange={handleFilterChange}
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl px-4 py-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
              >
                <option value="">All Institutions</option>
                <option value="SMS Varanasi">SMS Varanasi</option>
                <option value="Outsider">Outsider</option>
              </select>
            </div>
          )}

          <div className="flex items-end lg:col-start-4 xl:col-start-5">
            <button onClick={downloadExcel} className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl">
              Download Excel 📊
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-slate-900/60 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative">
        {loading && <div className="absolute inset-0 bg-[#0f0a19]/60 backdrop-blur-sm z-30 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}
        <div className="px-12 py-8 bg-white/[0.01] border-b border-white/5">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter tracking-widest">{reportType} Preview Matrix</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                {previewData.length > 0 && Object.keys(previewData[0]).map(header => (
                  <th key={header} className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {previewData.length > 0 ? previewData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.04] transition-all group">
                  {Object.entries(row).map(([header, val], i) => (
                    <td key={i} className="px-10 py-6 text-sm text-slate-400 group-hover:text-white transition-colors">
                      {header === "status" && reportType === "payments" ? (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${val === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : val === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          {val}
                        </span>
                      ) : (header === "totalPaid" || header === "totalRevenue" || header === "amount" || header === "fee" || header === "baseFee") ? (
                        <span className="font-black text-white">₹{Number(val).toLocaleString()}</span>
                      ) : (header === "type" && reportType === "events") ? (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${val === 'individual' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {val}
                        </span>
                      ) : val}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr><td colSpan="12" className="px-12 py-32 text-center text-slate-600 font-bold uppercase tracking-widest">No matching records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportManagement;
