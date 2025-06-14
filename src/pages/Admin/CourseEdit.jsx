import React, { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  setCourseField,
  fetchCourseById,
  updateCourseById,
} from "../../Slices/courseEdit";
import { useDispatch, useSelector } from "react-redux";
const AdminCourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { course, loading, error } = useSelector((state) => state.course);
  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
    }
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(
      setCourseField({
        name,
        value:
          name === "durationHours" || name === "maxParticipants"
            ? parseInt(value)
            : value,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateCourseById({ id: courseId, courseData: course }));
    navigate(`/dashboard/admin/courses/${courseId}`, {
      state: { message: "Course updated successfully" },
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>No course data found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h2 className="text-2xl font-semibold mb-6">Edit Training Program</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={course.title || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Trainer</label>
          <input
            type="text"
            name="trainer"
            value={course.trainer || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            Description (Link)
          </label>
          <input
            type="text"
            name="description"
            value={course.description || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={course.startDate?.split("T")[0] || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            name="endDate"
            value={course.endDate?.split("T")[0] || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Mode</label>
          <select
            name="mode"
            value={course.mode || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="">Select mode</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={course.category || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Duration (Hours)</label>
          <input
            type="number"
            name="durationHours"
            value={course.durationHours || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Max Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={course.maxParticipants || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
          >
            Update Course
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseEdit;
