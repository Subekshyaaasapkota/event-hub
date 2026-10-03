// src/components/Organizer/EventForm.jsx
import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";

const EventForm = ({ onSubmit }) => {
  const { user } = useAuth(); // must be logged-in organizer
  const [formData, setFormData] = useState({
  title: "",
  description: "",
  category: "tech",
  date: "",
  time: "",
  location: "",
  image: null,
  ticketPrice: "",
  capacity: "",
  });

  // Handle input changes
  const handleChange = (e) => {
  const { name, value, files } = e.target;
  if (name === "image") {
  setFormData({ ...formData, image: files[0] });
  } else {
  setFormData({ ...formData, [name]: value });
  }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  if (onSubmit) onSubmit(formData);
  console.log("Event data submitted:", formData);
  };

  // Role-based access
  if (!user) {
  return (
  <div className="text-center mt-20 text-red-600 font-bold">
  Please login to create an event.
  </div>
  );
  }

  if (user.role !== "organizer") {
  return (
  <div className="text-center mt-20 text-red-600 font-bold">
  You are not authorized to create events.
  </div>
  );
  }

  return (
  <div className="max-w-3xl mx-auto mt-24 p-6 bg-white shadow-md rounded-lg">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">
  Create New Event
  </h2>
  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
  <input
  type="text"
  name="title"
  placeholder="Event Title"
  value={formData.title}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
  required
  />

  <textarea
  name="description"
  placeholder="Event Description"
  value={formData.description}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
  rows={4}
  required
  />

  <select
  name="category"
  value={formData.category}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
  required
  >
  <option value="tech">Tech</option>
  <option value="sports">Sports</option>
  <option value="cultural">Cultural</option>
  <option value="workshop">Workshop</option>
  </select>

  <div className="flex gap-4">
  <input
  type="date"
  name="date"
  value={formData.date}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 flex-1"
  required
  />
  <input
  type="time"
  name="time"
  value={formData.time}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 flex-1"
  required
  />
  </div>

  <input
  type="text"
  name="location"
  placeholder="Location / Venue"
  value={formData.location}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
  required
  />

  <input
  type="file"
  name="image"
  accept="image/*"
  onChange={handleChange}
  className="p-1 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
  />

  <div className="flex gap-4">
  <input
  type="number"
  name="ticketPrice"
  placeholder="Ticket Price (0 for Free)"
  value={formData.ticketPrice}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 flex-1"
  />
  <input
  type="number"
  name="capacity"
  placeholder="Capacity"
  value={formData.capacity}
  onChange={handleChange}
  className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 flex-1"
  />
  </div>

  <button
  type="submit"
  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
  >
  Create Event
  </button>
  </form>
  </div>
  );
};

export default EventForm;
