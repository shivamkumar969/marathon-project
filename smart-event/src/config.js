const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  getImageUrl: (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + path;
  }
};

export default config;
