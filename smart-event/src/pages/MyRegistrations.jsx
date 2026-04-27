import { useEffect, useState } from "react";
import { getMyRegistrations, withdrawRegistration } from "../services/registrationApi";
import axios from "axios";
import config from "../config";

function MyRegistrations() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user") || "{}"));
  const [skillsInput, setSkillsInput] = useState(user.skills ? user.skills.join(", ") : "");
  const [updatingSkills, setUpdatingSkills] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getMyRegistrations(user._id);
      setData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (id) => {
    const confirmBox = window.confirm("Are you sure you want to withdraw?");
    if (!confirmBox) return;

    try {
      await withdrawRegistration(id);
      setData(data.filter(item => item._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to withdraw");
    }
  };

  const handleUpdateSkills = async (e) => {
    e.preventDefault();
    setUpdatingSkills(true);
    try {
      const skillsArray = skillsInput.split(",").map(s => s.trim()).filter(s => s !== "");
      const res = await axios.put(`${config.API_BASE_URL}/api/matchmaker/skills/${user._id}`, {
        skills: skillsArray
      });
      const updatedUser = { ...user, skills: res.data.skills };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Skills updated successfully! The AI Matchmaker will now use this data.");
    } catch (error) {
      alert("Failed to update skills");
    }
    setUpdatingSkills(false);
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* AI Matchmaker Profile Section */}
      <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/80 p-6 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]"></div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>✨</span> AI Matchmaker Profile
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Update your skills to help the AI find the perfect team for you in upcoming events. Separate skills with commas.
        </p>
        <form onSubmit={handleUpdateSkills} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. React, Node.js, Public Speaking, Design"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={updatingSkills}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            {updatingSkills ? "Updating..." : "Save Skills"}
          </button>
        </form>
      </div>

      {/* Registrations List */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📅</span> Active Registrations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
              <span className="text-6xl mb-4 opacity-50">📭</span>
              <p className="text-slate-400 text-lg">You haven't registered for any events yet.</p>
            </div>
          ) : (
            data.map((item) => (
              <div
                key={item._id}
                className="group relative bg-[#1a1325]/80 backdrop-blur-md border border-fuchsia-900/30 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-[0_0_30px_rgba(192,38,211,0.2)] transition-all duration-300 overflow-hidden"
              >
                {/* Decorative Glowing Orb */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-600/20 rounded-full blur-[40px] group-hover:bg-fuchsia-500/30 transition-colors"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-fuchsia-400 transition-colors tracking-tight">
                      {item.eventId?.title || "Unknown Event"}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="bg-slate-800/80 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                        🗓️ {item.eventId?.date ? new Date(item.eventId.date).toLocaleDateString("en-GB").replace(/\//g, "-") : "TBD"}
                      </span>
                      <span className="bg-slate-800/80 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                        📍 {item.eventId?.venue || "TBD"}
                      </span>
                    </div>
                  </div>
                  {item.teamName && (
                    <span className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg shadow-lg shadow-fuchsia-500/20">
                      Team: {item.teamName}
                    </span>
                  )}
                </div>

                {/* Team Roster / User Detail */}
                <div className="bg-black/20 rounded-2xl p-4 mb-6 border border-white/5 relative z-10">
                  <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Participant Details</h4>
                  {item.teamMembers && item.teamMembers.length > 0 ? (
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-fuchsia-400">👑</span> 
                        <span className="text-slate-300">
                          {item.userId?._id === user._id ? "You (Leader)" : `${item.userId?.name} (Leader)`}
                        </span>
                      </li>
                      {item.teamMembers.map(member => (
                        <li key={member._id} className="flex items-center gap-2 text-sm text-slate-400 pl-6 border-l-2 border-slate-700 ml-2">
                          {member.name} {member._id === user._id && "(You)"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                        👤
                      </span>
                      Individual Registration
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="relative z-10 flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                  {item.userId?._id !== user._id ? (
                    <span className="text-xs text-slate-500 italic">Only the team leader can withdraw this registration.</span>
                  ) : (
                    <div className="ml-auto">
                      <button
                        onClick={() => handleWithdraw(item._id)}
                        className="flex items-center gap-2 text-slate-400 hover:text-rose-400 font-semibold text-sm bg-transparent hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all"
                      >
                        <span>✕</span> Withdraw Registration
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyRegistrations;