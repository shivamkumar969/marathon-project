import { useState, useEffect, useRef } from "react";
import { createEvent, getEvents } from "../services/eventApi";
import { getCoordinators } from "../services/authApi";
import { getCourses } from "../services/courseApi";

function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    fee: 0,
    coordinators: [],
    allowedInstitutes: "any",
    allowedCourses: [],
    maxWinners: 3
  });

  const [availableCoordinators, setAvailableCoordinators] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  const courseDropdownRef = useRef(null);
  const coordinatorDropdownRef = useRef(null);

  const [bannerPreview, setBannerPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
      if (coordinatorDropdownRef.current && !coordinatorDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coordsRes, eventsRes, coursesRes] = await Promise.all([
          getCoordinators(),
          getEvents(),
          getCourses()
        ]);
        setAvailableCoordinators(coordsRes.data);
        setAllEvents(eventsRes.data);
        setAvailableCourses(coursesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const isCoordinatorBusy = (coordId) => {
    if (!form.date) return false;
    return allEvents.some(event => event.date === form.date && event.coordinators?.includes(coordId));
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
        formData.append(key, JSON.stringify(form[key]));
      } else {
        formData.append(key, form[key]);
      }
    });

    try {
      await createEvent(formData);
      alert("Event Created Successfully");
      setForm({
        title: "",
        description: "",
        date: "",
        venue: "",
        fee: 0,
        coordinators: [],
        allowedInstitutes: "any",
        allowedCourses: [],
        maxWinners: 3
      });
      setBannerPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      alert("Failed to Create Event: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col md:col-span-2">
          <label className="text-slate-300 text-sm mb-3">Event Banner (High Quality Promotional Image)</label>
          <div 
            className="relative w-full h-48 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-all flex flex-col items-center justify-center cursor-pointer bg-slate-800/50 overflow-hidden"
            onClick={() => fileInputRef.current.click()}
          >
            {bannerPreview ? (
              <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <span className="text-4xl mb-2 block">🖼️</span>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Click to Upload Banner</p>
                <p className="text-slate-600 text-[10px] mt-1">Recommended: 1200x400 (3:1 Ratio)</p>
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

        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Event Title</label>
          <input
            name="title"
            placeholder="E.g. CodeChef Hackathon"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Venue</label>
          <input
            name="venue"
            placeholder="E.g. Main Auditorium"
            value={form.venue}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            required
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-slate-300 text-sm mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Event details..."
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 h-24"
            required
          ></textarea>
        </div>

        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Event Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Event Fee (₹ per Participant)</label>
          <input
            type="number"
            name="fee"
            min="0"
            value={form.fee}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Allowed Institute</label>
          <select
            name="allowedInstitutes"
            value={form.allowedInstitutes}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="any">Any Institute</option>
            <option value="SMS Varanasi">SMS Varanasi Only</option>
            <option value="Outsider">Outsiders Only</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Maximum Winners (Top N)</label>
          <input
            type="number"
            name="maxWinners"
            min="1"
            max="20"
            value={form.maxWinners}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            required
          />
        </div>

        <div className="flex flex-col relative" ref={courseDropdownRef}>
          <label className="text-slate-300 text-sm mb-2">Allowed Courses</label>
          
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 min-h-[50px] flex flex-wrap gap-2 items-center cursor-pointer" onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}>
            {form.allowedCourses.length === 0 && <span className="text-slate-500 text-sm pl-2">Any Course (All Allowed)</span>}
            
            {form.allowedCourses.map(courseName => (
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500"
                />
              </div>
              <div className="max-h-56 overflow-y-auto custom-scrollbar p-2 space-y-1">
                
                {/* Special "Any Course" Option */}
                <div 
                  onClick={() => {
                    setForm({ ...form, allowedCourses: [] });
                    setIsCourseDropdownOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    form.allowedCourses.length === 0 
                      ? 'bg-fuchsia-600/20 text-white border border-fuchsia-500/30' 
                      : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${form.allowedCourses.length === 0 ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-slate-600'}`}>
                    {form.allowedCourses.length === 0 && <span className="text-white text-xs">✓</span>}
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
                      const isSelected = form.allowedCourses.includes(course.name);
                      
                      return (
                        <div 
                          key={course._id} 
                          onClick={() => {
                            const updated = isSelected 
                              ? form.allowedCourses.filter(c => c !== course.name)
                              : [...form.allowedCourses, course.name];
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

        <div className="flex flex-col md:col-span-2 relative" ref={coordinatorDropdownRef}>
          <label className="text-slate-300 text-sm mb-3">Assign Coordinators</label>
          
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 min-h-[56px] flex flex-wrap gap-2 items-center cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {form.coordinators.length === 0 && <span className="text-slate-500 text-sm pl-2">Select coordinators...</span>}
            
            {form.coordinators.map(coordId => {
              const coord = availableCoordinators.find(c => c._id === coordId);
              if (!coord) return null;
              return (
                <span key={coord._id} className="bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {coord.name}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, coordinators: form.coordinators.filter(id => id !== coord._id) });
                    }}
                    className="hover:text-white bg-indigo-900/50 rounded-full w-4 h-4 flex items-center justify-center"
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
            <div className="absolute top-[80px] left-0 right-0 z-50 bg-[#1e162b] border border-slate-600 rounded-xl shadow-2xl mt-2 overflow-hidden animate-fadeIn">
              <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <input 
                  type="text" 
                  placeholder="Search coordinators..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
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
                      const isSelected = form.coordinators.includes(coord._id);
                      
                      return (
                        <div 
                          key={coord._id} 
                          onClick={() => {
                            const updated = isSelected 
                              ? form.coordinators.filter(id => id !== coord._id)
                              : [...form.coordinators, coord._id];
                            setForm({ ...form, coordinators: updated });
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600/20 text-white' 
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
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

        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;