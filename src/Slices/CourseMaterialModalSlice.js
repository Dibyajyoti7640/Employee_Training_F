import { createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

const initialState = {
  materials: [],
  uploading: false,
  loading: false,
  dragActive: false,
  uploadProgress: 0,
};

const courseMaterialModalSlice = createSlice({
  initialState,
  name: "courseMaterialModal",
  reducers: {
    setMaterials(state, action) {
      state.materials = action.payload;
    },
    setUploading(state, action) {
      state.uploading = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setDragActive(state, action) {
      state.dragActive = action.payload;
    },
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload;
    },
    removeMaterial(state, action) {
      state.materials = state.materials.filter(
        (material) => material.id !== action.payload
      );
    },
  },
});

export const {
  setMaterials,
  setUploading,
  setLoading,
  setDragActive,
  setUploadProgress,
  removeMaterial,
} = courseMaterialModalSlice.actions;

export const fetchCourseMaterials = (courseId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.get("/StudyMaterials");
    const materials = response.data.filter(
      (material) => material.courseId === parseInt(courseId)
    );
    dispatch(setMaterials(materials));
  } catch (error) {
    console.error("Failed to fetch course materials:", error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const uploadCourseMaterial =
  (files, courseId) => async (dispatch, getState) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, Word, PowerPoint, and text files are allowed");
      return;
    }

    try {
      dispatch(setUploading(true));
      dispatch(setUploadProgress(0));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseID", courseId);

      const progressInterval = setInterval(() => {
        const currentProgress = getState().courseModal.uploadProgress;
        if (currentProgress >= 90) {
          clearInterval(progressInterval);
          return;
        }
        dispatch(setUploadProgress(currentProgress + 10));
      }, 200);

      const response = await api.post("/StudyMaterials/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      dispatch(setUploadProgress(100));

      const newMaterial = {
        id: response.data.id,
        documentName: file.name,
        courseId: parseInt(courseId),
      };

      const currentMaterials = getState().courseModal.materials;
      dispatch(setMaterials([...currentMaterials, newMaterial]));

      setTimeout(() => {
        dispatch(setUploadProgress(0));
        dispatch(setUploading(false));
      }, 1000);
    } catch (error) {
      console.error("Failed to upload course material:", error);
      dispatch(setUploading(false));
      dispatch(setUploadProgress(0));
      alert("Failed to upload course material. Please try again.");
    }
  };

export const deleteCourseMaterial = (materialId) => async (dispatch) => {
  try {
    await api.delete(`/StudyMaterials/${materialId}`);
    dispatch(removeMaterial(materialId));
  } catch (error) {
    console.error("Error deleting material:", error);
    alert("Failed to delete material");
  }
};
export default courseMaterialModalSlice.reducer;
