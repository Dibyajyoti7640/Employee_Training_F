import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Check, Info, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

const EmployeeRegister = () => {
  const [courses, setCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ type: '', message: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const coursesResponse = await api.get('/TrainingPrograms');
        setCourses(coursesResponse.data);

        try {
          const registrationsResponse = await api.get(`/registrations/user/${user.userId}`);
          const registeredProgramIds = registrationsResponse.data.map(reg => reg.programId);
          setRegisteredCourses(registeredProgramIds);
        } catch (regError) {
          console.warn('No registrations found for user:', regError);
          setRegisteredCourses([]);
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.userId) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user?.userId]);

  const handleChange = (event) => {
    const courseId = Number(event.target.value);
    setSelectedOption(courseId);
    
    if (courseId) {
      const course = courses.find(c => c.programId === courseId);
      setSelectedCourse(course);
    } else {
      setSelectedCourse(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!selectedOption) {
      setPopupMessage({
        type: 'error',
        message: 'Please select a course to register'
      });
      setShowPopup(true);
      return;
    }

    if (registeredCourses.includes(selectedOption)) {
      setPopupMessage({
        type: 'info',
        message: 'You are already registered for this course!'
      });
      setShowPopup(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/registrations', { 
        userId: user.userId, 
        programId: selectedOption 
      });
      console.log(user);
      setPopupMessage({
        type: 'success',
        message: 'Successfully registered for the course!'
      });
      console.log(selectedCourse)
      const res = await api.post('/Email', {
        "To": `${user.email}`,
        "subject": "Registration Succesful",
        "body": `You have been successfully registered for the course on ${selectedCourse.title}.` 
      })
      console.log(res);
      setRegisteredCourses([...registeredCourses, selectedOption]);
      setShowPopup(true);
      setSelectedOption('');
      setSelectedCourse(null);
    } catch (error) {
      console.error(error);
      setPopupMessage({
        type: 'error',
        message: 'Registration failed. Please try again later.'
      });
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const resetSelection = () => {
    setSelectedOption('');
    setSelectedCourse(null);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen p-6">
      <div 
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300"
        style={{ animation: "fadeIn 0.6s ease-out" }}
      >
        <div className="p-6">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 
              className="text-3xl font-bold text-gray-800"
              style={{ animation: "slideDown 0.5s ease-out" }}
            >
              Course Registration
            </h2>
            <p 
              className="text-gray-600 mt-1"
              style={{ animation: "slideDown 0.5s ease-out 0.1s both" }}
            >
              Select and register for available training programs
            </p>
          </div>
          
          {isLoading && !courses.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-gray-600">Loading available courses...</p>
            </div>
          ) : error ? (
            <div 
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 flex items-start"
              style={{ animation: "fadeIn 0.5s ease-out" }}
            >
              <AlertCircle className="mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium">Unable to load courses</p>
                <p className="mt-1 text-sm">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister}>
              <div 
                className="mb-6"
                style={{ animation: "slideUp 0.5s ease-out 0.2s both" }}
              >
                <label className="block text-gray-700 font-medium mb-2" htmlFor="course-select">
                  Available Courses
                </label>
                <div className="relative">
                  <select
                    id="course-select"
                    value={selectedOption}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                    disabled={isLoading}
                  >
                    <option value="">-- Select a training program --</option>
                    {courses.map(course => (
                      <option 
                        key={course.programId} 
                        value={course.programId}
                        disabled={registeredCourses.includes(course.programId)}
                      >
                        {course.title}
                        {registeredCourses.includes(course.programId) && " (Already Registered)"}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {selectedCourse && (
                <div 
                  className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100"
                  style={{ animation: "scaleIn 0.4s ease-out" }}
                >
                  <h3 className="text-lg font-semibold text-indigo-800 mb-2">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-3">
                    {selectedCourse.description || "Learn essential skills and knowledge in this comprehensive training program."}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-indigo-500" />
                      <span>{selectedCourse.startDate || "Flexible start date"}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-indigo-700 font-medium">
                    Registration will give you access to all course materials and resources.
                  </div>
                </div>
              )}
              
              <div 
                className="flex justify-end"
                style={{ animation: "slideUp 0.5s ease-out 0.3s both" }}
              >
                <button 
                  type="button" 
                  className="mr-3 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  onClick={resetSelection}
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="group relative px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-md shadow-sm hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-70"
                  disabled={isLoading || !selectedOption || registeredCourses.includes(selectedOption)}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Register Now
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
              
              {courses.length > 0 && !isLoading && !error && (
                <div 
                  className="mt-8 pt-6 border-t border-gray-100"
                  style={{ animation: "fadeIn 0.5s ease-out 0.4s both" }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Programs</h3>
                  {courses.length === 0 ? (
                    <p className="text-gray-600 text-center">No courses registered yet. Select a course above to get started!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.slice(0, 4).map(course => (
                        <div 
                          key={course.programId} 
                          className={`p-3 border border-gray-100 rounded-md transition-colors cursor-pointer ${
                            registeredCourses.includes(course.programId) 
                              ? 'bg-gray-100 opacity-75 cursor-not-allowed' 
                              : 'hover:border-indigo-200 hover:bg-indigo-50'
                          }`}
                          onClick={() => {
                            if (!registeredCourses.includes(course.programId)) {
                              setSelectedOption(course.programId);
                              setSelectedCourse(course);
                              document.getElementById('course-select').scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          <h4 className="font-medium text-gray-800">
                            {course.title}
                            {registeredCourses.includes(course.programId) && 
                              <span className="text-sm text-green-600 ml-2">(Registered)</span>
                            }
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {course.description || "Enhance your skills with this comprehensive training program."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {courses.length > 4 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      + {courses.length - 4} more programs available
                    </p>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      
      {showPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-30 z-50"
          style={{ animation: "fadeIn 0.3s ease-out" }}
          onClick={closePopup}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            style={{ animation: "scaleIn 0.3s ease-out" }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-1 ${
              popupMessage.type === 'success' ? 'bg-green-500' : 
              popupMessage.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
            }`}></div>
            <div className="p-6">
              <div className="flex items-start">
                <div className={`flex-shrink-0 p-2 rounded-full ${
                  popupMessage.type === 'success' ? 'bg-green-100 text-green-600' :
                  popupMessage.type === 'info' ? 'bg-blue-100 text-blue-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  {popupMessage.type === 'success' ? <Check size={20} /> :
                   popupMessage.type === 'info' ? <Info size={20} /> :
                   <Info size={20} />}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {popupMessage.type === 'success' ? 'Registration Successful' :
                     popupMessage.type === 'info' ? 'Already Registered' :
                     'Registration Failed'}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {popupMessage.message}
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                        popupMessage.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                        popupMessage.type === 'info' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-red-600 hover:bg-red-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        popupMessage.type === 'success' ? 'focus:ring-green-500' :
                        popupMessage.type === 'info' ? 'focus:ring-blue-500' :
                        'focus:ring-red-500'
                      }`}
                      onClick={closePopup}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeRegister;