import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logout } from "../Slices/AuthSlice";
import { Menu, X, BookOpen, Users, CheckCircle, Clock, Award } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from "../services/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("authToken");
  const userRole = user?.role || 'employee';
  console.log(user)
  console.log(userRole)
  const userId = user?.userId;

  const [dashboardData, setDashboardData] = useState({
    programs: [],
    registrations: [],
    isLoading: true,
    error: null
  });
  const [users, setUsers] = useState([]); // Add this line

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");

        const [programsResponse, registrationsResponse] = await Promise.all([
          api.get("/TrainingPrograms"),
          api.get("/Registrations")
        ]);

        console.log("Programs Response:", programsResponse);
        console.log("Registrations Response:", registrationsResponse);

        // Handle different response structures
        const programs = programsResponse.data || programsResponse || [];
        const registrations = registrationsResponse.data || registrationsResponse || [];

        console.log("Processed Programs:", programs);
        console.log("Processed Registrations:", registrations);

        setDashboardData({
          programs: Array.isArray(programs) ? programs : [],
          registrations: Array.isArray(registrations) ? registrations : [],
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        console.error("Error response:", error.response);


        console.log("Using mock data due to API error");

        setDashboardData({
          programs: mockPrograms,
          registrations: mockRegistrations,
          isLoading: false,
          error: `API Error: ${error.message}. Using mock data for demonstration.`
        });
      }
    };

    fetchData();
  }, [userId]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersResponse = await api.get("/Users");
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]); // fallback to empty array
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownVisible(!isUserDropdownVisible);
  };

  const getInitials = (user) => {
    if (!user) return "nn";
    const name = user?.name || user?.email || "Unknown";

    if (name.includes("@")) {
      const emailPrefix = name.split("@")[0];
      return emailPrefix.slice(0, 2).toUpperCase();
    }

    const nameParts = name.trim().split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  };

  const getRandomPastelColor = (seed = "") => {
    if (!seed) seed = "default";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsUserDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [avatarRef]);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path && path !== "dashboard") {
      setShowWelcomeBanner(false);
    } else {
      setShowWelcomeBanner(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
    }
  }, [user, token, navigate]);

  const getUserRegistrations = () => {
    const userRegs = dashboardData.registrations.filter(reg =>
      reg && reg.userId && reg.userId.toString() === userId?.toString()
    );
    console.log("User Registrations:", userRegs);
    return userRegs;
  };

  const getProgramsByStatus = (status) => {
    const userRegistrations = getUserRegistrations();
    const programsByStatus = userRegistrations
      .filter(reg => reg && reg.status === status)
      .map(reg => {
        const program = dashboardData.programs.find(p => p && p.programId === reg.programId);
        return program ? {
          ...program,
          registrationDate: reg.registeredAt
        } : null;
      })
      .filter(program => program !== null);

    console.log(`Programs with status ${status}:`, programsByStatus);
    return programsByStatus;
  };

  const getAdminStats = () => {
    const totalPrograms = dashboardData.programs.length;
    const totalRegistrations = dashboardData.registrations.length;

    const activePrograms = dashboardData.programs.filter(program => {
      if (!program || !program.startDate || !program.endDate) return false;
      try {
        return isAfter(new Date(), parseISO(program.startDate)) &&
          isBefore(new Date(), parseISO(program.endDate));
      } catch (error) {
        console.error("Date parsing error:", error, program);
        return false;
      }
    }).length;

    const upcomingPrograms = dashboardData.programs.filter(program => {
      if (!program || !program.startDate) return false;
      try {
        return isAfter(parseISO(program.startDate), new Date());
      } catch (error) {
        console.error("Date parsing error:", error, program);
        return false;
      }
    }).length;

    const stats = {
      totalPrograms,
      totalRegistrations,
      activePrograms,
      upcomingPrograms,
    };

    console.log("Admin Stats:", stats);
    return stats;
  };

  const getCategoryData = () => {
    const categories = {};
    dashboardData.programs.forEach(program => {
      if (program && program.category) {
        categories[program.category] = (categories[program.category] || 0) + 1;
      }
    });
    const result = Object.entries(categories).map(([name, value]) => ({ name, value }));
    console.log("Category Data:", result);
    return result;
  };

  const getRegistrationStatusData = () => {
    // Registered: total registrations
    const registeredCount = dashboardData.registrations.length;

    // Completed: total programs whose endDate is in the past
    const completedCount = dashboardData.programs.filter(program => {
      if (!program || !program.endDate) return false;
      try {
        return isAfter(new Date(), parseISO(program.endDate));
      } catch {
        return false;
      }
    }).length;

    return [{
      name: "Status",
      Registered: registeredCount,
      Completed: completedCount
    }];
  };

  // Helper to get registration details for modal
  const getRegistrationDetails = () => {
    return dashboardData.registrations.map(reg => {
      const program = dashboardData.programs.find(p => p.programId === reg.programId);
      const userObj = users.find(u => u.userId === reg.userId);
      return {
        username: userObj?.fullName,
        programName: program ? program.title : "Unknown Program"
      };
    });
  };

  const StatCard = ({ title, value, icon, color, onClick, clickable }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      green: 'bg-green-50 text-green-600 hover:bg-green-100',
      amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
      purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      red: 'bg-red-50 text-red-600 hover:bg-red-100'
    };

    return (
      <div
        className={`
          p-6 rounded-xl shadow-md border border-gray-200
          transition-all duration-300 ease-in-out
          ${colorClasses[color]}
          ${clickable ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1' : ''}
        `}
        onClick={clickable ? onClick : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
      >
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${colorClasses[color].replace('50', '100').replace('600', '700')}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminOverview = () => {
    const stats = getAdminStats();
    const categoryData = getCategoryData();
    const registrationStatusData = getRegistrationStatusData();

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"> {/* Changed classes here */}
          <StatCard
            title="Total Programs"
            value={stats.totalPrograms}
            icon={<BookOpen className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            icon={<Users className="h-6 w-6" />}
            color="green"
            onClick={() => setShowRegistrationsModal(true)}
            clickable
          />
          <StatCard
            title="Active Programs"
            value={stats.activePrograms}
            icon={<Clock className="h-6 w-6" />}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Increased gap */}
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200"> {/* Enhanced card styling */}
            <h3 className="text-xl font-semibold mb-6">Programs by Category</h3>
            <div className="h-80"> {/* Taller charts */}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Registrations by Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Registered" fill="#3b82f6" />
                  <Bar dataKey="Completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Programs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.programs.slice(0, 5).map(program => {
                  const programRegistrations = dashboardData.registrations.filter(
                    r => r.programId === program.programId
                  ).length;

                  const programStatus = isAfter(new Date(), parseISO(program.endDate))
                    ? 'Completed'
                    : isBefore(new Date(), parseISO(program.startDate))
                      ? 'Upcoming'
                      : 'Active';

                  const statusClass = programStatus === 'Completed'
                    ? 'bg-gray-100 text-gray-800'
                    : programStatus === 'Upcoming'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800';

                  return (
                    <tr key={program.programId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{program.title}</div>
                        <div className="text-sm text-gray-500">{program.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(program.startDate), 'MMM d')} - {format(parseISO(program.endDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {programRegistrations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                          {programStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for registrations */}
        {showRegistrationsModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 transition-opacity duration-300"
            onClick={(e) => e.target === e.currentTarget && setShowRegistrationsModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col transform transition-all duration-300 animate-fadeIn overflow-hidden">
              {/* Header with gradient background similar to dashboard */}
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 px-6 py-5 border-b">
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute inset-0 bg-white opacity-10"></div>
                  <div className="absolute -inset-x-20 top-8 h-px bg-blue-200 opacity-30 rotate-12"></div>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
                        User Registrations
                      </h2>
                      <p className="text-sm text-gray-600">
                        Total: {getRegistrationDetails()?.length || 0} registrations
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setShowRegistrationsModal(false)}
                    aria-label="Close modal"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {!getRegistrationDetails()?.length ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
                    <p className="text-sm text-center max-w-sm">
                      Registration data will appear here once users start enrolling in programs.
                    </p>
                  </div>
                ) : (
                  <div className="h-full overflow-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="text-left px-6 py-4 font-semibold text-gray-900 border-b border-gray-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Username</span>
                              </div>
                            </th>
                            <th className="text-left px-6 py-4 font-semibold text-gray-900 border-b border-gray-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <span>Program Name</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {getRegistrationDetails().map((reg, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-blue-50/50 transition-colors duration-150 group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                                    style={{
                                      backgroundColor: `hsl(${(reg.username?.charCodeAt(0) || 0) * 137.5 % 360}, 70%, 60%)`
                                    }}
                                  >
                                    {(reg.username || 'N').slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-gray-900 font-medium group-hover:text-blue-700 transition-colors">
                                    {reg.username || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 group-hover:bg-indigo-200 transition-colors">
                                    {reg.programName || 'N/A'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEmployeeOverview = () => {
    // Registered: all registrations for this user
    const registeredPrograms = dashboardData.registrations
      .filter(reg => reg.userId?.toString() === userId?.toString())
      .map(reg => {
        return dashboardData.programs.find(p => p.programId === reg.programId);
      })
      .filter(Boolean);

    // Completed: all programs whose endDate is in the past
    const completedPrograms = dashboardData.programs.filter(program => {
      if (!program || !program.endDate) return false;
      try {
        return isAfter(new Date(), parseISO(program.endDate));
      } catch {
        return false;
      }
    });

    // Prepare data for the bar chart
    const progressData = [
      {
        name: "Registered",
        value: registeredPrograms.length,
      },
      {
        name: "Completed",
        value: completedPrograms.length,
      },
    ];

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <StatCard
            title="Registered"
            value={registeredPrograms.length}
            icon={<BookOpen className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Completed"
            value={completedPrograms.length}
            icon={<Award className="h-6 w-6" />}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">My Training Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isDashboardRoot = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* <div className='absolute top-3 right-65'>
        <ThemeToggle />
      </div> */}
      <div
        className={`fixed inset-0 backdrop-blur-sm bg-black/30 z-20 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleMobileMenu}
      />

      <div
        className={`fixed inset-y-0 left-0 transform lg:relative lg:translate-x-0 transition duration-300 ease-in-out z-30 lg:z-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
              <div className="relative" ref={avatarRef}>
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-indigo-500 ring-offset-2 ring-offset-white focus:outline-none hover:scale-105 transition duration-300"
                  onClick={toggleUserDropdown}
                  aria-expanded={isUserDropdownVisible}
                  aria-haspopup="true"
                  style={{
                    backgroundColor: getRandomPastelColor(
                      user?.email || user?.name || "default"
                    ),
                  }}
                >
                  <span className="text-sm font-semibold text-black">
                    {getInitials(user)}
                  </span>
                </button>

                <div
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 transform transition duration-200 origin-top-right ${isUserDropdownVisible
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="p-3 border-b">
                    <p className="font-medium text-gray-800 truncate">
                      {user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "No email provided"}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
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
            {isDashboardRoot && (
              <>
                {showWelcomeBanner && (
                  <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 rounded-xl shadow-md my-8 transform transition-all duration-500 hover:shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute inset-0 bg-white opacity-10"></div>
                      <div className="absolute -inset-x-20 top-40 h-1 bg-blue-200 opacity-30 rotate-12"></div>
                      <div className="absolute -inset-x-20 top-60 h-1 bg-indigo-200 opacity-30 -rotate-12"></div>
                    </div>
                    <div className="relative px-8 py-16 md:py-20 text-center">
                      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-6 animate-fadeSlideUp">
                        Welcome to{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                          GyanSys
                        </span>
                      </h1>
                      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-fadeSlideUp animation-delay-200">
                        Your comprehensive business solutions partner. Access all
                        your tools and insights from this dashboard.
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse animation-delay-300"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse animation-delay-600"></div>
                    </div>
                  </div>
                )}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {userRole === 'admin' ? 'Admin Dashboard' :
                        userRole === 'manager' ? 'Manager Dashboard' : 'My Learning'}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Last updated: {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {dashboardData.isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : dashboardData.error ? (
                    <div className="text-center py-10">
                      <div className="text-red-500 mb-4">{dashboardData.error}</div>
                      <div className="text-sm text-gray-600">
                        Debug Info: Programs: {dashboardData.programs.length}, Registrations: {dashboardData.registrations.length}
                      </div>
                    </div>
                  ) : (
                    <>
                      {console.log("Rendering dashboard with data:", dashboardData)}
                      {userRole === 'Admin' || userRole === 'Manager'
                        ? renderAdminOverview()
                        : renderEmployeeOverview()}
                    </>
                  )}
                </div>
              </>
            )}
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-2 px-4 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <div>
              Status: <span className="text-green-500">●</span> Online
            </div>
            <div>Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;