import { useState, useEffect } from "react";
import axios from "axios";
import { getCourses } from "../services/courseApi";
import Toast from "./Toast";
import config from "../config";

function ParticipantProfile() {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user") || "{}"));
  const [notification, setNotification] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    mobileNo: user.mobileNo || "",
    course: user.course || ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    getCourses().then(res => setCourses(res.data)).catch(err => console.error(err));
  }, []);

  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      if (!value) error = "Name is required";
      else if (!/^[a-zA-Z\s]{2,50}$/.test(value)) error = "Please enter a valid name";
    } else if (name === "mobileNo") {
      if (!value) error = "Mobile number is required";
      else if (!/^[6-9][0-9]{9}$/.test(value)) error = "Please enter a valid mobile number";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; // Limit size to 400px
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with 0.7 quality (reduced size)
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, "image/jpeg", 0.7);
        };
      };
    });
  };

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      const file = files[0];
      if (file) {
        const compressed = await compressImage(file);
        setProfileImage(compressed);
      }
    } else {
      setForm({ ...form, [name]: value });
      if (touched[name]) validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ name: true, mobileNo: true });

    // Final validation
    let isValid = true;
    if (!validateField("name", form.name)) isValid = false;
    if (!validateField("mobileNo", form.mobileNo)) isValid = false;

    if (!isValid) {
      setNotification({ message: "Please correct the errors in the form", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("mobileNo", form.mobileNo);
      formData.append("course", form.course);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await axios.put(`${config.API_BASE_URL}/api/users/profile/${user._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      const updatedUser = { ...user, ...res.data };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setProfileImage(null);
      setNotification({ message: "Profile Updated Successfully!", type: "success" });
    } catch (error) {
      setNotification({ message: error.response?.data?.message || "Failed to update profile", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
      
      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        <div className="relative group">
          {user.profileImage ? (
            <img 
              src={config.getImageUrl(user.profileImage)} 
              alt="Profile" 
              className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-fuchsia-500/20 border-2 border-fuchsia-500/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-fuchsia-500/20">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-white">{user.name}</h2>
              <p className="text-fuchsia-400 font-semibold">{user.email}</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all border border-white/10"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn" noValidate>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Photo</label>
                <input 
                  type="file"
                  name="profileImage"
                  onChange={handleChange}
                  accept="image/*"
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-fuchsia-600 file:text-white hover:file:bg-fuchsia-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`bg-slate-800 border ${(touched.name && errors.name) ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-fuchsia-500'} rounded-xl px-4 py-3 text-white outline-none focus:ring-2 transition-all`}
                  required
                />
                {touched.name && errors.name && <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-fadeIn">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                <input 
                  name="mobileNo"
                  value={form.mobileNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`bg-slate-800 border ${(touched.mobileNo && errors.mobileNo) ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-fuchsia-500'} rounded-xl px-4 py-3 text-white outline-none focus:ring-2 transition-all`}
                  placeholder="10-digit mobile number"
                  required
                />
                {touched.mobileNo && errors.mobileNo && <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-fadeIn">{errors.mobileNo}</p>}
              </div>

              {user.role === "participant" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course / Stream</label>
                  <select 
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="md:col-span-2 flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); setForm({ name: user.name, mobileNo: user.mobileNo, course: user.course }); }}
                  className="bg-slate-800 text-slate-300 px-8 py-3 rounded-xl font-bold transition-all border border-slate-700 hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 animate-fadeIn">
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile No</p>
                <p className="text-white font-medium">{user.mobileNo || "Not provided"}</p>
              </div>
              {user.role === "participant" && (
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Course</p>
                  <p className="text-white font-medium">{user.course || "Not set"}</p>
                </div>
              )}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Institute</p>
                <p className="text-white font-medium">{user.instituteType} {user.instituteName ? `- ${user.instituteName}` : ""}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParticipantProfile;
