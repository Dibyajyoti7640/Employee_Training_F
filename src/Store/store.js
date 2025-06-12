import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "../Slices/calendarSlice";
import courseReducer from "../Slices/courseEdit";
import authReducer from "../Slices/AuthSlice";
import courseModalReducer from "../Slices/CourseMaterialModalSlice";
export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    course: courseReducer,
    auth: authReducer,
    courseModal: courseModalReducer,
  },
});
