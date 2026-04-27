import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, forgotPassword } from "../services/authApi";
import Toast from "../components/Toast";

function Login() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await loginUser(form);
      sessionStorage.setItem("user", JSON.stringify(res.data));
      sessionStorage.setItem("token", res.data.token);

      setNotification({ message: "Login Successful! Welcome back.", type: "success" });

      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/admin");
        } else if (res.data.role === "coordinator") {
          navigate("/coordinator");
        } else {
          navigate("/participant");
        }
      }, 1000);
    } catch (error) {
      setNotification({ 
        message: error.response?.data?.message || "Invalid Email or Password", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setNotification({ message: "Please enter your email address", type: "info" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await forgotPassword({ email: resetEmail });
      setNotification({ message: res.data.message || "A new password has been sent to your email!", type: "success" });
      setIsForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      setNotification({ message: error.response?.data?.message || "Failed to reset password", type: "error" });
    } finally {
      setIsLoading(false);
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
      <div className="absolute top-[15%] left-[12%] text-6xl opacity-10 animate-bounce" style={{ animationDuration: '4s' }}>🔒</div>
      <div className="absolute bottom-[20%] right-[10%] text-6xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>👋</div>

      {/* Main Login Container with Glassmorphism and Fade-in Animation */}
      <div className={`relative z-10 max-w-5xl w-full flex bg-slate-900/60 backdrop-blur-xl rounded-4xl border border-slate-700/50 shadow-[0_0_40px_rgba(79,70,229,0.1)] transition-all duration-1000 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} hover:shadow-[0_0_60px_rgba(79,70,229,0.2)] overflow-hidden rounded-3xl`}>
        
        {/* Left Form Section */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 space-y-8 flex flex-col justify-center">
          <div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-4 text-sm text-slate-400">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Register now
              </Link>
            </p>
          </div>
          
          {isForgotPassword ? (
            <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Enter your registered email</label>
                  <input
                    name="resetEmail"
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300"
                    placeholder="john@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-slate-900 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Reset Password"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-slate-400 hover:text-white transition-colors py-2"
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-slate-300 block">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Graphic Section (Hidden on Mobile) */}
        <div className="hidden lg:block lg:w-1/2 relative bg-indigo-900 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Event Atmosphere" 
            className="w-full h-full object-cover mix-blend-overlay opacity-50 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05050f] via-indigo-900/40 to-transparent"></div>
          
          <div className="absolute bottom-16 left-12 right-12 text-white">
            <h3 className="text-4xl font-black mb-4 leading-tight">Empower Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Upcoming Events</span></h3>
            <p className="text-slate-300 text-lg">Join the premier platform for seamlessly discovering, managing, and participating in world-class events of all kinds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;