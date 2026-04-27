import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authApi";
import { getCourses } from "../services/courseApi";
import Toast from "../components/Toast";

function Register() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "participant",
    gender: "prefer_not_to_say",
    instituteType: "SMS Varanasi",
    instituteName: "SMS Varanasi",
    course: "",
    mobileNo: ""
  });
  
  const [courses, setCourses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setIsLoaded(true);
    getCourses().then(res => {
      setCourses(res.data);
    }).catch(err => console.error("Error fetching courses", err));
  }, []);

  const validateField = (name, value) => {
    let error = "";
    if (name === "name") {
      if (!value) error = "Name is required";
      else if (!/^[a-zA-Z\s]{2,50}$/.test(value)) error = "Please enter a valid name";
    } else if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) error = "Please enter a valid email address";
    } else if (name === "mobileNo") {
      if (!value) error = "Mobile number is required";
      else if (!/^[6-9][0-9]{9}$/.test(value)) error = "Please enter a valid mobile number";
    } else if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 6) error = "Password must be at least 6 characters";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched on submit
    const allTouched = {};
    Object.keys(form).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    // Final validation check
    let isValid = true;
    Object.keys(form).forEach(key => {
      if (!validateField(key, form[key])) isValid = false;
    });

    if (!isValid) {
      setNotification({ message: "Please correct the errors in the form", type: "error" });
      return;
    }

    try {
      const res = await registerUser(form);
      sessionStorage.setItem("user", JSON.stringify(res.data));
      sessionStorage.setItem("token", res.data.token);
      
      setNotification({ message: "Account created successfully! Welcome.", type: "success" });
      
      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/admin");
        } else if (res.data.role === "coordinator") {
          navigate("/coordinator");
        } else {
          navigate("/participant");
        }
      }, 1500);
    } catch (error) {
      setNotification({ 
        message: error.response?.data?.message || "Registration failed. Please check your details.", 
        type: "error" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05050f] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      {/* Background decorations - Matching Home UI */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[15%] w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] animate-pulse"></div>

      {/* Floating Decorative Icons in Background */}
      <div className="absolute top-[15%] left-[12%] text-6xl opacity-10 animate-bounce" style={{ animationDuration: '4.5s' }}>✨</div>
      <div className="absolute bottom-[20%] right-[10%] text-6xl opacity-10 animate-bounce" style={{ animationDuration: '5.5s', animationDelay: '0.5s' }}>🚀</div>

      {/* Main Container with Glassmorphism and Fade-in Animation */}
      <div className={`relative z-10 max-w-5xl w-full flex bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-[0_0_40px_rgba(79,70,229,0.1)] transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} hover:shadow-[0_0_60px_rgba(79,70,229,0.2)] overflow-hidden`}>
        
        {/* Left Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 space-y-8 flex flex-col justify-center">
          <div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 tracking-tight">
              Create an account
            </h2>
            <p className="mt-4 text-sm text-slate-400">
              Or{" "}
              <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                sign in to your existing account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className={`w-full px-5 py-4 bg-slate-800/50 border ${(touched.name && errors.name) ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-indigo-500/50'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300`}
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.name && errors.name && <p className="mt-1 text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-fadeIn">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className={`w-full px-5 py-4 bg-slate-800/50 border ${(touched.email && errors.email) ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-indigo-500/50'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300`}
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && <p className="mt-1 text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-fadeIn">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Mobile Number</label>
                <input
                  name="mobileNo"
                  type="tel"
                  required
                  className={`w-full px-5 py-4 bg-slate-800/50 border ${(touched.mobileNo && errors.mobileNo) ? 'border-rose-500/50 focus:ring-rose-500/20' : 'border-slate-700 focus:ring-indigo-500/50'} rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300`}
                  placeholder="9876543210"
                  value={form.mobileNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.mobileNo && errors.mobileNo && <p className="mt-1 text-[10px] font-bold text-rose-400 uppercase tracking-widest animate-fadeIn">{errors.mobileNo}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 tracking-widest"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 appearance-none"
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Institute</label>
                <select
                  name="instituteType"
                  value={form.instituteType}
                  onChange={(e) => setForm({...form, instituteType: e.target.value, instituteName: e.target.value === "SMS Varanasi" ? "SMS Varanasi" : ""})}
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 appearance-none"
                >
                  <option value="SMS Varanasi">SMS Varanasi</option>
                  <option value="Outsider">Outsider</option>
                </select>
              </div>

              {form.instituteType === "Outsider" && (
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Institute Name</label>
                  <input
                    name="instituteName"
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300"
                    placeholder="Enter your Institute Name"
                    value={form.instituteName}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 block">Course</label>
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 appearance-none"
                >
                  <option value="" disabled>Select your course</option>
                  {courses.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>

        {/* Right Graphic Section (Hidden on Mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative bg-fuchsia-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Hackathon Event" 
            className="w-full h-full object-cover mix-blend-overlay opacity-50 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050f] via-fuchsia-900/40 to-transparent"></div>
          
          <div className="absolute bottom-16 left-12 right-12 text-white">
            <h3 className="text-4xl font-black mb-4 leading-tight">Start Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">Journey Today</span></h3>
            <p className="text-slate-300 text-lg">Create an account to register for exclusive events, track your ongoing progress, and connect with other participants globally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;