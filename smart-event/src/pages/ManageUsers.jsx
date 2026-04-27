import { useEffect, useState } from "react";
import { getAllUsers, updateUserRole, deleteUser, createUser } from "../services/userApi";
import { getEvents } from "../services/eventApi";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);

  // Create User State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("coordinator");
  const [newUserGender, setNewUserGender] = useState("prefer_not_to_say");

  const fetchUsersAndEvents = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([getAllUsers(), getEvents()]);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndEvents();
  }, []);

  const isRegistrationOpen = (event) => {
    const now = new Date();
    if (event.registrationOpenDate && now < new Date(event.registrationOpenDate)) return false;
    if (event.registrationCloseDate && now > new Date(event.registrationCloseDate)) return false;
    return true;
  };

  const handleRoleChange = async (id, newRole, oldRole) => {
    const confirmBox = window.confirm(`Are you sure you want to change this user's role from ${oldRole.toUpperCase()} to ${newRole.toUpperCase()}?`);
    if (!confirmBox) return;

    try {
      await updateUserRole(id, newRole);
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    const confirmBox = window.confirm("Are you sure you want to completely delete this user? This cannot be undone.");
    if (!confirmBox) return;

    try {
      await deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        gender: newUserGender
      });
      alert(`Success! Created ${newUserRole} account for ${newUserName}`);
      setUsers([...users, res.data]);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create user");
    }
  };

  const [activeTab, setActiveTab] = useState("coordinator");

  const filteredUsers = users.filter(user => user.role === activeTab);

  if (loading) {
    return <div className="text-slate-400 p-6 text-center animate-pulse">Loading users...</div>;
  }

  return (
    <div className="space-y-6" id="create-user-section">
      {/* Create User Form Section */}
      <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-fuchsia-900/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>➕</span> Provision New Account
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              placeholder="e.g. Jane Doe"
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              placeholder="jane@university.edu"
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gender</label>
            <select
              value={newUserGender}
              onChange={(e) => setNewUserGender(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 lg:col-span-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="coordinator">Coordinator</option>
              <option value="admin">Master Admin</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all transform hover:-translate-y-0.5 text-sm h-[38px]"
            >
              Create User
            </button>
          </div>
        </form>
      </div>

      {/* Existing Tabs & Table Wrapper */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row border-b border-slate-700 bg-slate-900/50">
        <button
          onClick={() => setActiveTab("participant")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "participant"
              ? "text-blue-400 border-l-4 sm:border-l-0 sm:border-b-2 border-blue-400 bg-blue-400/5"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border-l-4 border-transparent sm:border-l-0"
          }`}
        >
          Participants
          <span className="bg-slate-700 text-slate-300 py-0.5 px-2 rounded-full text-[10px] sm:text-xs">{users.filter(u => u.role === "participant").length}</span>
        </button>
        <button
          onClick={() => setActiveTab("coordinator")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "coordinator"
              ? "text-purple-400 border-l-4 sm:border-l-0 sm:border-b-2 border-purple-400 bg-purple-400/5"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border-l-4 border-transparent sm:border-l-0"
          }`}
        >
          Coordinators
          <span className="bg-slate-700 text-slate-300 py-0.5 px-2 rounded-full text-[10px] sm:text-xs">{users.filter(u => u.role === "coordinator").length}</span>
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === "admin"
              ? "text-rose-400 border-l-4 sm:border-l-0 sm:border-b-2 border-rose-400 bg-rose-400/5"
              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border-l-4 border-transparent sm:border-l-0"
          }`}
        >
          Admins
          <span className="bg-slate-700 text-slate-300 py-0.5 px-2 rounded-full text-[10px] sm:text-xs">{users.filter(u => u.role === "admin").length}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/40 border-b border-slate-700/50 text-slate-400 uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold">User Details</th>
              <th className="p-4 font-semibold">Gender</th>
              <th className="p-4 font-semibold">Role Assignment</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{user.name}</span>
                    <span className="text-xs text-slate-400">{user.email}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-300 capitalize text-sm">
                  {user.gender === "prefer_not_to_say" ? "N/A" : user.gender}
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value, user.role)}
                    className={`text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 appearance-none cursor-pointer transition-colors ${
                      user.role === 'admin' 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                        : user.role === 'coordinator'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                    }`}
                  >
                    <option value="participant" className="bg-slate-800 text-white">Participant</option>
                    <option value="coordinator" className="bg-slate-800 text-white">Coordinator</option>
                    <option value="admin" className="bg-slate-800 text-white">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-right flex items-center justify-end gap-2">
                  {user.role === 'coordinator' && (
                    <button
                      onClick={() => setSelectedCoordinator(user)}
                      className="text-fuchsia-400 hover:text-white bg-fuchsia-500/10 hover:bg-fuchsia-500 border border-fuchsia-500/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                    >
                      View Events
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-slate-500 hover:text-rose-500 bg-slate-900/30 hover:bg-rose-500/10 p-2 rounded-lg transition-all duration-200"
                    title="Delete User"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-500 italic">
                  No {activeTab}s found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Allocated Events Modal */}
      {selectedCoordinator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1325] border border-fuchsia-900/50 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_40px_rgba(192,38,211,0.2)] animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🗓️</span> 
                Events for {selectedCoordinator.name}
              </h3>
              <button 
                onClick={() => setSelectedCoordinator(null)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-500 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {events.filter(e => e.coordinators && e.coordinators.includes(selectedCoordinator._id)).length > 0 ? (
                events.filter(e => e.coordinators && e.coordinators.includes(selectedCoordinator._id)).map((event) => (
                  <div key={event._id} className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold">{event.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{event.type.toUpperCase()} • {new Date(event.date).toLocaleDateString("en-GB").replace(/\//g, "-")}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${isRegistrationOpen(event) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
                      {isRegistrationOpen(event) ? "Open" : "Closed"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-slate-400">No events allocated to this coordinator.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedCoordinator(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors font-medium text-sm"
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

export default ManageUsers;
