import React, { useState, useEffect } from "react";
import {
    Send,
    FileText,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Download,
    Award,
    Search,
    Filter,
    FileCheck,
    Mail,
    Users,
} from "lucide-react";
import api from "../../services/api";

const AdminCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [userFilter, setUserFilter] = useState("all");
    const [users, setUsers] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const usersResponse = await api.get("/Users");
                setUsers(usersResponse.data);

                const allCertificates = [];
                for (const user of usersResponse.data) {
                    try {
                        const certsResponse = await api.get(`/Certificates/${user.userId}`);
                        if (certsResponse.data && Array.isArray(certsResponse.data)) {
                            const certsWithUser = certsResponse.data.map(cert => ({
                                ...cert,
                                traineeName: user.fullName,
                                traineeEmail: user.email
                            }));
                            allCertificates.push(...certsWithUser);
                        }
                    } catch (error) {
                        console.error(`Error fetching certificates for user ${user.userId}:`, error);
                    }
                }
                setCertificates(allCertificates);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (reviewModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [reviewModalOpen]);

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
            .includes(searchTerm.toLowerCase()) ||
            cert.traineeName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
        const matchesUser = userFilter === "all" || cert.TraineeId.toString() === userFilter;

        return matchesSearch && matchesStatus && matchesUser;
    });

    const handleDownload = async (certificateId) => {
        try {
            const response = await api.get(`/Certificates/download/${certificateId}`, {
                responseType: "blob",
            });

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

    const handleReviewSubmit = async (reviewData) => {
        setReviewLoading(true);
        try {
            const formData = new FormData();
            formData.append("certificateID", selectedCertificate.id);
            formData.append("email", selectedCertificate.traineeEmail);
            formData.append("subject", reviewData.subject);
            formData.append("body", reviewData.body || "");
            formData.append("hrID", JSON.parse(localStorage.getItem("user")).userId);
            formData.append("isApproved", reviewData.isApproved);
            formData.append("remarks", reviewData.remarks || "");
            formData.append("EmployeeName", selectedCertificate.traineeName);
            formData.append("CertificationType", selectedCertificate.title);
            formData.append("adminName", JSON.parse(localStorage.getItem("user")).name);
            formData.append("responseDate", new Date().toISOString());
            formData.append("comments", reviewData.comments || "");
            formData.append("nextSteps", reviewData.nextSteps || "");

            console.log("Submitting review data:", reviewData);

            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            console.log("Selected Certificate:", selectedCertificate);
            const response = await api.post("/Certificates/review", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                setCertificates(certs => certs.map(cert =>
                    cert.id === selectedCertificate.id ? {
                        ...cert,
                        status: reviewData.isApproved ? "Approved" : "Rejected",
                        remarks: reviewData.remarks,
                        ReviewedBy: JSON.parse(localStorage.getItem("user")).userId,
                        ReviewedOn: new Date().toISOString()
                    } : cert
                ));
                setReviewModalOpen(false);
                alert("Review submitted successfully!");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setReviewLoading(false);
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
                                Certificate Approvals
                            </h1>
                            <p className="text-slate-600 text-lg mt-2">
                                Review and manage employee certificate submissions
                            </p>
                        </div>
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
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">
                                    Under Review
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {certificates.filter(c => c.status === "Under Review").length}
                                </p>
                            </div>
                            <FileCheck size={24} className="text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Approved</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {certificates.filter(c => c.status === "Approved").length}
                                </p>
                            </div>
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Rejected</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {certificates.filter(c => c.status === "Rejected").length}
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
                                placeholder="Search certificates or employees..."
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
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            <select
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                            >
                                <option value="all">All Employees</option>
                                {users.map(user => (
                                    <option key={user.userId} value={user.userId}>
                                        {user.fullName}
                                    </option>
                                ))}
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
                                    ? "No certificates have been submitted yet"
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
                                                    <User size={14} />
                                                    Employee: {certificate.traineeName}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    Submitted: {new Date(certificate.submittedOn).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText size={14} />
                                                    {certificate.fileName}
                                                </span>
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
                                            {(certificate.status === "Under Review" || certificate.status === "Pending") && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedCertificate(certificate);
                                                        setReviewModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                >
                                                    <FileCheck size={16} />
                                                    Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {reviewModalOpen && selectedCertificate && (
                    <ReviewModal
                        certificate={selectedCertificate}
                        onClose={() => {
                            setReviewModalOpen(false);
                            setSelectedCertificate(null);
                        }}
                        onSubmit={handleReviewSubmit}
                        loading={reviewLoading}
                    />
                )}
            </div>
        </div>
    );
};

const ReviewModal = ({ certificate, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        isApproved: true,
        remarks: "",
        subject: `Certificate ${certificate.status} - ${certificate.title}`,
        body: "",
        comments: "",
        nextSteps: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck size={24} className="text-emerald-600" />
                        Review Certificate
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Employee Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                                    value={certificate.traineeName}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Certificate Title
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                                    value={certificate.title}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Decision *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="decision"
                                        checked={formData.isApproved}
                                        onChange={() => setFormData({ ...formData, isApproved: true })}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-slate-700">Approve</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="decision"
                                        checked={!formData.isApproved}
                                        onChange={() => setFormData({ ...formData, isApproved: false })}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-slate-700">Reject</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Subject *
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Body
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                rows="4"
                                placeholder="Enter the email body content..."
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Remarks *
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                rows="3"
                                placeholder="Enter your review remarks..."
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Comments (for internal use)
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                rows="2"
                                placeholder="Any internal comments..."
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Next Steps
                            </label>
                            <textarea
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                rows="2"
                                placeholder="Recommended next steps..."
                                value={formData.nextSteps}
                                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                            />
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-slate-200 flex-shrink-0">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .scrollbar-hide {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default AdminCertificates;