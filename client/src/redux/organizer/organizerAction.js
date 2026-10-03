import { createAsyncThunk } from "@reduxjs/toolkit";
import clubService from "../../services/clubService";

export const registerClub = createAsyncThunk(
  "organizer/registerClub",
  async (clubData, { rejectWithValue }) => {
  try {
  // console.log("Redux sending data to backend:", clubData);
  const response = await clubService.registerClub(clubData);
  // console.log("Redux received data:", response);
  return response;
  } catch (error) {
  // console.error("Redux error:", error);
  return rejectWithValue(error.message || "Club registration failed");
  }
  },
);

//  Fetch
export const fetchOrganizerEvents = createAsyncThunk(
  "organizer/fetchOrganizerEvents",
  async (_, { rejectWithValue }) => {
  try {
  const response = await clubService.getAllCreatedEvents();
  return response; //  FIX: response is already the array, not a wrapper object
  } catch (error) {
  return rejectWithValue(error.message || "Event data retrieved failed");
  }
  },
);

//  Delete
export const deleteOrganizerEvent = createAsyncThunk(
  "organizer/deleteOrganizerEvent",
  async (eventId, { rejectWithValue }) => {
  try {
  // Fixed: Use the correct service method
  await clubService.deleteEvent(eventId);
  return eventId;
  } catch (error) {
  return rejectWithValue(error.message);
  }
  },
);

//  Fetch Club Registrations
export const fetchClubRegistrations = createAsyncThunk(
  "organizer/fetchClubRegistrations",
  async (_, { rejectWithValue }) => {
  try {
  const response = await clubService.getClubRegistrations();
  return response;
  } catch (error) {
  return rejectWithValue(error.message || "Failed to fetch registrations");
  }
  },
);
