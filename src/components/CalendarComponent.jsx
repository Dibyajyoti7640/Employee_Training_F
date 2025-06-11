import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Users,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import api from "../services/api";
import { useSelector, useDispatch } from "react-redux";
import {
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
} from "../Slices/calendarSlice";

const CalendarComponent = () => {
  const dispatch = useDispatch();
  const {
    currentDate,
    selectedDate,
    selectedEvent,
    events,
    isLoading,
    error,
    eventForm,
    emailFile,
    clock,
  } = useSelector((state) => state.calendar);

  const { showClock, showEndTimeClock, selectedHour, selectedMinute, isAM } =
    clock;

  const [showModal, setShowModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isEmailFileUploaded, setIsEmailFileUploaded] = useState(false);

  // Destructure eventForm from Redux state
  const {
    title: eventTitle,
    time: eventTime,
    endTime: eventEndTime,
    description: eventDescription,
    meetingLink,
    trainer,
    organiser,
    venue,
    endingDate,
  } = eventForm;

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleGlobalFileUpload = (uploadedFile) => {
    if (uploadedFile) {
      sessionStorage.setItem("emailFile", uploadedFile.name);
      dispatch(setEmailFile(uploadedFile));
      setFile(uploadedFile);
      setIsEmailFileUploaded(true);
    }
  };

  const fetchEvents = async () => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await api.get("/Calendars");
      console.log("Fetched events:", response.data);

      const normalizedEvents = response.data.map((event) => ({
        id: event.id,
        title: event.meetingName || "Untitled Event",
        date: event.startingDate || normalizeDate(event.time),
        time: event.time ? extractTimeFromDateTime(event.time) : "00:00",
        endTime: event.endTime
          ? extractTimeFromDateTime(event.endTime)
          : "00:00",
        meetingLink: event.teamsLink || "",
        trainer: event.trainer || "",
        organiser: event.organiser || "",
        venue: event.venue || "",
        endingDate:
          event.endingDate || event.startingDate || normalizeDate(event.time),
        rawData: event,
      }));

      dispatch(setEvents(normalizedEvents));
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message || err.message || "Failed to fetch events"
        )
      );
      console.error("Error fetching events:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;

    try {
      let date;
      if (dateStr.includes("T")) {
        date = new Date(dateStr);
      } else if (dateStr.includes("-")) {
        date = new Date(dateStr + "T00:00:00");
      } else {
        date = new Date(dateStr);
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error normalizing date:", error);
      return null;
    }
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getEventColor = (events, index) => {
    const colors = [
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
    ];
    return colors[index % colors.length];
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const getEventsForDate = (dateStr) => {
    const filteredEvents = events.filter((event) => {
      const eventStartDate = new Date(event.date);
      const eventEndDate = new Date(event.endingDate || event.date);
      const currentDate = new Date(dateStr);
      return currentDate >= eventStartDate && currentDate <= eventEndDate;
    });

    return filteredEvents.sort((a, b) => {
      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";
      return timeA.localeCompare(timeB);
    });
  };

  const handlePreviousMonth = () => {
    const currentDateObj = new Date(currentDate);
    const newDate = new Date(
      currentDateObj.getFullYear(),
      currentDateObj.getMonth() - 1,
      1
    );
    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const handleNextMonth = () => {
    const currentDateObj = new Date(currentDate);
    const newDate = new Date(
      currentDateObj.getFullYear(),
      currentDateObj.getMonth() + 1,
      1
    );
    dispatch(setCurrentDate(newDate.toISOString()));
  };

  const handleDateClick = (day) => {
    const currentDateObj = new Date(currentDate);
    const dateStr = formatDate(
      currentDateObj.getFullYear(),
      currentDateObj.getMonth(),
      day
    );
    dispatch(setSelectedDate(dateStr));
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    dispatch(setSelectedEvent(event));
    setShowEventDetails(true);
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !eventTime.trim() || !selectedDate) {
      return;
    }

    const startDateTimeLocal = `${selectedDate}T${eventTime}:00`;
    const endDateTimeLocal = `${selectedDate}T${eventEndTime}:00`;

    const newEvent = {
      meetingName: eventTitle.trim(),
      time: startDateTimeLocal,
      endTime: endDateTimeLocal,
      teamsLink: meetingLink.trim() || null,
      trainer: trainer.trim() || null,
      organiser: organiser.trim() || null,
      venue: venue.trim() || null,
      startingDate: selectedDate,
      endingDate: endingDate || selectedDate,
      description: eventDescription,
    };

    try {
      dispatch(setLoading(true));

      const reminderSubject = `Meeting scheduled for ${eventTitle} on ${selectedDate} at ${eventTime}`;
      const reminderBody = `You have a meeting scheduled for ${eventTitle} on ${selectedDate} from ${eventTime} to ${eventEndTime}, location ${venue}. Please join the meeting by clicking this link: ${meetingLink}`;

      if (file || emailFile) {
        await sendReminder(reminderSubject, reminderBody);
      }

      const response = await api.post("/Calendars", newEvent);

      const normalizedEvent = {
        id: response.data.id,
        title: response.data.meetingName || eventTitle.trim(),
        date: response.data.startingDate || selectedDate,
        time: response.data.time
          ? extractTimeFromDateTime(response.data.time)
          : eventTime,
        endTime: response.data.End_time
          ? extractTimeFromDateTime(response.data.End_time)
          : eventEndTime,
        meetingLink: response.data.teamsLink || meetingLink.trim(),
        trainer: response.data.trainer || trainer.trim(),
        organiser: response.data.organiser || organiser.trim(),
        venue: response.data.venue || venue.trim(),
        endingDate: response.data.endingDate || endingDate || selectedDate,
        rawData: response.data,
      };

      dispatch(setEvents([...events, normalizedEvent]));
      dispatch(resetEventForm());
      setShowModal(false);
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message || err.message || "Failed to add event"
        )
      );
      console.error("Error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const extractTimeFromDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "00:00";

    try {
      let date;

      if (
        dateTimeStr.includes("T") &&
        !dateTimeStr.endsWith("Z") &&
        !dateTimeStr.includes("+")
      ) {
        const [datePart, timePart] = dateTimeStr.split("T");
        const [hours, minutes] = timePart.split(":");
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}`;
      } else {
        date = new Date(dateTimeStr);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    } catch (error) {
      console.error("Error extracting time:", error);
      return "00:00";
    }
  };

  const sendReminder = async (subject, body) => {
    try {
      const reminderFile = emailFile || file;
      console.log("Sending reminder with file:", reminderFile);

      if (!reminderFile) {
        console.warn(
          "No email list file available - skipping email notification"
        );
        return { success: false, message: "No email file available" };
      }

      const formData = new FormData();
      formData.append("file", reminderFile);
      formData.append("subject", subject);
      formData.append("body", body);

      const response = await api.post("/Reminder/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error sending reminder:", error);
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      dispatch(setLoading(true));

      const eventToDelete = events.find((event) => event.id === eventId);

      await api.delete(`/Calendars/${eventId}`);
      dispatch(setEvents(events.filter((event) => event.id !== eventId)));

      if ((emailFile || file) && eventToDelete) {
        const cancellationSubject = `Event Canceled: ${eventToDelete.title}`;
        const cancellationBody = `The following event has been canceled:

Event: ${eventToDelete.title}
Date: ${eventToDelete.date}
Time: ${eventToDelete.time} - ${eventToDelete.endTime}
${eventToDelete.venue ? `Venue: ${eventToDelete.venue}` : ""}

We apologize for any inconvenience this may cause.`;

        try {
          await sendReminder(cancellationSubject, cancellationBody);
          console.log("Cancellation email sent successfully");
        } catch (emailError) {
          console.error("Failed to send cancellation email:", emailError);
          dispatch(
            setError(
              "Event was deleted but failed to send cancellation emails: " +
                (emailError.response?.data?.message ||
                  emailError.message ||
                  "Unknown error")
            )
          );
        }
      }

      setShowEventDetails(false);
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message || err.message || "Failed to delete event"
        )
      );
      console.error("Error deleting event:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleClockTimeSelect = (isEndTime = false) => {
    const hours = isAM
      ? selectedHour === 12
        ? 0
        : selectedHour
      : selectedHour === 12
      ? 12
      : selectedHour + 12;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      selectedMinute
    ).padStart(2, "0")}`;

    if (isEndTime) {
      dispatch(updateEventForm({ endTime: formattedTime }));
    } else {
      dispatch(updateEventForm({ time: formattedTime }));
    }
    dispatch(setShowClock(false));
    dispatch(setShowEndTimeClock(false));
  };

  const renderClock = (isEndTime = false) => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return (
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl border border-purple-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-purple-800">
              Select {isEndTime ? "End" : "Start"} Time
            </h3>
            <button
              onClick={() =>
                isEndTime
                  ? dispatch(setShowEndTimeClock(false))
                  : dispatch(setShowClock(false))
              }
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative w-52 h-52 rounded-full border-2 border-purple-200 bg-purple-50">
              {hours.map((hour, index) => {
                const angle = index * 30 - 90;
                const x = 50 + 40 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 40 * Math.sin((angle * Math.PI) / 180);

                return (
                  <button
                    key={`hour-${hour}`}
                    className={`absolute w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      selectedHour === hour
                        ? "bg-purple-600 text-white"
                        : "hover:bg-purple-100 text-purple-800"
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() =>
                      dispatch(setClockTime({ selectedHour: hour }))
                    }
                  >
                    {hour}
                  </button>
                );
              })}

              {minutes.map((minute, index) => {
                const angle = index * 30 - 90;
                const x = 50 + 20 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 20 * Math.sin((angle * Math.PI) / 180);

                return (
                  <button
                    key={`minute-${minute}`}
                    className={`absolute w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all ${
                      selectedMinute === minute
                        ? "bg-indigo-600 text-white"
                        : "hover:bg-indigo-100 text-indigo-800"
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() =>
                      dispatch(setClockTime({ selectedMinute: minute }))
                    }
                  >
                    {minute}
                  </button>
                );
              })}

              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                isAM ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => dispatch(setClockTime({ isAM: true }))}
            >
              AM
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                !isAM ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => dispatch(setClockTime({ isAM: false }))}
            >
              PM
            </button>
          </div>

          <div className="text-center text-lg font-semibold mb-4">
            {selectedHour}:{String(selectedMinute).padStart(2, "0")}{" "}
            {isAM ? "AM" : "PM"}
          </div>

          <button
            onClick={() => handleClockTimeSelect(isEndTime)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
          >
            Select Time
          </button>
        </div>
      </div>
    );
  };

  const renderCalendarDays = () => {
    const currentDateObj = new Date(currentDate);
    const daysInMonth = getDaysInMonth(currentDateObj);
    const firstDay = getFirstDayOfMonth(currentDateObj);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-32 border border-purple-100 bg-gray-50"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(
        currentDateObj.getFullYear(),
        currentDateObj.getMonth(),
        day
      );
      const dayEvents = getEventsForDate(dateStr);
      const today = new Date();
      const isToday =
        dateStr ===
        formatDate(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <div
          key={day}
          className={`h-32 border border-purple-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-300 ${
            isToday
              ? "bg-purple-50 border-purple-400"
              : "bg-white hover:bg-purple-25"
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className="h-full flex flex-col">
            <div
              className={`p-2 border-b border-purple-100 ${
                isToday ? "bg-purple-100" : "bg-gray-50"
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isToday ? "text-purple-800" : "text-gray-700"
                }`}
              >
                {day}
              </span>
              {dayEvents.length > 0 && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {dayEvents.length}
                </span>
              )}
            </div>

            <div className="flex-1 p-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-1">
                {dayEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded-md border transition-colors hover:shadow-sm ${getEventColor(
                      dayEvents,
                      index
                    )}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    <div className="flex items-center space-x-1 mb-0.5">
                      <Clock size={8} />
                      <span className="font-medium">
                        {event.time} - {event.endTime}
                      </span>
                    </div>
                    <div className="font-medium truncate" title={event.title}>
                      {event.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    const event = selectedEvent.rawData || selectedEvent;
    const eventDate = new Date(event.time || event.startingDate);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = eventDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] scrollbar-hide overflow-y-auto shadow-2xl border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-purple-800">
                {event.meetingName || "Event Details"}
              </h3>
              <p className="text-sm text-purple-600 mt-1">{formattedDate}</p>
            </div>
            <button
              onClick={() => setShowEventDetails(false)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Clock size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500">Time</h4>
                <p className="text-gray-800">
                  {formattedTime} - {selectedEvent.endTime}
                </p>
              </div>
            </div>

            {event.trainer && (
              <div className="flex items-start">
                <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Trainer
                  </h4>
                  <p className="text-gray-800">{event.trainer}</p>
                </div>
              </div>
            )}

            {event.organiser && (
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Organiser
                  </h4>
                  <p className="text-gray-800">{event.organiser}</p>
                </div>
              </div>
            )}

            {event.venue && (
              <div className="flex items-start">
                <div className="bg-teal-100 p-3 rounded-lg mr-4">
                  <MapPin size={20} className="text-teal-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Venue</h4>
                  <p className="text-gray-800">{event.venue}</p>
                </div>
              </div>
            )}

            {event.description && (
              <div className="flex items-start">
                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                  <FileText size={20} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Description
                  </h4>
                  <p className="text-gray-800 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {event.teamsLink && (
              <div className="pt-4">
                <a
                  href={event.teamsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Join Teams Meeting</span>
                </a>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => handleDeleteEvent(event.id)}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                {isLoading ? "Deleting..." : "Delete Event"}
              </button>
              <button
                onClick={() => setShowEventDetails(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper to reset form fields
  const resetForm = () => {
    dispatch(resetEventForm());
    setFile(null);
    setIsEmailFileUploaded(false);
  };

  return (
    <div className="p-6 max-w-8xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-800 mb-1">
              Calendar
            </h1>
            <p className="text-purple-600">Manage your events and schedule</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousMonth}
              className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 transition-all duration-200 hover:shadow-md"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 min-w-64 text-center px-4">
              {months[new Date(currentDate).getMonth()]}{" "}
              {new Date(currentDate).getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 transition-all duration-200 hover:shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 mb-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-bold text-purple-700 bg-gradient-to-b from-purple-100 to-purple-50 border border-purple-200 first:rounded-l-lg last:rounded-r-lg"
            >
              <div className="text-sm">{day}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0 border-2 border-purple-200 rounded-xl overflow-hidden shadow-inner">
          {renderCalendarDays()}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-5xl h-auto max-h-[85vh] scrollbar-hide overflow-y-auto shadow-2xl border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-purple-800">Add Event</h3>
                <p className="text-sm text-purple-600 mt-1">
                  {selectedDate && formatDateDisplay(selectedDate)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {selectedDate && getEventsForDate(selectedDate).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock size={16} className="mr-2" />
                  Existing Events
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
                  {getEventsForDate(selectedDate).map((event, index) => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${getEventColor(
                        getEventsForDate(selectedDate),
                        index
                      )}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm opacity-75 flex items-center mt-1">
                          <Clock size={12} className="mr-1" />
                          {event.time} - {event.endTime}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white hover:bg-opacity-50 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) =>
                    dispatch(updateEventForm({ title: e.target.value }))
                  }
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={eventTime}
                      readOnly
                      placeholder="Select time"
                      className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                      onClick={() => dispatch(setShowClock(true))}
                    />
                    <button
                      onClick={() => dispatch(setShowClock(true))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                    >
                      <Clock size={20} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={eventEndTime}
                      readOnly
                      placeholder="Select time"
                      className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                      onClick={() => dispatch(setShowEndTimeClock(true))}
                    />
                    <button
                      onClick={() => dispatch(setShowEndTimeClock(true))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                    >
                      <Clock size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trainer
                </label>
                <input
                  type="text"
                  value={trainer}
                  onChange={(e) =>
                    dispatch(updateEventForm({ trainer: e.target.value }))
                  }
                  placeholder="Enter trainer name"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organiser
                </label>
                <input
                  type="text"
                  value={organiser}
                  onChange={(e) =>
                    dispatch(updateEventForm({ organiser: e.target.value }))
                  }
                  placeholder="Enter organiser name"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) =>
                    dispatch(updateEventForm({ venue: e.target.value }))
                  }
                  placeholder="Enter venue"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ending Date
                </label>
                <input
                  type="date"
                  value={endingDate}
                  onChange={(e) =>
                    dispatch(updateEventForm({ endingDate: e.target.value }))
                  }
                  min={selectedDate}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) =>
                    dispatch(updateEventForm({ description: e.target.value }))
                  }
                  placeholder="Enter event description"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teams Link
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) =>
                    dispatch(updateEventForm({ meetingLink: e.target.value }))
                  }
                  placeholder="https://teams.microsoft.com/l/meetup-join/..."
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={(e) => handleGlobalFileUpload(e.target.files[0])}
                  placeholder="upload file"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {isEmailFileUploaded && (
                  <p className="mt-1 text-sm text-green-600">
                    Email list uploaded for all future notifications
                  </p>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddEvent}
                  disabled={
                    !eventTitle.trim() || !eventTime.trim() || isLoading
                  }
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-300 disabled:to-indigo-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Add Event</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClock && renderClock()}
      {showEndTimeClock && renderClock(true)}
      {showEventDetails && renderEventDetails()}
    </div>
  );
};

export default CalendarComponent;
