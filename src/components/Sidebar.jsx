import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Users,
  FileText,
  BookOpen,
  UserCheck,
  BarChart2,
} from "lucide-react";

const Sidebar = ({ collapsed = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const getNavLinks = () => {
    if (!user) return [];

    const links = {
      Admin: [
        {
          to: "admin/courses",
          label: "Manage Courses",
          icon: <BookOpen size={20} />,
        },
        {
          to: "admin/employees",
          label: "Employee List",
          icon: <Users size={20} />,
        },
        { to: "admin/quizzes", label: "Quiz", icon: <FileText size={20} /> },
        {
          to: "admin/responses",
          label: "View Quiz",
          icon: <Briefcase size={20} />,
        },
      ],
      Manager: [
        {
          to: "manager/courses",
          label: "Manage Courses",
          icon: <BookOpen size={20} />,
        },
        {
          to: "manager/employees",
          label: "Employee Progress",
          icon: <BarChart2 size={20} />,
        },
        { to: "manager/quizzes", label: "Quiz", icon: <FileText size={20} /> },
        {
          to: "manager/responses",
          label: "View Quiz",
          icon: <Briefcase size={20} />,
        },
      ],
      Employee: [
        {
          to: "employee/courses",
          label: "Courses",
          icon: <BookOpen size={20} />,
        },
        {
          to: "employee/register",
          label: "Register",
          icon: <UserCheck size={20} />,
        },
        {
          to: "employee/progress",
          label: "Progress",
          icon: <BarChart2 size={20} />,
        },
        { to: "employee/quizzes", label: "Quiz", icon: <FileText size={20} /> },
      ],
    };

    return links[user.role] || [];
  };

  return (
    <aside className="h-full bg-gray-900 dark:bg-gray-900 text-white flex flex-col overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <button
          type="button"
          className={`text-xl font-bold cursor-pointer text-white transition-opacity duration-300 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Dashboard
        </button>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <div className="px-3 space-y-1">
          {getNavLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-3 py-3 rounded-md transition-colors duration-200 group ${
                isActive(link.to)
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="mr-3 text-lg transition-transform duration-200 group-hover:scale-110">
                {link.icon}
              </span>
              <span
                className={`transition-opacity duration-300 ${
                  collapsed ? "opacity-0 hidden" : "opacity-100"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      <div
        className={`px-4 py-4 mt-auto border-t border-gray-800 ${
          collapsed ? "hidden" : "block"
        }`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {user?.displayName || user?.email || "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.role || "Role"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
