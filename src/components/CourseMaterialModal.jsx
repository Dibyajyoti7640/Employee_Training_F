import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  File,
  Check,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";
import api from "../services/api";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCourseMaterials,
  uploadCourseMaterial,
  deleteCourseMaterial,
} from "../Slices/CourseMaterialModalSlice";
const CourseMaterialModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  userRole,
}) => {
  const { materials, uploading, loading, uploadProgress } = useSelector(
    (state) => state.courseModal
  );
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const isEmployee = userRole === "Employee";
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (isOpen && courseId) {
      dispatch(fetchCourseMaterials(courseId));
    }
  }, [isOpen, courseId, dispatch]);
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    dispatch(uploadCourseMaterial(files, courseId));
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      const response = await api.get(`/StudyMaterials/download/${materialId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }
    dispatch(deleteCourseMaterial(materialId));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!isEmployee && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const iconClass = "w-8 h-8";

    switch (extension) {
      case "pdf":
        return <File className={`${iconClass} text-red-500`} />;
      case "doc":
      case "docx":
        return <File className={`${iconClass} text-blue-500`} />;
      case "ppt":
      case "pptx":
        return <File className={`${iconClass} text-orange-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Course Materials</h2>
              <p className="text-emerald-100 mt-1">{courseTitle}</p>
              {isEmployee && (
                <p className="text-emerald-200 text-sm mt-1">
                  View Only Access
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!isEmployee && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Upload New Material
              </h3>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-600">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={48} className="text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">
                      Drag and drop your files here, or{" "}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports PDF, Word, PowerPoint, and text files (max 10MB)
                    </p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {isEmployee ? "Available Materials" : "Existing Materials"} (
              {materials.length})
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : materials.length > 0 ? (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.documentName)}
                      <div>
                        <p className="font-medium text-slate-800">
                          {material.documentName}
                        </p>
                        <p className="text-sm text-slate-500">
                          Course Material
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleDownload(material.id, material.documentName)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </button>
                      {!isEmployee && (
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <File size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No materials available</p>
                {!isEmployee && (
                  <p className="text-sm">Upload your first material above</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseMaterialModal;
