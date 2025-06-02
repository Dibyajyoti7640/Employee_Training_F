import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  ChevronDown,
} from "lucide-react";

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: "Morning Meeting", date: "2025-06-02", time: "09:00" },
    { id: 2, title: "Project Review", date: "2025-06-02", time: "10:30" },
    { id: 3, title: "Client Call", date: "2025-06-02", time: "14:00" },
    { id: 4, title: "Team Standup", date: "2025-06-02", time: "16:30" },
    { id: 5, title: "Design Review", date: "2025-06-03", time: "11:00" },
    { id: 6, title: "Lunch Meeting", date: "2025-06-03", time: "12:30" },
  ]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [showClock, setShowClock] = useState(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);

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

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
    return events
      .filter((event) => event.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (day) => {
    const dateStr = formatDate(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const handleAddEvent = () => {
    if (eventTitle.trim() && eventTime.trim() && selectedDate) {
      const newEvent = {
        id: Date.now(),
        title: eventTitle.trim(),
        date: selectedDate,
        time: eventTime,
      };
      setEvents([...events, newEvent]);
      setEventTitle("");
      setEventTime("");
      setShowModal(false);
      setShowClock(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId));
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

  const handleClockTimeSelect = () => {
    const hours = isAM
      ? selectedHour
      : selectedHour === 12
      ? 12
      : selectedHour + 12;
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(
      selectedMinute
    ).padStart(2, "0")}`;
    setEventTime(formattedTime);
    setShowClock(false);
  };

  const renderClock = () => {
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return (
      <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl border border-purple-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-purple-800">
              Select Time
            </h3>
            <button
              onClick={() => setShowClock(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative w-55 h-55    rounded-full border-2 border-purple-200 bg-purple-50">
              {/* Hour markers */}
              {hours.map((hour, index) => {
                const angle = index * 30 - 90;
                const x = 50 + 40 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 40 * Math.sin((angle * Math.PI) / 180);

                return (
                  <button
                    key={`hour-${hour}`}
                    className={`absolute w-7 h-7  flex items-center justify-center rounded-full transition-all ${
                      selectedHour === hour
                        ? "bg-purple-600 text-white"
                        : "hover:bg-purple-100 text-purple-800"
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={() => setSelectedHour(hour)}
                  >
                    {hour}
                  </button>
                );
              })}

              {/* Minute markers (inner circle) */}
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
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </button>
                );
              })}

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                isAM ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setIsAM(true)}
            >
              AM
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                !isAM ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setIsAM(false)}
            >
              PM
            </button>
          </div>

          <div className="text-center text-lg font-semibold mb-4">
            {selectedHour}:{String(selectedMinute).padStart(2, "0")}{" "}
            {isAM ? "AM" : "PM"}
          </div>

          <button
            onClick={handleClockTimeSelect}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium"
          >
            Select Time
          </button>
        </div>
      </div>
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-32 border border-purple-100 bg-gray-50"
        ></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = getEventsForDate(dateStr);
      const isToday =
        dateStr ===
        formatDate(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate()
        );

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
            {/* Day number header */}
            <div
              className={`p-2 border-b border-purple-100 ${
                isToday ? "bg-purple-400" : "bg-gray-50"
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

            {/* Scrollable events area */}
            <div className="flex-1 p-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-1">
                {dayEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded-md border transition-colors hover:shadow-sm ${getEventColor(
                      dayEvents,
                      index
                    )}`}
                  >
                    <div className="flex items-center space-x-1 mb-0.5">
                      <Clock size={8} />
                      <span className="font-medium">{event.time}</span>
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
      {/* Header */}
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
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-3 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 transition-all duration-200 hover:shadow-md"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
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

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border-2 border-purple-200 rounded-xl overflow-hidden shadow-inner">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-purple-100">
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
                  setEventTitle("");
                  setEventTime("");
                  setMeetingLink("");
                  setShowClock(false);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Existing events for the date */}
            {selectedDate && getEventsForDate(selectedDate).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Clock size={16} className="mr-2" />
                  Existing Events
                </h4>
                <div className="space-y-2 max-h-25 overflow-y-auto scrollbar-hide">
                  {getEventsForDate(selectedDate).map((event, index) => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${getEventColor(
                        getEventsForDate(selectedDate),
                        index
                      )}`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm opacity-75 flex items-center mt-1">
                          <Clock size={12} className="mr-1" />
                          {event.time}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
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
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={eventTime}
                    readOnly
                    placeholder="Select time"
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                    onClick={() => setShowClock(true)}
                  />
                  <button
                    onClick={() => setShowClock(true)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                  >
                    <Clock size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teams Link
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddEvent}
                  disabled={!eventTitle.trim() || !eventTime.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-300 disabled:to-indigo-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <Plus size={18} />
                  <span>Add Event</span>
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEventTitle("");
                    setEventTime("");
                    setShowClock(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clock Picker Modal */}
      {showClock && renderClock()}
    </div>
  );
};

export default CalendarComponent;
