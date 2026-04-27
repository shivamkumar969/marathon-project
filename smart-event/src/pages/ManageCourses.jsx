import React, { useState, useEffect } from "react";
import { getCourses, createCourse, deleteCourse } from "../services/courseApi";

function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setLoading(true);
    try {
      await createCourse({ name: newCourseName });
      setNewCourseName("");
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-[#1a1325]/80 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-lg border border-fuchsia-900/30">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📚</span> Manage Academic Courses
        </h2>

        <form onSubmit={handleAddCourse} className="flex flex-col sm:flex-row gap-4 mb-10">
          <input 
            type="text" 
            placeholder="e.g. B.Tech Computer Science" 
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all whitespace-nowrap disabled:opacity-50"
          >
            {loading ? "Adding..." : "+ Add Course"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course._id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center group hover:border-indigo-500/50 transition-colors">
              <span className="text-white font-medium">{course.name}</span>
              <button 
                onClick={() => handleDeleteCourse(course._id)}
                className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-300 p-2 bg-rose-500/10 rounded-lg"
                title="Delete Course"
              >
                ✕
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-slate-500 text-center py-8">
              No courses added yet. Add courses above to allow students to select them during registration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageCourses;
