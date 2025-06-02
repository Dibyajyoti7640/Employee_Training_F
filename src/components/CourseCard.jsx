import React from 'react';

const CourseCard = ({ course }) => {
  return (
    <div className="border p-4 rounded shadow hover:shadow-md transition duration-200">
      <h3 className="font-bold text-lg">{course.title}</h3>
      <p className="mt-2 text-sm text-gray-500">
        Duration: {course.durationHours} hrs | Mode: {course.mode}
      </p>
    </div>
  );
};

export default CourseCard;
