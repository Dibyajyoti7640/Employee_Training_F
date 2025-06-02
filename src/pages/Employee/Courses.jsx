import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard';
import api from '../../services/api';
import { Search, Filter, BookOpen, Clock, Award, CheckCircle } from 'lucide-react';

const EmployeeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewLayout, setViewLayout] = useState('grid');

  const categories = ['Technical', 'Leadership', 'Soft Skills', 'Compliance'];

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/TrainingPrograms');
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let result = [...courses];
    
    if (selectedCategory !== 'all') {
      result = result.filter(course => course.category === selectedCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term)
      );
    }
    
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        result.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setFilteredCourses(result);
  }, [courses, searchTerm, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6">
      <div 
        className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 animate-fadeIn"
        style={{
          animation: "fadeIn 0.6s ease-out"
        }}
      >
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-slideDown">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <BookOpen className="mr-2 text-indigo-500" />
                Learning Portal
              </h2>
              <p className="text-gray-600 mt-1">Discover courses to enhance your skills</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="flex bg-gray-100 p-1 rounded-md">
                <button 
                  onClick={() => setViewLayout('grid')}
                  className={`p-2 rounded-md ${viewLayout === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button 
                  onClick={() => setViewLayout('list')}
                  className={`p-2 rounded-md ${viewLayout === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              {/* <div className="hidden md:flex items-center space-x-1 text-sm">
                <span className="text-gray-500">My Progress:</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-0"></div>
                </div>
                <span className="font-medium">0%</span>
              </div> */}
            </div>
          </div>

          <div 
            className="bg-gray-50 p-4 rounded-lg mb-8 animate-slideUp"
            style={{
              animation: "slideUp 0.5s ease-out 0.2s both"
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={18} className="text-gray-400" />
                </div>
                <select 
                  className="block w-full pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <select 
                  className="block w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">Alphabetical</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <button 
                onClick={resetFilters}
                className="md:w-auto w-full px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            style={{
              animation: "slideUp 0.5s ease-out 0.3s both"
            }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg flex items-center">
              <div className="bg-blue-200 rounded-full p-3 mr-4">
                <Award size={24} className="text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">0 Completed</h3>
                <p className="text-sm text-blue-700">Courses finished</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg flex items-center">
              <div className="bg-purple-200 rounded-full p-3 mr-4">
                <Clock size={24} className="text-purple-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900">0 In Progress</h3>
                <p className="text-sm text-purple-700">Currently learning</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg flex items-center">
              <div className="bg-green-200 rounded-full p-3 mr-4">
                <CheckCircle size={24} className="text-green-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">0 Certificates</h3>
                <p className="text-sm text-green-700">Earned so far</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {isLoading ? 'Loading courses...' : 
                filteredCourses.length === 0 ? 'No courses found' : 
                `Showing ${filteredCourses.length} ${filteredCourses.length === 1 ? 'course' : 'courses'}`
              }
            </p>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No courses found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <button 
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className={viewLayout === 'grid' ? 
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" : 
              "space-y-4 animate-fadeIn"
            }>
              {filteredCourses.map((course, index) => (
                <div 
                  key={course.id}
                  className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${0.1 + index * 0.05}s both`
                  }}
                >
                  <CourseCard course={course} layout={viewLayout} />
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination
          {filteredCourses.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 font-medium">1</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">2</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">3</button>
                <button className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )} */}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeCourses;