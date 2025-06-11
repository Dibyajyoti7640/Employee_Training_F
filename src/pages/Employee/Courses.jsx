import React, { useState, useEffect } from "react";
import CourseCard from "../../components/CourseCard";
import api from "../../services/api";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

const EmployeeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewLayout, setViewLayout] = useState("grid");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    certificates: 0,
  });
  const navigate = useNavigate();

  const predefinedCategories = [
    "Technical",
    "Leadership",
    "Soft Skills",
    "Compliance",
  ];

  const getCourseStatus = (course) => {
    if (!course.endDate) return "ongoing";
    const currentDate = new Date();
    const endDate = new Date(course.endDate);

    if (currentDate > endDate) {
      return "completed";
    }

    return "in_progress";
  };

  const calculateStats = (courses) => {
    let completed = 0;
    let inProgress = 0;
    let certificates = 0;

    courses.forEach((course) => {
      const status = getCourseStatus(course);

      switch (status) {
        case "completed":
          completed++;
          if (course.certificateAvailable !== false) {
            certificates++;
          }
          break;
        case "in_progress":
        case "ongoing":
          inProgress++;
          break;
        default:
          break;
      }
    });

    return { completed, inProgress, certificates };
  };

  const handleStatusFilter = (status) => {
    if (selectedStatus === status) {
      setSelectedStatus("all");
    } else {
      setSelectedStatus(status);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/TrainingPrograms");
        setCourses(response.data);
        setFilteredCourses(response.data);

        const newStats = calculateStats(response.data);
        setStats(newStats);

        const uniqueCategories = [
          ...new Set(response.data.map((course) => course.category)),
        ].filter(Boolean);
        setCategories([
          ...predefinedCategories,
          ...uniqueCategories.filter(
            (cat) => !predefinedCategories.includes(cat)
          ),
        ]);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  useEffect(() => {
    let result = [...courses];

    if (selectedCategory !== "all") {
      result = result.filter((course) => course.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      result = result.filter((course) => {
        const courseStatus = getCourseStatus(course);
        if (selectedStatus === "completed") {
          return courseStatus === "completed";
        } else if (selectedStatus === "in_progress") {
          return courseStatus === "in_progress" || courseStatus === "ongoing";
        }
        return true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.trainer.toLowerCase().includes(term)
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt || b.startDate) -
            new Date(a.createdAt || a.startDate)
        );
        break;
      case "popular":
        result.sort(
          (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
        );
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "startDate":
        result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case "duration":
        result.sort((a, b) => (a.durationHours || 0) - (b.durationHours || 0));
        break;
      default:
        break;
    }

    if (sortOrder === "desc" && sortBy !== "newest") {
      result.reverse();
    }

    setFilteredCourses(result);
  }, [
    courses,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("newest");
    setSortOrder("asc");
    setFiltersVisible(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/employee/courses/${courseId}`);
  };

  const getCourseStatusForDisplay = (course) => {
    return getCourseStatus(course);
  };

  if (!isLoading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6">
      <div
        className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 animate-fadeIn"
        style={{
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slideDown">
            <div>
              <h2 className="group text-3xl font-bold text-gray-800 flex items-center relative">
                <BookOpen className="mr-2 text-indigo-500" />
                <span className="relative z-10">Learning Portal</span>
                <span className="absolute bottom-1 left-8 w-full h-3 bg-indigo-200 opacity-50 -z-10 transform -rotate-1 group-hover:rotate-0 group-hover:h-4 transition-all duration-500"></span>
              </h2>
              <p className="text-gray-600 mt-1">
                Discover courses to enhance your skills
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="flex bg-gray-100 p-1 rounded-md">
                <button
                  onClick={() => setViewLayout("grid")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewLayout === "grid"
                      ? "bg-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button
                  onClick={() => setViewLayout("list")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewLayout === "list"
                      ? "bg-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div
            className="bg-gray-50 p-4 rounded-lg mb-8 animate-slideUp"
            style={{
              animation: "slideUp 0.5s ease-out 0.2s both",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-300"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-300"
                >
                  <Filter size={16} className="text-gray-400" />
                  <span>Filters</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 ${
                      filtersVisible ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {(searchTerm ||
                  selectedCategory !== "all" ||
                  selectedStatus !== "all" ||
                  sortBy !== "newest") && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
                  >
                    <X size={16} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out mt-4 ${
                filtersVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter size={18} className="text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm transition-all duration-300"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm transition-all duration-300"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm transition-all duration-300"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="popular">Most Popular</option>
                      <option value="title">Alphabetical</option>
                      <option value="startDate">Start Date</option>
                      <option value="duration">Duration</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <div className="relative">
                    <select
                      className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm transition-all duration-300"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            style={{
              animation: "slideUp 0.5s ease-out 0.3s both",
            }}
          >
            <button
              onClick={() => handleStatusFilter("completed")}
              className={`bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg flex items-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedStatus === "completed"
                  ? "ring-2 ring-blue-500 shadow-lg scale-105"
                  : ""
              }`}
            >
              <div className="bg-blue-200 rounded-full p-3 mr-4">
                <Award size={24} className="text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  {stats.completed} Completed
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedStatus === "completed"
                    ? "Showing completed courses"
                    : "Click to filter completed"}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleStatusFilter("in_progress")}
              className={`bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg flex items-center transform transition-all duration-300 hover:scale-105 hover:shadow-lg text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                selectedStatus === "in_progress"
                  ? "ring-2 ring-purple-500 shadow-lg scale-105"
                  : ""
              }`}
            >
              <div className="bg-purple-200 rounded-full p-3 mr-4">
                <Clock size={24} className="text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">
                  {stats.inProgress} In Progress
                </h3>
                <p className="text-sm text-purple-700">
                  {selectedStatus === "in_progress"
                    ? "Showing in progress courses"
                    : "Click to filter in progress"}
                </p>
              </div>
            </button>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg flex items-center transform transition-all duration-300 hover:scale-105">
              <div className="bg-green-200 rounded-full p-3 mr-4">
                <CheckCircle size={24} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  {stats.certificates} Certificates
                </h3>

                <p className="text-sm text-green-700">Earned so far</p>
              </div>
            </div>
          </div>

          {selectedStatus !== "all" && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filter:</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedStatus === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {selectedStatus === "completed" ? (
                  <>
                    <Award size={14} className="mr-1" />
                    Completed Courses
                  </>
                ) : (
                  <>
                    <Clock size={14} className="mr-1" />
                    In Progress Courses
                  </>
                )}
                <button
                  onClick={() => setSelectedStatus("all")}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </span>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              {isLoading ? (
                "Loading courses..."
              ) : filteredCourses.length === 0 ? (
                "No courses found"
              ) : (
                <div className="flex items-center gap-4">
                  <span>
                    {filteredCourses.length}{" "}
                    {filteredCourses.length === 1 ? "course" : "courses"} found
                  </span>
                  {(searchTerm ||
                    selectedCategory !== "all" ||
                    selectedStatus !== "all") && (
                    <span className="text-sm text-gray-500">
                      • Filtered results
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isLoading && filteredCourses.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Sorted by:</span>
                <button
                  onClick={() => handleSort(sortBy)}
                  className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
                >
                  {sortBy === "title" && "Title"}
                  {sortBy === "newest" && "Newest"}
                  {sortBy === "popular" && "Popular"}
                  {sortBy === "startDate" && "Start Date"}
                  {sortBy === "duration" && "Duration"}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No courses found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors duration-300"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewLayout === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn"
                  : "space-y-4 animate-fadeIn"
              }
            >
              {filteredCourses.map((course, index) => {
                const courseStatus = getCourseStatusForDisplay(course);
                return (
                  <div
                    key={course.programId || course.id}
                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer opacity-0 animate-fade-in-up relative"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${
                        0.1 + index * 0.05
                      }s both`,
                    }}
                    onClick={() =>
                      handleCourseClick(course.programId || course.id)
                    }
                  >
                    <div className="absolute top-2 right-2 z-10">
                      {courseStatus === "completed" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} className="mr-1" />
                          Completed
                        </span>
                      )}
                      {(courseStatus === "in_progress" ||
                        courseStatus === "ongoing") && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock size={12} className="mr-1" />
                          In Progress
                        </span>
                      )}
                    </div>
                    <CourseCard course={course} layout={viewLayout} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmployeeCourses;
