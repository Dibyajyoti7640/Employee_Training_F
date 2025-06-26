import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import {
  User,
  Trash2,
  UserPlus,
  Search,
  X,
  CheckCircle,
  Edit2,
  Save,
} from "lucide-react";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "fullName",
    direction: "ascending",
  });

  const [addEmployeeData, setAddEmployeeData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    department: "",
    empId: "",
  });

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editEmployeeData, setEditEmployeeData] = useState({
    fullName: "",
    email: "",
    role: "",
    department: "",
    empId: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const departments = [
    "L&D",
    "HR",
    "RMG",
    "Microsoft",
    "SAP",
    "Salesforce",
    "Sales",
    "Finance",
    "Operations",
    "IT Support",
  ];
  const roles = ["Admin", "Manager", "Employee"];

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchEmployees = () => {
    setIsLoading(true);
    api
      .get("/Users")
      .then((response) => {
        setEmployees(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setNotification({
          show: true,
          message: "Failed to fetch employees",
          type: "error",
        });
        setIsLoading(false);
      });
  };

  const validatePassword = (password) => {
    const errors = [];
    let strength = 0;

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    } else {
      strength += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    } else {
      strength += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    } else {
      strength += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    } else {
      strength += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one special character");
    } else {
      strength += 1;
    }

    setPasswordStrength(strength);
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddEmployeeData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "password") {
        validatePassword(value);
      }
      return newData;
    });
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee.userId);
    setEditEmployeeData({
      fullName: employee.fullName,
      email: employee.email,
      role: employee.role || "",
      department: employee.department || "",
      empId: employee.empId || "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditEmployeeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (employeeId) => {
    try {
      setIsLoading(true);
      await api.put(`/Users/${employeeId}`, editEmployeeData);

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.userId === employeeId ? { ...emp, ...editEmployeeData } : emp
        )
      );

      setEditingEmployee(null);
      setEditEmployeeData({
        fullName: "",
        email: "",
        role: "",
        department: "",
        empId: "",
      });

      setNotification({
        show: true,
        message: "Employee updated successfully!",
        type: "success",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating employee:", error);
      setNotification({
        show: true,
        message: "Failed to update employee",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditEmployeeData({
      fullName: "",
      email: "",
      role: "",
      department: "",
      empId: "",
    });
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!validatePassword(addEmployeeData.password)) {
      setNotification({
        show: true,
        message: "Password does not meet requirements",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    api
      .post("/auth/register", addEmployeeData)
      .then((response) => {
        console.log(response.data);
        const newEmployee = {
          ...response.data,
          department: addEmployeeData.department,
          role: addEmployeeData.role,
          empId: addEmployeeData.empId,
        };
        setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
        setAddEmployeeData({
          fullName: "",
          email: "",
          password: "",
          role: "",
          department: "",
          empId: "",
        });
        setShowAddForm(false);
        setPasswordStrength(0);
        setPasswordErrors([]);
        setNotification({
          show: true,
          message: "Employee added successfully!",
          type: "success",
        });
        setIsLoading(false);
        console.log(addEmployeeData);
      })
      .then(() => {
        api.post("/Email", {
          To: `${addEmployeeData.email}`,
          subject: "Account Created Successfully",
          body: `Your account has been created successfully.\nYour Credentials:\nEmployee ID: ${addEmployeeData.empId}\nEmail: ${addEmployeeData.email}\nPassword: ${addEmployeeData.password}`,
        });
      })

      .catch((error) => {
        console.error("Error adding employee:", error);
        setNotification({
          show: true,
          message: "Failed to add employee",
          type: "error",
        });
        setIsLoading(false);
      });
  };

  const handleDelete = (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setIsLoading(true);
      api
        .delete(`/Users/${employeeId}`)
        .then(() => {
          setEmployees(employees.filter((emp) => emp.userId !== employeeId));
          setNotification({
            show: true,
            message: "Employee deleted successfully!",
            type: "success",
          });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error deleting employee:", error);
          setNotification({
            show: true,
            message: "Failed to delete employee",
            type: "error",
          });
          setIsLoading(false);
        });
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredEmployees = sortedEmployees.filter(
    (emp) =>
      emp.role !== "Admin" &&
      (emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Employee Management
        </h2>
        <p className="text-gray-600">Manage your organization's workforce</p>
      </div>

      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${notification.type === "success"
            ? "bg-green-100 text-green-800 border-l-4 border-green-500"
            : "bg-red-100 text-red-800 border-l-4 border-red-500"
            }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : (
            <X className="mr-2 h-5 w-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      <div className="flex justify-between items-center mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300"
        >
          {showAddForm ? (
            <>
              <X className="mr-2 h-5 w-5" />
              Cancel
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-5 w-5" />
              Add New Employee
            </>
          )}
        </motion.button>

        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <form
            onSubmit={handleAddEmployee}
            className="bg-white p-6 rounded-lg shadow-md"
            autoComplete="off"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Register New Employee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Employee ID
                </label>
                <input
                  type="number"
                  name="empId"
                  value={addEmployeeData.empId}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  required
                  autoComplete="off"
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={addEmployeeData.fullName}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  required
                  autoComplete="off"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={addEmployeeData.email}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  required
                  autoComplete="off"
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={addEmployeeData.password}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  required
                  autoComplete="new-password"
                  placeholder="Enter password"
                />
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                {passwordErrors.length > 0 && (
                  <ul className="text-xs text-red-600 mt-1">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  name="department"
                  value={addEmployeeData.department}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={addEmployeeData.role}
                  onChange={handleAddInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={passwordErrors.length > 0}
              className={`mt-6 px-6 py-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 ${passwordErrors.length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              Register Employee
            </motion.button>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-xl font-bold p-6 text-gray-800 border-b">
          Employee Directory
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("empId")}
                  >
                    <div className="flex items-center">
                      Employee ID
                      {sortConfig.key === "empId" && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("fullName")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === "fullName" && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortConfig.key === "email" && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("department")}
                  >
                    <div className="flex items-center">
                      Department
                      {sortConfig.key === "department" && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => requestSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {sortConfig.key === "role" && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((emp, index) => (
                  <motion.tr
                    key={emp.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingEmployee === emp.userId ? (
                        <input
                          type="number"
                          name="empId"
                          value={editEmployeeData.empId}
                          onChange={handleEditInputChange}
                          className="text-sm font-medium text-gray-900 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-20"
                        />
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          #{emp.empId || "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          {editingEmployee === emp.userId ? (
                            <input
                              type="text"
                              name="fullName"
                              value={editEmployeeData.fullName}
                              onChange={handleEditInputChange}
                              className="text-sm font-medium text-gray-900 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {emp.fullName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmployee === emp.userId ? (
                        <input
                          type="email"
                          name="email"
                          value={editEmployeeData.email}
                          onChange={handleEditInputChange}
                          className="text-sm text-gray-500 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{emp.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEmployee === emp.userId ? (
                        <select
                          name="department"
                          value={editEmployeeData.department}
                          onChange={handleEditInputChange}
                          className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {emp.department || "Not assigned"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingEmployee === emp.userId ? (
                        <select
                          name="role"
                          value={editEmployeeData.role}
                          onChange={handleEditInputChange}
                          className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        emp.role || "Not assigned"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingEmployee === emp.userId ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleSaveEdit(emp.userId)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors duration-200"
                            >
                              <Save className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                              <X className="h-5 w-5" />
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditClick(emp)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
                            >
                              <Edit2 className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(emp.userId)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                            >
                              <Trash2 className="h-5 w-5" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-10 text-gray-500">
            {searchTerm
              ? "No employees match your search criteria"
              : "No employees found. Add your first employee!"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmployees;