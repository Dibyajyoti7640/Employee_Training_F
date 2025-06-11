import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseMaterialModal from "../../components/CourseMaterialModal";
import api from "../../services/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  User,
  BookOpen,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Monitor,
  Building,
} from "lucide-react";

const ManagerCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/TrainingPrograms/${courseId}`);
        setCourse(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/TrainingPrograms/${courseId}`);
      navigate("/manager/courses", {
        state: { message: "Course deleted successfully" },
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/dashboard/manager/courses/${courseId}/edit`);
  };

  const handleBack = () => {
    navigate("/dashboard/manager/courses");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = () => {
    if (!course || !course.startDate || !course.endDate) return null;

    const now = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);

    if (now < startDate) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Clock size={14} className="mr-1" />
          Upcoming
        </span>
      );
    } else if (now >= startDate && now <= endDate) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle size={14} className="mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <CheckCircle size={14} className="mr-1" />
          Completed
        </span>
      );
    }
  };

  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case "online":
        return <Globe size={16} className="text-blue-500" />;
      case "offline":
        return <Building size={16} className="text-green-500" />;
      case "hybrid":
        return <Monitor size={16} className="text-purple-500" />;
      default:
        return <BookOpen size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Course Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            {error || "The course you are looking for does not exist."}
          </p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen size={24} className="text-emerald-600" />
                                Course Overview
                            </h2>
                            <div className="prose max-w-none">
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, '<br/>') }}
                                />
                            </div>
                        </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">
                  {course.title}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-slate-600 text-lg">Training Program Details</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Edit3 size={16} />
                Edit Course
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen size={24} className="text-emerald-600" />
                Course Overview
              </h2>
              <div className="prose max-w-none">
                <p className="text-slate-700 leading-relaxed text-lg">
                  {course.description ||
                    "No description provided for this course."}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-emerald-600" />
                Schedule & Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={20} className="text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Start Date</h3>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {formatDate(course.startDate)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={20} className="text-green-600" />
                    <h3 className="font-semibold text-slate-800">End Date</h3>
                  </div>
                  <p className="text-slate-700 font-medium">
                    {formatDate(course.endDate)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setMaterialModalOpen(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen size={16} />
                  Course Materials
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Course Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <User size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Instructor
                    </p>
                    <p className="text-slate-600">
                      {course.trainer || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Duration
                    </p>
                    <p className="text-slate-600">
                      {course.durationHours || "Not specified"} hours
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Users size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      Max Participants
                    </p>
                    <p className="text-slate-600">
                      {course.maxParticipants || "Unlimited"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  {getModeIcon(course.mode)}
                  <div>
                    <p className="text-sm font-medium text-slate-800">Mode</p>
                    <p className="text-slate-600">
                      {course.mode || "Not specified"}
                    </p>
                  </div>
                </div>

                {course.category && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Star size={20} className="text-slate-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Category
                      </p>
                      <p className="text-slate-600">{course.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-auto">
              <div className="text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Delete Course
                </h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete "{course.title}"? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <CourseMaterialModal
          isOpen={materialModalOpen}
          onClose={() => setMaterialModalOpen(false)}
          courseId={courseId}
          courseTitle={course.title}
          userRole="Manager"
        />
      </div>
    </div>
  );
};

export default ManagerCourseDetails;
