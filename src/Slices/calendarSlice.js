import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  events: [],
  currentDate: new Date().toISOString(),
  selectedDate: null,
  selectedEvent: null,
  isLoading: false,
  error: null,
  eventForm: {
    title: "",
    time: "",
    endTime: "",
    description: "",
    meetingLink: "",
    trainer: "",
    organiser: "",
    venue: "",
    endingDate: "",
  },
  clock: {
    showClock: false,
    showEndTimeClock: false,
    selectedHour: 12,
    selectedMinute: 0,
    isAM: true,
  },
  emailFile: null,
  isEmailFileUploaded: false,
};
const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateEventForm: (state, action) => {
      state.eventForm = { ...state.eventForm, ...action.payload };
    },
    resetEventForm: (state) => {
      state.eventForm = initialState.eventForm;
    },
    setShowClock: (state, action) => {
      state.clock.showClock = action.payload;
    },
    setShowEndTimeClock: (state, action) => {
      state.clock.showEndTimeClock = action.payload;
    },
    setClockTime: (state, action) => {
      state.clock = { ...state.clock, ...action.payload };
    },
    setEmailFile: (state, action) => {
      state.emailFile = action.payload;
      state.isEmailFileUploaded = !!action.payload;
    },
  },
});
export const {
  setCurrentDate,
  setSelectedDate,
  setSelectedEvent,
  setEvents,
  setLoading,
  setError,
  updateEventForm,
  resetEventForm,
  setShowClock,
  setShowEndTimeClock,
  setClockTime,
  setEmailFile,
} = calendarSlice.actions;
export default calendarSlice.reducer;
