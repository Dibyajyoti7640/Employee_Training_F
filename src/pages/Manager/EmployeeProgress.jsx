import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Monitor, Award, BookOpen, ChevronRight, Filter, Search, Grid, List } from 'lucide-react';

const EmployeeProgress = ({ userId }) => {
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  console.log(userId)

  const statusConfig = {
    'Registered': {
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <BookOpen size={14} className="mr-1" />,
      progress: 0
    },
    'In Progress': {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock size={14} className="mr-1" />,
      progress: 50
    },
    'Completed': {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Award size={14} className="mr-1" />,
      progress: 100
    },
    'Dropped': {
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: <ChevronRight size={14} className="mr-1" />,
      progress: 0
    }
  };

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = (startDate, endDate, status) => {
    if (status === 'Completed') return 100;
    if (status === 'Dropped') return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (today < start) return 0;
    if (today > end) return 100;

    const totalDuration = end - start;
    const elapsed = today - start;
    return Math.round((elapsed / totalDuration) * 100);
  };

  useEffect(() => {
    const fetchEmployeeRegistrations = async () => {
      if (!userId) {
        setLoading(false);
        setError("No user ID provided.");
        return;
      }

      try {
        setLoading(true);

        const registrationsResponse = await api.get('/Registrations');
        const registrationsData = registrationsResponse.data;

        const employeeRegistrations = registrationsData.filter(
          reg => reg.userId === Number(userId) && reg.programId !== null
        );

        setRegistrations(employeeRegistrations);

        const courseIds = [...new Set(employeeRegistrations.map(reg => reg.programId))];

        if (courseIds.length > 0) {
          try {
            const courseDetailsPromises = courseIds.map(id =>
              api.get(`/TrainingPrograms/${id}`)
            );

            const courseResponses = await Promise.all(courseDetailsPromises);

            const courseMap = {};
            courseResponses.forEach(response => {
              const course = response.data;
              courseMap[course.programId] = course;
            });
            setCourses(courseMap);
          } catch (courseError) {
            console.error("Error fetching course details:", courseError);
          }
        }
      } catch (err) {
        setError("Failed to load course registrations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeRegistrations();
  }, [userId]);

  const filteredRegistrations = registrations
    .filter(registration => {
      const course = courses[registration.programId] || {};
      const matchesSearch = course.title
        ? course.title.toLowerCase().includes(searchTerm.toLowerCase())
        : false;
      const matchesFilter = filterStatus === 'all' || registration.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const courseA = courses[a.programId] || {};
      const courseB = courses[b.programId] || {};

      if (sortBy === 'date') {
        return new Date(b.registeredAt) - new Date(a.registeredAt);
      } else if (sortBy === 'title') {
        return (courseA.title || '').localeCompare(courseB.title || '');
      } else if (sortBy === 'progress') {
        const progressA = calculateProgress(
          courseA.startDate,
          courseA.endDate,
          a.status
        );
        const progressB = calculateProgress(
          courseB.startDate,
          courseB.endDate,
          b.status
        );
        return progressB - progressA;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-indigo-300 animate-spin absolute top-2 left-2"></div>
        </div>
        <p className="ml-4 text-indigo-600 font-medium animate-pulse">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-rose-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="font-semibold text-lg">Error Loading Courses</h3>
        </div>
        <p className="mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-300 flex items-center shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Retry
        </button>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 shadow-sm">
        <div className="flex items-center mb-3">
          <svg className="w-6 h-6 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="font-semibold text-lg">User ID Required</h3>
        </div>
        <p className="mb-4">A valid user ID is required to view course progress.</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Course Progress</h2>
        <div className="p-8 bg-gray-50 rounded-xl shadow-sm border border-gray-200 max-w-lg mx-auto transform transition-all duration-300 hover:scale-105 hover:shadow-md">
          <div className="mb-6 text-gray-400">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <p className="text-lg text-gray-600 mb-6">This employee is not registered for any courses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Course Progress</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 w-full sm:w-auto"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Registered">Registered</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="progress">Sort by Progress</option>
            </select>

            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600">No courses match your search criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map(registration => {
            const course = courses[registration.programId] || {};
            const daysRemaining = course.endDate ? calculateDaysRemaining(course.endDate) : 0;
            const progressPercentage = course.startDate && course.endDate
              ? calculateProgress(course.startDate, course.endDate, registration.status)
              : statusConfig[registration.status]?.progress || 0;

            return (
              <div
                key={registration.registrationId}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 group"
              >
                <div className="p-4 border-b border-gray-200 relative">
                  <div
                    className="absolute top-0 right-0 w-16 h-16 overflow-hidden"
                    style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                  >
                    <div className={`w-full h-full ${registration.status === 'Completed' ? 'bg-emerald-100' :
                        registration.status === 'In Progress' ? 'bg-amber-100' :
                          registration.status === 'Dropped' ? 'bg-rose-100' : 'bg-indigo-100'
                      }`}></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors duration-300">
                    {course.title || "Unknown Course"}
                  </h3>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center border ${statusConfig[registration.status]?.color || 'bg-gray-100'}`}>
                      {statusConfig[registration.status]?.icon}
                      {registration.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-3 text-sm">
                    {course.trainer && (
                      <div className="flex items-start">
                        <User size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 block text-xs">Trainer</span>
                          <span className="text-gray-800 font-medium">{course.trainer}</span>
                        </div>
                      </div>
                    )}

                    {course.mode && (
                      <div className="flex items-start">
                        <Monitor size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 block text-xs">Mode</span>
                          <span className="text-gray-800 font-medium">{course.mode}</span>
                        </div>
                      </div>
                    )}

                    {course.startDate && (
                      <div className="flex items-start">
                        <Calendar size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 block text-xs">Duration</span>
                          <span className="text-gray-800 font-medium">
                            {format(new Date(course.startDate), 'MMM d, yyyy')}
                            {course.endDate && ` - ${format(new Date(course.endDate), 'MMM d, yyyy')}`}
                          </span>
                        </div>
                      </div>
                    )}

                    {course.durationHours && (
                      <div className="flex items-start">
                        <Clock size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="text-gray-500 block text-xs">Hours</span>
                          <span className="text-gray-800 font-medium">{course.durationHours} hours</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Time Elapsed</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${registration.status === 'Completed' ? 'bg-emerald-500' :
                            registration.status === 'In Progress' ? 'bg-amber-500' :
                              registration.status === 'Dropped' ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                  {daysRemaining > 0 ? (
                    <span className={`text-sm ${daysRemaining < 7 ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                      <span className="font-medium">{daysRemaining}</span> days remaining
                    </span>
                  ) : (
                    <span className="text-sm text-gray-600">Course ended</span>
                  )}


                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map(registration => {
                  const course = courses[registration.programId] || {};
                  const progressPercentage = course.startDate && course.endDate
                    ? calculateProgress(course.startDate, course.endDate, registration.status)
                    : statusConfig[registration.status]?.progress || 0;

                  return (
                    <tr
                      key={registration.registrationId}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{course.title || "Unknown Course"}</div>
                        {course.mode && <div className="text-xs text-gray-500">{course.mode}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center w-fit border ${statusConfig[registration.status]?.color || 'bg-gray-100'}`}>
                          {statusConfig[registration.status]?.icon}
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.trainer || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.startDate ? (
                          <div>
                            <div>{format(new Date(course.startDate), 'MMM d, yyyy')}</div>
                            {course.endDate && <div className="text-xs">to {format(new Date(course.endDate), 'MMM d, yyyy')}</div>}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${registration.status === 'Completed' ? 'bg-emerald-500' :
                                  registration.status === 'In Progress' ? 'bg-amber-500' :
                                    registration.status === 'Dropped' ? 'bg-rose-500' : 'bg-indigo-500'
                                }`}
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/dashboard/course/${registration.programId}`)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProgress;