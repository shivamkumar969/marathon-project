import React, { useEffect } from "react";

function Toast({ message, type = "error", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = {
    error: "bg-rose-500/10 border-rose-500/50 text-rose-200",
    success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-200",
    info: "bg-blue-500/10 border-blue-500/50 text-blue-200"
  };

  const icons = {
    error: "⚠️",
    success: "✅",
    info: "ℹ️"
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slideUp ${bgStyles[type]}`}>
      <span className="text-xl">{icons[type]}</span>
      <p className="text-sm font-bold tracking-wide">{message}</p>
      <button 
        onClick={onClose}
        className="ml-4 text-white/40 hover:text-white/80 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
