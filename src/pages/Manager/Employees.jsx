import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp, User, Mail, Briefcase, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeeProgress from './EmployeeProgress';

const ManagerEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = () => {
    setLoading(true);
    api.get('/Users')
      .then(response => {
        console.log('API response data:', response.data);

        const employeeRoleOnly = response.data.filter(user => {
          if (response.data.length > 0 && user === response.data[0]) {
            console.log('Sample user object:', user);
          }
          
          return (
            (user.role && user.role.toLowerCase() === 'employee') ||
            (user.userRole && user.userRole.toLowerCase() === 'employee') ||
            (user.userType && user.userType.toLowerCase() === 'employee')
          );
        });
        
        console.log('Filtered employees:', employeeRoleOnly);
        setEmployees(employeeRoleOnly);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching employees:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEmployees();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
  };

  const departments = ['All', ...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees
    .filter(emp => 
      (selectedDepartment === 'All' || emp.department === selectedDepartment) &&
      (emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
       emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="inline w-4 h-4" /> : <ChevronDown className="inline w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="mr-2 text-indigo-600" />
          Manager - Employee Progress
        </h2>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all duration-300"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('fullName')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Name</span>
                    {getSortIcon('fullName')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>Email</span>
                    {getSortIcon('email')}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('department')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>Department</span>
                    {getSortIcon('department')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => handleRowClick(emp.userId)}
                    className="hover:bg-indigo-50 transition-colors duration-150 cursor-pointer group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeIn 0.5s ease-in-out forwards',
                      opacity: 0
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap group-hover:text-indigo-700 transition-colors duration-150">{emp.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 group-hover:text-indigo-600 transition-colors duration-150">{emp.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 group-hover:bg-indigo-200 transition-colors duration-150">
                        {emp.department}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                      No employees found matching your search criteria
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-right text-sm text-gray-500">
        Showing {filteredEmployees.length} of {employees.length} employees
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg text-gray-800">Employee Progress</h3>
              <button 
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <EmployeeProgress userId={selectedUserId} />
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ManagerEmployees;