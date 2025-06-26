import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchCourseById = createAsyncThunk(
  "course/fetchById",
  async (id) => {
    const response = await api.get(`/trainingPrograms/${id}`);
    return response.data;
  }
);
export const updateCourseById = createAsyncThunk(
  "course/updateById",
  async ({ id, courseData }) => {
    const response = await api.put(`/trainingPrograms/${id}`, courseData);
    return response.data;
  }
);
const courseSlice = createSlice({
  name: "course",
  initialState: {
    course: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCourseField: (state, action) => {
      const { name, value } = action.payload;
      if (state.course) {
        state.course[name] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.course = action.payload;
      })
      .addCase(updateCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const { setCourseField } = courseSlice.actions;
export default courseSlice.reducer;
