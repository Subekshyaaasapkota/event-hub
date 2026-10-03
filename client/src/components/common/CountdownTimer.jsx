import React, { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate, deadline }) => {
  const calculateTimeLeft = () => {
  const now = new Date();
  const eventDate = new Date(targetDate);
  const deadlineDate = deadline ? new Date(deadline) : null;

  // If deadline exists and hasn't passed, check deadline timing
  if (deadlineDate && deadlineDate > now) {
  const timeToDeadline = deadlineDate - now;
  const hoursToDeadline = Math.floor(timeToDeadline / (1000 * 60 * 60));

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(
  deadlineDate.getFullYear(),
  deadlineDate.getMonth(),
  deadlineDate.getDate(),
  );
  const isDeadlineToday = today.getTime() === deadlineDay.getTime();
  const isNearDeadline = timeToDeadline <= 24 * 60 * 60 * 1000;

  // If deadline is today or within 24 hours, show deadline timer
  if (isDeadlineToday || isNearDeadline) {
  return {
  show: true,
  type: isDeadlineToday ? "deadline_today" : "deadline",
  hours: Math.max(0, hoursToDeadline),
  minutes: Math.max(
  0,
  Math.floor((timeToDeadline % (1000 * 60 * 60)) / (1000 * 60)),
  ),
  };
  }

  // More than 24 hours away: don't show deadline timer
  return { show: false };
  }

  // If deadline passed or no deadline, check event timing
  const timeToEvent = eventDate - now;

  if (timeToEvent > 0) {
  // Event hasn't started, show days remaining
  return {
  show: true,
  type: "event",
  days: Math.floor(timeToEvent / (1000 * 60 * 60 * 24)),
  };
  } else if (timeToEvent > -(1000 * 60 * 60 * 24)) {
  // Within 24 hours after event start
  // Event has started recently, show "Event Started"
  return {
  show: true,
  type: "started",
  };
  } else {
  // Event has been completed (more than 24 hours ago)
  return {
  show: true,
  type: "completed",
  };
  }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
  const timer = setTimeout(() => {
  setTimeLeft(calculateTimeLeft());
  }, 60000); // Update every minute for deadline, less frequent for event days

  return () => clearTimeout(timer);
  });

  if (!timeLeft.show) {
  return null; // Don't show anything before deadline
  }

  let content;
  let className;

  switch (timeLeft.type) {
  case "deadline_today":
  className =
  "text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block border border-red-200";
  content = "Last Deadline Day";
  break;
  case "deadline":
  className =
  "text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block border border-red-200";
  content =
  timeLeft.hours > 0
  ? `${timeLeft.hours}h left`
  : `${timeLeft.minutes}m left`;
  break;
  case "event":
  className =
  "text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block";
  content = `${timeLeft.days} days left`;
  break;
  case "started":
  className =
  "text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block";
  content = "Event Started";
  break;
  case "completed":
  className =
  "text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block";
  content = "Event Completed";
  break;
  default:
  return null;
  }

  return <div className={className}>{content}</div>;
};

export default CountdownTimer;
