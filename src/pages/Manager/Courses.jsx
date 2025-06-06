import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { PlusCircle, X, Search, Filter, Calendar, Clock, Users, Briefcase, ChevronDown, ArrowLeft, Trash2, Edit } from 'lucide-react';

const ManagerCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    trainer: '',
    startDate: '',
    endDate: '',
    mode: 'Online',
    durationHours: '',
    maxParticipants: '',
    category: '',
    createdBy: ''
  });

  useEffect(() => {
    if (user && user.userId) {
      setNewCourse(prev => ({
        ...prev,
        createdBy: user.userId
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get('/TrainingPrograms')
      .then(response => {
        setCourses(response.data);
        setFilteredCourses(response.data);

        const uniqueCategories = [...new Set(response.data.map(course => course.category))].filter(Boolean);
        setCategories(uniqueCategories);

        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching courses:", error);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    let result = [...courses];

    if (searchTerm) {
      result = result.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.trainer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      result = result.filter(course => course.category === filterCategory);
    }

    result.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (sortBy === 'startDate' || sortBy === 'endDate') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCourses(result);
  }, [searchTerm, filterCategory, courses, sortBy, sortOrder]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleAddCourse = (e) => {
    e.preventDefault();

    if (!user || !user.userId) {
      alert("You must be logged in to add a course");
      return;
    }

    const courseToAdd = {
      ...newCourse,
      createdBy: user.userId
    };

    setSubmitting(true);

    api.post('/TrainingPrograms', courseToAdd)
      .then(response => {
        setCourses(prevCourses => [...prevCourses, response.data]);

        if (newCourse.category && !categories.includes(newCourse.category)) {
          setCategories(prev => [...prev, newCourse.category]);
        }

        setNewCourse({
          title: '',
          description: '',
          trainer: '',
          startDate: '',
          endDate: '',
          mode: 'Online',
          durationHours: '',
          maxParticipants: '',
          category: '',
          createdBy: user.userId
        });

        setShowForm(false);
        setSubmitting(false);
      })
      .catch(error => {
        console.error("Error adding course:", error);
        alert("Failed to add course. Please try again.");
        setSubmitting(false);
      });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortBy('startDate');
    setSortOrder('asc');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/manager/courses/${courseId}`);
  };

  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="group text-3xl font-bold text-slate-800 mb-4 md:mb-0 relative inline-block">
            <span className="relative z-10">Manager - Manage Courses</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-200 opacity-50 -z-10 transform -rotate-1 group-hover:rotate-0 group-hover:h-4 transition-all duration-500"></span>
          </h2>

          <button
            onClick={() => setShowForm(!showForm)}
            className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            aria-expanded={showForm}
          >
            {showForm ? (
              <>
                <X size={18} className="transition-transform duration-300 group-hover:rotate-90" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} className="transition-transform duration-300 group-hover:scale-110" />
                <span>Add New Course</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-300"
              >
                <Filter size={16} className="text-slate-500" />
                <span>Filters</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-300 ${filtersVisible ? 'rotate-180' : ''}`}
                />
              </button>

              {(searchTerm || filterCategory || sortBy !== 'startDate' || sortOrder !== 'asc') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors duration-300"
                >
                  <X size={16} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out mt-4 ${filtersVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300"
                >
                  <option value="title">Title</option>
                  <option value="startDate">Start Date</option>
                  <option value="endDate">End Date</option>
                  <option value="durationHours">Duration</option>
                  <option value="maxParticipants">Max Participants</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out mb-6 ${showForm ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-emerald-500 transform transition-all duration-500">
            <h3 className="text-xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
              <PlusCircle size={20} />
              Create New Training Course
            </h3>

            <form onSubmit={handleAddCourse}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="group">
                  <label className="block text-slate-700 text-sm font-medium mb-1">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Advanced Web Development"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-slate-700 text-sm font-medium mb-1">Trainer *</label>
                  <input
                    type="text"
                    name="trainer"
                    placeholder="e.g. John Smith"
                    value={newCourse.trainer}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    required
                  />
                </div>

                <div className="group">
                  <label className="text-slate-700 text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar size={16} className="text-emerald-500" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newCourse.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    required
                  />
                </div>

                <div className="group">
                  <label className="text-slate-700 text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar size={16} className="text-emerald-500" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newCourse.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-slate-700 text-sm font-medium mb-1">Mode *</label>
                  <select
                    name="mode"
                    value={newCourse.mode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    required
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="group">
                  <label className="text-slate-700 text-sm font-medium mb-1 flex items-center gap-1">
                    <Clock size={16} className="text-emerald-500" />
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    name="durationHours"
                    placeholder="e.g. 24"
                    value={newCourse.durationHours}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    required
                    min="1"
                  />
                </div>

                <div className="group">
                  <label className="text-slate-700 text-sm font-medium mb-1 flex items-center gap-1">
                    <Users size={16} className="text-emerald-500" />
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    placeholder="e.g. 20"
                    value={newCourse.maxParticipants}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    min="1"
                  />
                </div>

                <div className="group">
                  <label className="text-slate-700 text-sm font-medium mb-1 flex items-center gap-1">
                    <Briefcase size={16} className="text-emerald-500" />
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g. Technical, Soft Skills"
                    value={newCourse.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((category, index) => (
                      <option key={index} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="mb-4 group truncate">
                <label className="block text-slate-700 text-sm font-medium mb-1 ">Description *</label>
                <textarea
                  name="description"
                  placeholder="Provide a detailed description of the course..."
                  value={newCourse.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all duration-300 group-hover:border-emerald-300 truncate"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="mr-2 py-2 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-300 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || !user}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Save Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {!loading && filteredCourses.length > 0 && (
          <div className="flex justify-between items-center mb-4 text-sm text-slate-600">
            <div>
              <span className="font-medium">{filteredCourses.length}</span> courses found
              {(searchTerm || filterCategory) && (
                <span> • Filtered results</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span>Sorted by:</span>
              <button
                onClick={() => handleSort(sortBy)}
                className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-800"
              >
                {sortBy === 'title' && 'Title'}
                {sortBy === 'startDate' && 'Start Date'}
                {sortBy === 'endDate' && 'End Date'}
                {sortBy === 'durationHours' && 'Duration'}
                {sortBy === 'maxParticipants' && 'Max Participants'}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.programId || course.id}
                    className="opacity-0 animate-fade-in-up cursor-pointer transform transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                    onClick={() => handleCourseClick(course.programId || course.id)}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <Search size={24} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-500 mb-4 max-w-md mx-auto">
                  {searchTerm || filterCategory ?
                    'Try adjusting your search or filter criteria to find what you\'re looking for.' :
                    'Get started by adding your first course. Click the "Add New Course" button above.'}
                </p>
                {(searchTerm || filterCategory) && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
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
        
        @keyframes slideInRight {
          from {
            transform: translate3d(20px, 0, 0);
            opacity: 0;
          }
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.4s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ManagerCourses;