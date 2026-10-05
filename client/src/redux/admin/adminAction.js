import { createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "../../services/adminService"; // Make sure path is correct

//  Events
export const fetchAdminEvents = createAsyncThunk(
  "admin/fetchEvents",
  async (_, { rejectWithValue }) => {
  try {
  const response = await adminService.getAdminEvents();
  return response;
  } catch (error) {
  return rejectWithValue(error?.response?.data?.message || error.message);
  }
  },
);

//  Users
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
  try {
  return await adminService.getAllUsers();
  } catch (error) {
  return rejectWithValue(error?.response?.data?.message || error.message);
  }
  },
);

//  Clubs
export const fetchAdminClubs = createAsyncThunk(
  "admin/fetchClubs",
  async (_, { rejectWithValue }) => {
  try {
const clubs = await adminService.getAllClubs();
    return clubs;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || error.message);
  }
  },
);

//  Approve Club
export const adminApproveClub = createAsyncThunk(
  "admin/approveClub",
  async (clubId, { rejectWithValue }) => {
  try {
  const updatedClub = await adminService.approveClub(clubId);
  return updatedClub; // return updated club
  } catch (error) {
  return rejectWithValue(error?.response?.data?.message || error.message);
  }
  },
);

//  Reject Club - Add this endpoint in backend
export const rejectClubAdmin = createAsyncThunk(
  "admin/rejectClub",
  async (clubId, { rejectWithValue }) => {
  try {
  const updatedClub = await adminService.rejectClub(clubId);
  return updatedClub;
  } catch (error) {
  return rejectWithValue(error?.response?.data?.message || error.message);
  }
  },
);

//  Delete User
export const deleteUserAdmin = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue, dispatch }) => {
  try {
  await adminService.deleteUser(userId);
  dispatch(fetchAllUsers());
  return userId;
  } catch (error) {
  return rejectWithValue(error.message);
  }
  },
);

//  Delete Event
//  Removes the row locally rather than refetching the whole list, because the
//  admin list is already loaded and this is a single record.
export const deleteAdminEvent = createAsyncThunk(
  "admin/deleteEvent",
  async (eventId, { rejectWithValue }) => {
  try {
    await adminService.deleteEvent(eventId);
    return eventId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
  },
);

//  Registrations
export const fetchAllRegistrations = createAsyncThunk(
  "admin/fetchRegistrations",
  async (_, { rejectWithValue }) => {
  try {
  return await adminService.getAllRegistrations();
  } catch (error) {
  return rejectWithValue(error?.response?.data?.message || error.message);
  }
  },
);
