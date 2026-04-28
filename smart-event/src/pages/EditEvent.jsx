import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getCoordinators } from "../services/authApi";
import { getEvents } from "../services/eventApi";
import config from "../config";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bannerPreview, setBannerPreview] = useState(null);
  const fileInputRef = useRef(null);
  const coordinatorDropdownRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    type: "individual",
    teamSize: 1,
    registrationOpenDate: "",
    registrationCloseDate: "",
    genderParticipation: "any",
    minSpecificGenderInTeam: 0,
    specificGenderForTeam: "any",
    isFinalized: false,
    fee: 0,
    coordinators: [],
    maxWinners: 3,
    allowedInstitutes: "any",
    allowedCourses: []
  });

  const [availableCoordinators, setAvailableCoordinators] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const courseDropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coordinatorDropdownRef.current && !coordinatorDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${config.API_BASE_URL}/api/events/${id}`);
      const data = res.data;
      
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
        } catch (e) {
          return "";
        }
      };

      if (data.registrationOpenDate) data.registrationOpenDate = formatDate(data.registrationOpenDate);
      if (data.registrationCloseDate) data.registrationCloseDate = formatDate(data.registrationCloseDate);
      
      if (data.eventBanner) setBannerPreview(config.getImageUrl(data.eventBanner));
      setForm({
        ...data,
        allowedInstitutes: data.allowedInstitutes || "any",
        allowedCourses: data.allowedCourses || []
      });
    } catch (error) {
      console.error("Fetch Event Error:", error);
      alert("Failed to Load Event Details");
    }
  };

  useEffect(() => {
    fetchEvent();
    
    const fetchData = async () => {
      try {
        const [coordsRes, eventsRes] = await Promise.all([
          getCoordinators(),
          getEvents()
        ]);
        setAvailableCoordinators(coordsRes.data);
        setAllEvents(eventsRes.data);

        // Fetch courses using axios since I don't have getCourses import here (but I can import it)
        const coursesRes = await axios.get(`${config.API_BASE_URL}/api/courses`);
        setAvailableCourses(coursesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const isCoordinatorBusy = (coordId) => {
    if (!form.date) return false;
    return allEvents.some(event => {
      return event._id !== id && event.date === form.date && event.coordinators?.includes(coordId);
    });
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "eventBanner") {
      const file = files[0];
      if (file) {
        setForm({ ...form, eventBanner: file });
        setBannerPreview(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === "coordinators" || key === "allowedCourses") {
        formData.append(key, Array.isArray(form[key]) ? JSON.stringify(form[key]) : form[key]);
      } else if (key === "eventBanner" && typeof form[key] === "string") {
        // Skip existing banner string path
      } else {
        formData.append(key, form[key]);
      }
    });
    
    formData.append("userId", user._id);

    try {
      await axios.put(`${config.API_BASE_URL}/api/events/${id}`, formData);
      alert("Event Updated Successfully");
      navigate(-1); // go back
    } catch (error) {
      alert("Update Failed: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-8">
          Configure Event
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col md:col-span-2">
            <label className="text-slate-300 text-sm mb-3">Event Banner (Promotional Image)</label>
            <div 
              className="relative w-full h-48 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-all flex flex-col items-center justify-center cursor-pointer bg-slate-900/50 overflow-hidden"
              onClick={() => fileInputRef.current.click()}
            >
              {bannerPreview ? (
                <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <span className="text-4xl mb-2 block">🖼️</span>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Click to Update Banner</p>
                </div>
              )}
              <input 
                type="file" 
                name="eventBanner" 
                ref={fileInputRef}
                onChange={handleChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700 md:col-span-2">
            <div>
              <h3 className="text-lg font-bold text-white">Finalize Event</h3>
              <p className="text-sm text-slate-400">If checked, participants will be able to see and register for this event.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isFinalized" 
                className="sr-only peer"
                checked={form.isFinalized || false}
                onChange={(e) => setForm({...form, isFinalized: e.target.checked})}
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Event Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Venue</label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-slate-300 text-sm mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 h-24"
            ></textarea>
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Event Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Participation Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="individual">Individual</option>
              <option value="team">Team</option>
            </select>
          </div>

          {form.type === "team" && (
            <>
              <div className="flex flex-col">
                <label className="text-slate-300 text-sm mb-2">Team Size</label>
                <input
                  type="number"
                  name="teamSize"
                  min="2"
                  value={form.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-300 text-sm mb-2">Required Specific Gender in Team</label>
                <select
                  name="specificGenderForTeam"
                  value={form.specificGenderForTeam || "any"}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                >
                  <option value="any">None Required</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {form.specificGenderForTeam !== "any" && (
                <div className="flex flex-col">
                  <label className="text-slate-300 text-sm mb-2">Minimum {form.specificGenderForTeam} Members Required</label>
                  <input
                    type="number"
                    name="minSpecificGenderInTeam"
                    min="1"
                    max={form.teamSize}
                    value={form.minSpecificGenderInTeam || 1}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Registration Open Date</label>
            <input
              type="date"
              name="registrationOpenDate"
              value={form.registrationOpenDate || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Registration Close Date</label>
            <input
              type="date"
              name="registrationCloseDate"
              value={form.registrationCloseDate || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Allowed Gender</label>
            <select
              name="genderParticipation"
              value={form.genderParticipation || "any"}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="any">Any</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Event Fee (₹ per Participant)</label>
            <input
              type="number"
              name="fee"
              min="0"
              value={form.fee || 0}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Maximum Winners (Top N)</label>
            <input
              type="number"
              name="maxWinners"
              min="1"
              max="20"
              value={form.maxWinners || 3}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-300 text-sm mb-2">Allowed Institute</label>
            <select
              name="allowedInstitutes"
              value={form.allowedInstitutes || "any"}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            >
              <option value="any">Any Institute</option>
              <option value="SMS Varanasi">SMS Varanasi Only</option>
              <option value="Outsider">Outsiders Only</option>
            </select>
          </div>

          <div className="flex flex-col md:col-span-2 relative" ref={courseDropdownRef}>
            <label className="text-slate-300 text-sm mb-2">Allowed Courses</label>
            
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 min-h-[50px] flex flex-wrap gap-2 items-center cursor-pointer" onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}>
              {(!form.allowedCourses || form.allowedCourses.length === 0) && <span className="text-slate-500 text-sm pl-2">Any Course (All Allowed)</span>}
              
              {form.allowedCourses && form.allowedCourses.map(courseName => (
                <span key={courseName} className="bg-fuchsia-600/30 border border-fuchsia-500/50 text-fuchsia-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {courseName}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, allowedCourses: form.allowedCourses.filter(c => c !== courseName) });
                    }}
                    className="hover:text-white bg-fuchsia-900/50 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </span>
              ))}
              
              <div className="ml-auto text-slate-400 px-2 pointer-events-none">▼</div>
            </div>

            {isCourseDropdownOpen && (
              <div className="absolute top-[80px] left-0 right-0 z-50 bg-[#1e162b] border border-slate-600 rounded-xl shadow-2xl mt-2 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                  <input 
                    type="text" 
                    placeholder="Search courses..." 
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  
                  <div 
                    onClick={() => {
                      setForm({ ...form, allowedCourses: [] });
                      setIsCourseDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      (!form.allowedCourses || form.allowedCourses.length === 0) 
                        ? 'bg-fuchsia-600/20 text-white border border-fuchsia-500/30' 
                        : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${(!form.allowedCourses || form.allowedCourses.length === 0) ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-slate-600'}`}>
                      {(!form.allowedCourses || form.allowedCourses.length === 0) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <p className="font-bold text-sm text-fuchsia-300">✨ Any Course (All Allowed)</p>
                  </div>

                  <div className="h-px bg-slate-700/50 my-2 mx-2"></div>

                  {availableCourses.length === 0 ? (
                    <p className="text-slate-500 text-sm italic p-4 text-center">No courses available</p>
                  ) : (
                    availableCourses
                      .filter(c => c.name.toLowerCase().includes(courseSearchQuery.toLowerCase()))
                      .map(course => {
                        const isSelected = form.allowedCourses?.includes(course.name);
                        
                        return (
                          <div 
                            key={course._id} 
                            onClick={() => {
                              const current = form.allowedCourses || [];
                              const updated = isSelected 
                                ? current.filter(c => c !== course.name)
                                : [...current, course.name];
                              setForm({ ...form, allowedCourses: updated });
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                              isSelected 
                                ? 'bg-fuchsia-600/20 text-white' 
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-slate-600'}`}>
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                            <p className="font-medium text-sm">{course.name}</p>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>

          {user.role === "admin" && (
            <div className="flex flex-col md:col-span-2 mt-4 border-t border-slate-700 pt-6 relative" ref={coordinatorDropdownRef}>
              <label className="text-slate-300 text-sm mb-3 font-semibold">Re-assign Coordinators</label>
              
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 min-h-[56px] flex flex-wrap gap-2 items-center cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {(!form.coordinators || form.coordinators.length === 0) && <span className="text-slate-500 text-sm pl-2">Select coordinators...</span>}
                
                {form.coordinators && form.coordinators.map(coordId => {
                  const coord = availableCoordinators.find(c => c._id === coordId);
                  if (!coord) return null;
                  return (
                    <span key={coord._id} className="bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {coord.name}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({ ...form, coordinators: form.coordinators.filter(id => id !== coord._id) });
                        }}
                        className="hover:text-white bg-emerald-900/50 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
                
                <div className="ml-auto text-slate-400 px-2 pointer-events-none">
                  ▼
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-[100px] left-0 right-0 z-50 bg-[#1e162b] border border-slate-600 rounded-xl shadow-2xl mt-2 overflow-hidden animate-fadeIn">
                  <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                    <input 
                      type="text" 
                      placeholder="Search coordinators..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {availableCoordinators.length === 0 ? (
                      <p className="text-slate-500 text-sm italic p-4 text-center">No coordinators available</p>
                    ) : (
                      availableCoordinators
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(coord => {
                          const busy = isCoordinatorBusy(coord._id);
                          const isSelected = form.coordinators?.includes(coord._id);
                          
                          return (
                            <div 
                              key={coord._id} 
                              onClick={() => {
                                const current = form.coordinators || [];
                                const updated = isSelected 
                                  ? current.filter(id => id !== coord._id)
                                  : [...current, coord._id];
                                setForm({ ...form, coordinators: updated });
                              }}
                              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-600/20 text-white' 
                                  : 'hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                                  {isSelected && <span className="text-white text-xs">✓</span>}
                                </div>
                                <div>
                                  <p className={`font-medium text-sm ${busy ? 'line-through text-rose-400/50' : ''}`}>{coord.name}</p>
                                  <p className="text-xs opacity-70">{coord.email}</p>
                                </div>
                              </div>
                              {busy && (
                                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">BUSY</span>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="md:col-span-2 mt-6 flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Update Event
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;