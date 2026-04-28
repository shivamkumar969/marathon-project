import React, { useState } from "react";
import axios from "axios";
import config from "../config";

function TeamRegistrationModal({ event, isOpen, onClose, onSubmit }) {
  const [teamName, setTeamName] = useState("");
  const [memberEmails, setMemberEmails] = useState([""]); // Start with one empty email field
  const [suggestions, setSuggestions] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  if (!isOpen || !event) return null;

  // The registering user is already 1 member. The max extra members is event.teamSize - 1.
  const maxExtraMembers = event.teamSize ? event.teamSize - 1 : 0;

  const handleEmailChange = (index, value) => {
    const newEmails = [...memberEmails];
    newEmails[index] = value;
    setMemberEmails(newEmails);
  };

  const addEmailField = () => {
    if (memberEmails.length < maxExtraMembers) {
      setMemberEmails([...memberEmails, ""]);
    }
  };

  const removeEmailField = (index) => {
    const newEmails = memberEmails.filter((_, i) => i !== index);
    setMemberEmails(newEmails);
  };

  const getAiSuggestions = async () => {
    setLoadingAi(true);
    try {
      const res = await axios.get(`${config.API_BASE_URL}/api/matchmaker/suggest/${user._id}/${event._id}`);
      setSuggestions(res.data);
    } catch (err) {
      alert("Failed to load AI suggestions");
    }
    setLoadingAi(false);
  };

  const addSuggestionToTeam = (email) => {
    // Check if there is an empty slot
    const emptyIndex = memberEmails.findIndex(e => e.trim() === "");
    if (emptyIndex !== -1) {
      const newEmails = [...memberEmails];
      newEmails[emptyIndex] = email;
      setMemberEmails(newEmails);
    } else if (memberEmails.length < maxExtraMembers) {
      setMemberEmails([...memberEmails, email]);
    } else {
      alert("Team is already at maximum capacity!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      alert("Team Name is required.");
      return;
    }
    
    // Filter out empty emails and trim them
    const validEmails = memberEmails
      .map(email => email.trim())
      .filter(email => email !== "");
      
    const totalMembers = validEmails.length + 1; // +1 for the registering user
    const totalFee = (event.fee || 0) * totalMembers;

    // We will let the parent component handle the actual payment popup
    
    onSubmit({
      teamName: teamName.trim(),
      teamMembers: validEmails,
      amountPaid: totalFee,
      paymentStatus: totalFee > 0 ? "paid" : "free"
    });
  };

  const currentTeamSize = memberEmails.filter(e => e.trim() !== "").length + 1;
  const currentTotalFee = (event.fee || 0) * currentTeamSize;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-fuchsia-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 mb-2">
          Team Registration
        </h2>
        <p className="text-slate-400 mb-4 text-sm">
          Registering for <strong>{event.title}</strong>. You can add up to {maxExtraMembers} additional team members.
        </p>

        {event.minSpecificGenderInTeam > 0 && event.specificGenderForTeam !== "any" && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-lg text-sm mb-6">
            <strong>Requirement:</strong> This team must contain at least {event.minSpecificGenderInTeam} {event.specificGenderForTeam} members in total.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm mb-1">Team Name *</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="Enter Team Name"
              required
            />
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-slate-300 text-sm font-medium">Need Teammates?</label>
              <button
                type="button"
                onClick={getAiSuggestions}
                disabled={loadingAi}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg shadow transition-colors flex items-center gap-1"
              >
                {loadingAi ? "Analyzing..." : "✨ AI Matchmaker"}
              </button>
            </div>
            
            {suggestions.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {suggestions.map(s => (
                  <div key={s._id} className="flex justify-between items-center bg-slate-900 border border-slate-700 p-2 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{s.name} <span className="text-xs text-slate-400">({s.gender})</span></p>
                      <p className="text-xs text-indigo-400">Match Score: {s.matchScore} • Wins: {s.pastWins}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addSuggestionToTeam(s.email)}
                      className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 px-2 py-1 rounded text-xs transition-colors"
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-2">Team Member Emails (Must be registered users)</label>
            {memberEmails.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-500"
                  placeholder={`Member ${index + 1} Email`}
                />
                <button
                  type="button"
                  onClick={() => removeEmailField(index)}
                  className="px-3 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-lg transition-colors"
                  title="Remove Member"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {memberEmails.length < maxExtraMembers && (
              <button
                type="button"
                onClick={addEmailField}
                className="text-sm text-fuchsia-400 hover:text-fuchsia-300 font-medium mt-1"
              >
                + Add Another Member
              </button>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-fuchsia-600/30"
            >
              {currentTotalFee > 0 ? `Pay ₹${currentTotalFee} & Confirm` : "Confirm Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeamRegistrationModal;
