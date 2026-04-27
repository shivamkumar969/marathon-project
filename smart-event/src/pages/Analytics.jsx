import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, PieChart, Pie, Legend, AreaChart, Area, ComposedChart, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] border border-fuchsia-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 text-xs font-bold uppercase mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          </div>
        ))}
        {payload.length > 1 && payload[0].value !== undefined && payload[1].value !== undefined && (
          <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-500 italic leading-tight">
            * AI predicts a {payload[1].value > payload[0].value ? 'growth' : 'dip'} based on current velocity.
          </div>
        )}
      </div>
    );
  }
  return null;
};

function Analytics() {
  const [data, setData] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalWinners: 0,
    genderBreakdown: { male: 0, female: 0, prefer_not_to_say: 0, other: 0 },
    eventTypes: { individual: 0, team: 0 },
    regsOverTime: [],
    instituteBreakdown: { sms: 0, outsider: 0 },
    courseBreakdown: { sms: [], outsider: [] }
  });

  const [predictiveData, setPredictiveData] = useState({ data: [], growthRate: "", trendFactor: "" });

  const fetchData = async () => {
    try {
      const [res, predRes] = await Promise.all([
        axios.get("http://localhost:5000/api/analytics"),
        axios.get("http://localhost:5000/api/analytics/predictive")
      ]);
      setData(res.data);
      setPredictiveData(predRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = [
    { name: 'Users', value: data.totalUsers },
    { name: 'Events', value: data.totalEvents },
    { name: 'Registrations', value: data.totalRegistrations },
    { name: 'Winners', value: data.totalWinners },
  ];

  const [insight, setInsight] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateAiInsights = async () => {
    setLoadingAi(true);
    try {
      const res = await axios.get("http://localhost:5000/api/analytics/ai-insights");
      setInsight(res.data.insight);
    } catch (err) {
      setInsight("Failed to generate insights.");
    }
    setLoadingAi(false);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">Event Statistics</h3>
        <button 
          onClick={handleGenerateAiInsights}
          disabled={loadingAi}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {loadingAi ? "Generating..." : "✨ AI Insights"}
        </button>
      </div>

      {insight && (
        <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
          <p className="text-indigo-200 text-sm italic">{insight}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors group">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h3 className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider group-hover:text-blue-400 transition-colors truncate pr-2">Users</h3>
            <span className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">👥</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white">{data.totalUsers}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h3 className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors truncate pr-2">Events</h3>
            <span className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">📅</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white">{data.totalEvents}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors group">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h3 className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider group-hover:text-purple-400 transition-colors truncate pr-2">Registrations</h3>
            <span className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0">📝</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white">{data.totalRegistrations}</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg border border-amber-500/20 hover:border-amber-500/40 transition-colors group">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h3 className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider group-hover:text-amber-400 transition-colors truncate pr-2">Winners</h3>
            <span className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">🏆</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white">{data.totalWinners}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Registrations Over Time */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col h-80">
          <h4 className="text-white font-bold mb-4 shrink-0">Registrations Over Time</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.regsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="_id" stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{stroke: '#334155', strokeWidth: 2}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} 
                />
                <Line type="monotone" dataKey="count" name="Registrations" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#a855f7'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Predictive Analytics */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-fuchsia-500/30 flex flex-col h-80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity flex items-center gap-2">
             <span className="text-xs font-bold text-fuchsia-400 border border-fuchsia-500/50 rounded-full px-2 py-1 bg-fuchsia-900/20">
               AI Forecast (Linear Regression)
             </span>
          </div>
          <h4 className="text-white font-bold mb-1 shrink-0 flex items-center gap-2">
            <span className="text-fuchsia-400">✨</span> Predicted Turnout
          </h4>
          <p className="text-slate-400 text-xs mb-4">
             Next 2 Months Forecast • Trend: <span className={predictiveData.growthRate === "Positive" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{predictiveData.growthRate} ({predictiveData.trendFactor})</span>
          </p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictiveData.data}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <ReferenceLine 
                  x={predictiveData.data[predictiveData.data.length - 3]?.name} 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: 'Forecast Start', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  name="Historical Actual" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  name="AI Predicted" 
                  stroke="#d946ef" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  fillOpacity={1} 
                  fill="url(#colorPredicted)" 
                  animationDuration={2000}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="none" 
                  dot={{ r: 4, fill: '#d946ef', strokeWidth: 2, stroke: '#1e1b4b' }} 
                  activeDot={{ r: 6, fill: '#f5d0fe', stroke: '#d946ef' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Demographics */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col h-80">
          <h4 className="text-white font-bold mb-4 shrink-0">User Demographics (Gender)</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Male', value: data.genderBreakdown.male },
                    { name: 'Female', value: data.genderBreakdown.female },
                    { name: 'Other', value: data.genderBreakdown.other },
                    { name: 'Unspecified', value: data.genderBreakdown.prefer_not_to_say }
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" /> {/* Male - Blue */}
                  <Cell fill="#ec4899" /> {/* Female - Pink */}
                  <Cell fill="#f59e0b" /> {/* Other - Amber */}
                  <Cell fill="#64748b" /> {/* Unspecified - Slate */}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Types Breakdown */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col h-80">
          <h4 className="text-white font-bold mb-4 shrink-0">Event Types Overview</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Individual Events', value: data.eventTypes.individual, fill: '#10b981' },
                { name: 'Team Events', value: data.eventTypes.team, fill: '#3b82f6' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institute Demographics */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col h-80">
          <h4 className="text-white font-bold mb-4 shrink-0">Institute Demographics</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'SMS Varanasi', value: data.instituteBreakdown.sms },
                    { name: 'Outsiders', value: data.instituteBreakdown.outsider }
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#14b8a6" /> {/* Teal */}
                  <Cell fill="#8b5cf6" /> {/* Violet */}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Breakdown: SMS Varanasi */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col h-80">
          <h4 className="text-white font-bold mb-4 shrink-0 flex items-center gap-2">
            <span className="text-teal-400">■</span> Course Breakdown (SMS Varanasi)
          </h4>
          <div className="flex-1 min-h-0">
            {data.courseBreakdown.sms.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.courseBreakdown.sms} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={100} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="value" name="Students" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">No data available</div>
            )}
          </div>
        </div>

        {/* Course Breakdown: Outsiders */}
        <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-700/50 flex flex-col h-80">
          <h4 className="text-white font-bold mb-4 shrink-0 flex items-center gap-2">
            <span className="text-violet-400">■</span> Course Breakdown (Outsiders)
          </h4>
          <div className="flex-1 min-h-0">
            {data.courseBreakdown.outsider.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.courseBreakdown.outsider} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={100} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} 
                  />
                  <Bar dataKey="value" name="Students" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">No data available</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;