import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  Download,
  Award,
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileCheck,
  Mail,
  Trash2,
} from "lucide-react";
import api from "../../services/api";

const EmployeeCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [sendingApproval, setSendingApproval] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User from localStorage:", user);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        if (!user || !user.userId) {
          throw new Error("User not found in localStorage");
        }

        const response = await api.get(`/Certificates/${user.userId}`);

        let data = response.data;
        if (!Array.isArray(data)) {
          data = data ? [data] : [];
        }

        console.log(data);

        const mappedData = await Promise.all(
          data.map(async (cert) => {
            let reviewedByName = cert.reviewedBy;
            if (cert.reviewedBy) {
              try {
                const reviewedByUser = await api.get(
                  `/Users/${cert.reviewedBy}`
                );
                reviewedByName = reviewedByUser.data.fullName;
              } catch (e) {
                reviewedByName = cert.reviewedBy;
              }
            }
            return {
              id: cert.id,
              title: cert.title,
              fileName: cert.fileName,
              uploadedOn: cert.submittedOn,
              status: cert.status,
              reviewedBy: reviewedByName,
              reviewedOn: cert.reviewedOn,
              remarks: cert.remarks,
            };
          })
        );
        setCertificates(mappedData);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [certificates.length]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        color: "text-yellow-600",
      },
      "Under Review": {
        icon: FileCheck,
        className: "bg-blue-100 text-blue-800 border-blue-200",
        color: "text-blue-600",
      },
      Approved: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-200",
        color: "text-green-600",
      },
      Rejected: {
        icon: XCircle,
        className: "bg-red-100 text-red-800 border-red-200",
        color: "text-red-600",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.className}`}
      >
        <IconComponent size={14} className={`mr-1 ${config.color}`} />
        {status}
      </span>
    );
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = cert.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpload = async (formData) => {
    console.log("Uploading certificate:", formData);

    setUploading(true);
    try {
      const userId = user.userId;
      const data = new FormData();
      data.append("file", formData.file);
      data.append("title", formData.title);
      data.append("traineeId", userId);

      const response = await api.post(`/Certificates/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload certificate. Please try again.");
    } finally {
      setUploading(false);
      setUploadModalOpen(false);
      window.location.reload();
    }
  };

  const handleApprovalRequest = async (approvalData) => {
    setSendingApproval(true);
    console.log("Sending approval request:", approvalData);
    try {
      const formData = new FormData();
      formData.append("certificateID", selectedCertificate.id);
      formData.append("subject", approvalData.subject);
      formData.append("body", approvalData.body || "");
      formData.append("employeeName", approvalData.employeeName);
      formData.append("certificationType", approvalData.certificationType);
      formData.append("justification", approvalData.justification);

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api.post(`/Certificates/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Approval request response:", response.data);

      if (response.status === 200) {
        alert("Approval request sent successfully!");
        setApprovalModalOpen(false);
        setSelectedCertificate(null);
      }
    } catch (error) {
      console.error("Error sending approval request:", error);
      if (error.response) {
        alert(
          `Error: ${error.response.data.message ||
          error.response.data ||
          "Failed to send approval request"
          }`
        );
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSendingApproval(false);
      window.location.reload();
    }
  };

  const handleDownload = async (certificateId) => {
    console.log("Downloading certificate with ID:", certificateId);
    try {
      const response = await api.get(
        `/Certificates/download/${certificateId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate_${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete(`/Certificates/${certificateId}`);

      alert('Certificate deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting certificate:', error);

      if (error.response) {
        const errorMessage = error.response.data || error.response.statusText;
        alert(`Failed to delete certificate: ${errorMessage}`);
      } else if (error.request) {
        alert('Network error: Unable to delete certificate');
      } else {
        alert('Error deleting certificate');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Award size={32} className="text-emerald-600" />
                My Certificates
              </h1>
              <p className="text-slate-600 text-lg mt-2">
                Manage your professional certifications and approvals
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Upload Certificate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Certificates
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {certificates.length}
                </p>
              </div>
              <FileText size={24} className="text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-slate-800">
                  {certificates.filter((c) => c.status === "Approved").length}
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-800">
                  {
                    certificates.filter(
                      (c) =>
                        c.status === "Pending" || c.status === "Under Review"
                    ).length
                  }
                </p>
              </div>
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rejected</p>
                <p className="text-2xl font-bold text-slate-800">
                  {certificates.filter((c) => c.status === "Rejected").length}
                </p>
              </div>
              <XCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search certificates..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-400" />
              <select
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Award size={48} className="text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No certificates found
              </h3>
              <p className="text-slate-500">
                {certificates.length === 0
                  ? "Upload your first certificate to get started"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText size={20} className="text-emerald-600" />
                        <h3 className="text-lg font-semibold text-slate-800">
                          {certificate.title}
                        </h3>
                        {getStatusBadge(certificate.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Uploaded:{" "}
                          {new Date(
                            certificate.uploadedOn
                          ).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {certificate.fileName}
                        </span>
                        {certificate.reviewedBy && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            Reviewed by: {certificate.reviewedBy}
                          </span>
                        )}
                      </div>
                      {certificate.remarks && (
                        <div className="mt-2 p-3 bg-slate-100 rounded-lg">
                          <p className="text-sm text-slate-700">
                            <strong>Remarks:</strong> {certificate.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(certificate.id)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      {certificate.status === "Pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteCertificate(certificate.id)}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                            {loading ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCertificate(certificate);
                              setApprovalModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Send size={16} />
                            Request Approval
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {uploadModalOpen && (
          <UploadModal
            onClose={() => setUploadModalOpen(false)}
            onUpload={handleUpload}
            uploading={uploading}
          />
        )}

        {approvalModalOpen && selectedCertificate && (
          <ApprovalModal
            certificate={selectedCertificate}
            onClose={() => {
              setApprovalModalOpen(false);
              setSelectedCertificate(null);
            }}
            onSubmit={handleApprovalRequest}
            sending={sendingApproval}
          />
        )}
      </div>
    </div>
  );
};

const UploadModal = ({ onClose, onUpload, uploading }) => {
  const [formData, setFormData] = useState({
    title: "",
    file: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.file) {
      onUpload(formData);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Upload size={24} className="text-emerald-600" />
          Upload Certificate
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Certificate Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., AWS Cloud Practitioner"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Certificate File
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files[0] })
              }
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Supported formats: PDF (Only) (Max 10MB)
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={uploading || !formData.title || !formData.file}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApprovalModal = ({ certificate, onClose, onSubmit, sending }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    subject: `Certificate Approval Request - ${certificate.title}`,
    employeeName: user.name,
    certificationType: certificate.title,
    justification: "",
    body: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeName.trim() || !formData.justification.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Mail size={24} className="text-emerald-600" />
          Request Approval
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your full name"
              value={formData.employeeName}
              onChange={(e) =>
                setFormData({ ...formData, employeeName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Certificate Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
              value={formData.certificationType}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Justification *
            </label>
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="4"
              placeholder="Explain why this certificate should be approved and how it benefits your role..."
              value={formData.justification}
              onChange={(e) =>
                setFormData({ ...formData, justification: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Body of the Email
            </label>
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="3"
              placeholder="Any additional information or message..."
              value={formData.body}
              onChange={(e) =>
                setFormData({ ...formData, body: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={sending}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeCertificates;