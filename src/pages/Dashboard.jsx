import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';
// import ThemeToggle from '../components/ThemeToggle';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
  const avatarRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownVisible(!isUserDropdownVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsUserDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [avatarRef]);

  React.useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'dashboard') {
      setShowWelcomeBanner(false);
    } else {
      setShowWelcomeBanner(true);
    }
  }, [location.pathname]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-200"></div>
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-4 border-indigo-600 animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* <div className='absolute top-3 right-65'>
        <ThemeToggle />
      </div> */}
      <div
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={toggleMobileMenu}
      />

      <div
        className={`fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition duration-300 ease-in-out z-30 lg:z-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <Sidebar />
        <button
          className="absolute top-4 right-4 p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 lg:hidden"
          onClick={toggleMobileMenu}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden text-gray-600 hover:text-gray-900"
                onClick={toggleMobileMenu}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center">
              <div
                className="relative"
                ref={avatarRef}
              >
                <button
                  className="overflow-hidden w-10 h-10 rounded-full ring-2 ring-indigo-500 ring-offset-2 ring-offset-white focus:outline-none hover:scale-105 transition duration-300"
                  onClick={toggleUserDropdown}
                  aria-expanded={isUserDropdownVisible}
                  aria-haspopup="true"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 transform transition duration-200 origin-top-right ${isUserDropdownVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                    }`}
                >
                  <div className="p-3 border-b">
                    <p className="font-medium text-gray-800 truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 overflow-auto">
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {showWelcomeBanner && (
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 rounded-xl shadow-md my-8 transform transition-all duration-500 hover:shadow-lg">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                  <div className="absolute -inset-x-20 top-40 h-1 bg-blue-200 opacity-30 rotate-12"></div>
                  <div className="absolute -inset-x-20 top-60 h-1 bg-indigo-200 opacity-30 -rotate-12"></div>
                </div>
                <div className="relative px-8 py-16 md:py-20 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-6 animate-fadeSlideUp">
                    Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">GyanSys</span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-fadeSlideUp animation-delay-200">
                    Your comprehensive business solutions partner. Access all your tools and insights from this dashboard.
                  </p>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse animation-delay-300"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse animation-delay-600"></div>
                </div>
              </div>
            )}
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-2 px-4 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <div>
              Status: <span className="text-green-500">●</span> Online
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;